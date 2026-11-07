import { describe, it, expect } from 'vitest';
import { calculatePert } from './pertEngine';
import { calculateSchedule, BASELINE_ACTIVITIES, analyzeDelayImpact } from './cpmEngine';

describe('Academic Extension Tests', () => {
  it('PERT calculations match standard formula (O + 4M + P) / 6', () => {
    // Inputs: O = 4, M = 7, P = 16
    // Expected: (4 + 4*7 + 16) / 6 = (4 + 28 + 16) / 6 = 48 / 6 = 8.0
    const result = calculatePert({ optimistic: 4, mostLikely: 7, pessimistic: 16 });
    expect(result.expectedDuration).toBe(8);
    // Standard deviation: (16 - 4) / 6 = 12 / 6 = 2.0
    expect(result.standardDeviation).toBe(2);
    // Variance: 2^2 = 4.0
    expect(result.variance).toBe(4);
    // 68% confidence interval: 8 ± 2 = [6, 10]
    expect(result.confidence68).toEqual([6, 10]);
  });

  it('Critical activity delay directly extends project duration and creates no new critical paths if only one path is longer', () => {
    const base = calculateSchedule(BASELINE_ACTIVITIES);
    // Delay Activity B (critical) by 2 days (from 4 to 6)
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'B' ? { ...a, duration: 6 } : a
    );
    const modified = calculateSchedule(modifiedActivities);

    expect(modified.projectDuration).toBe(20);
    expect(modified.criticalPaths).toHaveLength(1);
    expect(modified.criticalPaths[0].activityIds).toEqual(['A', 'B', 'D', 'E', 'F']);

    // Non-critical Activity C total float expands because B finishes later
    expect(modified.activities.C.totalFloat).toBe(3);

    const impact = analyzeDelayImpact(base, modified, 'B');
    expect(impact.projectDurationDelta).toBe(2);
    expect(impact.criticalPathChanged).toBe(false);
  });

  it('Delaying non-critical Activity C by 1 day (duration 4) consumes its 1 day of slack without changing project duration', () => {
    const base = calculateSchedule(BASELINE_ACTIVITIES);
    const modifiedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'C' ? { ...a, duration: 4 } : a
    );
    const modified = calculateSchedule(modifiedActivities);

    const impact = analyzeDelayImpact(base, modified, 'C');
    expect(impact.projectDurationDelta).toBe(0);
    expect(impact.newProjectDuration).toBe(18);
    expect(impact.criticalPathChanged).toBe(true);
    expect(modified.criticalPaths).toHaveLength(2);
    expect(impact.explanation).toContain('absorbed');
  });
});
