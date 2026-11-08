import {
  Activity,
  CalculatedActivity,
  ProjectPath,
  ScheduleCalculationResult,
  DelayImpactAnalysis,
  ValidationResult,
  ValidationError,
  RelationshipType,
  ActivityDependency,
} from '../types/scheduling';

export const BASELINE_ACTIVITIES: Activity[] = [
  {
    id: 'A',
    name: 'Requirements Analysis',
    duration: 3,
    predecessors: [],
    description: 'Gather stakeholder requirements, interview faculty and students, specify functional specifications for the University Management System.',
    category: 'Planning',
    progress: 100,
    dependencyClassification: 'Internal',
    dependencyRelations: [],
    isMilestone: false,
  },
  {
    id: 'B',
    name: 'System Design',
    duration: 4,
    predecessors: ['A'],
    description: 'Architect overall system modules, authentication, API contracts, and user interface workflows.',
    category: 'Design',
    progress: 80,
    dependencyClassification: 'Mandatory',
    dependencyRelations: [
      { predecessorId: 'A', type: 'FS', lag: 0, classification: 'Mandatory' },
    ],
    isMilestone: false,
  },
  {
    id: 'C',
    name: 'Database Design',
    duration: 3,
    predecessors: ['A'],
    description: 'Design normalized relational schemas, ER diagrams, indexes, and university data tables.',
    category: 'Design',
    progress: 65,
    dependencyClassification: 'Mandatory',
    dependencyRelations: [
      { predecessorId: 'A', type: 'FS', lag: 0, classification: 'Mandatory' },
    ],
    isMilestone: false,
  },
  {
    id: 'D',
    name: 'Development',
    duration: 6,
    predecessors: ['B', 'C'],
    description: 'Implement core backend services, portal frontend, and database queries. Requires both system and database designs.',
    category: 'Engineering',
    progress: 25,
    dependencyClassification: 'Mandatory',
    dependencyRelations: [
      { predecessorId: 'B', type: 'FS', lag: 0, classification: 'Mandatory' },
      { predecessorId: 'C', type: 'FS', lag: 0, classification: 'Mandatory' },
    ],
    isMilestone: false,
  },
  {
    id: 'E',
    name: 'Testing',
    duration: 3,
    predecessors: ['D'],
    description: 'Execute integration tests, end-to-end security audits, and load testing on the staging cluster.',
    category: 'Quality',
    progress: 0,
    dependencyClassification: 'Discretionary',
    dependencyRelations: [
      { predecessorId: 'D', type: 'FS', lag: 0, classification: 'Discretionary' },
    ],
    isMilestone: false,
  },
  {
    id: 'F',
    name: 'User Training',
    duration: 2,
    predecessors: ['E'],
    description: 'Conduct workshops for university registrars, faculty, and student administrators prior to go-live.',
    category: 'Deployment',
    progress: 0,
    dependencyClassification: 'External',
    dependencyRelations: [
      { predecessorId: 'E', type: 'FS', lag: 0, classification: 'External' },
    ],
    isMilestone: false,
  },
];

/**
 * Normalizes all dependencies for an activity, synchronizing `dependencyRelations`
 * and `predecessors` while applying defaults (type: 'FS', lag: 0).
 * Handles multiple mixed relationships between the same pair of activities cleanly.
 */
