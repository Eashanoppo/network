import {
  Activity,
  ScheduleCalculationResult,
  ScheduleComparisonResult,
  SimulationScenario,
  SimulationType,
  ActivityChangeDelta,
  ValidationError,
} from '../types/scheduling';
import { calculateSchedule, validateActivities, BASELINE_ACTIVITIES } from './cpmEngine';
import { calculatePert } from './pertEngine';

/**
 * Deeply compares two schedules (e.g. baseline vs simulated, or current vs proposed)
 * and generates a structured causal impact delta and academic explanation.
 */
export function compareSchedules(
  baseSchedule: ScheduleCalculationResult,
  targetSchedule: ScheduleCalculationResult,
  changedActivityId?: string
): ScheduleComparisonResult {
  const oldProjectDuration = baseSchedule.projectDuration;
  const newProjectDuration = targetSchedule.projectDuration;
  const projectDurationDelta = newProjectDuration - oldProjectDuration;
  const projectDurationChanged = projectDurationDelta !== 0;

  const activityDeltas: Record<string, ActivityChangeDelta> = {};
  const affectedActivityIds: string[] = [];

  // Union of all activity IDs from both schedules
  const allIds = new Set([
    ...Object.keys(baseSchedule.activities || {}),
    ...Object.keys(targetSchedule.activities || {}),
  ]);

  const newCriticalActivities: string[] = [];
  const lostCriticalActivities: string[] = [];

  for (const id of allIds) {
    const oldAct = baseSchedule.activities[id];
    const newAct = targetSchedule.activities[id];

    if (!oldAct && !newAct) continue;

    const oldDur = oldAct?.duration ?? 0;
    const newDur = newAct?.duration ?? 0;
    const durDelta = newDur - oldDur;

    const oldEs = oldAct?.es ?? 0;
    const newEs = newAct?.es ?? 0;
    const oldEf = oldAct?.ef ?? 0;
    const newEf = newAct?.ef ?? 0;
    const oldLs = oldAct?.ls ?? 0;
    const newLs = newAct?.ls ?? 0;
    const oldLf = oldAct?.lf ?? 0;
    const newLf = newAct?.lf ?? 0;

    const oldFloat = oldAct?.totalFloat ?? 0;
    const newFloat = newAct?.totalFloat ?? 0;
    const floatDelta = newFloat - oldFloat;

    const wasCrit = oldAct?.isCritical ?? false;
    const isCrit = newAct?.isCritical ?? false;

    const esChanged = oldEs !== newEs;
    const efChanged = oldEf !== newEf;
    const lsChanged = oldLs !== newLs;
    const lfChanged = oldLf !== newLf;
    const floatChanged = oldFloat !== newFloat;
    const durChanged = durDelta !== 0;
    const critChanged = wasCrit !== isCrit;

    if (durChanged || esChanged || efChanged || lsChanged || lfChanged || floatChanged || critChanged) {
      affectedActivityIds.push(id);
    }

    if (!wasCrit && isCrit) newCriticalActivities.push(id);
    if (wasCrit && !isCrit) lostCriticalActivities.push(id);

    activityDeltas[id] = {
      activityId: id,
      name: newAct?.name || oldAct?.name || id,
      durationChanged: durChanged,
      oldDuration: oldDur,
      newDuration: newDur,
      durationDelta: durDelta,
      esChanged,
      oldEs,
      newEs,
      efChanged,
      oldEf,
      newEf,
      lsChanged,
      oldLs,
      newLs,
      lfChanged,
      oldLf,
      newLf,
      floatChanged,
      oldFloat,
      newFloat,
      floatDelta,
      criticalStatusChanged: critChanged,
      wasCritical: wasCrit,
      isCritical: isCrit,
    };
  }

  // Critical path comparison
  const oldPathStrings = (baseSchedule.criticalPaths || []).map(p => p.activityIds.join('-')).sort();
  const newPathStrings = (targetSchedule.criticalPaths || []).map(p => p.activityIds.join('-')).sort();
  const criticalPathsChanged =
    oldPathStrings.length !== newPathStrings.length ||
    oldPathStrings.some((str, i) => str !== newPathStrings[i]);

  // Causal explanation generation
  let explanation = '';
  let keyTakeaway = '';

  const targetAct = changedActivityId ? targetSchedule.activities[changedActivityId] : undefined;
  const targetOldAct = changedActivityId ? baseSchedule.activities[changedActivityId] : undefined;
  const targetDelta = targetAct && targetOldAct ? targetAct.duration - targetOldAct.duration : 0;

  if (affectedActivityIds.length === 0) {
    explanation = 'The simulated schedule is identical to the baseline project schedule.';
    keyTakeaway = `Project duration is ${newProjectDuration} workdays with critical path: ${newPathStrings.join(', ')}.`;
  } else if (changedActivityId && targetAct && targetOldAct) {
    const actName = `${changedActivityId} (${targetAct.name})`;
    const targetOldFloat = targetOldAct.totalFloat;
    const targetNewFloat = targetAct.totalFloat;

    if (targetDelta > 0) {
      // Delay / duration increase
      if (targetOldAct.isCritical) {
        explanation = `Activity ${actName} is on the critical path (Total Float = 0). Increasing its duration by ${targetDelta} day(s) directly delays project completion by +${projectDurationDelta} workdays (from ${oldProjectDuration} to ${newProjectDuration} days). Downstream activities (${targetAct.successors.join(', ') || 'end'}) are shifted by ${projectDurationDelta} days.`;
        keyTakeaway = 'Critical activities have zero slack: any delay on a critical activity extends total project duration by an identical amount.';
      } else if (targetDelta <= targetOldFloat) {
        explanation = `Activity ${actName} had ${targetOldFloat} day(s) of Total Float (slack). Increasing its duration by ${targetDelta} day(s) completely absorbed its available buffer (remaining float: ${targetNewFloat}d) without extending overall project completion (${newProjectDuration} workdays).`;
        if (targetNewFloat === 0) {
          explanation += ` Because float reached 0, this path is now tied for the longest duration, creating ${targetSchedule.criticalPaths.length} critical paths (${newPathStrings.join(', ')})!`;
          keyTakeaway = 'Absorbing all available slack turns a non-critical activity into a critical activity, generating multiple critical paths.';
        } else {
          keyTakeaway = 'A non-critical activity delayed within its total float does not extend the project completion date.';
        }
      } else {
        const excessDelay = targetDelta - targetOldFloat;
        explanation = `Activity ${actName} only had ${targetOldFloat} day(s) of float buffer. The delay of ${targetDelta} days exceeded its float by ${excessDelay} day(s). This pushed downstream successor starts and extended project completion from ${oldProjectDuration} to ${newProjectDuration} workdays (+${projectDurationDelta} days). Path ${newPathStrings.join(', ')} is now the controlling critical path.`;
        keyTakeaway = 'Any delay exceeding an activity’s total float directly extends the project completion date by the excess amount.';
      }
    } else if (targetDelta < 0) {
      // Compression / Crashing
      const savedDays = Math.abs(targetDelta);
      if (targetOldAct.isCritical) {
        if (projectDurationDelta < 0) {
          explanation = `Shortening critical activity ${actName} by ${savedDays} day(s) compressed the project duration from ${oldProjectDuration} to ${newProjectDuration} workdays (-${Math.abs(projectDurationDelta)} days).`;
          keyTakeaway = 'To compress overall project duration (schedule crashing), project managers must shorten activities on the critical path.';
        } else {
          explanation = `Shortening ${actName} by ${savedDays} day(s) did not shorten the overall project (${newProjectDuration} workdays) because a parallel path became the controlling critical path.`;
          keyTakeaway = 'Crashing a critical path activity only compresses the project until another parallel path becomes the controlling bottleneck.';
        }
      } else {
        explanation = `Shortening non-critical activity ${actName} by ${savedDays} day(s) increased its total float from ${targetOldFloat} to ${targetNewFloat} workdays. Overall project duration remains unchanged at ${newProjectDuration} workdays.`;
        keyTakeaway = 'Shortening non-critical activities does not accelerate project delivery; it only adds unnecessary slack.';
      }
    }
  } else {
    // General dependency or multi-activity change
    if (projectDurationChanged) {
      explanation = `The simulation modified project topology or durations, changing project duration by ${projectDurationDelta > 0 ? `+${projectDurationDelta}` : projectDurationDelta} workdays (from ${oldProjectDuration} to ${newProjectDuration} days). ${affectedActivityIds.length} activities were impacted.`;
      keyTakeaway = 'Structural network changes alter the longest path through the project.';
    } else {
      explanation = `The simulation impacted ${affectedActivityIds.length} activities without extending the overall project completion deadline of ${newProjectDuration} workdays.`;
      keyTakeaway = 'Schedule changes absorbed by existing float buffers do not affect final delivery milestones.';
    }
  }

  return {
    projectDurationDelta,
    oldProjectDuration,
    newProjectDuration,
    projectDurationChanged,
    affectedActivityIds,
    activityDeltas,
    criticalPathsChanged,
    oldCriticalPaths: baseSchedule.criticalPaths || [],
    newCriticalPaths: targetSchedule.criticalPaths || [],
    newCriticalActivities,
    lostCriticalActivities,
    explanation,
    keyTakeaway,
  };
}

