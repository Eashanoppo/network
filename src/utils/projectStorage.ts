import { Project, Activity } from '../types/scheduling';
import { INITIAL_SAMPLE_PROJECTS, SAMPLE_PROJECT_UMS } from '../data/sampleProjects';
import { validateActivities, detectCycles } from '../engine/cpmEngine';

export const STORAGE_KEY_PROJECTS = 'pm_scheduling_projects_v2';
export const STORAGE_KEY_ACTIVE_ID = 'pm_scheduling_active_id_v2';

/**
 * Loads projects from browser localStorage with safe fallback to initial samples.
 */
export function loadProjectsFromStorage(): { projects: Project[]; activeProjectId: string } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      projects: INITIAL_SAMPLE_PROJECTS,
      activeProjectId: SAMPLE_PROJECT_UMS.id,
    };
  }

  try {
    const rawProjects = window.localStorage.getItem(STORAGE_KEY_PROJECTS);
    const rawActiveId = window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID);

    if (!rawProjects) {
      return {
        projects: INITIAL_SAMPLE_PROJECTS,
        activeProjectId: SAMPLE_PROJECT_UMS.id,
      };
    }

    const parsed = JSON.parse(rawProjects);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return {
        projects: INITIAL_SAMPLE_PROJECTS,
        activeProjectId: SAMPLE_PROJECT_UMS.id,
      };
    }

    // Validate that each project has minimum valid schema
    const validProjects: Project[] = [];
    for (const item of parsed) {
      if (item && typeof item.id === 'string' && typeof item.name === 'string' && Array.isArray(item.activities)) {
        validProjects.push({
          id: item.id,
          name: item.name,
          description: typeof item.description === 'string' ? item.description : '',
          activities: item.activities,
          baselineActivities: Array.isArray(item.baselineActivities)
            ? item.baselineActivities
            : JSON.parse(JSON.stringify(item.activities)),
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
          calendarConfig: item.calendarConfig || { hoursPerDay: 8, workdaysPerWeek: 5 },
          metadata: item.metadata || {},
        });
      }
    }

    if (validProjects.length === 0) {
      return {
        projects: INITIAL_SAMPLE_PROJECTS,
        activeProjectId: SAMPLE_PROJECT_UMS.id,
      };
    }

    // Ensure active ID exists among valid projects
    let activeId = rawActiveId && validProjects.some(p => p.id === rawActiveId)
      ? rawActiveId
      : validProjects[0].id;

    return {
      projects: validProjects,
      activeProjectId: activeId,
    };
  } catch (err) {
    console.warn('Failed to parse projects from localStorage. Falling back to default samples.', err);
    return {
      projects: INITIAL_SAMPLE_PROJECTS,
      activeProjectId: SAMPLE_PROJECT_UMS.id,
    };
  }
}

/**
 * Saves projects array and active project ID to browser localStorage.
 */
export function saveProjectsToStorage(projects: Project[], activeProjectId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProjectId);
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
}

/**
 * Validates and imports a project JSON string.
 */
export function validateAndImportProjectJson(jsonString: string): {
  success: boolean;
  project?: Project;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid JSON: Expected a JSON object.' };
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      return { success: false, error: 'Validation Error: Project must have a non-empty name.' };
    }

    if (!Array.isArray(data.activities)) {
      return { success: false, error: 'Validation Error: Project must contain an "activities" array.' };
    }

    // Validate activities structure
    const seenIds = new Set<string>();
    for (const act of data.activities) {
      if (!act.id || typeof act.id !== 'string' || act.id.trim() === '') {
        return { success: false, error: 'Validation Error: Every activity must have a non-empty "id".' };
      }
      if (seenIds.has(act.id)) {
        return { success: false, error: `Validation Error: Duplicate activity ID "${act.id}" detected.` };
      }
      seenIds.add(act.id);

      if (typeof act.duration !== 'number' || isNaN(act.duration) || act.duration < 0) {
        return { success: false, error: `Validation Error: Activity "${act.id}" has an invalid duration (${act.duration}). Duration must be a non-negative number.` };
      }

      if (!Array.isArray(act.predecessors)) {
        return { success: false, error: `Validation Error: Activity "${act.id}" predecessors must be an array of IDs.` };
      }
    }

    // Predecessor reference & self-reference checks
    for (const act of data.activities) {
      for (const pred of act.predecessors) {
        if (pred === act.id) {
          return { success: false, error: `Validation Error: Activity "${act.id}" cannot depend on itself.` };
        }
        if (!seenIds.has(pred)) {
          return { success: false, error: `Validation Error: Activity "${act.id}" references non-existent predecessor "${pred}".` };
        }
      }
    }

    // Check for circular dependencies
    if (data.activities.length > 0) {
      const cycleCheck = detectCycles(data.activities);
      if (cycleCheck.hasCycle) {
        return {
          success: false,
          error: `Circular Dependency Error: Circular loop detected among activities: ${cycleCheck.cycleNodes?.join(', ')}`,
        };
      }
    }

    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      description: typeof data.description === 'string' ? data.description.trim() : '',
      activities: data.activities,
      baselineActivities: Array.isArray(data.baselineActivities) && data.baselineActivities.length > 0
        ? data.baselineActivities
        : JSON.parse(JSON.stringify(data.activities)),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      calendarConfig: data.calendarConfig || { hoursPerDay: 8, workdaysPerWeek: 5 },
      metadata: {
        isSample: false,
        author: data.metadata?.author || 'Imported User',
        category: data.metadata?.category || 'Imported Project',
        version: '1.0.0',
        tags: Array.isArray(data.metadata?.tags) ? data.metadata.tags : ['Imported'],
      },
    };

    return { success: true, project: newProject };
  } catch (err: any) {
    return { success: false, error: `JSON Parse Error: ${err.message || 'Malformed JSON file.'}` };
  }
}

/**
 * Triggers a browser download of the project in JSON format.
 */
export function exportProjectAsJsonFile(project: Project): void {
  const exportData = {
    id: project.id,
    name: project.name,
    description: project.description,
    activities: project.activities,
    baselineActivities: project.baselineActivities,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    calendarConfig: project.calendarConfig,
    metadata: project.metadata,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeFilename = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFilename}-schedule.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates the next sequential unique Activity ID.
 * Prefers standard letters A, B, C... then G, H, I... or ACT-1, ACT-2...
 */
export function generateNextActivityId(existingActivities: Activity[]): string {
  const existingIds = new Set(existingActivities.map(a => a.id.trim().toUpperCase()));

  // Try single letters A through Z
  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    if (!existingIds.has(char)) {
      return char;
    }
  }

  // Next try two letters: AA, AB, AC... or ACT-1, ACT-2...
  let counter = 1;
  while (true) {
    const candidate = `ACT-${counter}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
    counter++;
  }
}

