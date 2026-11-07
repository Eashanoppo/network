import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Activity, ScheduleCalculationResult, DelayImpactAnalysis } from '../types/scheduling';
import { BASELINE_ACTIVITIES, calculateSchedule, analyzeDelayImpact } from '../engine/cpmEngine';

interface ScheduleContextType {
  activities: Activity[];
  schedule: ScheduleCalculationResult;
  baselineSchedule: ScheduleCalculationResult;
  selectedActivityId: string | null;
  showCriticalPath: boolean;
  showFloat: boolean;
  highlightedPathId: string | null;
  presenterMode: boolean;
  delayImpact: DelayImpactAnalysis | null;
  isModified: boolean;
  // Actions
  updateActivityDuration: (id: string, duration: number) => void;
  resetToBaseline: () => void;
  setSelectedActivityId: (id: string | null) => void;
  setShowCriticalPath: (show: boolean) => void;
  setShowFloat: (show: boolean) => void;
  setHighlightedPathId: (pathId: string | null) => void;
  togglePresenterMode: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(BASELINE_ACTIVITIES);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>('C'); // Start with C selected as it has float
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true);
  const [showFloat, setShowFloat] = useState<boolean>(true);
  const [highlightedPathId, setHighlightedPathId] = useState<string | null>(null);
  const [presenterMode, setPresenterMode] = useState<boolean>(false);
  const [lastChangedActivityId, setLastChangedActivityId] = useState<string | null>(null);

  // Baseline calculation (memoized once)
  const baselineSchedule = useMemo(() => calculateSchedule(BASELINE_ACTIVITIES), []);

  // Current calculation (dynamically recomputed whenever activities array changes)
  const schedule = useMemo(() => calculateSchedule(activities), [activities]);

  // Is modified check
  const isModified = useMemo(() => {
    return activities.some(act => {
      const base = BASELINE_ACTIVITIES.find(b => b.id === act.id);
      return base ? base.duration !== act.duration : true;
    });
  }, [activities]);

  // Delay impact analysis
  const delayImpact = useMemo(() => {
    if (!lastChangedActivityId) return null;
    return analyzeDelayImpact(baselineSchedule, schedule, lastChangedActivityId);
  }, [baselineSchedule, schedule, lastChangedActivityId]);

  const updateActivityDuration = useCallback((id: string, newDuration: number) => {
    const clampedDuration = Math.max(1, Math.min(20, Math.round(newDuration)));
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, duration: clampedDuration } : act))
    );
    setLastChangedActivityId(id);
    setSelectedActivityId(id);
  }, []);

  const resetToBaseline = useCallback(() => {
    setActivities(BASELINE_ACTIVITIES);
    setSelectedActivityId('C');
    setLastChangedActivityId(null);
    setHighlightedPathId(null);
  }, []);

  const togglePresenterMode = useCallback(() => {
    setPresenterMode(prev => !prev);
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        activities,
        schedule,
        baselineSchedule,
        selectedActivityId,
        showCriticalPath,
        showFloat,
        highlightedPathId,
        presenterMode,
        delayImpact,
        isModified,
        updateActivityDuration,
        resetToBaseline,
        setSelectedActivityId,
        setShowCriticalPath,
        setShowFloat,
        setHighlightedPathId,
        togglePresenterMode,
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