/**
 * Simulates a duration change for a single activity without modifying the input array.
 */
export function simulateDurationChange(
  baseActivities: Activity[],
  activityId: string,
  newDuration: number
): SimulationScenario {
  // Input validation
  const validationErrors: ValidationError[] = [];

  const targetAct = baseActivities.find(a => a.id === activityId);
  if (!targetAct) {
    validationErrors.push({
      activityId,
      field: 'id',
      message: `Activity '${activityId}' does not exist in the schedule.`,
    });
  }

  if (typeof newDuration !== 'number' || isNaN(newDuration)) {
    validationErrors.push({
      activityId,
      field: 'duration',
      message: 'New duration must be a valid numeric value.',
    });
  } else if (newDuration < 0) {
    validationErrors.push({
      activityId,
      field: 'duration',
      message: 'Duration cannot be negative.',
    });
  } else if (!Number.isInteger(newDuration)) {
    validationErrors.push({
      activityId,
      field: 'duration',
      message: 'Duration must be an integer workday count.',
    });
  }

  if (validationErrors.length > 0) {
    const invalidSchedule: ScheduleCalculationResult = {
      activities: {},
      activityList: [],
      projectDuration: 0,
      criticalPaths: [],
      allPaths: [],
      criticalActivityIds: [],
      hasCycle: false,
      isValid: false,
      validationErrors,
      errorMessage: validationErrors.map(e => e.message).join(' | '),
    };

    return {
      id: `sim-dur-${activityId}-${Date.now()}`,
      type: 'duration',
      description: `Failed simulation: Invalid duration for activity ${activityId}`,
      targetActivityId: activityId,
      proposedActivities: baseActivities,
      schedule: invalidSchedule,
      comparison: {
        projectDurationDelta: 0,
        oldProjectDuration: 0,
        newProjectDuration: 0,
        projectDurationChanged: false,
        affectedActivityIds: [],
        activityDeltas: {},
        criticalPathsChanged: false,
        oldCriticalPaths: [],
        newCriticalPaths: [],
        newCriticalActivities: [],
        lostCriticalActivities: [],
        explanation: validationErrors[0].message,
        keyTakeaway: 'Rejected invalid simulation input.',
      },
      isValid: false,
      validationErrors,
    };
  }

  // Clone activities immutably
  const proposedActivities = baseActivities.map(act =>
    act.id === activityId ? { ...act, duration: Math.max(1, newDuration) } : { ...act }
  );

  const baseSchedule = calculateSchedule(baseActivities);
  const simSchedule = calculateSchedule(proposedActivities);
  const comparison = compareSchedules(baseSchedule, simSchedule, activityId);

  return {
    id: `sim-dur-${activityId}-${newDuration}`,
    type: 'duration',
    description: `Simulate Activity ${activityId} duration: ${targetAct?.duration}d → ${newDuration}d`,
    targetActivityId: activityId,
    proposedActivities,
    schedule: simSchedule,
    comparison,
    isValid: simSchedule.isValid,
    validationErrors: simSchedule.validationErrors || [],
  };
}

