import { describe, it, expect } from 'vitest';
import { BASELINE_ACTIVITIES, calculateSchedule, validateActivities } from './cpmEngine';
import {
  compareSchedules,
  simulateDurationChange,
  simulateDelay,
  simulateDependencyChange,
  simulatePertEstimate,
  applySimulation,
  discardSimulation,
} from './simulationEngine';
import { Activity } from '../types/scheduling';

describe('Simulation Engine Verification', () => {
  const baseSchedule = calculateSchedule(BASELINE_ACTIVITIES);

  it('TEST 1: Changing C from 3 to 4 days creates two critical paths while project duration remains 18 days', () => {
    const scenario = simulateDurationChange(BASELINE_ACTIVITIES, 'C', 4);

    expect(scenario.isValid).toBe(true);
    expect(scenario.schedule.projectDuration).toBe(18);
    expect(scenario.schedule.criticalPaths).toHaveLength(2);

    const pathStrings = scenario.schedule.criticalPaths
      .map(p => p.activityIds.join('-'))
      .sort();
    expect(pathStrings).toEqual(['A-B-D-E-F', 'A-C-D-E-F']);

    // Check delta comparison
    expect(scenario.comparison.projectDurationChanged).toBe(false);
    expect(scenario.comparison.projectDurationDelta).toBe(0);
    expect(scenario.comparison.criticalPathsChanged).toBe(true);
    expect(scenario.comparison.newCriticalActivities).toContain('C');
    expect(scenario.comparison.activityDeltas['C'].floatDelta).toBe(-1);
    expect(scenario.comparison.activityDeltas['C'].newFloat).toBe(0);
    expect(scenario.comparison.explanation).toContain('creating 2 critical paths');
  });

  it('TEST 2: Changing C from 3 to 5 days increases project duration to 19 days', () => {
    const scenario = simulateDurationChange(BASELINE_ACTIVITIES, 'C', 5);

    expect(scenario.isValid).toBe(true);
    expect(scenario.schedule.projectDuration).toBe(19);
    expect(scenario.comparison.projectDurationChanged).toBe(true);
    expect(scenario.comparison.projectDurationDelta).toBe(1);

    // C becomes critical, B gains float and is no longer critical
    expect(scenario.schedule.criticalPaths).toHaveLength(1);
    expect(scenario.schedule.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
    expect(scenario.comparison.newCriticalActivities).toContain('C');
    expect(scenario.comparison.lostCriticalActivities).toContain('B');
    expect(scenario.schedule.activities.B.totalFloat).toBe(1);
    expect(scenario.comparison.explanation).toContain('extended project completion');
  });

  it('TEST 3: Changing a non-critical activity within its float does not unnecessarily extend the project', () => {
    // Activity C has 1 day float. Changing duration from 3 to 3 (delay +0) or checking float consumption
    const scenario = simulateDelay(BASELINE_ACTIVITIES, 'C', 0);
    expect(scenario.schedule.projectDuration).toBe(18);
    expect(scenario.comparison.projectDurationChanged).toBe(false);

    // Simulating duration 3 -> 4 is +1d delay, equal to float, project remains 18 days
    const scenarioDelay1 = simulateDelay(BASELINE_ACTIVITIES, 'C', 1);
    expect(scenarioDelay1.schedule.projectDuration).toBe(18);
    expect(scenarioDelay1.comparison.projectDurationChanged).toBe(false);
    expect(scenarioDelay1.comparison.keyTakeaway).toContain('critical paths');
  });

  it('TEST 4: Delaying a critical activity directly extends the project completion duration', () => {
    // Activity B is critical with duration 4. Adding 2 days delay makes duration 6
    const scenario = simulateDelay(BASELINE_ACTIVITIES, 'B', 2);

    expect(scenario.isValid).toBe(true);
    expect(scenario.schedule.projectDuration).toBe(20); // 18 + 2
    expect(scenario.comparison.projectDurationChanged).toBe(true);
    expect(scenario.comparison.projectDurationDelta).toBe(2);
    expect(scenario.comparison.affectedActivityIds).toContain('B');
    expect(scenario.comparison.affectedActivityIds).toContain('D');
    expect(scenario.comparison.affectedActivityIds).toContain('E');
    expect(scenario.comparison.affectedActivityIds).toContain('F');
    expect(scenario.comparison.keyTakeaway).toContain('zero slack');
  });

  it('TEST 5: Simulation immutability - base activities are never mutated', () => {
    const originalDurationC = BASELINE_ACTIVITIES.find(a => a.id === 'C')!.duration;
    const originalLength = BASELINE_ACTIVITIES.length;

    const scenario = simulateDurationChange(BASELINE_ACTIVITIES, 'C', 9);

    expect(scenario.schedule.projectDuration).toBe(23);
    // Baseline must remain completely unchanged
    expect(BASELINE_ACTIVITIES.find(a => a.id === 'C')!.duration).toBe(originalDurationC);
    expect(BASELINE_ACTIVITIES.length).toBe(originalLength);
  });

  it('TEST 6: applySimulation promotes proposed activities to new current schedule while baseline remains intact', () => {
    const currentActivities: Activity[] = BASELINE_ACTIVITIES.map(a => ({ ...a }));
    const scenario = simulateDurationChange(currentActivities, 'C', 4);

    const updatedActivities = applySimulation(currentActivities, scenario);

    expect(updatedActivities.find(a => a.id === 'C')?.duration).toBe(4);
    // Baseline array untouched
    expect(BASELINE_ACTIVITIES.find(a => a.id === 'C')?.duration).toBe(3);
  });

  it('TEST 7: discardSimulation leaves current activities unchanged', () => {
    const currentActivities: Activity[] = BASELINE_ACTIVITIES.map(a => ({ ...a }));
    const discarded = discardSimulation(currentActivities);

    expect(discarded).toEqual(currentActivities);
    expect(discarded.find(a => a.id === 'C')?.duration).toBe(3);
  });

  it('TEST 8: Validation rejects invalid duration inputs with structured errors', () => {
    const negativeSim = simulateDurationChange(BASELINE_ACTIVITIES, 'C', -2);
    expect(negativeSim.isValid).toBe(false);
    expect(negativeSim.validationErrors[0].message).toContain('cannot be negative');

    const nonIntegerSim = simulateDurationChange(BASELINE_ACTIVITIES, 'C', 3.5);
    expect(nonIntegerSim.isValid).toBe(false);
    expect(nonIntegerSim.validationErrors[0].message).toContain('must be an integer');

    const nonExistentSim = simulateDurationChange(BASELINE_ACTIVITIES, 'Z', 5);
    expect(nonExistentSim.isValid).toBe(false);
    expect(nonExistentSim.validationErrors[0].message).toContain("Activity 'Z' does not exist");
  });

  it('TEST 9: Validation rejects duplicate IDs, unknown predecessors, self-references, and cycles', () => {
    // Duplicate IDs
    const duplicateList: Activity[] = [
      ...BASELINE_ACTIVITIES,
      { id: 'A', name: 'Duplicate A', duration: 2, predecessors: [] },
    ];
    const dupCheck = validateActivities(duplicateList);
    expect(dupCheck.isValid).toBe(false);
    expect(dupCheck.errors.some(e => e.message.includes("Duplicate Activity ID 'A'"))).toBe(true);

    // Unknown predecessor in simulation
    const invalidDepSim = simulateDependencyChange(BASELINE_ACTIVITIES, 'C', ['NON_EXISTENT']);
    expect(invalidDepSim.isValid).toBe(false);
    expect(invalidDepSim.validationErrors.some(e => e.message.includes("Unknown predecessor 'NON_EXISTENT'"))).toBe(true);

    // Self dependency
    const selfDepSim = simulateDependencyChange(BASELINE_ACTIVITIES, 'C', ['C']);
    expect(selfDepSim.isValid).toBe(false);
    expect(selfDepSim.validationErrors.some(e => e.message.includes('cannot depend on itself'))).toBe(true);

    // Cycle detection
    const cycleActivities: Activity[] = [
      { id: 'X', name: 'X', duration: 2, predecessors: ['Y'] },
      { id: 'Y', name: 'Y', duration: 2, predecessors: ['X'] },
    ];
    const cycleResult = calculateSchedule(cycleActivities);
    expect(cycleResult.isValid).toBe(false);
    expect(cycleResult.hasCycle).toBe(true);
    expect(cycleResult.errorMessage).toContain('Circular dependency');
  });

  it('TEST 10: simulatePertEstimate computes weighted expected duration and simulates schedule', () => {
    // For Activity C: Optimistic = 2, Most Likely = 3, Pessimistic = 10
    // Expected = (2 + 4*3 + 10) / 6 = (2 + 12 + 10) / 6 = 24 / 6 = 4.0 days
    const pertSim = simulatePertEstimate(BASELINE_ACTIVITIES, 'C', 2, 3, 10);

    expect(pertSim.isValid).toBe(true);
    expect(pertSim.type).toBe('pert');
    const proposedC = pertSim.proposedActivities.find(a => a.id === 'C');
    expect(proposedC?.duration).toBe(4);
    expect(pertSim.schedule.projectDuration).toBe(18);
    expect(pertSim.schedule.criticalPaths).toHaveLength(2);
    expect(proposedC?.pert).toEqual({ optimistic: 2, mostLikely: 3, pessimistic: 10 });
  });

  it('TEST 11: compareSchedules correctly analyzes schedule crashing (duration decrease)', () => {
    // If critical activity D is crashed from 6 days to 4 days (-2d)
    const crashedActivities = BASELINE_ACTIVITIES.map(a =>
      a.id === 'D' ? { ...a, duration: 4 } : a
    );
    const crashedSchedule = calculateSchedule(crashedActivities);
    const comparison = compareSchedules(baseSchedule, crashedSchedule, 'D');

    expect(comparison.projectDurationDelta).toBe(-2);
    expect(comparison.newProjectDuration).toBe(16);
    expect(comparison.explanation).toContain('compressed the project duration');
    expect(comparison.keyTakeaway).toContain('schedule crashing');
  });
});
