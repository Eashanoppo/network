import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Activity,
  ScheduleCalculationResult,
  DelayImpactAnalysis,
  SimulationScenario,
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
  simulateDependencyChange,
  simulatePertEstimate,
  applySimulation,
} from '../engine/simulationEngine';
import { CHAPTERS_DATA } from '../data/educationalContent';

interface ScheduleContextType {
  // Three-tier state architecture
  activities: Activity[]; // Current applied working activities
  schedule: ScheduleCalculationResult; // Current applied schedule
  baselineSchedule: ScheduleCalculationResult; // Immutable baseline schedule
  activeSimulation: SimulationScenario | null; // Active what-if scenario (if any)

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
  isModified: boolean;
  presentationTimerSeconds: number;
  isTimerRunning: boolean;

  // Actions
  updateActivityDuration: (id: string, duration: number) => void;
  updateActivityProgress: (id: string, progress: number) => void;
  updateActivityDependencies: (id: string, newPredecessors: string[]) => { success: boolean; error?: string };
  applyPertDuration: (activityId: string, duration: number) => void;
  resetToBaseline: () => void;
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
  runDependencySimulation: (activityId: string, newPredecessors: string[]) => SimulationScenario;
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
  const [activities, setActivities] = useState<Activity[]>(BASELINE_ACTIVITIES);
  const [activeSimulation, setActiveSimulation] = useState<SimulationScenario | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>('C'); // Start with C selected as it has float
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

  // Baseline calculation (memoized once from immutable baseline)
  const baselineSchedule = useMemo(() => calculateSchedule(BASELINE_ACTIVITIES), []);

  // Current calculation (dynamically recomputed whenever activities array changes)
  const schedule = useMemo(() => calculateSchedule(activities), [activities]);

  // Is modified check against immutable baseline
  const isModified = useMemo(() => {
    return activities.some(act => {
      const base = BASELINE_ACTIVITIES.find(b => b.id === act.id);
      if (!base) return true;
      if (base.duration !== act.duration) return true;
      if (base.predecessors.length !== act.predecessors.length) return true;
      if (base.predecessors.some((p, i) => p !== act.predecessors[i])) return true;
      if ((base.progress ?? 0) !== (act.progress ?? 0)) return true;
      return false;
    });
  }, [activities]);

  // Delay impact analysis
  const delayImpact = useMemo(() => {
    if (!lastChangedActivityId) return null;
    return analyzeDelayImpact(baselineSchedule, schedule, lastChangedActivityId);
  }, [baselineSchedule, schedule, lastChangedActivityId]);

  const clearScheduleError = useCallback(() => {
    setScheduleError(null);
  }, []);

  const updateActivityDuration = useCallback((id: string, newDuration: number) => {
    const clampedDuration = Math.max(1, Math.min(20, Math.round(newDuration)));
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, duration: clampedDuration } : act))
    );
    setScheduleError(null);
    setLastChangedActivityId(id);
    setSelectedActivityId(id);
  }, []);

  const updateActivityProgress = useCallback((id: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, progress: clampedProgress } : act))
    );
  }, []);

  const updateActivityDependencies = useCallback(
    (id: string, newPredecessors: string[]): { success: boolean; error?: string } => {
      const proposed = activities.map(a =>
        a.id === id ? { ...a, predecessors: [...newPredecessors] } : { ...a }
      );
      const validation = validateActivities(proposed);
      if (!validation.isValid) {
        const err = validation.errors.map(e => e.message).join(' | ');
        setScheduleError(err);
        return { success: false, error: err };
      }
      const cycleCheck = detectCycles(proposed);
      if (cycleCheck.hasCycle) {
        const err = `Circular dependency detected involving activities: ${cycleCheck.cycleNodes?.join(', ')}`;
        setScheduleError(err);
        return { success: false, error: err };
      }
      setScheduleError(null);
      setActivities(proposed);
      setLastChangedActivityId(id);
      setSelectedActivityId(id);
      return { success: true };
    },
    [activities]
  );

  const applyPertDuration = useCallback(
    (activityId: string, duration: number) => {
      const rounded = Math.max(1, Math.min(25, Math.round(duration)));
      updateActivityDuration(activityId, rounded);
    },
    [updateActivityDuration]
  );

  const resetToBaseline = useCallback(() => {
    setActivities(BASELINE_ACTIVITIES);
    setActiveSimulation(null);
    setScheduleError(null);
    setSelectedActivityId('C');
    setLastChangedActivityId(null);
    setHighlightedPathId(null);
  }, []);

  // Real-time Simulation Engine Actions
  const runDurationSimulation = useCallback(
    (activityId: string, newDuration: number): SimulationScenario => {
      const scenario = simulateDurationChange(activities, activityId, newDuration);
      setActiveSimulation(scenario);
      return scenario;
    },
    [activities]
  );

  const runDelaySimulation = useCallback(
    (activityId: string, additionalDays: number): SimulationScenario => {
      const scenario = simulateDelay(activities, activityId, additionalDays);
      setActiveSimulation(scenario);
      return scenario;
    },
    [activities]
  );

  const runDependencySimulation = useCallback(
    (activityId: string, newPredecessors: string[]): SimulationScenario => {
      const scenario = simulateDependencyChange(activities, activityId, newPredecessors);
      setActiveSimulation(scenario);
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
      return scenario;
    },
    [activities]
  );

  const applyActiveSimulation = useCallback(() => {
    if (!activeSimulation) return;
    if (activeSimulation.isValid) {
      const nextActivities = applySimulation(activities, activeSimulation);
      setActivities(nextActivities);
      if (activeSimulation.targetActivityId) {
        setLastChangedActivityId(activeSimulation.targetActivityId);
        setSelectedActivityId(activeSimulation.targetActivityId);
      }
    }
    setActiveSimulation(null);
  }, [activeSimulation, activities]);

  const discardActiveSimulation = useCallback(() => {
    setActiveSimulation(null);
  }, []);

  const clearActiveSimulation = useCallback(() => {
    setActiveSimulation(null);
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

  // Keyboard navigation for presentation mode (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presenterMode) return;
      // If typing in an input or slider, do not hijack
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        nextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, nextChapter, prevChapter]);

  return (
    <ScheduleContext.Provider
      value={{
        activities,
        schedule,
        baselineSchedule,
        activeSimulation,
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
        isModified,
        presentationTimerSeconds,
        isTimerRunning,
        updateActivityDuration,
        updateActivityProgress,
        updateActivityDependencies,
        applyPertDuration,
        resetToBaseline,
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
        runDurationSimulation,
        runDelaySimulation,
        runDependencySimulation,
        runPertSimulation,
        applyActiveSimulation,
        discardActiveSimulation,
        clearActiveSimulation,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
