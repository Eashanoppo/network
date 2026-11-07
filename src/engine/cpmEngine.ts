import { Activity, CalculatedActivity, ProjectPath, ScheduleCalculationResult, DelayImpactAnalysis } from '../types/scheduling';

export const BASELINE_ACTIVITIES: Activity[] = [
  {
    id: 'A',
    name: 'Requirements Analysis',
    duration: 3,
    predecessors: [],
    description: 'Gather stakeholder requirements, interview faculty and students, specify functional specifications for the University Management System.',
    category: 'Planning',
  },
  {
    id: 'B',
    name: 'System Design',
    duration: 4,
    predecessors: ['A'],
    description: 'Architect overall system modules, authentication, API contracts, and user interface workflows.',
    category: 'Design',
  },
  {
    id: 'C',
    name: 'Database Design',
    duration: 3,
    predecessors: ['A'],
    description: 'Design normalized relational schemas, ER diagrams, indexes, and university data tables.',
    category: 'Design',
  },
  {
    id: 'D',
    name: 'Development',
    duration: 6,
    predecessors: ['B', 'C'],
    description: 'Implement core backend services, portal frontend, and database queries. Requires both system and database designs.',
    category: 'Engineering',
  },
  {
    id: 'E',
    name: 'Testing',
    duration: 3,
    predecessors: ['D'],
    description: 'Execute integration tests, end-to-end security audits, and load testing on the staging cluster.',
    category: 'Quality',
  },
  {
    id: 'F',
    name: 'User Training',
    duration: 2,
    predecessors: ['E'],
    description: 'Conduct workshops for university registrars, faculty, and student administrators prior to go-live.',
    category: 'Deployment',
  },
];

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
      isCritical: false, // will be evaluated against project max duration
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
  // Check for cycles
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
      errorMessage: `Circular dependency detected involving activities: ${cycleNodes?.join(', ')}`,
    };
  }

  const actMap = new Map<string, Activity>(activities.map(a => [a.id, a]));
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
  } else if (changedActivityId === 'C') {
    // Specialized high-yield scenarios for Activity C (the textbook non-critical activity)
    if (newDuration === 4) {
      explanation = `Activity C (Database Design) was increased from 3 to 4 days (+1 day). Because C initially had exactly 1 day of Total Float (Slack), this 1-day delay completely absorbed its float without delaying overall project completion (18 days). Both Path 1 (A-B-D-E-F) and Path 2 (A-C-D-E-F) now tie at 18 workdays!`;
      keyTakeaway = `Key Concept: Absorbing available slack does NOT delay the project, but it turns the path critical, creating multiple critical paths.`;
    } else if (newDuration >= 5) {
      const daysOver = newDuration - 3;
      explanation = `Activity C (Database Design) was increased from 3 to ${newDuration} days (+${daysOver} days). Since C only had 1 day of slack, the extra ${daysOver - 1} day(s) beyond its float pushed the start of Development (Activity D) and extended the entire project from 18 to ${newProjectDuration} days (+${projectDurationDelta} day${projectDurationDelta > 1 ? 's' : ''}). Path 2 (A-C-D-E-F) is now the controlling critical path!`;
      keyTakeaway = `Key Concept: Any delay beyond an activity's total float directly extends the project completion date.`;
    } else {
      // e.g. duration decreased to 2 or 1
      explanation = `Activity C duration was reduced from 3 to ${newDuration} days. Since C was already non-critical, reducing its duration simply increased its total float from 1 to ${newAct.totalFloat} days. Project duration remains ${newProjectDuration} days.`;
      keyTakeaway = `Key Concept: Crashing or shortening non-critical tasks does not shorten the project duration.`;
    }
  } else if (oldAct?.isCritical) {
    // Modifying a critical activity
    if (durationDelta > 0) {
      explanation = `Activity ${changedActivityId} (${newAct.name}) is on the critical path (Total Float = 0). Increasing its duration by ${durationDelta} day(s) directly extends the overall project duration from ${oldProjectDuration} to ${newProjectDuration} workdays (+${projectDurationDelta} days).`;
      keyTakeaway = `Key Concept: Critical activities have ZERO float. Every day of delay on a critical activity extends project completion by a full day!`;
    } else {
      explanation = `Activity ${changedActivityId} (${newAct.name}) was shortened by ${Math.abs(durationDelta)} day(s). If this was the only controlling path, overall project duration drops from ${oldProjectDuration} to ${newProjectDuration} workdays.`;
      keyTakeaway = `Key Concept: To compress (crash) a project schedule, project managers must focus exclusively on critical path activities.`;
    }
  } else {
    // Non-critical activity
    if (durationDelta <= (oldAct?.totalFloat ?? 0)) {
      explanation = `Activity ${changedActivityId} is non-critical. The delay of ${durationDelta} day(s) is within its available float of ${oldAct?.totalFloat} day(s). Total project duration remains unchanged at ${newProjectDuration} workdays.`;
      keyTakeaway = `Float acts as a buffer against schedule uncertainty for non-critical activities.`;
    } else {
      explanation = `Activity ${changedActivityId} exceeded its total float buffer! The excess delay cascaded into successor tasks, extending project duration to ${newProjectDuration} workdays.`;
      keyTakeaway = `A non-critical activity becomes critical once all its float is exhausted.`;
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

