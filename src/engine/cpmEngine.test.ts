import { describe, it, expect } from 'vitest';
import { calculateSchedule, BASELINE_ACTIVITIES, detectCycles } from './cpmEngine';

describe('CPM Calculation Engine Verification', () => {
  it('TEST 1: The original example produces an 18-workday schedule', () => {
    const result = calculateSchedule(BASELINE_ACTIVITIES);
    expect(result.hasCycle).toBe(false);
    expect(result.projectDuration).toBe(18);
  });

  it('TEST 2: The critical path is A-B-D-E-F', () => {
    const result = calculateSchedule(BASELINE_ACTIVITIES);
    expect(result.criticalPaths).toHaveLength(1);
    expect(result.criticalPaths[0].activityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
    expect(result.criticalActivityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
  });

  it('TEST 3: Activity C has one workday of total float and correct CPM values', () => {
    const result = calculateSchedule(BASELINE_ACTIVITIES);
    const { activities } = result;

    // A: ES 0, EF 3, LS 0, LF 3, Float 0
    expect(activities.A.es).toBe(0);
    expect(activities.A.ef).toBe(3);
    expect(activities.A.ls).toBe(0);
    expect(activities.A.lf).toBe(3);
    expect(activities.A.totalFloat).toBe(0);
    expect(activities.A.isCritical).toBe(true);

    // B: ES 3, EF 7, LS 3, LF 7, Float 0
    expect(activities.B.es).toBe(3);
    expect(activities.B.ef).toBe(7);
    expect(activities.B.ls).toBe(3);
    expect(activities.B.lf).toBe(7);
    expect(activities.B.totalFloat).toBe(0);
    expect(activities.B.isCritical).toBe(true);

    // C: ES 3, EF 6, LS 4, LF 7, Float 1
    expect(activities.C.es).toBe(3);
    expect(activities.C.ef).toBe(6);
    expect(activities.C.ls).toBe(4);
    expect(activities.C.lf).toBe(7);
    expect(activities.C.totalFloat).toBe(1);
    expect(activities.C.freeFloat).toBe(1); // D starts on day 7, 7 - 6 = 1
    expect(activities.C.isCritical).toBe(false);

    // D: ES 7, EF 13, LS 7, LF 13, Float 0
    expect(activities.D.es).toBe(7);
    expect(activities.D.ef).toBe(13);
    expect(activities.D.ls).toBe(7);
    expect(activities.D.lf).toBe(13);
    expect(activities.D.totalFloat).toBe(0);
    expect(activities.D.isCritical).toBe(true);

    // E: ES 13, EF 16, LS 13, LF 16, Float 0
    expect(activities.E.es).toBe(13);
    expect(activities.E.ef).toBe(16);
    expect(activities.E.ls).toBe(13);
    expect(activities.E.lf).toBe(16);
    expect(activities.E.totalFloat).toBe(0);
    expect(activities.E.isCritical).toBe(true);

    // F: ES 16, EF 18, LS 16, LF 18, Float 0
    expect(activities.F.es).toBe(16);
    expect(activities.F.ef).toBe(18);
    expect(activities.F.ls).toBe(16);
    expect(activities.F.lf).toBe(18);
    expect(activities.F.totalFloat).toBe(0);
    expect(activities.F.isCritical).toBe(true);
  });

  it('TEST 4: Changing C from 3 to 4 days produces two critical paths and 18-day duration', () => {
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, duration: 4 } : a
    );
    const result = calculateSchedule(modifiedActivities);

    expect(result.projectDuration).toBe(18);
    expect(result.activities.C.totalFloat).toBe(0);
    expect(result.activities.C.isCritical).toBe(true);
    expect(result.criticalPaths).toHaveLength(2);

    const pathStrings = result.criticalPaths.map(p => p.activityIds.join('-')).sort();
    expect(pathStrings).toEqual(['A-B-D-E-F', 'A-C-D-E-F']);
  });

  it('TEST 5: Changing C from 3 to 5 days increases project duration to 19 days', () => {
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, duration: 5 } : a
    );
    const result = calculateSchedule(modifiedActivities);

    expect(result.projectDuration).toBe(19);
    // C is now on the single controlling critical path
    expect(result.criticalPaths).toHaveLength(1);
    expect(result.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
    // B now has slack! Float of B becomes 1!
    expect(result.activities.B.isCritical).toBe(false);
    expect(result.activities.B.totalFloat).toBe(1);
  });

  it('Cycle detection prevents infinite loops and reports cycle nodes', () => {
    const cyclicActivities = [
      { id: 'A', name: 'Task A', duration: 2, predecessors: ['C'] },
      { id: 'B', name: 'Task B', duration: 3, predecessors: ['A'] },
      { id: 'C', name: 'Task C', duration: 4, predecessors: ['B'] },
    ];
    const { hasCycle, cycleNodes } = detectCycles(cyclicActivities);
    expect(hasCycle).toBe(true);
    expect(cycleNodes).toBeDefined();

    const result = calculateSchedule(cyclicActivities);
    expect(result.hasCycle).toBe(true);
    expect(result.errorMessage).toBeDefined();
  });
});

