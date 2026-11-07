import {
  Activity,
  CalculatedActivity,
  ProjectPath,
  ScheduleCalculationResult,
  DelayImpactAnalysis,
  ValidationResult,
  ValidationError,
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
 * Validates activity attributes, IDs, durations, and predecessor references.
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
    } else if (!Number.isInteger(act.duration)) {
      errors.push({
        activityId: act.id,
        field: 'duration',
        message: `Activity '${act.id}' duration must be an integer workday count.`,
      });
    }
  }

  // 4. Predecessor reference checks
  for (const act of activities) {
    for (const pred of act.predecessors) {
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
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates activities and checks for cycles using topological sort (Kahn's algorithm).
 */
export function detectCycles(activities: Activity[]): { hasCycle: boolean; sortedIds?: string[]; cycleNodes?: string[] } {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const allIds = new Set(activities.map(a => a.id));

  for (const act of activities) {
    inDegree.set(act.id, 0);
    adj.set(act.id, []);
  }

  for (const act of activities) {
    for (const pred of act.predecessors) {
      if (allIds.has(pred)) {
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
 * Finds all paths from start activities to end activities
 */
export function findAllPaths(activities: Activity[]): ProjectPath[] {
  const actMap = new Map(activities.map(a => [a.id, a]));
  const successorsMap = new Map<string, string[]>();

  for (const act of activities) {
    successorsMap.set(act.id, []);
  }
  for (const act of activities) {
    for (const pred of act.predecessors) {
      if (successorsMap.has(pred)) {
        successorsMap.get(pred)!.push(act.id);
      }
    }
  }

  const startNodes = activities.filter(a => a.predecessors.length === 0).map(a => a.id);
  const endNodes = activities.filter(a => (successorsMap.get(a.id) || []).length === 0).map(a => a.id);

  const paths: string[][] = [];

  function dfs(currentId: string, currentPath: string[]) {
    const nextPath = [...currentPath, currentId];
    const succs = successorsMap.get(currentId) || [];
    if (succs.length === 0 || endNodes.includes(currentId)) {
      paths.push(nextPath);
      return;
    }
    for (const succ of succs) {
      dfs(succ, nextPath);
    }
  }

  for (const start of startNodes) {
    dfs(start, []);
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
 * Calculates complete CPM schedule using standard inclusive 1-based workday numbering.
 * ES = 1 (for initial nodes)
 * ES = max(pred.EF) + 1
 * EF = ES + Duration - 1
 * ProjectDuration = max(EF)
 * LF = ProjectDuration (for terminal nodes)
 * LF = min(succ.LS) - 1
 * LS = LF - Duration + 1
 * TotalFloat = LS - ES
 * FreeFloat = min(succ.ES) - EF - 1 (or ProjectDuration - EF if terminal)
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

  // 2. Cycle detection
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

  const successorsMap = new Map<string, string[]>();
  for (const act of activities) {
    successorsMap.set(act.id, []);
  }
  for (const act of activities) {
    for (const pred of act.predecessors) {
      if (successorsMap.has(pred)) {
        successorsMap.get(pred)!.push(act.id);
      }
    }
  }

  const calculatedMap = new Map<string, CalculatedActivity>();

  // Initialize calculated objects
  for (const act of activities) {
    calculatedMap.set(act.id, {
      ...act,
      es: 1,
      ef: 1,
      ls: 1,
      lf: 1,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
      successors: successorsMap.get(act.id) || [],
    });
  }

  // 1. FORWARD PASS (in topological order)
  for (const id of sortedIds) {
    const act = calculatedMap.get(id)!;
    if (act.predecessors.length === 0) {
      act.es = 1;
    } else {
      let maxPredEf = 0;
      for (const predId of act.predecessors) {
        const predAct = calculatedMap.get(predId);
        if (predAct && predAct.ef > maxPredEf) {
          maxPredEf = predAct.ef;
        }
      }
      act.es = maxPredEf + 1;
    }
    act.ef = act.es + Math.max(1, act.duration) - 1;
  }

  // Project duration is max of all early finishes
  let projectDuration = 0;
  for (const act of calculatedMap.values()) {
    if (act.ef > projectDuration) {
      projectDuration = act.ef;
    }
  }

  // 2. BACKWARD PASS (in reverse topological order)
  const reversedIds = [...sortedIds].reverse();
  for (const id of reversedIds) {
    const act = calculatedMap.get(id)!;
    const succs = act.successors;

    if (succs.length === 0) {
      act.lf = projectDuration;
    } else {
      let minSuccLs = Infinity;
      for (const succId of succs) {
        const succAct = calculatedMap.get(succId);
        if (succAct && succAct.ls < minSuccLs) {
          minSuccLs = succAct.ls;
        }
      }
      act.lf = minSuccLs - 1;
    }

    act.ls = act.lf - Math.max(1, act.duration) + 1;
    act.totalFloat = act.ls - act.es;

    // Free float: min(successor.ES) - EF - 1
    if (succs.length === 0) {
      act.freeFloat = projectDuration - act.ef;
    } else {
      let minSuccEs = Infinity;
      for (const succId of succs) {
        const succAct = calculatedMap.get(succId);
        if (succAct && succAct.es < minSuccEs) {
          minSuccEs = succAct.es;
        }
      }
      act.freeFloat = Math.max(0, minSuccEs - act.ef - 1);
    }

    // Critical if total float === 0
    act.isCritical = act.totalFloat === 0;
  }

  // Find all paths and identify critical paths
  const allPaths = findAllPaths(activities);
  for (const path of allPaths) {
    path.isCritical = path.totalDuration === projectDuration;
  }
  const criticalPaths = allPaths.filter(p => p.isCritical);

  // Critical activities set
  const criticalActivityIds = activities
    .filter(a => calculatedMap.get(a.id)?.isCritical)
    .map(a => a.id);

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