/**
 * Simulates adding or subtracting delay days from an activity.
 */
export function simulateDelay(
  baseActivities: Activity[],
  activityId: string,
  additionalDays: number
): SimulationScenario {
  const targetAct = baseActivities.find(a => a.id === activityId);
  const currentDuration = targetAct ? targetAct.duration : 1;
  const newDuration = Math.max(1, currentDuration + additionalDays);

  const scenario = simulateDurationChange(baseActivities, activityId, newDuration);
  scenario.type = 'delay';
  scenario.description = `Simulate delay of ${additionalDays > 0 ? `+${additionalDays}` : additionalDays} day(s) on Activity ${activityId}`;
  return scenario;
}

/**
 * Simulates modifying predecessor dependencies for an activity.
 */
export function simulateDependencyChange(
  baseActivities: Activity[],
  activityId: string,
  newPredecessors: string[]
): SimulationScenario {
  const validationErrors: ValidationError[] = [];

  const targetAct = baseActivities.find(a => a.id === activityId);
  if (!targetAct) {
    validationErrors.push({
      activityId,
      field: 'id',
      message: `Activity '${activityId}' does not exist in the schedule.`,
    });
  }

  const allIds = new Set(baseActivities.map(a => a.id));
  for (const pred of newPredecessors) {
    if (pred === activityId) {
      validationErrors.push({
        activityId,
        field: 'predecessors',
        message: `Activity '${activityId}' cannot depend on itself.`,
      });
    } else if (!allIds.has(pred)) {
      validationErrors.push({
        activityId,
        field: 'predecessors',
        message: `Unknown predecessor '${pred}' referenced.`,
      });
    }
  }

  if (validationErrors.length > 0) {
    const invalidSchedule: ScheduleCalculationResult = {
      activities: {},
      activityList: [],
      projectDuration: 0,
      criticalPaths: [],
      allPaths: [],
      criticalActivityIds: [],
      hasCycle: false,
      isValid: false,
      validationErrors,
      errorMessage: validationErrors.map(e => e.message).join(' | '),
    };

    return {
      id: `sim-dep-${activityId}-${Date.now()}`,
      type: 'dependency',
      description: `Failed simulation: Invalid predecessors for Activity ${activityId}`,
      targetActivityId: activityId,
      proposedActivities: baseActivities,
      schedule: invalidSchedule,
      comparison: {
        projectDurationDelta: 0,
        oldProjectDuration: 0,
        newProjectDuration: 0,
        projectDurationChanged: false,
        affectedActivityIds: [],
        activityDeltas: {},
        criticalPathsChanged: false,
        oldCriticalPaths: [],
        newCriticalPaths: [],
        newCriticalActivities: [],
        lostCriticalActivities: [],
        explanation: validationErrors[0].message,
        keyTakeaway: 'Rejected invalid dependency configuration.',
      },
      isValid: false,
      validationErrors,
    };
  }

  const proposedActivities = baseActivities.map(act =>
    act.id === activityId ? { ...act, predecessors: [...newPredecessors] } : { ...act }
  );

  const baseSchedule = calculateSchedule(baseActivities);
  const simSchedule = calculateSchedule(proposedActivities);
  const comparison = compareSchedules(baseSchedule, simSchedule, activityId);

  return {
    id: `sim-dep-${activityId}-${newPredecessors.join(',')}`,
    type: 'dependency',
    description: `Simulate dependencies for Activity ${activityId}: [${newPredecessors.join(', ')}]`,
    targetActivityId: activityId,
    proposedActivities,
    schedule: simSchedule,
    comparison,
    isValid: simSchedule.isValid,
    validationErrors: simSchedule.validationErrors || [],
  };
}

