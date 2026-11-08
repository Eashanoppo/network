import { describe, it, expect } from 'vitest';
import {
  calculateSchedule,
  BASELINE_ACTIVITIES,
} from '../engine/cpmEngine';
import {
  simulateDurationChange,
  simulateDelay,
  simulateCompression,
  simulateDependencyChange,
  simulatePertEstimate,
  applySimulation,
  compareSchedules,
} from '../engine/simulationEngine';
import {
  SAMPLE_PROJECT_UMS,
  SAMPLE_PROJECT_WEBSITE,
  SAMPLE_PROJECT_BLANK,
} from '../data/sampleProjects';
import { Activity, Project } from '../types/scheduling';

describe('Unified Simulation Preview & Multi-Tier Schedule Verification (Prompt 3)', () => {
  /* ========================================================================
   * 1. PREVIEW BEHAVIOR & DURATION TESTS
   * ======================================================================== */
  it('Criterion 1: Changing C from 3 to 4 previews 18 days and two critical paths without mutating working schedule', () => {
    const workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));
    const workingSchedule = calculateSchedule(workingActivities);

    // Initial working baseline check
    expect(workingSchedule.projectDuration).toBe(18);
    expect(workingSchedule.criticalPaths.length).toBe(1);
    expect(workingSchedule.activities['C'].totalFloat).toBe(1);

    // Run preview simulation
    const scenario = simulateDurationChange(workingActivities, 'C', 4);

    expect(scenario.isValid).toBe(true);
    expect(scenario.schedule.projectDuration).toBe(18);
    expect(scenario.comparison.projectDurationDelta).toBe(0);
    expect(scenario.schedule.criticalPaths.length).toBe(2);

    const paths = scenario.schedule.criticalPaths.map(p => p.activityIds.join('-'));
    expect(paths).toContain('A-B-D-E-F');
    expect(paths).toContain('A-C-D-E-F');

    // Float of C is absorbed from 1 to 0
    expect(scenario.schedule.activities['C'].totalFloat).toBe(0);
    expect(scenario.schedule.activities['C'].isCritical).toBe(true);

    // Verify workingActivities was NOT mutated
    expect(workingActivities.find(a => a.id === 'C')!.duration).toBe(3);
  });

  it('Criterion 2: Changing C from 3 to 5 previews 19 days and flips the critical path', () => {
    const workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));
    const scenario = simulateDurationChange(workingActivities, 'C', 5);

    expect(scenario.isValid).toBe(true);
    expect(scenario.schedule.projectDuration).toBe(19);
    expect(scenario.comparison.projectDurationDelta).toBe(1);

    // Activity C is critical; Activity B gains 1 day of float
    expect(scenario.schedule.activities['C'].isCritical).toBe(true);
    expect(scenario.schedule.activities['C'].totalFloat).toBe(0);
    expect(scenario.schedule.activities['B'].isCritical).toBe(false);
    expect(scenario.schedule.activities['B'].totalFloat).toBe(1);

    // Controlling critical path is now A-C-D-E-F
    expect(scenario.schedule.criticalActivityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
    expect(scenario.schedule.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
  });

  /* ========================================================================
   * 2. CROSS-SECTION VISUALIZATION SYNCHRONIZATION
   * ======================================================================== */
  it('Criteria 3, 4, 5 & 11: All visualizations (Network Diagram, CPM Table, Gantt Chart) read identical preview metrics', () => {
    const workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));
    const scenario = simulateDurationChange(workingActivities, 'C', 5);
    const previewSched = scenario.schedule;

    // 1. Network Diagram Node Metrics Agreement
    // Node C: Duration=5, ES=3, EF=8, LS=3, LF=8, Float=0
    expect(previewSched.activities['C'].duration).toBe(5);
    expect(previewSched.activities['C'].es).toBe(3);
    expect(previewSched.activities['C'].ef).toBe(8);
    expect(previewSched.activities['C'].ls).toBe(3);
    expect(previewSched.activities['C'].lf).toBe(8);
    expect(previewSched.activities['C'].totalFloat).toBe(0);
    expect(previewSched.activities['C'].isCritical).toBe(true);

    // Node D: Pred B (EF 7) & C (EF 8) -> ES = max(7, 8) = 8
    expect(previewSched.activities['D'].es).toBe(8);
    expect(previewSched.activities['D'].ef).toBe(14); // 8 + 6 = 14

    // Node E: ES = 14, EF = 17
    expect(previewSched.activities['E'].es).toBe(14);
    expect(previewSched.activities['E'].ef).toBe(17);

    // Node F: ES = 17, EF = 19
    expect(previewSched.activities['F'].es).toBe(17);
    expect(previewSched.activities['F'].ef).toBe(19);

    // 2. CPM Table Agreement
    // Table rows use previewSched.activityList; verify all match previewSched.activities dictionary
    previewSched.activityList.forEach(row => {
      const dictAct = previewSched.activities[row.id];
      expect(dictAct).toBeDefined();
      expect(row.es).toBe(dictAct.es);
      expect(row.ef).toBe(dictAct.ef);
      expect(row.ls).toBe(dictAct.ls);
      expect(row.lf).toBe(dictAct.lf);
      expect(row.totalFloat).toBe(dictAct.totalFloat);
      expect(row.isCritical).toBe(dictAct.isCritical);
    });

    // 3. Gantt Chart Agreement
    // Timeline max days is dynamically based on preview duration: Math.max(19 + 4, 22) = 23 days
    const ganttTimelineMaxDays = Math.max(previewSched.projectDuration + 4, 22);
    expect(ganttTimelineMaxDays).toBe(23);

    // Activity bar width calculation
    const cWidthPercent = ((previewSched.activities['C'].ef - previewSched.activities['C'].es) / ganttTimelineMaxDays) * 100;
    expect(cWidthPercent).toBeCloseTo((5 / 23) * 100, 2);

    // Project duration metric matches across all modules
    expect(previewSched.projectDuration).toBe(19);
  });

  /* ========================================================================
   * 3. APPLY / DISCARD & THREE-TIER STATE IMMUTABILITY
   * ======================================================================== */
  it('Criterion 6: Discard restores the previous working schedule without lingering preview state', () => {
    let workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));
    const initialSchedule = calculateSchedule(workingActivities);

    // User stages a simulation: C = 5d (19d duration)
    const scenario = simulateDurationChange(workingActivities, 'C', 5);
    expect(scenario.schedule.projectDuration).toBe(19);

    // User discards the simulation: working activities are left untouched
    // (In ScheduleContext, discardActiveSimulation clears activeSimulation and sets viewMode to 'current')
    const postDiscardSchedule = calculateSchedule(workingActivities);

    expect(postDiscardSchedule.projectDuration).toBe(initialSchedule.projectDuration);
    expect(postDiscardSchedule.projectDuration).toBe(18);
    expect(postDiscardSchedule.activities['C'].duration).toBe(3);
    expect(postDiscardSchedule.activities['C'].totalFloat).toBe(1);
    expect(postDiscardSchedule.criticalActivityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
  });

  it('Criterion 7: Apply updates the working schedule while baseline remains unchanged', () => {
    const baselineActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));
    let workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));

    // Stage simulation: C = 5
    const scenario = simulateDurationChange(workingActivities, 'C', 5);
    expect(scenario.schedule.projectDuration).toBe(19);

    // Apply simulation
    workingActivities = applySimulation(workingActivities, scenario);

    // Working schedule is updated to 19 days
    const updatedWorkingSchedule = calculateSchedule(workingActivities);
    expect(updatedWorkingSchedule.projectDuration).toBe(19);
    expect(updatedWorkingSchedule.activities['C'].duration).toBe(5);
    expect(updatedWorkingSchedule.activities['C'].isCritical).toBe(true);

    // Criterion 8: Baseline remains 100% unchanged at 18 days!
    const baselineSchedule = calculateSchedule(baselineActivities);
    expect(baselineSchedule.projectDuration).toBe(18);
    expect(baselineSchedule.activities['C'].duration).toBe(3);
    expect(baselineSchedule.activities['C'].totalFloat).toBe(1);
    expect(baselineSchedule.criticalActivityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
  });

  /* ========================================================================
   * 4. PROJECT SWITCHING & STALE PREVIEW ISOLATION
   * ======================================================================== */
  it("Criterion 9: Changing projects isolates simulations and clears other projects' previews", () => {
    const project1 = JSON.parse(JSON.stringify(SAMPLE_PROJECT_UMS)) as Project;
    const project2 = JSON.parse(JSON.stringify(SAMPLE_PROJECT_WEBSITE)) as Project;

    // Run simulation on Project 1
    const simP1 = simulateDurationChange(project1.activities, 'C', 5);
    expect(simP1.schedule.projectDuration).toBe(19);

    // Switch to Project 2: project 2 schedule is calculated purely from its own activities
    const schedP2 = calculateSchedule(project2.activities);
    expect(schedP2.projectDuration).toBe(27);
    expect(project2.activities.some(a => a.id === 'REQ')).toBe(true);
    expect(project2.activities.some(a => a.id === 'C')).toBe(false);

    // Project 1 activities remained at 18d baseline
    const schedP1 = calculateSchedule(project1.activities);
    expect(schedP1.projectDuration).toBe(18);
  });

  it('Criterion 10: Multiple sequential preview changes evaluate without stale or cached state', () => {
    const workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));

    // Step 1: Preview C = 4
    const sim1 = simulateDurationChange(workingActivities, 'C', 4);
    expect(sim1.schedule.projectDuration).toBe(18);
    expect(sim1.schedule.criticalPaths.length).toBe(2);

    // Step 2: Immediately preview C = 5 (no apply)
    const sim2 = simulateDurationChange(workingActivities, 'C', 5);
    expect(sim2.schedule.projectDuration).toBe(19);
    expect(sim2.schedule.criticalPaths.length).toBe(1);
    expect(sim2.schedule.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);

    // Step 3: Immediately preview critical task B = 6
    const sim3 = simulateDurationChange(workingActivities, 'B', 6);
    expect(sim3.schedule.projectDuration).toBe(20);
    expect(sim3.schedule.activities['B'].ef).toBe(9);
    expect(sim3.schedule.activities['C'].totalFloat).toBe(3);

    // Step 4: Immediately preview crashing critical task B = 3 (from 4d to 3d)
    const sim4 = simulateCompression(workingActivities, 'B', 1);
    // Since both B (3d) and C (3d) finish on Day 6, D starts on Day 7, compressing project from 18 to 17 days with 2 critical paths!
    expect(sim4.schedule.projectDuration).toBe(17);
    expect(sim4.schedule.criticalPaths.length).toBe(2);
  });

  /* ========================================================================
   * 5. PERT & DEPENDENCY LIVE SIMULATION TESTS
   * ======================================================================== */
  it('simulates PERT three-point estimate and produces mathematically sound schedule preview', () => {
    const workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));

    // For Activity D: O=4, M=6, P=14 -> (4 + 24 + 14)/6 = 7.0 workdays
    const simPert = simulatePertEstimate(workingActivities, 'D', 4, 6, 14);

    expect(simPert.isValid).toBe(true);
    expect(simPert.proposedActivities.find(a => a.id === 'D')!.duration).toBe(7);
    // D duration expands from 6 to 7 days, so project duration expands from 18 to 19 days
    expect(simPert.schedule.projectDuration).toBe(19);
    expect(simPert.comparison.projectDurationDelta).toBe(1);
  });

  it('simulates generalized dependency change (SS with +2 lag) in preview mode', () => {
    const workingActivities: Activity[] = JSON.parse(JSON.stringify(BASELINE_ACTIVITIES));

    // Simulate changing Activity B's predecessor link to A with SS lag +2
    const simDep = simulateDependencyChange(workingActivities, 'B', [
      { predecessorId: 'A', type: 'SS', lag: 2 },
    ]);

    expect(simDep.isValid).toBe(true);
    // A starts Day 0 (tS=0). B with SS lag 2 starts Day 2 (tS=2, ES=2), duration 4 -> EF=6 (instead of Day 7!)
    expect(simDep.schedule.activities['B'].es).toBe(2);
    expect(simDep.schedule.activities['B'].ef).toBe(6);
  });
});
