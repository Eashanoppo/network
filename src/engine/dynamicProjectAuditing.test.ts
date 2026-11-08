import { describe, it, expect } from 'vitest';
import { calculateSchedule, detectCycles, validateActivities } from './cpmEngine';
import { Activity } from '../types/scheduling';
import { simulateDurationChange, simulateDelay, simulateCompression, simulatePertEstimate } from './simulationEngine';

describe('Auditing Suite: Dynamic Project Topologies & CPM Verification', () => {
  // 1. Single activity project
  describe('1-Activity Project', () => {
    it('correctly schedules a single standard activity', () => {
      const activities: Activity[] = [
        { id: 'SINGLE', name: 'Solitary Work Package', duration: 7, predecessors: [] },
      ];
      const result = calculateSchedule(activities);
      expect(result.isValid).toBe(true);
      expect(result.projectDuration).toBe(7);
      expect(result.activities['SINGLE'].es).toBe(0);
      expect(result.activities['SINGLE'].ef).toBe(7);
      expect(result.activities['SINGLE'].ls).toBe(0);
      expect(result.activities['SINGLE'].lf).toBe(7);
      expect(result.activities['SINGLE'].totalFloat).toBe(0);
      expect(result.activities['SINGLE'].freeFloat).toBe(0);
      expect(result.activities['SINGLE'].isCritical).toBe(true);
      expect(result.criticalPaths[0].activityIds).toEqual(['SINGLE']);
    });

    it('correctly schedules a single milestone (0 duration)', () => {
      const activities: Activity[] = [
        { id: 'M0', name: 'Project Kickoff Milestone', duration: 0, isMilestone: true, predecessors: [] },
      ];
      const result = calculateSchedule(activities);
      expect(result.isValid).toBe(true);
      expect(result.projectDuration).toBe(0);
      expect(result.activities['M0'].es).toBe(0);
      expect(result.activities['M0'].ef).toBe(0);
      expect(result.activities['M0'].totalFloat).toBe(0);
      expect(result.activities['M0'].isCritical).toBe(true);
    });
  });

  // 2. Three activities projects
  describe('3-Activity Projects', () => {
    it('schedules a purely linear 3-activity chain', () => {
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 3, predecessors: [] },
        { id: 'B', name: 'Task B', duration: 4, predecessors: ['A'] },
        { id: 'C', name: 'Task C', duration: 5, predecessors: ['B'] },
      ];
      const result = calculateSchedule(activities);
      expect(result.projectDuration).toBe(12); // 3 + 4 + 5
      expect(result.activities['A'].es).toBe(0);
      expect(result.activities['A'].ef).toBe(3);
      expect(result.activities['B'].es).toBe(3);
      expect(result.activities['B'].ef).toBe(7);
      expect(result.activities['C'].es).toBe(7);
      expect(result.activities['C'].ef).toBe(12);
      expect(result.criticalPaths[0].activityIds).toEqual(['A', 'B', 'C']);
    });

    it('schedules a 3-activity parallel split and merge', () => {
      // Start node splits into B (fast) and C (slow)
      const activities: Activity[] = [
        { id: 'A', name: 'Start', duration: 2, predecessors: [] },
        { id: 'B', name: 'Fast Branch', duration: 3, predecessors: ['A'] },
        { id: 'C', name: 'Slow Branch', duration: 6, predecessors: ['A'] },
      ];
      const result = calculateSchedule(activities);
      // Path A-B = 2 + 3 = 5
      // Path A-C = 2 + 6 = 8
      expect(result.projectDuration).toBe(8);
      expect(result.activities['B'].totalFloat).toBe(3); // 8 - 5 = 3
      expect(result.activities['B'].freeFloat).toBe(3);
      expect(result.activities['C'].totalFloat).toBe(0);
      expect(result.activities['C'].isCritical).toBe(true);
    });
  });

  // 3. Canonical 6-activity University Management System verification
  describe('6-Activity Canonical University Management System', () => {
    const baseUMS: Activity[] = [
      { id: 'A', name: 'Requirements Analysis', duration: 3, predecessors: [] },
      { id: 'B', name: 'System Design', duration: 4, predecessors: ['A'] },
      { id: 'C', name: 'Database Design', duration: 3, predecessors: ['A'] },
      { id: 'D', name: 'Development', duration: 6, predecessors: ['B', 'C'] },
      { id: 'E', name: 'Testing', duration: 3, predecessors: ['D'] },
      { id: 'F', name: 'User Training', duration: 2, predecessors: ['E'] },
    ];

    it('UMS baseline: duration = 18, critical path = A-B-D-E-F, C total float = 1', () => {
      const res = calculateSchedule(baseUMS);
      expect(res.projectDuration).toBe(18);
      expect(res.criticalPaths.length).toBe(1);
      expect(res.criticalPaths[0].activityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
      expect(res.activities['C'].totalFloat).toBe(1);
      expect(res.activities['C'].freeFloat).toBe(1);
      expect(res.activities['B'].totalFloat).toBe(0);
    });

    it('UMS with C = 4: duration remains 18, exactly two critical paths', () => {
      const acts = baseUMS.map(a => a.id === 'C' ? { ...a, duration: 4 } : a);
      const res = calculateSchedule(acts);
      expect(res.projectDuration).toBe(18);
      expect(res.criticalPaths.length).toBe(2);
      const paths = res.criticalPaths.map(p => p.activityIds.join('-'));
      expect(paths).toContain('A-B-D-E-F');
      expect(paths).toContain('A-C-D-E-F');
      expect(res.activities['C'].totalFloat).toBe(0);
      expect(res.activities['B'].totalFloat).toBe(0);
    });

    it('UMS with C = 5: duration becomes 19, critical path shifts to A-C-D-E-F', () => {
      const acts = baseUMS.map(a => a.id === 'C' ? { ...a, duration: 5 } : a);
      const res = calculateSchedule(acts);
      expect(res.projectDuration).toBe(19);
      expect(res.criticalPaths.length).toBe(1);
      expect(res.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
      expect(res.activities['C'].totalFloat).toBe(0);
      expect(res.activities['B'].totalFloat).toBe(1); // B now has 1 day of slack!
    });
  });

  // 4. Ten activities project
  describe('10-Activity Multi-Branch Project', () => {
    it('correctly calculates forward and backward passes across 10 activities with parallel branches', () => {
      const activities: Activity[] = [
        { id: 'A1', name: 'Initiation', duration: 2, predecessors: [] },
        { id: 'A2', name: 'Feasibility', duration: 3, predecessors: ['A1'] },
        { id: 'A3', name: 'Procurement', duration: 5, predecessors: ['A1'] },
        { id: 'A4', name: 'Design Sprint', duration: 4, predecessors: ['A2'] },
        { id: 'A5', name: 'Vendor Setup', duration: 2, predecessors: ['A3'] },
        { id: 'A6', name: 'Core Engine Dev', duration: 6, predecessors: ['A4', 'A5'] },
        { id: 'A7', name: 'Security Audit', duration: 3, predecessors: ['A6'] },
        { id: 'A8', name: 'QA Performance', duration: 4, predecessors: ['A6'] },
        { id: 'A9', name: 'Release Prep', duration: 2, predecessors: ['A7', 'A8'] },
        { id: 'A10', name: 'Go-Live Launch', duration: 1, predecessors: ['A9'] },
      ];

      const res = calculateSchedule(activities);
      expect(res.isValid).toBe(true);
      expect(res.activityList.length).toBe(10);
      // Path through A3: A1(2) + A3(5) + A5(2) = 9
      // Path through A2: A1(2) + A2(3) + A4(4) = 9 (both tie entering A6 on Day 10!)
      // A6 starts on Day 10, runs for 6 days -> Day 10..15 (EF = 15)
      // Path through A8: A6(15) -> A8(4d -> EF=19) -> A9(2d -> EF=21) -> A10(1d -> EF=22)
      // Path through A7: A6(15) -> A7(3d -> EF=18)
      expect(res.projectDuration).toBe(22);
      expect(res.activities['A10'].ef).toBe(22);
      expect(res.activities['A7'].totalFloat).toBe(1); // 4d vs 3d branch
    });
  });

  // 5. Twenty activities enterprise project
  describe('20-Activity Enterprise Network', () => {
    it('correctly scales and computes CPM across a 20-activity network with no performance degradation', () => {
      const activities: Activity[] = [];
      // Create 20 activities with 4 parallel tracks merging at milestones
      // Track 1: T1 -> T2 -> T3 -> T4
      // Track 2: T5 -> T6 -> T7 -> T8
      // Track 3: T9 -> T10 -> T11 -> T12
      // Track 4: T13 -> T14 -> T15 -> T16
      // Merge at M1 (T17), then T18 -> T19 -> T20 (Finish)

      activities.push({ id: 'T1', name: 'Track 1 Start', duration: 3, predecessors: [] });
      activities.push({ id: 'T2', name: 'Track 1 Work', duration: 4, predecessors: ['T1'] });
      activities.push({ id: 'T3', name: 'Track 1 Review', duration: 5, predecessors: ['T2'] });
      activities.push({ id: 'T4', name: 'Track 1 Done', duration: 2, predecessors: ['T3'] }); // 3+4+5+2 = 14

      activities.push({ id: 'T5', name: 'Track 2 Start', duration: 2, predecessors: [] });
      activities.push({ id: 'T6', name: 'Track 2 Work', duration: 6, predecessors: ['T5'] });
      activities.push({ id: 'T7', name: 'Track 2 Review', duration: 7, predecessors: ['T6'] });
      activities.push({ id: 'T8', name: 'Track 2 Done', duration: 3, predecessors: ['T7'] }); // 2+6+7+3 = 18 (controlling!)

      activities.push({ id: 'T9', name: 'Track 3 Start', duration: 4, predecessors: [] });
      activities.push({ id: 'T10', name: 'Track 3 Work', duration: 3, predecessors: ['T9'] });
      activities.push({ id: 'T11', name: 'Track 3 Review', duration: 2, predecessors: ['T10'] });
      activities.push({ id: 'T12', name: 'Track 3 Done', duration: 2, predecessors: ['T11'] }); // 4+3+2+2 = 11

      activities.push({ id: 'T13', name: 'Track 4 Start', duration: 1, predecessors: [] });
      activities.push({ id: 'T14', name: 'Track 4 Work', duration: 4, predecessors: ['T13'] });
      activities.push({ id: 'T15', name: 'Track 4 Review', duration: 5, predecessors: ['T14'] });
      activities.push({ id: 'T16', name: 'Track 4 Done', duration: 2, predecessors: ['T15'] }); // 1+4+5+2 = 12

      // Convergence Milestone
      activities.push({ id: 'T17', name: 'Sync Milestone', duration: 0, isMilestone: true, predecessors: ['T4', 'T8', 'T12', 'T16'] });

      // Tail execution
      activities.push({ id: 'T18', name: 'Final Integration', duration: 5, predecessors: ['T17'] });
      activities.push({ id: 'T19', name: 'UAT & Verification', duration: 4, predecessors: ['T18'] });
      activities.push({ id: 'T20', name: 'Deployment', duration: 2, predecessors: ['T19'] });

      const startTime = performance.now();
      const res = calculateSchedule(activities);
      const elapsedMs = performance.now() - startTime;

      expect(res.isValid).toBe(true);
      expect(res.activityList.length).toBe(20);
      expect(elapsedMs).toBeLessThan(50); // High-speed execution requirement

      // Controlling track 2: 18 workdays + 0 milestone + 5 + 4 + 2 = 29 workdays total!
      expect(res.projectDuration).toBe(29);
      expect(res.activities['T17'].es).toBe(18); // Milestone day
      expect(res.activities['T18'].es).toBe(18);
      expect(res.activities['T20'].ef).toBe(29);

      // Track 1 should have float: 18 - 14 = 4 days
      expect(res.activities['T4'].totalFloat).toBe(4);
      // Track 3 should have float: 18 - 11 = 7 days
      expect(res.activities['T12'].totalFloat).toBe(7);
      // Critical path must follow Track 2
      expect(res.criticalPaths[0].activityIds).toEqual(['T5', 'T6', 'T7', 'T8', 'T17', 'T18', 'T19', 'T20']);
    });
  });

  // 6. Multiple terminal activities
  describe('Multiple Terminal Activities', () => {
    it('correctly handles networks with multiple terminal tasks completing on different dates', () => {
      const activities: Activity[] = [
        { id: 'START', name: 'Kickoff', duration: 4, predecessors: [] },
        { id: 'DOCS', name: 'User Documentation', duration: 3, predecessors: ['START'] }, // Finishes Day 7
        { id: 'CODE', name: 'Main Development', duration: 8, predecessors: ['START'] },   // Finishes Day 12
        { id: 'MARKET', name: 'Marketing Campaign', duration: 5, predecessors: ['START'] }, // Finishes Day 9
      ];
      // Three distinct terminal activities: DOCS, CODE, MARKET
      const res = calculateSchedule(activities);
      expect(res.projectDuration).toBe(12);
      expect(res.activities['CODE'].isCritical).toBe(true);
      expect(res.activities['CODE'].totalFloat).toBe(0);
      expect(res.activities['CODE'].lf).toBe(12);

      // DOCS finishes Day 7, project ends Day 12 -> Total float = 5
      expect(res.activities['DOCS'].ef).toBe(7);
      expect(res.activities['DOCS'].lf).toBe(12);
      expect(res.activities['DOCS'].totalFloat).toBe(5);
      expect(res.activities['DOCS'].freeFloat).toBe(5);

      // MARKET finishes Day 9, project ends Day 12 -> Total float = 3
      expect(res.activities['MARKET'].ef).toBe(9);
      expect(res.activities['MARKET'].lf).toBe(12);
      expect(res.activities['MARKET'].totalFloat).toBe(3);
      expect(res.activities['MARKET'].freeFloat).toBe(3);
    });
  });

  // 7. Mixed PDM dependency types (FS, SS, FF, SF, Lead/Lag)
  describe('Mixed PDM Dependency Types', () => {
    it('correctly calculates mixed FS, SS, FF, and SF dependencies in the same project', () => {
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 6, predecessors: [] },
        // B has SS with lag +2 from A -> ES_B >= ES_A + 2 = 1 + 2 = 3
        {
          id: 'B',
          name: 'Task B',
          duration: 4,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'SS', lag: 2 }],
        },
        // C has FF with lag +1 from A -> EF_C >= EF_A + 1 = 6 + 1 = 7 (ES_C = 7 - 3 + 1 = 5)
        {
          id: 'C',
          name: 'Task C',
          duration: 3,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'FF', lag: 1 }],
        },
        // D has FS from B and C with lag 0
        {
          id: 'D',
          name: 'Task D',
          duration: 2,
          predecessors: ['B', 'C'],
          dependencyRelations: [
            { predecessorId: 'B', type: 'FS', lag: 0 },
            { predecessorId: 'C', type: 'FS', lag: 0 },
          ],
        },
      ];

      const res = calculateSchedule(activities);
      expect(res.isValid).toBe(true);
      expect(res.activities['A'].es).toBe(0);
      expect(res.activities['A'].ef).toBe(6);

      // B starts on Day 2 (SS lag 2 from tS=0), duration 4 -> EF = 6
      expect(res.activities['B'].es).toBe(2);
      expect(res.activities['B'].ef).toBe(6);

      // C finishes on Day 7, duration 3 -> ES = 4, EF = 7
      expect(res.activities['C'].es).toBe(4);
      expect(res.activities['C'].ef).toBe(7);

      // D depends on B (EF=6) and C (EF=7). Max required start is Day 7.
      expect(res.activities['D'].es).toBe(7);
      expect(res.activities['D'].ef).toBe(9);
      expect(res.projectDuration).toBe(9);
    });

    it('correctly handles negative lag (lead) as fast-tracking concurrency', () => {
      const activities: Activity[] = [
        { id: 'A', name: 'Design Phase', duration: 6, predecessors: [] },
        // B has FS with -2 lag (2 days of lead / overlap) -> starts on EF_A - 2 = Day 4
        {
          id: 'B',
          name: 'Prototyping Phase',
          duration: 4,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'FS', lag: -2 }],
        },
      ];

      const res = calculateSchedule(activities);
      expect(res.activities['A'].es).toBe(0);
      expect(res.activities['A'].ef).toBe(6);
      expect(res.activities['B'].es).toBe(4); // Starts 2 days before A finishes!
      expect(res.activities['B'].ef).toBe(8); // Day 4..8 = 4 days
      expect(res.projectDuration).toBe(8);
    });
  });

  // 8. Simulation Engine integrity (Baseline immutability)
  describe('Simulation & Baseline Protection', () => {
    it('running simulations produces a scenario without modifying the original input array', () => {
      const originalActivities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 4, predecessors: [] },
        { id: 'B', name: 'Task B', duration: 5, predecessors: ['A'] },
      ];
      const snapshot = JSON.stringify(originalActivities);

      // Run duration simulation
      const scenario = simulateDurationChange(originalActivities, 'A', 8);
      expect(scenario.schedule.projectDuration).toBe(13); // 8 + 5 = 13
      expect(JSON.stringify(originalActivities)).toBe(snapshot); // Untouched!

      // Run delay simulation
      const delayScen = simulateDelay(originalActivities, 'A', 3);
      expect(delayScen.schedule.projectDuration).toBe(12); // 4+3 + 5 = 12
      expect(JSON.stringify(originalActivities)).toBe(snapshot); // Untouched!

      // Run compression simulation
      const crashScen = simulateCompression(originalActivities, 'B', 2);
      expect(crashScen.schedule.projectDuration).toBe(7); // 4 + 3 = 7
      expect(JSON.stringify(originalActivities)).toBe(snapshot); // Untouched!

      // Run PERT simulation
      const pertScen = simulatePertEstimate(originalActivities, 'B', 3, 5, 13);
      // (3 + 20 + 13) / 6 = 36 / 6 = 6d
      expect(pertScen.schedule.activities['B'].duration).toBe(6);
      expect(JSON.stringify(originalActivities)).toBe(snapshot); // Untouched!
    });
  });
});