/**
 * Simulates applying a PERT three-point estimate to an activity.
 */
export function simulatePertEstimate(
  baseActivities: Activity[],
  activityId: string,
  optimistic: number,
  mostLikely: number,
  pessimistic: number
): SimulationScenario {
  const pertResult = calculatePert({ optimistic, mostLikely, pessimistic });
  const roundedDuration = Math.max(1, Math.round(pertResult.expectedDuration));

  const scenario = simulateDurationChange(baseActivities, activityId, roundedDuration);
  scenario.type = 'pert';
  scenario.description = `Simulate PERT estimate for Activity ${activityId}: O=${optimistic}, M=${mostLikely}, P=${pessimistic} → Expected=${roundedDuration}d`;

  // Attach pert metadata to the proposed activity
  scenario.proposedActivities = scenario.proposedActivities.map(act =>
    act.id === activityId ? { ...act, pert: { optimistic, mostLikely, pessimistic } } : act
  );

  return scenario;
}

/**
 * Promotes a simulation scenario to become the new applied working activities list.
 * Preserves the original baseline untouched.
 */
export function applySimulation(
  currentActivities: Activity[],
  scenario: SimulationScenario
): Activity[] {
  if (!scenario.isValid) {
    throw new Error(`Cannot apply invalid simulation scenario: ${scenario.schedule.errorMessage}`);
  }
  return scenario.proposedActivities.map(a => ({ ...a }));
}

/**
 * Discards a simulation scenario and restores the previous active activities list.
 */
export function discardSimulation(
  currentActivities: Activity[]
): Activity[] {
  return currentActivities.map(a => ({ ...a }));
}
