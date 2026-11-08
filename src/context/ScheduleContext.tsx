import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Activity,
  ActivityDependency,
  ScheduleCalculationResult,
  DelayImpactAnalysis,
  SimulationScenario,
  Project,
  ScheduleViewMode,
} from '../types/scheduling';
import {
  BASELINE_ACTIVITIES,
  calculateSchedule,
  analyzeDelayImpact,
  validateActivities,
  detectCycles,
} from '../engine/cpmEngine';
import {
  simulateDurationChange,
  simulateDelay,
  simulateCompression,
  simulateDependencyChange,
  simulatePertEstimate,
  applySimulation,
} from '../engine/simulationEngine';
import { CHAPTERS_DATA } from '../data/educationalContent';
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  validateAndImportProjectJson,
  exportProjectAsJsonFile,
  generateNextActivityId,
} from '../utils/projectStorage';
import { INITIAL_SAMPLE_PROJECTS } from '../data/sampleProjects';

interface ScheduleContextType {
  // Project Management
  projects: Project[];
  activeProjectId: string;
  activeProject: Project;
  switchProject: (projectId: string) => void;
  createProject: (name: string, description?: string, templateActivities?: Activity[]) => Project;
  updateProjectDetails: (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'activities' | 'baselineActivities'>>
  ) => void;
  duplicateProject: (projectId: string) => Project;
  deleteProject: (projectId: string) => boolean;
  resetProjectToBaseline: (projectId?: string) => void;
  setProjectAsNewBaseline: (projectId?: string) => void;
  exportProject: (projectId?: string) => void;
  importProject: (jsonString: string) => { success: boolean; error?: string; project?: Project };

  // Activity Management
  addActivity: (activityData: Partial<Activity> & { name: string; duration: number }) => {
    success: boolean;
    error?: string;
    activity?: Activity;
  };
  updateActivity: (id: string, updates: Partial<Activity>) => { success: boolean; error?: string };
  deleteActivity: (
    id: string,
    cascadeCleanPredecessors?: boolean
  ) => { success: boolean; error?: string; dependentActivities?: string[] };
  duplicateActivity: (id: string) => { success: boolean; error?: string; activity?: Activity };

  // Three-tier state architecture & View Mode
  viewMode: ScheduleViewMode;
  setViewMode: (mode: ScheduleViewMode) => void;
  activeSchedule: ScheduleCalculationResult;
  activeActivities: Activity[];
  currentActivities: Activity[];
  baselineActivities: Activity[];
  previewActivities: Activity[] | null;
  displayedActivities: Activity[];
  currentSchedule: ScheduleCalculationResult;
  schedule: ScheduleCalculationResult; // Currently active/displayed schedule for seamless backward compatibility
  activities: Activity[]; // Currently active/displayed activities
  baselineSchedule: ScheduleCalculationResult; // Approved project baseline schedule
  previewSchedule: ScheduleCalculationResult | null; // Staged simulation preview (if any)
  displayedSchedule: ScheduleCalculationResult;
  activeSimulation: SimulationScenario | null; // Active what-if scenario (if any)
  isSimulating: boolean;
  isModified: boolean;

  // UI state
  scheduleError: string | null;
  clearScheduleError: () => void;
  selectedActivityId: string | null;
  showCriticalPath: boolean;
  showFloat: boolean;
  highlightedPathId: string | null;
  presenterMode: boolean;
  presentationStageMode: boolean;
  activeChapter: number; // 1 to 9
  delayImpact: DelayImpactAnalysis | null;
  presentationTimerSeconds: number;
  isTimerRunning: boolean;

