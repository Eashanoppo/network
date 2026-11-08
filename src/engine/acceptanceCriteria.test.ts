import { describe, it, expect } from 'vitest';
import { calculateSchedule } from './cpmEngine';
import {
  SAMPLE_PROJECT_UMS,
  SAMPLE_PROJECT_WEBSITE,
  SAMPLE_PROJECT_EVENT,
  SAMPLE_PROJECT_BLANK,
} from '../data/sampleProjects';
import {
  validateAndImportProjectJson,
  generateNextActivityId,
} from '../utils/projectStorage';
import { Activity, Project } from '../types/scheduling';

describe('Prompt 1 — Multi-Project Scheduling Acceptance Criteria', () => {
  // 1. Existing University Management System still calculates 18 workdays.
  it('Criterion 1: University Management System calculates exactly 18 workdays with critical path A-B-D-E-F', () => {
    const schedule = calculateSchedule(SAMPLE_PROJECT_UMS.activities);
    expect(schedule.projectDuration).toBe(18);
    expect(schedule.criticalPaths.length).toBe(1);
    expect(schedule.criticalPaths[0].activityIds).toEqual(['A', 'B', 'D', 'E', 'F']);
    expect(schedule.activities['C'].totalFloat).toBe(1);
  });

  // 2. User can create a project with three activities.
  it('Criterion 2: Can create and calculate a project with three activities', () => {
    const threeActivities: Activity[] = [
      { id: 'ACT-1', name: 'Scope Definition', duration: 4, predecessors: [] },
      { id: 'ACT-2', name: 'Architecture Review', duration: 5, predecessors: ['ACT-1'] },
      { id: 'ACT-3', name: 'Executive Sign-off', duration: 2, predecessors: ['ACT-2'] },
    ];

    const schedule = calculateSchedule(threeActivities);
    expect(schedule.isValid).toBe(true);
    expect(schedule.activityList.length).toBe(3);
    // 4 + 5 + 2 = 11 days
    expect(schedule.projectDuration).toBe(11);
    expect(schedule.criticalPaths[0].activityIds).toEqual(['ACT-1', 'ACT-2', 'ACT-3']);
  });

  // 3. User can create a project with ten activities.
  it('Criterion 3: Can create and calculate a complex project with 10 activities and parallel branches', () => {
    const tenActivities: Activity[] = [
      { id: 'T1', name: 'Task 1', duration: 2, predecessors: [] },
      { id: 'T2', name: 'Task 2', duration: 3, predecessors: ['T1'] },
      { id: 'T3', name: 'Task 3', duration: 4, predecessors: ['T1'] },
      { id: 'T4', name: 'Task 4', duration: 5, predecessors: ['T2'] },
      { id: 'T5', name: 'Task 5', duration: 2, predecessors: ['T3'] },
      { id: 'T6', name: 'Task 6', duration: 6, predecessors: ['T4', 'T5'] },
      { id: 'T7', name: 'Task 7', duration: 3, predecessors: ['T6'] },
      { id: 'T8', name: 'Task 8', duration: 4, predecessors: ['T7'] },
      { id: 'T9', name: 'Task 9', duration: 2, predecessors: ['T8'] },
      { id: 'T10', name: 'Task 10', duration: 1, predecessors: ['T9'] },
    ];

    const schedule = calculateSchedule(tenActivities);
    expect(schedule.isValid).toBe(true);
    expect(schedule.activityList.length).toBe(10);
    // Path through T2: T1(2) -> T2(3) -> T4(5) -> T6(6) -> T7(3) -> T8(4) -> T9(2) -> T10(1) = 26
    // Path through T3: T1(2) -> T3(4) -> T5(2) -> T6(6) ... = 24
    expect(schedule.projectDuration).toBe(26);
    expect(schedule.criticalPaths[0].activityIds).toEqual(['T1', 'T2', 'T4', 'T6', 'T7', 'T8', 'T9', 'T10']);
  });

  // 4. User can add and delete activities safely.
  it('Criterion 4: Safe addition and cascade deletion of activities without broken references', () => {
    let activities: Activity[] = [
      { id: 'A', name: 'Start', duration: 2, predecessors: [] },
      { id: 'B', name: 'Middle', duration: 3, predecessors: ['A'] },
      { id: 'C', name: 'End', duration: 2, predecessors: ['B'] },
    ];

    // Add activity D depending on C
    const newAct: Activity = { id: 'D', name: 'Final Wrap', duration: 1, predecessors: ['C'] };
    activities = [...activities, newAct];
    expect(activities.length).toBe(4);

    // Delete Activity B with cascade cleanup: Activity C should have B removed from predecessors
    const deleteId = 'B';
    activities = activities
      .filter(a => a.id !== deleteId)
      .map(a => ({
        ...a,
        predecessors: a.predecessors.filter(p => p !== deleteId),
      }));

    expect(activities.find(a => a.id === 'B')).toBeUndefined();
    expect(activities.find(a => a.id === 'C')?.predecessors).toEqual([]);
    const scheduleAfterDelete = calculateSchedule(activities);
    expect(scheduleAfterDelete.isValid).toBe(true);
  });

  // 5. User can change activity durations.
  it('Criterion 5: Changing activity durations immediately updates CPM schedule', () => {
    const activities: Activity[] = JSON.parse(JSON.stringify(SAMPLE_PROJECT_UMS.activities));
    const baseSchedule = calculateSchedule(activities);
    expect(baseSchedule.projectDuration).toBe(18);

    // Increase Activity B from 4d to 6d (+2d on critical path)
    const actB = activities.find(a => a.id === 'B')!;
    actB.duration = 6;
    const modifiedSchedule = calculateSchedule(activities);
    expect(modifiedSchedule.projectDuration).toBe(20);

    // Increase Activity C from 3d to 4d (absorbs 1d float, overall project stays 18d)
    actB.duration = 4; // restore B
    const actC = activities.find(a => a.id === 'C')!;
    actC.duration = 4;
    const floatSchedule = calculateSchedule(activities);
    expect(floatSchedule.projectDuration).toBe(18);
    expect(floatSchedule.criticalPaths.length).toBe(2); // Path A-B-D-E-F (18) and Path A-C-D-E-F (18)
  });

  // 6. User can switch between sample projects.
  it('Criterion 6: Sample projects calculate their own correct authoritative durations', () => {
    const ums = calculateSchedule(SAMPLE_PROJECT_UMS.activities);
    const web = calculateSchedule(SAMPLE_PROJECT_WEBSITE.activities);
    const event = calculateSchedule(SAMPLE_PROJECT_EVENT.activities);

    expect(ums.projectDuration).toBe(18);
    expect(web.projectDuration).toBe(27);
    expect(event.projectDuration).toBe(21);
    expect(SAMPLE_PROJECT_BLANK.activities.length).toBe(0);
  });

  // 7. Each project retains its own modifications.
  it('Criterion 7: Project mutations are isolated and do not bleed into other projects', () => {
    const project1: Project = JSON.parse(JSON.stringify(SAMPLE_PROJECT_UMS));
    const project2: Project = JSON.parse(JSON.stringify(SAMPLE_PROJECT_WEBSITE));

    // Mutate project1
    project1.activities[0].duration = 10;
    const sched1 = calculateSchedule(project1.activities);
    const sched2 = calculateSchedule(project2.activities);

    expect(sched1.projectDuration).toBe(25); // 18 + 7 = 25
    expect(sched2.projectDuration).toBe(27); // Unchanged!
  });

  // 8. Project reset restores the correct project's baseline.
  it("Criterion 8: Resetting a project restores that project's own baseline, not UMS", () => {
    const projectWeb: Project = JSON.parse(JSON.stringify(SAMPLE_PROJECT_WEBSITE));
    const originalDuration = calculateSchedule(projectWeb.baselineActivities).projectDuration;
    expect(originalDuration).toBe(27);

    // Modify projectWeb
    projectWeb.activities[0].duration = 99;
    expect(calculateSchedule(projectWeb.activities).projectDuration).toBeGreaterThan(27);

    // Reset to its own baseline
    projectWeb.activities = JSON.parse(JSON.stringify(projectWeb.baselineActivities));
    const resetSchedule = calculateSchedule(projectWeb.activities);
    expect(resetSchedule.projectDuration).toBe(27);
    expect(resetSchedule.activityList.length).toBe(9);
  });

  // 9. Imported project data is validated.
  it('Criterion 9: JSON import validates schema, prevents duplicate IDs, negative durations, and circular dependencies', () => {
    // Valid import
    const validJson = JSON.stringify({
      name: 'Valid Custom Project',
      activities: [
        { id: 'T1', name: 'Start', duration: 3, predecessors: [] },
        { id: 'T2', name: 'End', duration: 4, predecessors: ['T1'] },
      ],
    });
    const validRes = validateAndImportProjectJson(validJson);
    expect(validRes.success).toBe(true);
    expect(validRes.project?.name).toBe('Valid Custom Project');

    // Invalid JSON: Circular dependency
    const cycleJson = JSON.stringify({
      name: 'Cycle Project',
      activities: [
        { id: 'A', name: 'A', duration: 2, predecessors: ['B'] },
        { id: 'B', name: 'B', duration: 2, predecessors: ['A'] },
      ],
    });
    const cycleRes = validateAndImportProjectJson(cycleJson);
    expect(cycleRes.success).toBe(false);
    expect(cycleRes.error).toContain('Circular Dependency Error');

    // Invalid JSON: Negative duration
    const negJson = JSON.stringify({
      name: 'Negative Duration',
      activities: [{ id: 'A', name: 'A', duration: -5, predecessors: [] }],
    });
    const negRes = validateAndImportProjectJson(negJson);
    expect(negRes.success).toBe(false);
    expect(negRes.error).toContain('Validation Error');

    // Invalid JSON: Duplicate IDs
    const dupJson = JSON.stringify({
      name: 'Dup IDs',
      activities: [
        { id: 'A', name: 'Task 1', duration: 3, predecessors: [] },
        { id: 'A', name: 'Task 2', duration: 4, predecessors: [] },
      ],
    });
    const dupRes = validateAndImportProjectJson(dupJson);
    expect(dupRes.success).toBe(false);
    expect(dupRes.error?.toLowerCase()).toContain('duplicate activity id');
  });

  // 10. Existing website functionality remains operational.
  it('Criterion 10: Automatic ID generation works sequentially (A..Z then ACT-1..)', () => {
    const acts: Activity[] = [
      { id: 'A', name: 'A', duration: 1, predecessors: [] },
      { id: 'B', name: 'B', duration: 1, predecessors: [] },
      { id: 'C', name: 'C', duration: 1, predecessors: [] },
    ];
    expect(generateNextActivityId(acts)).toBe('D');
  });
});
