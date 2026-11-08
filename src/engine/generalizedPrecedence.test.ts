import { describe, it, expect } from 'vitest';
import {
  calculateSchedule,
  validateActivities,
  detectCycles,
  findCriticalPaths,
  BASELINE_ACTIVITIES,
} from './cpmEngine';
import { Activity } from '../types/scheduling';

describe('Generalized Precedence Scheduling Engine (PDM) Tests', () => {
  /* ========================================================================
   * 1. CANONICAL BENCHMARK EXAMPLE
   * ======================================================================== */
  describe('Canonical Academic Benchmark (University Management System)', () => {
    it('calculates exactly 18 workdays, critical path A-B-D-E-F, and C total float of 1 day', () => {
      const schedule = calculateSchedule(BASELINE_ACTIVITIES);

      expect(schedule.isValid).toBe(true);
      expect(schedule.hasCycle).toBe(false);
      expect(schedule.projectDuration).toBe(18);

      // Verify earliest and latest dates for all 6 activities
      // A (3d): ES=1, EF=3, LS=1, LF=3, Float=0
      expect(schedule.activities['A'].es).toBe(1);
      expect(schedule.activities['A'].ef).toBe(3);
      expect(schedule.activities['A'].ls).toBe(1);
      expect(schedule.activities['A'].lf).toBe(3);
      expect(schedule.activities['A'].totalFloat).toBe(0);
      expect(schedule.activities['A'].isCritical).toBe(true);

      // B (4d): ES=4, EF=7, LS=4, LF=7, Float=0
      expect(schedule.activities['B'].es).toBe(4);
      expect(schedule.activities['B'].ef).toBe(7);
      expect(schedule.activities['B'].ls).toBe(4);
      expect(schedule.activities['B'].lf).toBe(7);
      expect(schedule.activities['B'].totalFloat).toBe(0);
      expect(schedule.activities['B'].isCritical).toBe(true);

      // C (3d): ES=4, EF=6, LS=5, LF=7, Float=1
      expect(schedule.activities['C'].es).toBe(4);
      expect(schedule.activities['C'].ef).toBe(6);
      expect(schedule.activities['C'].ls).toBe(5);
      expect(schedule.activities['C'].lf).toBe(7);
      expect(schedule.activities['C'].totalFloat).toBe(1);
      expect(schedule.activities['C'].isCritical).toBe(false);

      // D (6d): ES=8, EF=13, LS=8, LF=13, Float=0
      expect(schedule.activities['D'].es).toBe(8);
      expect(schedule.activities['D'].ef).toBe(13);
      expect(schedule.activities['D'].ls).toBe(8);
      expect(schedule.activities['D'].lf).toBe(13);
      expect(schedule.activities['D'].totalFloat).toBe(0);
      expect(schedule.activities['D'].isCritical).toBe(true);

      // E (3d): ES=14, EF=16, LS=14, LF=16, Float=0
      expect(schedule.activities['E'].es).toBe(14);
      expect(schedule.activities['E'].ef).toBe(16);
      expect(schedule.activities['E'].totalFloat).toBe(0);
      expect(schedule.activities['E'].isCritical).toBe(true);

      // F (2d): ES=17, EF=18, LS=17, LF=18, Float=0
      expect(schedule.activities['F'].es).toBe(17);
      expect(schedule.activities['F'].ef).toBe(18);
      expect(schedule.activities['F'].totalFloat).toBe(0);
      expect(schedule.activities['F'].isCritical).toBe(true);

      // Critical path must be A-B-D-E-F
      expect(schedule.criticalActivityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
      expect(schedule.criticalPaths.length).toBe(1);
      expect(schedule.criticalPaths[0].activityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
    });
  });

  /* ========================================================================
   * 2. DURATION VARIATION TESTS
   * ======================================================================== */
  describe('Duration Sensitivity & Parallel Critical Path Tests', () => {
    it('increasing Activity C from 3 to 4 days preserves 18-day duration and generates two critical paths', () => {
      const activities: Activity[] = BASELINE_ACTIVITIES.map(a =>
        a.id === 'C' ? { ...a, duration: 4 } : { ...a }
      );
      const schedule = calculateSchedule(activities);

      expect(schedule.isValid).toBe(true);
      expect(schedule.projectDuration).toBe(18);

      // Both B and C now have zero total float
      expect(schedule.activities['B'].totalFloat).toBe(0);
      expect(schedule.activities['C'].totalFloat).toBe(0);
      expect(schedule.activities['B'].isCritical).toBe(true);
      expect(schedule.activities['C'].isCritical).toBe(true);

      // Both paths must be recognized as critical
      expect(schedule.criticalPaths.length).toBe(2);
      const pathStrings = schedule.criticalPaths.map(p => p.activityIds.join('-'));
      expect(pathStrings).toContain('A-B-D-E-F');
      expect(pathStrings).toContain('A-C-D-E-F');
    });

    it('increasing Activity C from 3 to 5 days extends project duration to 19 days and flips the critical path', () => {
      const activities: Activity[] = BASELINE_ACTIVITIES.map(a =>
        a.id === 'C' ? { ...a, duration: 5 } : { ...a }
      );
      const schedule = calculateSchedule(activities);

      expect(schedule.isValid).toBe(true);
      expect(schedule.projectDuration).toBe(19);

      // Activity C is now critical (float 0) and Activity B gains float 1
      expect(schedule.activities['C'].totalFloat).toBe(0);
      expect(schedule.activities['C'].isCritical).toBe(true);
      expect(schedule.activities['B'].totalFloat).toBe(1);
      expect(schedule.activities['B'].isCritical).toBe(false);

      expect(schedule.criticalActivityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
      expect(schedule.criticalPaths.length).toBe(1);
      expect(schedule.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
    });

    it('increasing critical Activity B by 2 days extends project duration from 18 to 20 days', () => {
      const activities: Activity[] = BASELINE_ACTIVITIES.map(a =>
        a.id === 'B' ? { ...a, duration: 6 } : { ...a }
      );
      const schedule = calculateSchedule(activities);

      expect(schedule.isValid).toBe(true);
      expect(schedule.projectDuration).toBe(20);
      expect(schedule.activities['B'].ef).toBe(9);
      // Activity C float expands from 1 to 3 days
      expect(schedule.activities['C'].totalFloat).toBe(3);
    });

    it('reducing non-critical Activity C duration from 3 to 1 day leaves project duration at 18 days and increases float to 3 days', () => {
      const activities: Activity[] = BASELINE_ACTIVITIES.map(a =>
        a.id === 'C' ? { ...a, duration: 1 } : { ...a }
      );
      const schedule = calculateSchedule(activities);

      expect(schedule.isValid).toBe(true);
      expect(schedule.projectDuration).toBe(18);
      expect(schedule.activities['C'].totalFloat).toBe(3);
      expect(schedule.activities['C'].freeFloat).toBe(3);
    });

    it('creates a second critical path through an independent parallel branch', () => {
      // Branch 1: A(3) -> B(7) -> D(2) = 12 workdays
      // Branch 2: A(3) -> C(7) -> D(2) = 12 workdays
      const activities: Activity[] = [
        { id: 'A', name: 'Start', duration: 3, predecessors: [] },
        { id: 'B', name: 'Branch North', duration: 7, predecessors: ['A'] },
        { id: 'C', name: 'Branch South', duration: 7, predecessors: ['A'] },
        { id: 'D', name: 'Convergence', duration: 2, predecessors: ['B', 'C'] },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(12);
      expect(schedule.activities['B'].totalFloat).toBe(0);
      expect(schedule.activities['C'].totalFloat).toBe(0);
      expect(schedule.criticalPaths.length).toBe(2);
      const paths = schedule.criticalPaths.map(p => p.activityIds.join('-'));
      expect(paths).toContain('A-B-D');
      expect(paths).toContain('A-C-D');
    });
  });

  /* ========================================================================
   * 3. GENERALIZED PRECEDENCE RELATIONSHIP TESTS (FS, SS, FF, SF + LEAD/LAG)
   * ======================================================================== */
  describe('Generalized Precedence Relationship Constraints', () => {
    it('FS with zero lag: successor starts immediately on next workday (EF_p + 1)', () => {
      // A (dur 3): ES=1, EF=3
      // B (dur 4): FS lag 0 -> ES=4, EF=7
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 3, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 4,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'FS', lag: 0 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(7);
      expect(schedule.activities['A'].es).toBe(1);
      expect(schedule.activities['A'].ef).toBe(3);
      expect(schedule.activities['B'].es).toBe(4);
      expect(schedule.activities['B'].ef).toBe(7);
    });

    it('FS with positive lag (+2): successor starts 2 workdays after predecessor finish (EF_p + 1 + 2)', () => {
      // A (dur 3): ES=1, EF=3
      // B (dur 4): FS lag +2 -> tS = tF_A + 2 = 3 + 2 = 5 -> ES = 6, EF = 9
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 3, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 4,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'FS', lag: 2 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(9);
      expect(schedule.activities['B'].es).toBe(6);
      expect(schedule.activities['B'].ef).toBe(9);
    });

    it('FS with negative lag / lead (-1): successor starts 1 day before predecessor finishes', () => {
      // A (dur 4): ES=1, EF=4 (tS=0, tF=4)
      // B (dur 3): FS lag -1 -> tS = tF_A - 1 = 4 - 1 = 3 -> ES = 4, EF = 6
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 4, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 3,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'FS', lag: -1 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.activities['A'].ef).toBe(4);
      expect(schedule.activities['B'].es).toBe(4);
      expect(schedule.activities['B'].ef).toBe(6);
      expect(schedule.projectDuration).toBe(6);
    });

    it('SS with zero lag: successor can start concurrently with predecessor on Day 1', () => {
      // A (dur 5): ES=1, EF=5 (tS=0, tF=5)
      // B (dur 3): SS lag 0 -> tS = tS_A + 0 = 0 -> ES = 1, EF = 3
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 5, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 3,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'SS', lag: 0 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.activities['B'].es).toBe(1);
      expect(schedule.activities['B'].ef).toBe(3);
      expect(schedule.projectDuration).toBe(5);
      // Activity B finishes at Day 3, but project completes at Day 5, so B has 2 days float
      expect(schedule.activities['B'].totalFloat).toBe(2);
    });

    it('SS with positive lag (+2): successor starts 2 days after predecessor starts', () => {
      // A (dur 6): ES=1, EF=6 (tS=0, tF=6)
      // B (dur 4): SS lag +2 -> tS = tS_A + 2 = 0 + 2 = 2 -> ES = 3, EF = 6
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 6, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 4,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'SS', lag: 2 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.activities['A'].es).toBe(1);
      expect(schedule.activities['B'].es).toBe(3);
      expect(schedule.activities['B'].ef).toBe(6);
      expect(schedule.projectDuration).toBe(6);
      // Both finish on Day 6, both critical
      expect(schedule.activities['A'].isCritical).toBe(true);
      expect(schedule.activities['B'].isCritical).toBe(true);
    });

    it('FF with positive lag (+2): successor finish must be at least 2 days after predecessor finish', () => {
      // A (dur 4): ES=1, EF=4 (tS=0, tF=4)
      // B (dur 3): FF lag +2 -> tF_B >= tF_A + 2 = 4 + 2 = 6 -> tS_B >= 6 - 3 = 3
      // ES = 4, EF = 6
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 4, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 3,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'FF', lag: 2 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.activities['A'].ef).toBe(4);
      expect(schedule.activities['B'].ef).toBe(6);
      expect(schedule.activities['B'].es).toBe(4);
      expect(schedule.projectDuration).toBe(6);
    });

    it('SF with positive lag (+5): successor finish must be at least 5 days after predecessor starts', () => {
      // A (dur 6): ES=1, EF=6 (tS=0, tF=6)
      // B (dur 2): SF lag +5 -> tF_B >= tS_A + 5 = 0 + 5 = 5 -> tS_B >= 5 - 2 = 3
      // ES = 4, EF = 5
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 6, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 2,
          predecessors: ['A'],
          dependencyRelations: [{ predecessorId: 'A', type: 'SF', lag: 5 }],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.activities['B'].es).toBe(4);
      expect(schedule.activities['B'].ef).toBe(5);
      expect(schedule.projectDuration).toBe(6);
    });

    it('Multiple mixed relationships between the same pair of tasks (SS + FF ladder)', () => {
      // Task A (dur 8): starts at Day 1 (tS=0, tF=8)
      // Task B (dur 5):
      // Constraint 1: SS lag 2 -> tS_B >= 0 + 2 = 2 (ES >= 3)
      // Constraint 2: FF lag 1 -> tF_B >= 8 + 1 = 9 -> tS_B >= 9 - 5 = 4 (ES >= 5)
      // Strongest constraint wins: tS_B = 4 -> ES = 5, EF = 9
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 8, predecessors: [] },
        {
          id: 'B',
          name: 'Task B',
          duration: 5,
          predecessors: ['A'],
          dependencyRelations: [
            { predecessorId: 'A', type: 'SS', lag: 2 },
            { predecessorId: 'A', type: 'FF', lag: 1 },
          ],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(9);
      expect(schedule.activities['B'].es).toBe(5);
      expect(schedule.activities['B'].ef).toBe(9);
    });

    it('Multiple predecessors with different relationship types and lags', () => {
      // A (dur 4): tS=0, tF=4
      // B (dur 6): tS=0, tF=6
      // C (dur 3):
      //   Pred A: FS lag +1 -> tS_C >= 4 + 1 = 5
      //   Pred B: SS lag +4 -> tS_C >= 0 + 4 = 4
      // Strongest constraint: tS_C = 5 -> ES = 6, EF = 8
      const activities: Activity[] = [
        { id: 'A', name: 'Prep Alpha', duration: 4, predecessors: [] },
        { id: 'B', name: 'Prep Beta', duration: 6, predecessors: [] },
        {
          id: 'C',
          name: 'Merge Gamma',
          duration: 3,
          predecessors: ['A', 'B'],
          dependencyRelations: [
            { predecessorId: 'A', type: 'FS', lag: 1 },
            { predecessorId: 'B', type: 'SS', lag: 4 },
          ],
        },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.activities['C'].es).toBe(6);
      expect(schedule.activities['C'].ef).toBe(8);
      expect(schedule.projectDuration).toBe(8);
    });
  });

  /* ========================================================================
   * 4. STRUCTURAL AND NETWORK TOPOLOGY TESTS
   * ======================================================================== */
  describe('Structural & Topology Extremes', () => {
    it('Single activity network calculates accurately', () => {
      const activities: Activity[] = [
        { id: 'SOLO', name: 'Solo Activity', duration: 5, predecessors: [] },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.isValid).toBe(true);
      expect(schedule.projectDuration).toBe(5);
      expect(schedule.activities['SOLO'].es).toBe(1);
      expect(schedule.activities['SOLO'].ef).toBe(5);
      expect(schedule.activities['SOLO'].ls).toBe(1);
      expect(schedule.activities['SOLO'].lf).toBe(5);
      expect(schedule.activities['SOLO'].totalFloat).toBe(0);
      expect(schedule.activities['SOLO'].isCritical).toBe(true);
    });

    it('Simple linear network calculates serial dates', () => {
      const activities: Activity[] = [
        { id: '1', name: 'Step 1', duration: 2, predecessors: [] },
        { id: '2', name: 'Step 2', duration: 3, predecessors: ['1'] },
        { id: '3', name: 'Step 3', duration: 4, predecessors: ['2'] },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(9);
      expect(schedule.activities['1'].ef).toBe(2);
      expect(schedule.activities['2'].es).toBe(3);
      expect(schedule.activities['2'].ef).toBe(5);
      expect(schedule.activities['3'].es).toBe(6);
      expect(schedule.activities['3'].ef).toBe(9);
      expect(schedule.criticalActivityIds).toEqual(['1', '2', '3']);
    });

    it('Multiple terminal activities with no common sink calculates correct maximum finish', () => {
      // Root A (dur 3) branches into:
      // Terminal B (dur 4) -> EF = 7
      // Terminal C (dur 7) -> EF = 10
      // Terminal D (dur 2) -> EF = 5
      const activities: Activity[] = [
        { id: 'A', name: 'Root', duration: 3, predecessors: [] },
        { id: 'B', name: 'Term B', duration: 4, predecessors: ['A'] },
        { id: 'C', name: 'Term C', duration: 7, predecessors: ['A'] },
        { id: 'D', name: 'Term D', duration: 2, predecessors: ['A'] },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(10);
      expect(schedule.activities['C'].isCritical).toBe(true);
      expect(schedule.activities['B'].isCritical).toBe(false);
      expect(schedule.activities['B'].totalFloat).toBe(3); // 10 - 7 = 3
      expect(schedule.activities['D'].totalFloat).toBe(5); // 10 - 5 = 5
    });

    it('Zero-duration milestone does not artificially inflate project duration', () => {
      // A (3d) -> MILESTONE (0d) -> B (4d)
      // Project duration must be exactly 3 + 4 = 7 days (milestone adds 0 days)
      const activities: Activity[] = [
        { id: 'A', name: 'Phase 1 Dev', duration: 3, predecessors: [] },
        {
          id: 'M1',
          name: 'Phase 1 Gate Milestone',
          duration: 0,
          isMilestone: true,
          predecessors: ['A'],
        },
        { id: 'B', name: 'Phase 2 Dev', duration: 4, predecessors: ['M1'] },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.projectDuration).toBe(7);
      expect(schedule.activities['A'].es).toBe(1);
      expect(schedule.activities['A'].ef).toBe(3);

      // Milestone occurs at end of day 3 / boundary
      expect(schedule.activities['M1'].duration).toBe(0);
      expect(schedule.activities['M1'].isMilestone).toBe(true);
      expect(schedule.activities['M1'].es).toBe(3);
      expect(schedule.activities['M1'].ef).toBe(3);

      // B starts on day 4
      expect(schedule.activities['B'].es).toBe(4);
      expect(schedule.activities['B'].ef).toBe(7);
      expect(schedule.criticalActivityIds).toEqual(['A', 'M1', 'B']);
    });

    it('Cycle detection detects circular dependencies cleanly and returns structured error', () => {
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 2, predecessors: ['C'] },
        { id: 'B', name: 'Task B', duration: 3, predecessors: ['A'] },
        { id: 'C', name: 'Task C', duration: 4, predecessors: ['B'] },
      ];
      const schedule = calculateSchedule(activities);

      expect(schedule.isValid).toBe(false);
      expect(schedule.hasCycle).toBe(true);
      expect(schedule.errorMessage).toContain('Circular dependency detected');
    });

    it('Validation rejects missing predecessor references', () => {
      const activities: Activity[] = [
        { id: 'A', name: 'Task A', duration: 2, predecessors: ['GHOST_NODE'] },
      ];
      const validation = validateActivities(activities);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes("unknown predecessor 'GHOST_NODE'"))).toBe(true);
    });

    it('Validation rejects duplicate activity IDs', () => {
      const activities: Activity[] = [
        { id: 'A', name: 'Task Alpha', duration: 2, predecessors: [] },
        { id: 'A', name: 'Task Duplicate', duration: 3, predecessors: [] },
      ];
      const validation = validateActivities(activities);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes("Duplicate Activity ID 'A'"))).toBe(true);
    });

    it('Validation rejects negative activity durations', () => {
      const activities: Activity[] = [
        { id: 'NEG', name: 'Negative Task', duration: -5, predecessors: [] },
      ];
      const validation = validateActivities(activities);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.field === 'duration')).toBe(true);
    });

    it('Large 25-activity network evaluates in milliseconds without combinatorial stack overflow', () => {
      // Build a 5-layer grid network: Layer 0..4, each with 5 parallel nodes
      const largeActivities: Activity[] = [];
      const layers = 5;
      const nodesPerLayer = 5;

      for (let l = 0; l < layers; l++) {
        for (let n = 0; n < nodesPerLayer; n++) {
          const id = `L${l}_N${n}`;
          const preds = l === 0 ? [] : [`L${l - 1}_N${n}`, `L${l - 1}_N${(n + 1) % nodesPerLayer}`];
          largeActivities.push({
            id,
            name: `Activity ${id}`,
            duration: (l + n) % 3 + 2, // 2..4 days
            predecessors: preds,
          });
        }
      }

      const startTime = performance.now();
      const schedule = calculateSchedule(largeActivities);
      const elapsed = performance.now() - startTime;

      expect(schedule.isValid).toBe(true);
      expect(schedule.hasCycle).toBe(false);
      expect(schedule.activityList.length).toBe(25);
      expect(schedule.projectDuration).toBeGreaterThan(0);
      expect(schedule.criticalPaths.length).toBeGreaterThan(0);
      // Must compute in under 100 milliseconds
      expect(elapsed).toBeLessThan(100);
    });
  });
});