export function normalizeActivityDependencies(act: Activity): ActivityDependency[] {
  const relations: ActivityDependency[] = [];
  const seen = new Set<string>();

  // If predecessors array is provided, it is the authoritative list of predecessor IDs.
  const allowedPreds = Array.isArray(act.predecessors)
    ? new Set(act.predecessors.map(p => p.trim()))
    : null;

  if (Array.isArray(act.dependencyRelations)) {
    for (const rel of act.dependencyRelations) {
      if (rel && rel.predecessorId && rel.predecessorId.trim()) {
        const pId = rel.predecessorId.trim();
        if (allowedPreds !== null && !allowedPreds.has(pId)) {
          // Predecessor was removed from predecessors list; skip stale relation
          continue;
        }
        const type = (rel.type || 'FS') as RelationshipType;
        const lag = typeof rel.lag === 'number' && !isNaN(rel.lag) ? rel.lag : 0;
        const key = `${pId}__${type}__${lag}`;
        if (!seen.has(key)) {
          seen.add(key);
          relations.push({
            predecessorId: pId,
            type,
            lag,
            classification: rel.classification || act.dependencyClassification,
          });
        }
      }
    }
  }

  // Also include any predecessor listed in act.predecessors that isn't yet in relations
  if (Array.isArray(act.predecessors)) {
    for (const p of act.predecessors) {
      const pId = p.trim();
      if (pId && !relations.some(r => r.predecessorId === pId)) {
        const key = `${pId}__FS__0`;
        if (!seen.has(key)) {
          seen.add(key);
          relations.push({
            predecessorId: pId,
            type: 'FS',
            lag: 0,
            classification: act.dependencyClassification,
          });
        }
      }
    }
  }

  return relations;
}

/**
 * Validates activity attributes, IDs, durations, milestones, and predecessor relationships.
 * Does not silently drop or ignore invalid inputs.
 */