  // Actions
  updateActivityDuration: (id: string, duration: number) => void;
  updateActivityProgress: (id: string, progress: number) => void;
  updateActivityDependencies: (
    id: string,
    newPredecessors: (string | ActivityDependency)[]
  ) => { success: boolean; error?: string };
  applyPertDuration: (activityId: string, duration: number) => void;
  resetToBaseline: () => void;
  resetPreview: () => void;
  setSelectedActivityId: (id: string | null) => void;
  setShowCriticalPath: (show: boolean) => void;
  setShowFloat: (show: boolean) => void;
  setHighlightedPathId: (pathId: string | null) => void;
  togglePresenterMode: () => void;
  togglePresentationStageMode: () => void;
  goToChapter: (chapterNum: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;

  // Real-time Simulation Engine Actions
  runDurationSimulation: (activityId: string, newDuration: number) => SimulationScenario;
  runDelaySimulation: (activityId: string, additionalDays: number) => SimulationScenario;
  runCompressionSimulation: (activityId: string, reductionDays: number) => SimulationScenario;
  runDependencySimulation: (
    activityId: string,
    newPredecessors: (string | ActivityDependency)[]
  ) => SimulationScenario;
  runPertSimulation: (
    activityId: string,
    optimistic: number,
    mostLikely: number,
    pessimistic: number
  ) => SimulationScenario;
  applyActiveSimulation: () => void;
  discardActiveSimulation: () => void;
  clearActiveSimulation: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial projects from localStorage with safe fallback
  const initialData = useMemo(() => loadProjectsFromStorage(), []);

  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialData.activeProjectId);

