import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateAndImportProjectJson,
  generateNextActivityId,
} from './projectStorage';
import { Activity } from '../types/scheduling';

describe('Project Storage & Import/Export Utilities', () => {
  it('generates unique activity IDs in sequence (A -> B -> C -> D -> E -> F -> G)', () => {
    const current: Activity[] = [
      { id: 'A', name: 'Task A', duration: 1, predecessors: [] },
      { id: 'B', name: 'Task B', duration: 1, predecessors: [] },
      { id: 'C', name: 'Task C', duration: 1, predecessors: [] },
      { id: 'D', name: 'Task D', duration: 1, predecessors: [] },
      { id: 'E', name: 'Task E', duration: 1, predecessors: [] },
      { id: 'F', name: 'Task F', duration: 1, predecessors: [] },
    ];
    const nextId = generateNextActivityId(current);
    expect(nextId).toBe('G');
  });

  it('correctly imports and validates a well-formed project JSON', () => {
    const validJson = JSON.stringify({
      name: 'Custom Mobile App',
      description: 'Test project description',
      activities: [
        { id: 'M1', name: 'Discovery', duration: 3, predecessors: [] },
        { id: 'M2', name: 'Design', duration: 4, predecessors: ['M1'] },
        { id: 'M3', name: 'Build', duration: 5, predecessors: ['M2'] },
      ],
    });

    const result = validateAndImportProjectJson(validJson);
    expect(result.success).toBe(true);
    expect(result.project?.name).toBe('Custom Mobile App');
    expect(result.project?.activities).toHaveLength(3);
  });

  it('rejects JSON with duplicate activity IDs', () => {
    const duplicateJson = JSON.stringify({
      name: 'Bad Project',
      activities: [
        { id: 'T1', name: 'Task 1', duration: 2, predecessors: [] },
        { id: 'T1', name: 'Task 1 duplicate', duration: 3, predecessors: [] },
      ],
    });

    const result = validateAndImportProjectJson(duplicateJson);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Duplicate activity ID');
  });

  it('rejects JSON referencing non-existent predecessor', () => {
    const invalidPredJson = JSON.stringify({
      name: 'Bad Project',
      activities: [
        { id: 'T1', name: 'Task 1', duration: 2, predecessors: ['GHOST_ID'] },
      ],
    });

    const result = validateAndImportProjectJson(invalidPredJson);
    expect(result.success).toBe(false);
    expect(result.error).toContain('non-existent predecessor');
  });

  it('rejects JSON with circular dependencies (A -> B -> A)', () => {
    const cycleJson = JSON.stringify({
      name: 'Loop Project',
      activities: [
        { id: 'A', name: 'Task A', duration: 2, predecessors: ['B'] },
        { id: 'B', name: 'Task B', duration: 2, predecessors: ['A'] },
      ],
    });

    const result = validateAndImportProjectJson(cycleJson);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Circular Dependency');
  });

  it('rejects malformed or empty JSON', () => {
    const result = validateAndImportProjectJson('{ not valid json');
    expect(result.success).toBe(false);
    expect(result.error).toContain('JSON Parse Error');
  });
});