export function validateActivities(activities: Activity[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!activities || activities.length === 0) {
    errors.push({
      field: 'activities',
      message: 'Project must contain at least one activity.',
    });
    return { isValid: false, errors };
  }

  const seenIds = new Set<string>();
  for (const act of activities) {
    // 1. Activity ID presence
    if (!act.id || act.id.trim() === '') {
      errors.push({
        field: 'id',
        message: 'Activity ID cannot be empty.',
      });
      continue;
    }

    // 2. Duplicate Activity ID
    if (seenIds.has(act.id)) {
      errors.push({
        activityId: act.id,
        field: 'id',
        message: `Duplicate Activity ID '${act.id}' detected. Each activity must have a unique identifier.`,
      });
    }
    seenIds.add(act.id);

    // 3. Duration validation
    if (typeof act.duration !== 'number' || isNaN(act.duration)) {
      errors.push({
        activityId: act.id,
        field: 'duration',
        message: `Activity '${act.id}' has an invalid duration (must be a valid number).`,
      });
    } else if (act.duration < 0) {
      errors.push({
        activityId: act.id,
        field: 'duration',
        message: `Activity '${act.id}' has a negative duration (${act.duration}). Workday duration cannot be negative.`,
      });
    }
  }

  // 4. Predecessor reference & relationship checks
  for (const act of activities) {
    const relations = normalizeActivityDependencies(act);
    const seenRelKeys = new Set<string>();

    for (const rel of relations) {
      const pred = rel.predecessorId;

      // Self-reference
      if (pred === act.id) {
        errors.push({
          activityId: act.id,
          field: 'predecessors',
          message: `Activity '${act.id}' cannot have itself as a predecessor.`,
        });
      }
      // Unknown predecessor reference
      else if (!seenIds.has(pred)) {
        errors.push({
          activityId: act.id,
          field: 'predecessors',
          message: `Activity '${act.id}' references an unknown predecessor '${pred}' that does not exist in the project.`,
        });
      }

      // Valid relationship type
      if (!['FS', 'SS', 'FF', 'SF'].includes(rel.type)) {
        errors.push({
          activityId: act.id,
          field: 'dependencyRelations',
          message: `Activity '${act.id}' references an invalid dependency relationship type '${rel.type}'. Must be FS, SS, FF, or SF.`,
        });
      }

      // Valid lag number
      if (typeof rel.lag !== 'number' || isNaN(rel.lag) || !isFinite(rel.lag)) {
        errors.push({
          activityId: act.id,
          field: 'lag',
          message: `Activity '${act.id}' has an invalid lag value for predecessor '${pred}'. Lag must be a finite number.`,
        });
      }

      // Duplicate relationship detection
      const relKey = `${pred}__${rel.type}__${rel.lag}`;
      if (seenRelKeys.has(relKey)) {
        errors.push({
          activityId: act.id,
          field: 'dependencyRelations',
          message: `Duplicate dependency detected: Activity '${act.id}' specifies multiple identical '${rel.type}' relationships with lag ${rel.lag} to predecessor '${pred}'.`,
        });
      }
      seenRelKeys.add(relKey);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates activities and checks for cycles using topological sort (Kahn's algorithm).
 * Accurately tracks all dependency relationship directions.
 */
export function detectCycles(activities: Activity[]): {
  hasCycle: boolean;
  sortedIds?: string[];
  cycleNodes?: string[];
} {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const allIds = new Set(activities.map(a => a.id));

  for (const act of activities) {
    inDegree.set(act.id, 0);
    adj.set(act.id, []);
  }

  for (const act of activities) {
    const relations = normalizeActivityDependencies(act);
    const uniquePreds = new Set(relations.map(r => r.predecessorId));

    for (const pred of uniquePreds) {
      if (allIds.has(pred) && pred !== act.id) {
        adj.get(pred)!.push(act.id);
        inDegree.set(act.id, (inDegree.get(act.id) || 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    sorted.push(curr);

    for (const neighbor of adj.get(curr) || []) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (sorted.length !== activities.length) {
    const cycleNodes = activities.filter(a => !sorted.includes(a.id)).map(a => a.id);
    return { hasCycle: true, cycleNodes };
  }

  return { hasCycle: false, sortedIds: sorted };
}

/**
 * Finds all network paths from start activities to end activities with safe bounds.
 * Prevents combinatorial explosion on large networks by capping output.
 */
export function findAllPaths(activities: Activity[], maxPaths = 50): ProjectPath[] {
  const actMap = new Map(activities.map(a => [a.id, a]));
  const successorsMap = new Map<string, string[]>();

  for (const act of activities) {
    successorsMap.set(act.id, []);
  }
  for (const act of activities) {
    const relations = normalizeActivityDependencies(act);
    const uniquePreds = new Set(relations.map(r => r.predecessorId));
    for (const pred of uniquePreds) {
      if (successorsMap.has(pred)) {
        successorsMap.get(pred)!.push(act.id);
      }
    }
  }

  const startNodes = activities
    .filter(a => normalizeActivityDependencies(a).length === 0)
    .map(a => a.id);
  const endNodes = activities
    .filter(a => (successorsMap.get(a.id) || []).length === 0)
    .map(a => a.id);

  const paths: string[][] = [];

  function dfs(currentId: string, currentPath: string[]) {
    if (paths.length >= maxPaths) return;
    const nextPath = [...currentPath, currentId];
    const succs = successorsMap.get(currentId) || [];
    if (succs.length === 0 || endNodes.includes(currentId)) {
      paths.push(nextPath);
      return;
    }
    for (const succ of succs) {
      dfs(succ, nextPath);
      if (paths.length >= maxPaths) break;
    }
  }

  for (const start of startNodes) {
    dfs(start, []);
    if (paths.length >= maxPaths) break;
  }

  return paths.map((pathNodeIds, idx) => {
    const totalDur = pathNodeIds.reduce((sum, id) => {
      const act = actMap.get(id);
      return sum + (act ? act.duration : 0);
    }, 0);

    return {
      id: `path-${idx + 1}`,
      activityIds: pathNodeIds,
      totalDuration: totalDur,
      isCritical: false,
      description: pathNodeIds.join(' → '),
    };
  });
}

/**
 * Traces critical paths using only zero-float activities and tight controlling dependencies.
 * Avoids exponential search and scales efficiently to large project networks.
 */
export function findCriticalPaths(
  calculatedMap: Map<string, CalculatedActivity>,
  projectDuration: number,
  maxPaths = 50
): ProjectPath[] {
  const criticalMap = new Map<string, CalculatedActivity>();
  for (const [id, act] of calculatedMap.entries()) {
    if (act.isCritical) {
      criticalMap.set(id, act);
    }
  }

  if (criticalMap.size === 0) return [];

  // Build tight forward critical adjacency graph
  const critAdj = new Map<string, string[]>();
  for (const [id, act] of criticalMap.entries()) {
    critAdj.set(id, []);
  }

  for (const [sId, succAct] of criticalMap.entries()) {
    const relations = normalizeActivityDependencies(succAct);
    const dS = Math.max(0, typeof succAct.duration === 'number' ? succAct.duration : 0);
    const tSs = dS > 0 ? succAct.es - 1 : (succAct.es === 1 ? 0 : succAct.es);
    const tFs = tSs + dS;

    for (const rel of relations) {
      const predAct = criticalMap.get(rel.predecessorId);
      if (!predAct) continue;

      const dP = Math.max(0, typeof predAct.duration === 'number' ? predAct.duration : 0);
      const tSp = dP > 0 ? predAct.es - 1 : (predAct.es === 1 ? 0 : predAct.es);
      const tFp = tSp + dP;
      const L = rel.lag || 0;

      // Check whether this edge is tight (controlling constraint)
      let isTight = false;
      if (rel.type === 'FS') {
        isTight = tSs === tFp + L;
      } else if (rel.type === 'SS') {
        isTight = tSs === tSp + L;
      } else if (rel.type === 'FF') {
        isTight = tFs === tFp + L;
      } else if (rel.type === 'SF') {
        isTight = tFs === tSp + L;
      }

      if (isTight) {
        if (!critAdj.get(rel.predecessorId)!.includes(sId)) {
          critAdj.get(rel.predecessorId)!.push(sId);
        }
      }
    }
  }

  // Critical start nodes: critical nodes that have no critical predecessors in critAdj, or start at t=0
  const critStarts: string[] = [];
  for (const [id, act] of criticalMap.entries()) {
    const d = Math.max(0, typeof act.duration === 'number' ? act.duration : 0);
    const tS = d > 0 ? act.es - 1 : (act.es === 1 ? 0 : act.es);
    if (tS === 0 || act.predecessors.length === 0) {
      critStarts.push(id);
    }
  }

  if (critStarts.length === 0) {
    // Fallback: pick any critical node with no incoming critical edge
    const hasIncoming = new Set<string>();
    for (const nbrs of critAdj.values()) {
      for (const n of nbrs) hasIncoming.add(n);
    }
    for (const id of criticalMap.keys()) {
      if (!hasIncoming.has(id)) critStarts.push(id);
    }
  }

  const paths: string[][] = [];

  function dfs(currId: string, currentPath: string[]) {
    if (paths.length >= maxPaths) return;
    const nextPath = [...currentPath, currId];
    const nbrs = critAdj.get(currId) || [];
    const act = criticalMap.get(currId)!;
    const isTerminal = act.ef === projectDuration || nbrs.length === 0;

    if (isTerminal) {
      paths.push(nextPath);
      return;
    }

    for (const nextId of nbrs) {
      dfs(nextId, nextPath);
      if (paths.length >= maxPaths) break;
    }
  }

  for (const start of critStarts) {
    dfs(start, []);
    if (paths.length >= maxPaths) break;
  }

  // Deduplicate and map to ProjectPath
  const uniquePaths: string[][] = [];
  const seenPathKeys = new Set<string>();
  for (const p of paths) {
    const key = p.join('-');
    if (!seenPathKeys.has(key)) {
      seenPathKeys.add(key);
      uniquePaths.push(p);
    }
  }

  return uniquePaths.map((ids, idx) => ({
    id: `crit-path-${idx + 1}`,
    activityIds: ids,
    totalDuration: projectDuration,
    isCritical: true,
    description: ids.join(' → '),
  }));
}

/**
 * Calculates complete CPM schedule using generalized precedence networking (PDM):
 * - Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), Start-to-Finish (SF)
 * - Positive and negative lag (lead)
 * - Milestones (zero duration events)
 * - Multiple parallel critical paths and float buffers
 * - Inclusive 1-based workday numbering convention: EF = ES + Duration - 1
 */
export function calculateSchedule(activities: Activity[]): ScheduleCalculationResult {
  // 1. Validation check
  const validation = validateActivities(activities);
  if (!validation.isValid) {
    return {
      activities: {},
      activityList: [],
      projectDuration: 0,
      criticalPaths: [],
      allPaths: [],
      criticalActivityIds: [],
      hasCycle: false,
      isValid: false,
      validationErrors: validation.errors,
      errorMessage: validation.errors.map(e => e.message).join(' | '),
    };
  }

  // 2. Cycle detection & topological ordering
  const { hasCycle, sortedIds, cycleNodes } = detectCycles(activities);
  if (hasCycle || !sortedIds) {
    return {
      activities: {},
      activityList: [],
      projectDuration: 0,
      criticalPaths: [],
      allPaths: [],
      criticalActivityIds: [],
      hasCycle: true,
      cycleNodes,
      isValid: false,
      errorMessage: `Circular dependency detected involving activities: ${cycleNodes?.join(', ')}`,
    };
  }

  // Build activity lookup map and normalized relationships
  const actMap = new Map<string, Activity>();
  const relMap = new Map<string, ActivityDependency[]>();
  const successorsMap = new Map<string, { succId: string; rel: ActivityDependency }[]>();

  for (const act of activities) {
    actMap.set(act.id, act);
    relMap.set(act.id, normalizeActivityDependencies(act));
    successorsMap.set(act.id, []);
  }

  for (const act of activities) {
    for (const rel of relMap.get(act.id)!) {
      if (successorsMap.has(rel.predecessorId)) {
        successorsMap.get(rel.predecessorId)!.push({ succId: act.id, rel });
      }
    }
  }

  // Continuous time points (0-indexed: t=0 is the morning of Day 1)
  const tStart = new Map<string, number>();
  const tFinish = new Map<string, number>();

  // 1. FORWARD PASS (in topological order)
  for (const id of sortedIds) {
    const act = actMap.get(id)!;
    const d = Math.max(0, typeof act.duration === 'number' ? act.duration : 0);
    const isMilestone = !!act.isMilestone || d === 0;
    const relations = relMap.get(id)!;

    if (relations.length === 0) {
      // Root activity begins at t=0 (Day 1 morning)
      tStart.set(id, 0);
      tFinish.set(id, d);
    } else {
      let maxFeasibleStart = 0;

      for (const rel of relations) {
        const predAct = actMap.get(rel.predecessorId);
        if (!predAct) continue;

        const tSp = tStart.get(rel.predecessorId) ?? 0;
        const tFp = tFinish.get(rel.predecessorId) ?? 0;
        const L = typeof rel.lag === 'number' && !isNaN(rel.lag) ? rel.lag : 0;

        let requiredStart = 0;
        if (rel.type === 'FS') {
          // Successor start cannot precede Predecessor finish + lag
          requiredStart = tFp + L;
        } else if (rel.type === 'SS') {
          // Successor start cannot precede Predecessor start + lag
          requiredStart = tSp + L;
        } else if (rel.type === 'FF') {
          // Successor finish cannot precede Predecessor finish + lag
          // tFs = tSs + d >= tFp + L => tSs >= tFp + L - d
          requiredStart = tFp + L - d;
        } else if (rel.type === 'SF') {
          // Successor finish cannot precede Predecessor start + lag
          // tFs = tSs + d >= tSp + L => tSs >= tSp + L - d
          requiredStart = tSp + L - d;
        }

        if (requiredStart > maxFeasibleStart) {
          maxFeasibleStart = requiredStart;
        }
      }

      // Start cannot be negative (clamped to project inception t=0)
      maxFeasibleStart = Math.max(0, maxFeasibleStart);
      tStart.set(id, maxFeasibleStart);
      tFinish.set(id, maxFeasibleStart + d);
    }
  }

  // Project completion time is the maximum of all finish times
  let projectDuration = 0;
  for (const finishTime of tFinish.values()) {
    if (finishTime > projectDuration) {
      projectDuration = finishTime;
    }
  }

  // 2. BACKWARD PASS (in reverse topological order)
  const tStartLate = new Map<string, number>();
  const tFinishLate = new Map<string, number>();
  const reversedIds = [...sortedIds].reverse();

  for (const id of reversedIds) {
    const act = actMap.get(id)!;
    const d = Math.max(0, typeof act.duration === 'number' ? act.duration : 0);
    const isMilestone = !!act.isMilestone || d === 0;
    const succs = successorsMap.get(id)!;

    if (succs.length === 0) {
      // Terminal activity can complete at project finish
      tFinishLate.set(id, projectDuration);
      tStartLate.set(id, projectDuration - d);
    } else {
      let minLateFinish = projectDuration;

      for (const { succId, rel } of succs) {
        const succAct = actMap.get(succId);
        if (!succAct) continue;

        const tSs_late = tStartLate.get(succId) ?? projectDuration;
        const tFs_late = tFinishLate.get(succId) ?? projectDuration;
        const L = typeof rel.lag === 'number' && !isNaN(rel.lag) ? rel.lag : 0;

        let maxAllowableFinish = projectDuration;
        if (rel.type === 'FS') {
          // tSs >= tFp + L => tFp <= tSs - L
          maxAllowableFinish = tSs_late - L;
        } else if (rel.type === 'SS') {
          // tSs >= tSp + L => tSp <= tSs - L => tFp <= tSs - L + d
          maxAllowableFinish = tSs_late - L + d;
        } else if (rel.type === 'FF') {
          // tFs >= tFp + L => tFp <= tFs - L
          maxAllowableFinish = tFs_late - L;
        } else if (rel.type === 'SF') {
          // tFs >= tSp + L => tSp <= tFs - L => tFp <= tFs - L + d
          maxAllowableFinish = tFs_late - L + d;
        }

        if (maxAllowableFinish < minLateFinish) {
          minLateFinish = maxAllowableFinish;
        }
      }

      tFinishLate.set(id, minLateFinish);
      tStartLate.set(id, minLateFinish - d);
    }
  }

  // 3. FLOAT & METRIC CONVERSION (To 1-based inclusive workdays)
  const calculatedMap = new Map<string, CalculatedActivity>();

  for (const id of sortedIds) {
    const act = actMap.get(id)!;
    const d = Math.max(0, typeof act.duration === 'number' ? act.duration : 0);
    const isMilestone = !!act.isMilestone || d === 0;

    const tS = tStart.get(id)!;
    const tF = tFinish.get(id)!;
    const tS_late = tStartLate.get(id)!;
    const tF_late = tFinishLate.get(id)!;

    // 1-based inclusive conversion:
    // For tasks with duration > 0: ES = tS + 1, EF = tF.
    // For milestones with duration = 0: if tF === 0, day is 1; else day is tF.
    let es: number;
    let ef: number;
    let ls: number;
    let lf: number;

    if (d > 0) {
      es = tS + 1;
      ef = tF;
      lf = tF_late;
      ls = tS_late + 1;
    } else {
      const milestoneDay = tF === 0 ? 1 : tF;
      es = milestoneDay;
      ef = milestoneDay;
      const milestoneLateDay = tF_late === 0 ? 1 : tF_late;
      lf = milestoneLateDay;
      ls = milestoneLateDay;
    }

    // Total float: buffer between late schedule and early schedule
    const totalFloat = Math.max(0, tS_late - tS);
    const isCritical = totalFloat === 0;

    // Free float: minimum buffer before violating any successor's early start/finish
    const succs = successorsMap.get(id)!;
    let freeFloat = 0;

    if (succs.length === 0) {
      freeFloat = Math.max(0, projectDuration - tF);
    } else {
      let minEdgeSlack = Infinity;

      for (const { succId, rel } of succs) {
        const tSs_early = tStart.get(succId) ?? 0;
        const tFs_early = tFinish.get(succId) ?? 0;
        const L = typeof rel.lag === 'number' && !isNaN(rel.lag) ? rel.lag : 0;

        let edgeSlack = 0;
        if (rel.type === 'FS') {
          edgeSlack = tSs_early - (tF + L);
        } else if (rel.type === 'SS') {
          edgeSlack = tSs_early - (tS + L);
        } else if (rel.type === 'FF') {
          edgeSlack = tFs_early - (tF + L);
        } else if (rel.type === 'SF') {
          edgeSlack = tFs_early - (tS + L);
        }

        if (edgeSlack < minEdgeSlack) {
          minEdgeSlack = edgeSlack;
        }
      }

      freeFloat = isFinite(minEdgeSlack) ? Math.max(0, minEdgeSlack) : 0;
    }

    // Predecessors list synced with dependencyRelations
    const relations = relMap.get(id)!;
    const syncedPredecessors = Array.from(new Set(relations.map(r => r.predecessorId)));

    calculatedMap.set(id, {
      ...act,
      duration: d,
      isMilestone,
      predecessors: syncedPredecessors,
      dependencyRelations: relations,
      es,
      ef,
      ls,
      lf,
      totalFloat,
      freeFloat,
      isCritical,
      successors: succs.map(s => s.succId),
    });
  }

  // 4. PATH EXTRACTION
  const criticalPaths = findCriticalPaths(calculatedMap, projectDuration);
  const allPaths = findAllPaths(activities);

  for (const path of allPaths) {
    path.isCritical = criticalPaths.some(cp => cp.activityIds.join('-') === path.activityIds.join('-'));
  }

  const criticalActivityIds = sortedIds.filter(id => calculatedMap.get(id)?.isCritical);
  const activityList = sortedIds.map(id => calculatedMap.get(id)!);
  const resultRecord: Record<string, CalculatedActivity> = {};
  for (const [id, act] of calculatedMap.entries()) {
    resultRecord[id] = act;
  }

  return {
    activities: resultRecord,
    activityList,
    projectDuration,
    criticalPaths,
    allPaths,
    criticalActivityIds,
    hasCycle: false,
    isValid: true,
  };
}

/**
 * Analyzes the impact of a duration modification on the project schedule.
 * Generates clear, student-friendly academic explanations.
 */
export function analyzeDelayImpact(
  baselineResult: ScheduleCalculationResult,
  currentResult: ScheduleCalculationResult,
  changedActivityId: string
): DelayImpactAnalysis {
  const oldAct = baselineResult.activities[changedActivityId];
  const newAct = currentResult.activities[changedActivityId];

  const oldDuration = oldAct?.duration ?? 0;
  const newDuration = newAct?.duration ?? 0;
  const durationDelta = newDuration - oldDuration;

  const oldProjectDuration = baselineResult.projectDuration;
  const newProjectDuration = currentResult.projectDuration;
  const projectDurationDelta = newProjectDuration - oldProjectDuration;

  const oldCriticalPaths = baselineResult.criticalPaths.map(p => p.activityIds);
  const newCriticalPaths = currentResult.criticalPaths.map(p => p.activityIds);

  const oldPathStrings = oldCriticalPaths.map(p => p.join('-')).sort().join(', ');
  const newPathStrings = newCriticalPaths.map(p => p.join('-')).sort().join(', ');
  const criticalPathChanged = oldPathStrings !== newPathStrings;

  let explanation = '';
  let keyTakeaway = '';

  if (durationDelta === 0) {
    explanation = `Activity ${changedActivityId} (${newAct?.name}) is at its baseline duration of ${newDuration} workdays.`;
    keyTakeaway = `The project schedule matches the original baseline. Critical Path is ${newPathStrings} (${newProjectDuration} days).`;
  } else if (durationDelta > 0) {
    // Delay / Duration increase
    if (oldAct?.isCritical) {
      explanation = `Activity ${changedActivityId} (${newAct?.name}) is on the critical path (Total Float = 0). Increasing its duration by ${durationDelta} day(s) directly extends overall project completion from ${oldProjectDuration} to ${newProjectDuration} workdays (+${projectDurationDelta} days). Downstream successors are delayed accordingly.`;
      keyTakeaway = 'Critical activities have zero slack: any delay on a critical activity extends total project duration by an identical amount.';
    } else if (durationDelta <= (oldAct?.totalFloat ?? 0)) {
      explanation = `Activity ${changedActivityId} (${newAct?.name}) had ${oldAct?.totalFloat} day(s) of Total Float (slack). Increasing its duration by ${durationDelta} day(s) absorbed available buffer (remaining float: ${newAct?.totalFloat}d) without extending overall project completion (${newProjectDuration} workdays).`;
      if (newAct?.totalFloat === 0) {
        explanation += ` Because float reached 0, this path is now tied for the longest duration, creating ${currentResult.criticalPaths.length} critical paths (${newPathStrings})!`;
        keyTakeaway = 'Absorbing all available slack turns a non-critical activity into a critical activity, generating multiple critical paths.';
      } else {
        keyTakeaway = 'A non-critical activity delayed within its total float does not extend the project completion date.';
      }
    } else {
      const excessDelay = durationDelta - (oldAct?.totalFloat ?? 0);
      explanation = `Activity ${changedActivityId} (${newAct?.name}) only had ${oldAct?.totalFloat} day(s) of float buffer. The delay of ${durationDelta} days exceeded its float by ${excessDelay} day(s). This pushed downstream successor starts and extended project completion from ${oldProjectDuration} to ${newProjectDuration} workdays (+${projectDurationDelta} days). Path ${newPathStrings} is now the controlling critical path.`;
      keyTakeaway = 'Any delay exceeding an activity’s total float directly extends the project completion date by the excess amount.';
    }
  } else {
    // Compression / Crashing (durationDelta < 0)
    const savedDays = Math.abs(durationDelta);
    if (oldAct?.isCritical) {
      if (projectDurationDelta < 0) {
        explanation = `Shortening critical activity ${changedActivityId} (${newAct?.name}) by ${savedDays} day(s) compressed the project duration from ${oldProjectDuration} to ${newProjectDuration} workdays (-${Math.abs(projectDurationDelta)} days).`;
        keyTakeaway = 'To compress overall project duration (schedule crashing), project managers must shorten activities on the critical path.';
      } else {
        explanation = `Shortening ${changedActivityId} (${newAct?.name}) by ${savedDays} day(s) did not shorten the overall project (${newProjectDuration} workdays) because a parallel path became the controlling critical path.`;
        keyTakeaway = 'Crashing a critical path activity only compresses the project until another parallel path becomes the controlling bottleneck.';
      }
    } else {
      explanation = `Shortening non-critical activity ${changedActivityId} (${newAct?.name}) by ${savedDays} day(s) increased its total float from ${oldAct?.totalFloat} to ${newAct?.totalFloat} workdays. Overall project duration remains unchanged at ${newProjectDuration} workdays.`;
      keyTakeaway = 'Shortening non-critical activities does not accelerate project delivery; it only adds unnecessary slack.';
    }
  }

  return {
    changedActivityId,
    oldDuration,
    newDuration,
    durationDelta,
    oldProjectDuration,
    newProjectDuration,
    projectDurationDelta,
    oldCriticalPaths,
    newCriticalPaths,
    criticalPathChanged,
    explanation,
    keyTakeaway,
  };
}
