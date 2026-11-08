import { describe, it, expect } from 'vitest';
import {
  BASELINE_ACTIVITIES,
  calculateSchedule,
  analyzeDelayImpact,
  validateActivities,
  detectCycles,
} from '../engine/cpmEngine';
import {
  compareSchedules,
  simulateDurationChange,
  simulateDelay,
  simulateDependencyChange,
  simulatePertEstimate,
} from '../engine/simulationEngine';
import { calculatePert } from '../engine/pertEngine';
import { Activity } from '../types/scheduling';

describe('Shared Schedule & Data Synchronization Verification (Prompt 4)', () => {
  const baseSchedule = calculateSchedule(BASELINE_ACTIVITIES);

  it('CHECK 1: Change Activity C from 3 to 4 days across all modules', () => {
    // 1. Calculate schedule with C = 4
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, duration: 4 } : { ...a }
    );
    const result = calculateSchedule(modifiedActivities);

    // Synchronized CPM values
    expect(result.projectDuration).toBe(18);
    expect(result.activities['C'].totalFloat).toBe(0);
    expect(result.activities['C'].isCritical).toBe(true);
    expect(result.activities['B'].isCritical).toBe(true);

    // Dual critical paths
    expect(result.criticalPaths).toHaveLength(2);
    const pathDescriptions = result.criticalPaths.map(p => p.activityIds.join('-')).sort();
    expect(pathDescriptions).toEqual(['A-B-D-E-F', 'A-C-D-E-F']);

    // Dynamic explanation
    const impact = analyzeDelayImpact(baseSchedule, result, 'C');
    expect(impact.projectDurationDelta).toBe(0);
    expect(impact.explanation).toContain('absorbed available buffer');
    expect(impact.explanation).toContain('creating 2 critical paths');
  });

  it('CHECK 2: Change Activity C from 4 to 5 days across all modules', () => {
    // C = 5 days exceeds float
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, duration: 5 } : { ...a }
    );
    const result = calculateSchedule(modifiedActivities);

    // Project duration extends
    expect(result.projectDuration).toBe(19);

    // Path 2 becomes the single controlling critical path
    expect(result.criticalPaths).toHaveLength(1);
    expect(result.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);

    // Task B gains slack
    expect(result.activities['B'].isCritical).toBe(false);
    expect(result.activities['B'].totalFloat).toBe(1);

    // Dynamic diagnostic explanation
    const impact = analyzeDelayImpact(baseSchedule, result, 'C');
    expect(impact.projectDurationDelta).toBe(1);
    expect(impact.explanation).toContain('exceeded its float');
    expect(impact.keyTakeaway).toContain('excess amount');
  });

  it('CHECK 3: Change critical Activity B duration from 4 to 6 workdays', () => {
    // B is critical in baseline. Delaying B by +2 days (4 -> 6)
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'B' ? { ...a, duration: 6 } : { ...a }
    );
    const result = calculateSchedule(modifiedActivities);

    // Project duration directly extends by 2 days (18 -> 20)
    expect(result.projectDuration).toBe(20);

    // Downstream activities shift: D was ES 7 -> now ES 9
    expect(result.activities['D'].es).toBe(9);
    expect(result.activities['D'].ef).toBe(15);
    expect(result.activities['E'].es).toBe(15);
    expect(result.activities['F'].es).toBe(18);
    expect(result.activities['F'].ef).toBe(20);

    // Non-critical C gets more slack (from 1d to 3d)
    expect(result.activities['C'].totalFloat).toBe(3);

    // Dynamic explanation
    const impact = analyzeDelayImpact(baseSchedule, result, 'B');
    expect(impact.projectDurationDelta).toBe(2);
    expect(impact.explanation).toContain('critical path (Total Float = 0)');
    expect(impact.keyTakeaway).toContain('zero slack');
  });

  it('CHECK 4: Restore Baseline returns exact initial state', () => {
    const workingActivities: Activity[] = BASELINE_ACTIVITIES.map(a => ({
      ...a,
      duration: a.id === 'C' ? 9 : a.duration,
      progress: 50,
    }));

    // Reset action restores baseline activities
    const restored = BASELINE_ACTIVITIES.map(a => ({ ...a }));
    const restoredSchedule = calculateSchedule(restored);

    expect(restoredSchedule.projectDuration).toBe(18);
    expect(restoredSchedule.criticalPaths).toHaveLength(1);
    expect(restoredSchedule.criticalPaths[0].activityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
    expect(restoredSchedule.activities['C'].duration).toBe(3);
    expect(restoredSchedule.activities['C'].totalFloat).toBe(1);
    expect(restoredSchedule.activities['C'].progress).toBe(65);
  });

  it('CHECK 5: Shared activity selection metrics consistency across modules', () => {
    // Activity C values in schedule
    const actC = baseSchedule.activities['C'];

    // In Network Diagram, CPM table, Gantt Chart:
    expect(actC.es).toBe(3);
    expect(actC.ef).toBe(6);
    expect(actC.ls).toBe(4);
    expect(actC.lf).toBe(7);
    expect(actC.totalFloat).toBe(1);
    expect(actC.freeFloat).toBe(1);
    expect(actC.isCritical).toBe(false);
  });

  it('CHECK 6: Edit progress does not distort planned schedule calculations', () => {
    const activitiesWithProgress: Activity[] = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, progress: 100 } : { ...a }
    );
    const result = calculateSchedule(activitiesWithProgress);

    // Duration and CPM metrics remain completely stable
    expect(result.projectDuration).toBe(18);
    expect(result.activities['C'].es).toBe(3);
    expect(result.activities['C'].ef).toBe(6);
    expect(result.activities['C'].totalFloat).toBe(1);
    expect(result.activities['C'].progress).toBe(100);
  });

  it('CHECK 7: Actual dependency change recalculates entire project network', () => {
    // Fast-track Activity E (Testing) by removing predecessor D, making E start concurrently after A
    const modifiedActivities: Activity[] = BASELINE_ACTIVITIES.map(a =>
      a.id === 'E' ? { ...a, predecessors: ['A'] } : { ...a }
    );
    const result = calculateSchedule(modifiedActivities);

    expect(result.isValid).toBe(true);
    // Activity E now starts right after A finishes (Day 3 instead of Day 13!)
    expect(result.activities['E'].es).toBe(3);
    expect(result.activities['E'].ef).toBe(6);
  });

  it('CHECK 8: Apply PERT estimate updates activity duration and CPM ripple', () => {
    // For Activity D: O=4, M=6, P=14 -> (4 + 24 + 14)/6 = 7.0 workdays
    const pert = calculatePert({ optimistic: 4, mostLikely: 6, pessimistic: 14 });
    const expectedDays = Math.round(pert.expectedDuration);
    expect(expectedDays).toBe(7);

    // Apply 7 days to Activity D
    const updatedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'D' ? { ...a, duration: expectedDays } : { ...a }
    );
    const updatedSchedule = calculateSchedule(updatedActivities);

    // Project duration extends from 18 to 19 days because D is critical
    expect(updatedSchedule.projectDuration).toBe(19);
    expect(updatedSchedule.activities['D'].duration).toBe(7);
  });

  it('CHECK 9: Invalid inputs are rejected with explicit diagnostic errors', () => {
    // 1. Circular dependency rejection
    const cycleActivities: Activity[] = BASELINE_ACTIVITIES.map(a =>
      a.id === 'A' ? { ...a, predecessors: ['F'] } : { ...a }
    );
    const cycleResult = calculateSchedule(cycleActivities);
    expect(cycleResult.isValid).toBe(false);
    expect(cycleResult.hasCycle).toBe(true);
    expect(cycleResult.errorMessage).toContain('Circular dependency');

    // 2. Unknown predecessor reference rejection
    const unknownPredList: Activity[] = BASELINE_ACTIVITIES.map(a =>
      a.id === 'B' ? { ...a, predecessors: ['UNKNOWN_TASK'] } : { ...a }
    );
    const validation = validateActivities(unknownPredList);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0].message).toContain("references an unknown predecessor 'UNKNOWN_TASK'");

    // 3. Negative duration rejection
    const negativeDurationList: Activity[] = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, duration: -3 } : { ...a }
    );
    const negValidation = validateActivities(negativeDurationList);
    expect(negValidation.isValid).toBe(false);
    expect(negValidation.errors[0].message).toContain('cannot be negative');
  });
});
