import { describe, it, expect } from 'vitest';
import { calculateSchedule } from './cpmEngine';
import {
  SAMPLE_PROJECT_UMS,
  SAMPLE_PROJECT_WEBSITE,
  SAMPLE_PROJECT_EVENT,
  SAMPLE_PROJECT_BLANK,
} from '../data/sampleProjects';

describe('Sample Projects Verification', () => {
  it('Sample 1 (University Management System) calculates exact 18-workday duration and critical path A-B-D-E-F', () => {
    const result = calculateSchedule(SAMPLE_PROJECT_UMS.activities);
    expect(result.isValid).toBe(true);
    expect(result.hasCycle).toBe(false);
    expect(result.projectDuration).toBe(18);
    expect(result.criticalActivityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
    expect(result.activities['C'].totalFloat).toBe(1);
  });

  it('Sample 2 (SaaS Web Platform Launch) is a valid DAG with 9 activities', () => {
    const result = calculateSchedule(SAMPLE_PROJECT_WEBSITE.activities);
    expect(result.isValid).toBe(true);
    expect(result.hasCycle).toBe(false);
    expect(result.activityList.length).toBe(9);
    expect(result.projectDuration).toBeGreaterThan(15);
    expect(result.criticalPaths.length).toBeGreaterThan(0);
    // API (7d) is longer than DES (5d), so API should be critical
    expect(result.activities['API'].isCritical).toBe(true);
  });

  it('Sample 3 (Global Tech Conference) is a valid DAG with 9 activities and concurrent paths', () => {
    const result = calculateSchedule(SAMPLE_PROJECT_EVENT.activities);
    expect(result.isValid).toBe(true);
    expect(result.hasCycle).toBe(false);
    expect(result.activityList.length).toBe(9);
    expect(result.projectDuration).toBeGreaterThan(15);
    expect(result.criticalPaths.length).toBeGreaterThan(0);
  });

  it('Sample 4 (Blank Project) is safe with empty activities', () => {
    const result = calculateSchedule(SAMPLE_PROJECT_BLANK.activities);
    expect(result.projectDuration).toBe(0);
    expect(result.activityList.length).toBe(0);
  });
});