  // Active project derived
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || INITIAL_SAMPLE_PROJECTS[0];
  }, [projects, activeProjectId]);

  // Working activities of the active project
  const [activities, setActivities] = useState<Activity[]>(activeProject.activities);

  // Sync activities whenever active project changes
  useEffect(() => {
    const current = projects.find(p => p.id === activeProjectId);
    if (current) {
      setActivities(current.activities);
      setSelectedActivityId(current.activities[0]?.id || null);
    }
  }, [activeProjectId]);

  // Auto-persist projects to storage whenever projects state updates
  useEffect(() => {
    saveProjectsToStorage(projects, activeProjectId);
  }, [projects, activeProjectId]);

  // Helper to commit activity modifications back into projects state
  const syncActivitiesToProject = useCallback(
    (newActivities: Activity[]) => {
      setActivities(newActivities);
      setProjects(prev =>
        prev.map(p =>
          p.id === activeProjectId
            ? { ...p, activities: newActivities, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [activeProjectId]
  );

  const [activeSimulation, setActiveSimulation] = useState<SimulationScenario | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    activeProject.activities[0]?.id || 'C'
  );
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true);
  const [showFloat, setShowFloat] = useState<boolean>(true);
  const [highlightedPathId, setHighlightedPathId] = useState<string | null>(null);
  const [presenterMode, setPresenterMode] = useState<boolean>(false);
  const [presentationStageMode, setPresentationStageMode] = useState<boolean>(false);
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [lastChangedActivityId, setLastChangedActivityId] = useState<string | null>(null);

  // Presentation Timer (useful for 20-minute university team presentation)
  const [presentationTimerSeconds, setPresentationTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setPresentationTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const [viewMode, setViewMode] = useState<ScheduleViewMode>('current');

  // Baseline calculation (memoized from active project's own baselineActivities)
  const baselineActivities = useMemo(() => {
    return activeProject.baselineActivities || activeProject.activities || [];
  }, [activeProject.baselineActivities, activeProject.activities]);

  const baselineSchedule = useMemo(() => {
    return calculateSchedule(baselineActivities);
  }, [baselineActivities]);

  // Current calculation (dynamically recomputed whenever working activities change)
  const currentSchedule = useMemo(() => calculateSchedule(activities), [activities]);
  const currentActivities = activities;

  // Staged simulation preview
  const previewSchedule = activeSimulation?.isValid ? activeSimulation.schedule : null;
  const previewActivities = activeSimulation?.isValid ? activeSimulation.proposedActivities : null;

  // Active displayed schedule and activities according to viewMode
  const displayedSchedule = useMemo(() => {
    if (viewMode === 'preview' && previewSchedule) {
      return previewSchedule;
    }
    if (viewMode === 'baseline') {
      return baselineSchedule;
    }
    return currentSchedule;
  }, [viewMode, previewSchedule, baselineSchedule, currentSchedule]);

  const displayedActivities = useMemo(() => {
    if (viewMode === 'preview' && previewActivities) {
      return previewActivities;
    }
    if (viewMode === 'baseline') {
      return baselineActivities;
    }
    return activities;
  }, [viewMode, previewActivities, baselineActivities, activities]);

  const activeSchedule = displayedSchedule;
  const activeActivities = displayedActivities;
  const schedule = displayedSchedule;
  const isSimulating = viewMode === 'preview' && activeSimulation !== null;

  // Is modified check against active project's own baseline
  const isModified = useMemo(() => {
    const baseList = activeProject.baselineActivities || [];
    if (activities.length !== baseList.length) return true;
    return activities.some(act => {
      const base = baseList.find(b => b.id === act.id);
      if (!base) return true;
      if (base.duration !== act.duration) return true;
      if (base.predecessors.length !== act.predecessors.length) return true;
      if (base.predecessors.some((p, i) => p !== act.predecessors[i])) return true;
      if ((base.progress ?? 0) !== (act.progress ?? 0)) return true;
      return false;
    });
  }, [activities, activeProject.baselineActivities]);

  // Delay impact analysis
  const delayImpact = useMemo(() => {
    if (!lastChangedActivityId) return null;
    return analyzeDelayImpact(baselineSchedule, displayedSchedule, lastChangedActivityId);
  }, [baselineSchedule, displayedSchedule, lastChangedActivityId]);

  const clearScheduleError = useCallback(() => {
    setScheduleError(null);
  }, []);

  // Project Management Actions
  const switchProject = useCallback(
    (projectId: string) => {
      const target = projects.find(p => p.id === projectId);
      if (!target) return;
      setActiveProjectId(target.id);
      setActivities(target.activities);
      setSelectedActivityId(target.activities[0]?.id || null);
      setActiveSimulation(null);
      setViewMode('current');
      setScheduleError(null);
      setLastChangedActivityId(null);
      setHighlightedPathId(null);
    },
    [projects]
  );

  const createProject = useCallback(
    (name: string, description?: string, templateActivities?: Activity[]): Project => {
      const activitiesCopy = templateActivities
        ? JSON.parse(JSON.stringify(templateActivities))
        : [];
      const newProj: Project = {
        id: `project-${Date.now()}`,
        name: name.trim() || 'Untitled Project',
        description: description?.trim() || '',
        activities: activitiesCopy,
        baselineActivities: JSON.parse(JSON.stringify(activitiesCopy)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        calendarConfig: { hoursPerDay: 8, workdaysPerWeek: 5 },
        metadata: { isSample: false, category: 'Custom Project' },
      };

      setProjects(prev => [...prev, newProj]);
      setActiveProjectId(newProj.id);
      setActivities(newProj.activities);
      setSelectedActivityId(newProj.activities[0]?.id || null);
      setActiveSimulation(null);
      setScheduleError(null);
      return newProj;
    },
    []
  );

  const updateProjectDetails = useCallback(
    (
      projectId: string,
      updates: Partial<Omit<Project, 'id' | 'activities' | 'baselineActivities'>>
    ) => {
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    []
  );

  const duplicateProject = useCallback(
    (projectId: string): Project => {
      const source = projects.find(p => p.id === projectId) || activeProject;
      const clone: Project = {
        ...JSON.parse(JSON.stringify(source)),
        id: `project-${Date.now()}`,
        name: `${source.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { ...source.metadata, isSample: false },
      };

      setProjects(prev => [...prev, clone]);
      setActiveProjectId(clone.id);
      setActivities(clone.activities);
      setSelectedActivityId(clone.activities[0]?.id || null);
      setActiveSimulation(null);
      setScheduleError(null);
      return clone;
    },
    [projects, activeProject]
  );

  const deleteProject = useCallback(
    (projectId: string): boolean => {
      if (projects.length <= 1) {
        setScheduleError('Cannot delete the only remaining project in workspace.');
        return false;
      }
      const remaining = projects.filter(p => p.id !== projectId);
      setProjects(remaining);

      if (activeProjectId === projectId) {
        const nextActive = remaining[0];
        setActiveProjectId(nextActive.id);
        setActivities(nextActive.activities);
        setSelectedActivityId(nextActive.activities[0]?.id || null);
      }
      setActiveSimulation(null);
      setScheduleError(null);
      return true;
    },
    [projects, activeProjectId]
  );

  const resetProjectToBaseline = useCallback(
    (projectId?: string) => {
      const targetId = projectId || activeProjectId;
      const target = projects.find(p => p.id === targetId);
      if (!target) return;

      const base = JSON.parse(JSON.stringify(target.baselineActivities || []));
      if (targetId === activeProjectId) {
        setActivities(base);
        setSelectedActivityId(base[0]?.id || null);
        setActiveSimulation(null);
        setScheduleError(null);
        setLastChangedActivityId(null);
        setHighlightedPathId(null);
      }

      setProjects(prev =>
        prev.map(p => (p.id === targetId ? { ...p, activities: base, updatedAt: new Date().toISOString() } : p))
      );
    },
    [activeProjectId, projects]
  );

  const setProjectAsNewBaseline = useCallback(
    (projectId?: string) => {
      const targetId = projectId || activeProjectId;
      const currentActCopy = JSON.parse(JSON.stringify(activities));

      setProjects(prev =>
        prev.map(p =>
          p.id === targetId
            ? { ...p, baselineActivities: currentActCopy, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [activeProjectId, activities]
  );

  const exportProject = useCallback(
    (projectId?: string) => {
      const target = projects.find(p => p.id === (projectId || activeProjectId)) || activeProject;
      exportProjectAsJsonFile(target);
    },
    [projects, activeProjectId, activeProject]
  );

  const importProject = useCallback(
    (jsonString: string) => {
      const res = validateAndImportProjectJson(jsonString);
      if (!res.success || !res.project) {
        setScheduleError(res.error || 'Failed to import project.');
        return { success: false, error: res.error };
      }

      const importedProj = res.project;
      setProjects(prev => [...prev, importedProj]);
      setActiveProjectId(importedProj.id);
      setActivities(importedProj.activities);
      setSelectedActivityId(importedProj.activities[0]?.id || null);
      setActiveSimulation(null);
      setScheduleError(null);
      return { success: true, project: importedProj };
    },
    []
  );

  // Activity Management Actions
  const addActivity = useCallback(
    (
      data: Partial<Activity> & { name: string; duration: number }
    ): { success: boolean; error?: string; activity?: Activity } => {
      const autoId = data.id?.trim() || generateNextActivityId(activities);
      if (activities.some(a => a.id.toLowerCase() === autoId.toLowerCase())) {
        return { success: false, error: `Activity ID "${autoId}" already exists in this project.` };
      }

      const cleanPredecessors = (data.predecessors || []).filter(
        p => p !== autoId && activities.some(a => a.id === p)
      );

      const relations =
        data.dependencyRelations && data.dependencyRelations.length > 0
          ? data.dependencyRelations.filter(r => r.predecessorId !== autoId && activities.some(a => a.id === r.predecessorId))
          : cleanPredecessors.map(p => ({
              predecessorId: p,
              type: 'FS' as const,
              lag: 0,
              classification: data.dependencyClassification || 'Mandatory',
            }));

      const finalPreds = Array.from(new Set(relations.map(r => r.predecessorId)));

      const newActivity: Activity = {
        id: autoId,
        name: data.name.trim() || `Activity ${autoId}`,
        duration: Math.max(0, Math.round(data.duration)),
        predecessors: finalPreds,
        dependencyRelations: relations,
        description: data.description?.trim() || '',
        category: data.category || 'Engineering',
        progress: data.progress ?? 0,
        isMilestone: data.isMilestone ?? data.duration === 0,
        dependencyClassification: data.dependencyClassification || 'Mandatory',
      };

      const proposed = [...activities, newActivity];
      const cycleCheck = detectCycles(proposed);
      if (cycleCheck.hasCycle) {
        return {
          success: false,
          error: `Circular dependency detected involving activities: ${cycleCheck.cycleNodes?.join(', ')}`,
        };
      }

      syncActivitiesToProject(proposed);
      setSelectedActivityId(newActivity.id);
      setLastChangedActivityId(newActivity.id);
      setActiveSimulation(null);
      setViewMode('current');
      setScheduleError(null);
      return { success: true, activity: newActivity };
    },
    [activities, syncActivitiesToProject]
  );

  const updateActivity = useCallback(
    (id: string, updates: Partial<Activity>): { success: boolean; error?: string } => {
      const target = activities.find(a => a.id === id);
      if (!target) {
        return { success: false, error: `Activity "${id}" not found.` };
      }

      // Predecessor and relationship synchronization
      let finalUpdates = { ...updates };
      if (updates.dependencyRelations) {
        const predIds = Array.from(new Set(updates.dependencyRelations.map(r => r.predecessorId)));
        finalUpdates.predecessors = predIds;
      } else if (updates.predecessors) {
        finalUpdates.dependencyRelations = updates.predecessors.map(p => ({
          predecessorId: p,
          type: 'FS' as const,
          lag: 0,
        }));
      }

      if (finalUpdates.predecessors) {
        for (const pred of finalUpdates.predecessors) {
          if (pred === id) {
            return { success: false, error: `Activity "${id}" cannot depend on itself.` };
          }
          if (!activities.some(a => a.id === pred)) {
            return { success: false, error: `Predecessor "${pred}" does not exist in this project.` };
          }
        }
      }

      const isRenaming = finalUpdates.id && finalUpdates.id !== id;
      if (isRenaming && activities.some(a => a.id.toUpperCase() === finalUpdates.id!.toUpperCase())) {
        return { success: false, error: `Activity ID "${finalUpdates.id}" already exists.` };
      }

      const proposed = activities.map(a => {
        if (a.id === id) {
          return { ...a, ...finalUpdates };
        }
        if (isRenaming) {
          const updatedPreds = a.predecessors.map(p => (p === id ? finalUpdates.id! : p));
          const updatedRels = a.dependencyRelations?.map(r =>
            r.predecessorId === id ? { ...r, predecessorId: finalUpdates.id! } : r
          );
          return {
            ...a,
            predecessors: updatedPreds,
            dependencyRelations: updatedRels,
          };
        }
        return a;
      });

      const cycleCheck = detectCycles(proposed);
      if (cycleCheck.hasCycle) {
        return {
          success: false,
          error: `Circular dependency detected involving activities: ${cycleCheck.cycleNodes?.join(', ')}`,
        };
      }

      const finalId = finalUpdates.id || id;
      syncActivitiesToProject(proposed);
      setLastChangedActivityId(finalId);
      setSelectedActivityId(finalId);
      setActiveSimulation(null);
      setViewMode('current');
      setScheduleError(null);
      return { success: true };
    },
    [activities, syncActivitiesToProject]
  );

  const deleteActivity = useCallback(
    (
      id: string,
      cascadeCleanPredecessors: boolean = true
    ): { success: boolean; error?: string; dependentActivities?: string[] } => {
      const dependents = activities.filter(a => a.predecessors.includes(id)).map(a => a.id);
      if (dependents.length > 0 && !cascadeCleanPredecessors) {
        return {
          success: false,
          error: `Cannot delete Activity ${id}: Activities [${dependents.join(', ')}] depend on it.`,
          dependentActivities: dependents,
        };
      }

      const nextActivities = activities
        .filter(a => a.id !== id)
        .map(a => ({
          ...a,
          predecessors: a.predecessors.filter(p => p !== id),
          dependencyRelations: a.dependencyRelations
            ? a.dependencyRelations.filter(r => r.predecessorId !== id)
            : undefined,
        }));

      syncActivitiesToProject(nextActivities);
      if (selectedActivityId === id) {
        setSelectedActivityId(nextActivities[0]?.id || null);
      }
      setActiveSimulation(null);
      setViewMode('current');
      setScheduleError(null);
      return { success: true };
    },
    [activities, selectedActivityId, syncActivitiesToProject]
  );

  const duplicateActivity = useCallback(
    (id: string): { success: boolean; error?: string; activity?: Activity } => {
      const source = activities.find(a => a.id === id);
      if (!source) return { success: false, error: `Activity ${id} not found.` };

      const nextId = generateNextActivityId(activities);
      const clone: Activity = {
        ...JSON.parse(JSON.stringify(source)),
        id: nextId,
        name: `${source.name} (Copy)`,
        progress: 0,
      };

      const proposed = [...activities, clone];
      syncActivitiesToProject(proposed);
      setSelectedActivityId(clone.id);
      setLastChangedActivityId(clone.id);
      setActiveSimulation(null);
      setViewMode('current');
      return { success: true, activity: clone };
    },
    [activities, syncActivitiesToProject]
  );

  const updateActivityDuration = useCallback(
    (id: string, newDuration: number) => {
      const clampedDuration = Math.max(0, Math.min(60, Math.round(newDuration)));
      const nextActivities = activities.map(act =>
        act.id === id ? { ...act, duration: clampedDuration } : act
      );
      syncActivitiesToProject(nextActivities);
      setScheduleError(null);
      setLastChangedActivityId(id);
      setSelectedActivityId(id);
      setActiveSimulation(null);
      setViewMode('current');
    },
    [activities, syncActivitiesToProject]
  );

  const updateActivityProgress = useCallback(
    (id: string, progress: number) => {
      const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
      const nextActivities = activities.map(act =>
        act.id === id ? { ...act, progress: clampedProgress } : act
      );
      syncActivitiesToProject(nextActivities);
      setActiveSimulation(null);
      setViewMode('current');
    },
    [activities, syncActivitiesToProject]
  );

  const updateActivityDependencies = useCallback(
    (
      id: string,
      newPredecessors: (string | ActivityDependency)[]
    ): { success: boolean; error?: string } => {
      if (newPredecessors.length > 0 && typeof newPredecessors[0] !== 'string') {
        const relations = newPredecessors as ActivityDependency[];
        return updateActivity(id, {
          predecessors: relations.map(r => r.predecessorId),
          dependencyRelations: relations,
        });
      }
      return updateActivity(id, { predecessors: newPredecessors as string[] });
    },
    [updateActivity]
  );

  const applyPertDuration = useCallback(
    (activityId: string, duration: number) => {
      const rounded = Math.max(1, Math.min(60, Math.round(duration)));
      updateActivityDuration(activityId, rounded);
    },
    [updateActivityDuration]
  );

  const resetToBaseline = useCallback(() => {
    resetProjectToBaseline();
  }, [resetProjectToBaseline]);

  // Real-time Simulation Engine Actions
  const runDurationSimulation = useCallback(
    (activityId: string, newDuration: number): SimulationScenario => {
      const scenario = simulateDurationChange(activities, activityId, newDuration);
      setActiveSimulation(scenario);
      if (scenario.isValid) {
        setViewMode('preview');
      }
      return scenario;
    },
    [activities]
  );

  const runDelaySimulation = useCallback(
    (activityId: string, additionalDays: number): SimulationScenario => {
      const scenario = simulateDelay(activities, activityId, additionalDays);
      setActiveSimulation(scenario);
      if (scenario.isValid) {
        setViewMode('preview');
      }
      return scenario;
    },
    [activities]
  );

  const runCompressionSimulation = useCallback(
    (activityId: string, reductionDays: number): SimulationScenario => {
      const scenario = simulateCompression(activities, activityId, reductionDays);
      setActiveSimulation(scenario);
      if (scenario.isValid) {
        setViewMode('preview');
      }
      return scenario;
    },
    [activities]
  );

  const runDependencySimulation = useCallback(
    (
      activityId: string,
      newPredecessors: (string | ActivityDependency)[]
    ): SimulationScenario => {
      const scenario = simulateDependencyChange(activities, activityId, newPredecessors);
      setActiveSimulation(scenario);
      if (scenario.isValid) {
        setViewMode('preview');
      }
      return scenario;
    },
    [activities]
  );

  const runPertSimulation = useCallback(
    (
      activityId: string,
      optimistic: number,
      mostLikely: number,
      pessimistic: number
    ): SimulationScenario => {
      const scenario = simulatePertEstimate(
        activities,
        activityId,
        optimistic,
        mostLikely,
        pessimistic
      );
      setActiveSimulation(scenario);
      if (scenario.isValid) {
        setViewMode('preview');
      }
      return scenario;
    },
    [activities]
  );

  const applyActiveSimulation = useCallback(() => {
    if (!activeSimulation) return;
    if (activeSimulation.isValid) {
      const nextActivities = applySimulation(activities, activeSimulation);
      syncActivitiesToProject(nextActivities);
      if (activeSimulation.targetActivityId) {
        setLastChangedActivityId(activeSimulation.targetActivityId);
        setSelectedActivityId(activeSimulation.targetActivityId);
      }
    }
    setActiveSimulation(null);
    setViewMode('current');
  }, [activeSimulation, activities, syncActivitiesToProject]);

  const discardActiveSimulation = useCallback(() => {
    setActiveSimulation(null);
    setViewMode('current');
  }, []);

  const clearActiveSimulation = useCallback(() => {
    setActiveSimulation(null);
    setViewMode('current');
  }, []);

  const resetPreview = useCallback(() => {
    setActiveSimulation(null);
    setViewMode('current');
  }, []);

  const togglePresenterMode = useCallback(() => {
    setPresenterMode(prev => {
      const next = !prev;
      if (next && !isTimerRunning) {
        setIsTimerRunning(true);
      }
      return next;
    });
  }, [isTimerRunning]);

  const togglePresentationStageMode = useCallback(() => {
    setPresentationStageMode(prev => !prev);
  }, []);

  const goToChapter = useCallback((chapterNum: number) => {
    const clamped = Math.max(1, Math.min(CHAPTERS_DATA.length, chapterNum));
    setActiveChapter(clamped);
    const targetChapter = CHAPTERS_DATA[clamped - 1];
    if (targetChapter) {
      const el = document.getElementById(targetChapter.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const nextChapter = useCallback(() => {
    setActiveChapter(prev => {
      const next = Math.min(CHAPTERS_DATA.length, prev + 1);
      const targetChapter = CHAPTERS_DATA[next - 1];
      if (targetChapter) {
        const el = document.getElementById(targetChapter.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return next;
    });
  }, []);

  const prevChapter = useCallback(() => {
    setActiveChapter(prev => {
      const prevNum = Math.max(1, prev - 1);
      const targetChapter = CHAPTERS_DATA[prevNum - 1];
      if (targetChapter) {
        const el = document.getElementById(targetChapter.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return prevNum;
    });
  }, []);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setPresentationTimerSeconds(0);
    setIsTimerRunning(false);
  }, []);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.key === 'ArrowRight' && presenterMode) {
        nextChapter();
      } else if (e.key === 'ArrowLeft' && presenterMode) {
        prevChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, nextChapter, prevChapter]);

  const value = {
    // Project Management
    projects,
    activeProjectId,
    activeProject,
    switchProject,
    createProject,
    updateProjectDetails,
    duplicateProject,
    deleteProject,
    resetProjectToBaseline,
    setProjectAsNewBaseline,
    exportProject,
    importProject,

    // Activity Management
    addActivity,
    updateActivity,
    deleteActivity,
    duplicateActivity,

    // Multi-tier schedule state & view mode
    viewMode,
    setViewMode,
    activeSchedule,
    activeActivities,
    currentActivities,
    baselineActivities,
    previewActivities,
    displayedActivities,
    currentSchedule,
    schedule,
    activities,
    baselineSchedule,
    previewSchedule,
    displayedSchedule,
    activeSimulation,
    isSimulating,
    isModified,

    // UI state
    scheduleError,
    clearScheduleError,
    selectedActivityId,
    showCriticalPath,
    showFloat,
    highlightedPathId,
    presenterMode,
    presentationStageMode,
    activeChapter,
    delayImpact,
    presentationTimerSeconds,
    isTimerRunning,

    // Actions
    updateActivityDuration,
    updateActivityProgress,
    updateActivityDependencies,
    applyPertDuration,
    resetToBaseline,
    resetPreview,
    setSelectedActivityId,
    setShowCriticalPath,
    setShowFloat,
    setHighlightedPathId,
    togglePresenterMode,
    togglePresentationStageMode,
    goToChapter,
    nextChapter,
    prevChapter,
    toggleTimer,
    resetTimer,

    // Simulations
    runDurationSimulation,
    runDelaySimulation,
    runCompressionSimulation,
    runDependencySimulation,
    runPertSimulation,
    applyActiveSimulation,
    discardActiveSimulation,
    clearActiveSimulation,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
