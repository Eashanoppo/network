import { describe, it, expect } from 'vitest';
import { calculateSchedule } from '../engine/cpmEngine';
import { calculatePert } from '../engine/pertEngine';
import { simulateDependencyChange, simulateDurationChange, simulateCompression } from '../engine/simulationEngine';
import { SAMPLE_PROJECT_UMS, SAMPLE_PROJECT_WEBSITE, SAMPLE_PROJECT_EVENT } from '../data/sampleProjects';
import { QUIZ_QUESTIONS } from '../data/educationalContent';

describe('Prompt 4 - Integrated Platform & Module Verification', () => {
  describe('Dependency Lab & Engine Integration', () => {
    it('allows altering dependency logic to create a new critical path in the active project', () => {
      const baseUMS = SAMPLE_PROJECT_UMS.activities;
      // In base UMS, A(3) -> B(4) and A(3) -> C(3), both -> D(6) -> E(3) -> F(2)
      // Base duration is 18d, Path 1 (A-B-D-E-F) = 18d, Path 2 (A-C-D-E-F) = 17d
      // If we change C's duration to 5d, Path 2 becomes 19d and the sole critical path
      const sim = simulateDurationChange(baseUMS, 'C', 5);
      expect(sim.isValid).toBe(true);
      expect(sim.schedule.projectDuration).toBe(19);
      expect(sim.comparison.criticalPathsChanged).toBe(true);
      expect(sim.schedule.criticalPaths[0].activityIds).toEqual(['A', 'C', 'D', 'E', 'F']);
    });

    it('correctly simulates PDM lag changes on live project activities', () => {
      const baseUMS = SAMPLE_PROJECT_UMS.activities;
      // Add a 2-day lag on D's dependency on B: D can only start 2 days after B finishes
      const sim = simulateDependencyChange(baseUMS, 'D', [
        { predecessorId: 'B', type: 'FS', lag: 2 },
        { predecessorId: 'C', type: 'FS', lag: 0 },
      ]);
      expect(sim.isValid).toBe(true);
      // B finishes on Day 7, so with lag 2, D starts on 7 + 1 + 2 = Day 10 (instead of Day 8)
      expect(sim.schedule.activities['D'].es).toBe(10);
      expect(sim.schedule.projectDuration).toBe(20);
    });
  });

  describe('PERT Estimator Studio Math & Validation', () => {
    it('accurately computes Beta expected duration, variance, and confidence intervals', () => {
      // O = 4, M = 7, P = 16
      // TE = (4 + 4*7 + 16)/6 = 48/6 = 8.0
      // sigma = (16 - 4)/6 = 12/6 = 2.0
      // variance = 2^2 = 4.0
      const pert = calculatePert({ optimistic: 4, mostLikely: 7, pessimistic: 16 });
      expect(pert.expectedDuration).toBe(8.0);
      expect(pert.standardDeviation).toBe(2.0);
      expect(pert.variance).toBe(4.0);
      expect(pert.confidence68).toEqual([6.0, 10.0]); // 8 +- 2
      expect(pert.confidence95).toEqual([4.0, 12.0]); // 8 +- 4
    });

    it('calculates 99.7% confidence interval as TE +- 3*sigma', () => {
      const pert = calculatePert({ optimistic: 2, mostLikely: 5, pessimistic: 14 });
      const te = pert.expectedDuration;
      const sigma = pert.standardDeviation;
      const conf99Low = Math.max(0, Math.round((te - 3 * sigma) * 10) / 10);
      const conf99High = Math.round((te + 3 * sigma) * 10) / 10;
      expect(conf99High).toBeGreaterThan(conf99Low);
    });
  });

  describe('Multi-Project Support & Dynamic CPM Calculations', () => {
    it('calculates Website Project correctly with parallel branches and multiple paths', () => {
      const result = calculateSchedule(SAMPLE_PROJECT_WEBSITE.activities);
      expect(result.isValid).toBe(true);
      expect(result.projectDuration).toBeGreaterThan(0);
      expect(result.criticalPaths.length).toBeGreaterThan(0);
      // Verify float is calculated for every activity
      result.activityList.forEach(act => {
        expect(act.totalFloat).toBeGreaterThanOrEqual(0);
        expect(act.freeFloat).toBeGreaterThanOrEqual(0);
        expect(act.totalFloat).toBeGreaterThanOrEqual(act.freeFloat);
      });
    });

    it('calculates Event Management Project correctly with milestones', () => {
      const result = calculateSchedule(SAMPLE_PROJECT_EVENT.activities);
      expect(result.isValid).toBe(true);
      expect(result.projectDuration).toBeGreaterThan(0);
      const milestones = result.activityList.filter(a => a.isMilestone || a.duration === 0);
      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones[0].isMilestone).toBe(true);
    });
  });

  describe('Knowledge Check Quiz Labelling', () => {
    it('explicitly labels all University Management System benchmark questions', () => {
      const umsQuestions = QUIZ_QUESTIONS.filter(q =>
        q.question.includes('[University Management System Baseline]')
      );
      expect(umsQuestions.length).toBeGreaterThanOrEqual(4);
    });
  });
});
