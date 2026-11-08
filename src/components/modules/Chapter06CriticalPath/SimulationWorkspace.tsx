import React, { useState, useEffect, useMemo } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { ScheduleViewModeBanner } from '../../common/ScheduleViewModeBanner';
import { normalizeActivityDependencies } from '../../../engine/cpmEngine';
import { ActivityDependency, RelationshipType } from '../../../types/scheduling';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Layers,
  Check,
  X,
  Zap,
  Scissors,
  GitBranch,
  ShieldCheck,
  Percent,
} from 'lucide-react';

type SimControlTab = 'scenarios' | 'duration' | 'compression' | 'dependency' | 'pert';

export const SimulationWorkspace: React.FC = () => {
  const {
    activeProject,
    schedule,
    currentSchedule,
    baselineSchedule,
    previewSchedule,
    viewMode,
    setViewMode,
    activeSimulation,
    currentActivities,
    runDurationSimulation,
    runDelaySimulation,
    runCompressionSimulation,
    runDependencySimulation,
    runPertSimulation,
    applyActiveSimulation,
    discardActiveSimulation,
    resetPreview,
    resetToBaseline,
    isModified,
    selectedActivityId,
    setSelectedActivityId,
  } = useSchedule();

  const [activeTab, setActiveTab] = useState<SimControlTab>('duration');
  const [simTargetId, setSimTargetId] = useState<string>('C');

  // Working target activity
  const activeWorkingAct = currentActivities.find(a => a.id === simTargetId) || currentActivities[0];

  // Control state
  const [targetDuration, setTargetDuration] = useState<number>(3);
  const [delayInput, setDelayInput] = useState<number>(1);
  const [crashReduction, setCrashReduction] = useState<number>(1);

  // Dependency simulation state
  const [simDependencies, setSimDependencies] = useState<ActivityDependency[]>([]);

  // PERT state
  const [pertO, setPertO] = useState<number>(2);
  const [pertM, setPertM] = useState<number>(3);
  const [pertP, setPertP] = useState<number>(6);

  // Sync state when simTargetId changes or project changes
  useEffect(() => {
    if (currentActivities.length > 0) {
      const exists = currentActivities.some(a => a.id === simTargetId);
      const target = exists ? activeWorkingAct : currentActivities[0];
      const targetId = target?.id || currentActivities[0].id;

      if (!exists) {
        setSimTargetId(targetId);
      }

      if (target) {
        setTargetDuration(target.duration);
        setSimDependencies(normalizeActivityDependencies(target));
        setPertO(Math.max(1, target.duration - 1));
        setPertM(target.duration);
        setPertP(target.duration + 3);
      }
    }
  }, [currentActivities, simTargetId]);

  // Derived PERT statistics
  const pertExpected = useMemo(() => {
    return Math.round(((pertO + 4 * pertM + pertP) / 6) * 10) / 10;
  }, [pertO, pertM, pertP]);

  const pertVariance = useMemo(() => {
    const sigma = (pertP - pertO) / 6;
    return Math.round(sigma * sigma * 100) / 100;
  }, [pertO, pertP]);

  const pertStdDev = useMemo(() => {
    return Math.round(((pertP - pertO) / 6) * 100) / 100;
  }, [pertO, pertP]);

  // Dynamic Scenario Library based on active project topology and critical paths
  const scenarioLibrary = useMemo(() => {
    const list = currentActivities;
    const crit = list.filter(a => currentSchedule.activities[a.id]?.isCritical);
    const nonCrit = list.filter(
      a => !currentSchedule.activities[a.id]?.isCritical && (currentSchedule.activities[a.id]?.totalFloat || 0) > 0
    );

    const targetCrit = crit[0] || list[0];
    const targetNonCrit = nonCrit[0] || list.find(a => a.id !== targetCrit?.id) || list[0];
    const nonCritFloat = currentSchedule.activities[targetNonCrit?.id]?.totalFloat || 1;

    return [
      {
        id: 'baseline-ref',
        title: '1. Baseline Reference Schedule',
        tag: 'Pristine Reference',
        description: `Reset or inspect the untouched baseline schedule of ${activeProject.name} (${baselineSchedule.projectDuration} workdays).`,
        impactType: 'neutral' as const,
        predictedDuration: baselineSchedule.projectDuration,
        action: () => {
          resetPreview();
          setViewMode('baseline');
        },
      },
      {
        id: 'delay-crit',
        title: `2. Critical Path Slippage (+2d on Task ${targetCrit?.id})`,
        tag: 'Deadline Breach',
        description: `Delaying critical Activity ${targetCrit?.id} (${targetCrit?.name}) by 2 workdays. With zero float, the delay cascades directly into total project completion.`,
        impactType: 'critical' as const,
        predictedDuration: currentSchedule.projectDuration + 2,
        action: () => {
          if (targetCrit) {
            setSimTargetId(targetCrit.id);
            runDelaySimulation(targetCrit.id, 2);
          }
        },
      },
      {
        id: 'float-absorb',
        title: `3. Float Absorption (+1d on Task ${targetNonCrit?.id})`,
        tag: 'Slack Buffer',
        description: `Delaying non-critical Activity ${targetNonCrit?.id} (${targetNonCrit?.name}) by 1 workday within its available float (${nonCritFloat}d). Absorbs with zero project delay.`,
        impactType: 'success' as const,
        predictedDuration: currentSchedule.projectDuration,
        action: () => {
          if (targetNonCrit) {
            setSimTargetId(targetNonCrit.id);
            runDelaySimulation(targetNonCrit.id, 1);
          }
        },
      },
      {
        id: 'parallel-crit',
        title: `4. Parallel Path Becomes Critical (+${nonCritFloat}d on Task ${targetNonCrit?.id})`,
        tag: 'Path Shift',
        description: `Consumes the entire float buffer of Activity ${targetNonCrit?.id}. Its total float drops to 0, tying duration with the primary critical path and spawning dual critical paths.`,
        impactType: 'warning' as const,
        predictedDuration: currentSchedule.projectDuration,
        action: () => {
          if (targetNonCrit) {
            setSimTargetId(targetNonCrit.id);
            runDelaySimulation(targetNonCrit.id, nonCritFloat);
          }
        },
      },
      {
        id: 'crash-crit',
        title: `5. Schedule Compression (Crash Task ${targetCrit?.id} by -1d)`,
        tag: 'Crashing / Crashing Limit',
        description: `Reduces planned duration of critical Activity ${targetCrit?.id} from ${targetCrit?.duration}d to ${Math.max(1, (targetCrit?.duration || 2) - 1)}d to shorten overall delivery timeline.`,
        impactType: 'success' as const,
        predictedDuration: Math.max(1, currentSchedule.projectDuration - 1),
        action: () => {
          if (targetCrit) {
            setSimTargetId(targetCrit.id);
            runCompressionSimulation(targetCrit.id, 1);
          }
        },
      },
      {
        id: 'pert-risk',
        title: `6. PERT Stochastic Variance on Task ${targetCrit?.id}`,
        tag: 'Probabilistic Beta Risk',
        description: `Applies 3-point Beta distribution estimate (O=${Math.max(1, (targetCrit?.duration || 4) - 2)}d, M=${targetCrit?.duration || 4}d, P=${(targetCrit?.duration || 4) + 4}d) to evaluate uncertainty.`,
        impactType: 'warning' as const,
        predictedDuration: currentSchedule.projectDuration,
        action: () => {
          if (targetCrit) {
            setSimTargetId(targetCrit.id);
            const o = Math.max(1, targetCrit.duration - 2);
            const m = targetCrit.duration;
            const p = targetCrit.duration + 4;
            runPertSimulation(targetCrit.id, o, m, p);
          }
        },
      },
    ];
  }, [currentActivities, currentSchedule, baselineSchedule, activeProject.name, runDelaySimulation, runCompressionSimulation, runPertSimulation, resetPreview, setViewMode]);

  // Handle duration change
  const handleDurationChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(30, newVal));
    setTargetDuration(clamped);
    runDurationSimulation(simTargetId, clamped);
  };

  // Quick Presets
  const runPreset = (actId: string, newDur: number) => {
    setSimTargetId(actId);
    setTargetDuration(newDur);
    setSelectedActivityId(actId);
    runDurationSimulation(actId, newDur);
  };

  // Predecessor toggle for dependency simulation
  const toggleSimPredecessor = (predId: string) => {
    const existing = simDependencies.find(d => d.predecessorId === predId);
    let next: ActivityDependency[];
    if (existing) {
      next = simDependencies.filter(d => d.predecessorId !== predId);
    } else {
      next = [...simDependencies, { predecessorId: predId, type: 'FS', lag: 0 }];
    }
    setSimDependencies(next);
    runDependencySimulation(simTargetId, next);
  };

  const updateSimRelType = (predId: string, type: RelationshipType) => {
    const next = simDependencies.map(d => (d.predecessorId === predId ? { ...d, type } : d));
    setSimDependencies(next);
    runDependencySimulation(simTargetId, next);
  };

  const updateSimRelLag = (predId: string, lag: number) => {
    const next = simDependencies.map(d => (d.predecessorId === predId ? { ...d, lag } : d));
    setSimDependencies(next);
    runDependencySimulation(simTargetId, next);
  };

  // Quick activities list helpers
  const criticalActs = currentSchedule.activityList.filter(a => a.isCritical);
  const nonCriticalActs = currentSchedule.activityList.filter(a => !a.isCritical && a.totalFloat > 0);
  const firstCrit = criticalActs[0];
  const firstNonCrit = nonCriticalActs[0];

  return (
    <section id="section-simulations" className="w-full bg-warm py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-brand text-ink-primary">
              STUDIO &bull; REAL-TIME EXPERIMENTATION
            </span>
            <span className="text-xs text-ink-muted">&bull; Three-Tier Reactive Scheduling Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-primary font-sans leading-tight">
            Unified Simulation &amp; What-If Preview
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-secondary max-w-3xl leading-relaxed">
            Test hypothetical duration variations, schedule crashing, dependency alterations, and PERT three-point distributions without mutating your working schedule or baseline. When simulation preview is active, every visualization reflects the hypothetical schedule in real time.
          </p>
        </div>

        {/* Unified View Mode Banner */}
        <ScheduleViewModeBanner className="mb-8" />

        {/* 3-Tier State Comparison Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Tier 1: Approved Baseline */}
          <div
            onClick={() => setViewMode('baseline')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'baseline'
                ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                : 'bg-white border-border hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Tier 1 &bull; Approved Baseline
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-100 text-blue-800 font-bold border border-blue-200">
                Immutable
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-ink-primary">
              {baselineSchedule.projectDuration} Workdays
            </div>
            <p className="text-xs text-ink-secondary mt-1 truncate">
              Path: <span className="font-mono text-ink-primary font-semibold">{baselineSchedule.criticalPaths[0]?.activityIds.join(' → ') || 'None'}</span>
            </p>
          </div>

          {/* Tier 2: Current Working Schedule */}
          <div
            onClick={() => setViewMode('current')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'current'
                ? 'bg-white border-ink-primary ring-2 ring-ink-primary/20 shadow-xs'
                : 'bg-white/80 border-border hover:border-ink-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-primary">
                Tier 2 &bull; Current Working Schedule
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-warm text-ink-primary font-bold border border-border">
                Active
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-ink-primary">
              {currentSchedule.projectDuration} Workdays
            </div>
            <p className="text-xs text-ink-secondary mt-1 truncate">
              Critical: <span className="font-mono text-critical font-bold">{currentSchedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ') || 'None'}</span>
            </p>
          </div>

          {/* Tier 3: Staged Simulation Preview */}
          <div
            onClick={() => {
              if (activeSimulation) setViewMode('preview');
            }}
            className={`p-5 rounded-xl border transition-all ${
              viewMode === 'preview'
                ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs cursor-pointer'
                : activeSimulation
                ? 'bg-white border-amber-300 hover:border-amber-500 cursor-pointer'
                : 'bg-white/60 border-border opacity-70 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Tier 3 &bull; Simulation Preview
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  activeSimulation
                    ? 'bg-amber-500 text-white font-bold'
                    : 'bg-warm text-ink-muted border border-border'
                }`}
              >
                {activeSimulation ? (viewMode === 'preview' ? 'Active Preview' : 'Staged') : 'No Simulation'}
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-ink-primary">
              {previewSchedule ? `${previewSchedule.projectDuration} Workdays` : '—'}
            </div>
            <p className="text-xs text-ink-secondary mt-1 truncate">
              {activeSimulation ? (
                <span className="text-amber-900 font-semibold">{activeSimulation.description}</span>
              ) : (
                'Stage a parameter below to preview'
              )}
            </p>
          </div>
        </div>

        {/* Workbench Container */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs mb-8">
          {/* Target Activity Bar */}
          <div className="p-4 sm:p-5 bg-surface-secondary border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                1. Select Activity to Simulate
              </span>
              <h4 className="text-sm font-bold text-ink-primary mt-0.5">
                Target: {activeWorkingAct ? `${activeWorkingAct.id} — ${activeWorkingAct.name}` : 'None'}
              </h4>
            </div>

            {/* Target Activity Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {currentActivities.map(act => {
                const isSelected = simTargetId === act.id;
                const isCrit = currentSchedule.activities[act.id]?.isCritical;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      setSimTargetId(act.id);
                      setSelectedActivityId(act.id);
                      setTargetDuration(act.duration);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-ink-primary text-white shadow-xs'
                        : isCrit
                        ? 'bg-critical-light text-critical border border-critical-border hover:bg-critical/20'
                        : 'bg-white text-ink-primary border border-border hover:bg-warm'
                    }`}
                  >
                    <span>{act.id}</span>
                    <span className="text-[10px] opacity-80">{act.duration}d</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Control Navigation Tabs (Scenarios, A, B, C, D, E) */}
          <div className="border-b border-border bg-warm/50 px-4 sm:px-6 flex items-center space-x-1 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`py-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === 'scenarios'
                  ? 'border-brand text-brand bg-white'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Scenario Library</span>
            </button>

            <button
              onClick={() => setActiveTab('duration')}
              className={`py-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === 'duration'
                  ? 'border-brand text-brand bg-white'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>A &amp; B. Duration &amp; Delay</span>
            </button>

            <button
              onClick={() => setActiveTab('compression')}
              className={`py-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === 'compression'
                  ? 'border-brand text-brand bg-white'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>C. Schedule Crashing</span>
            </button>

            <button
              onClick={() => setActiveTab('dependency')}
              className={`py-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === 'dependency'
                  ? 'border-brand text-brand bg-white'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>D. Dependency &amp; PDM</span>
            </button>

            <button
              onClick={() => setActiveTab('pert')}
              className={`py-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === 'pert'
                  ? 'border-brand text-brand bg-white'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>E. PERT 3-Point Risk</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-5 sm:p-7">
            {/* TAB: Scenario Library */}
            {activeTab === 'scenarios' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <h5 className="text-sm font-bold text-ink-primary">
                      Dynamic Scenario Library ({activeProject.name})
                    </h5>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Explore realistic stress-test scenarios dynamically adapted to your active project graph.
                    </p>
                  </div>
                  {activeSimulation && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={discardActiveSimulation}
                        className="px-2.5 py-1 text-xs rounded border border-border bg-white hover:bg-surface-secondary text-ink-secondary"
                      >
                        Discard Preview
                      </button>
                      <button
                        onClick={applyActiveSimulation}
                        className="px-3 py-1 text-xs rounded font-bold bg-brand text-white hover:bg-brand-hover shadow-xs"
                      >
                        Apply Scenario
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scenarioLibrary.map(sc => (
                    <div
                      key={sc.id}
                      className="p-4 rounded-xl border border-border bg-white hover:border-ink-secondary transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                              sc.impactType === 'critical'
                                ? 'bg-critical-light text-critical'
                                : sc.impactType === 'success'
                                ? 'bg-success-light text-success'
                                : sc.impactType === 'warning'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-50 text-blue-900'
                            }`}
                          >
                            {sc.tag}
                          </span>
                          <span className="text-xs font-mono font-bold text-ink-primary">
                            ~{sc.predictedDuration}d
                          </span>
                        </div>

                        <h6 className="text-xs font-bold text-ink-primary mb-1.5 leading-snug">
                          {sc.title}
                        </h6>
                        <p className="text-[11px] text-ink-secondary leading-relaxed mb-4">
                          {sc.description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 pt-3 border-t border-border/60">
                        <button
                          onClick={sc.action}
                          className="flex-1 py-1.5 px-2 rounded-md bg-ink-primary text-white text-xs font-bold hover:bg-brand transition-colors text-center shadow-xs"
                        >
                          Load &amp; Preview
                        </button>
                        <button
                          onClick={() => setViewMode('baseline')}
                          className="py-1.5 px-2 rounded-md border border-border bg-warm text-[11px] text-ink-secondary hover:text-ink-primary transition-colors"
                          title="Compare with pristine baseline"
                        >
                          Baseline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB A & B: Duration & Delay */}
            {activeTab === 'duration' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Slider & Direct Numeric Input */}
                  <div className="p-4 rounded-xl bg-warm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-ink-primary">
                        Activity {simTargetId} Workday Duration
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-ink-muted">Working: {activeWorkingAct?.duration}d</span>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={targetDuration}
                          onChange={e => handleDurationChange(Number(e.target.value))}
                          className="w-16 px-2 py-0.5 rounded border border-border bg-white text-center font-mono font-bold text-sm text-ink-primary focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={targetDuration}
                      onChange={e => handleDurationChange(Number(e.target.value))}
                      className="w-full accent-brand cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-1.5">
                      <span>0d (Milestone)</span>
                      <span>Working: {activeWorkingAct?.duration}d</span>
                      <span>20d (Max)</span>
                    </div>
                  </div>

                  {/* Delay Slippage Simulator */}
                  <div className="p-4 rounded-xl bg-warm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-ink-primary">
                        Add Slippage Delay (+Days)
                      </span>
                      <span className="text-xs font-mono font-bold text-critical">
                        +{delayInput}d delay
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[1, 2, 3, 5].map(d => (
                        <button
                          key={d}
                          onClick={() => {
                            setDelayInput(d);
                            runDelaySimulation(simTargetId, d);
                          }}
                          className="py-1.5 rounded-lg border border-border bg-white hover:bg-surface-secondary text-xs font-mono font-bold text-ink-primary transition-colors"
                        >
                          +{d}d
                        </button>
                      ))}
                    </div>

                    {/* Float Absorption Diagnostic */}
                    {activeWorkingAct && (
                      <div className="text-[11px] flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-ink-secondary">
                          Available Float (Slack): <strong className="font-mono">{currentSchedule.activities[simTargetId]?.totalFloat || 0}d</strong>
                        </span>
                        <span
                          className={`font-semibold font-mono text-[10px] px-1.5 py-0.2 rounded ${
                            (currentSchedule.activities[simTargetId]?.totalFloat || 0) >= delayInput
                              ? 'bg-success-light text-success border border-success-border'
                              : 'bg-critical-light text-critical border border-critical-border'
                          }`}
                        >
                          {(currentSchedule.activities[simTargetId]?.totalFloat || 0) >= delayInput
                            ? 'Absorbed by Float'
                            : 'Project Date Slippage'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preset Scenario Quick Buttons */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted block mb-2.5">
                    One-Click Canonical Benchmark Scenarios
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => runPreset('C', 4)}
                      className="p-3 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                        <span>C = 4d (Absorb Float)</span>
                        <span className="text-success text-[10px] font-mono font-bold">0d Delay</span>
                      </div>
                      <p className="text-[11px] text-ink-secondary mt-1">
                        Absorbs 1d float. Duration remains 18d; yields 2 concurrent critical paths!
                      </p>
                    </button>

                    <button
                      onClick={() => runPreset('C', 5)}
                      className="p-3 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                        <span>C = 5d (Breach Float)</span>
                        <span className="text-critical text-[10px] font-mono font-bold">+1d Delay</span>
                      </div>
                      <p className="text-[11px] text-ink-secondary mt-1">
                        Exceeds slack buffer. Completion slips to 19 days, flipping critical path.
                      </p>
                    </button>

                    <button
                      onClick={() => runPreset('B', 6)}
                      className="p-3 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                        <span>B = 6d (Critical Delay)</span>
                        <span className="text-critical text-[10px] font-mono font-bold">+2d Delay</span>
                      </div>
                      <p className="text-[11px] text-ink-secondary mt-1">
                        Task B has zero float. Adding 2 days extends delivery from 18 to 20 days.
                      </p>
                    </button>

                    <button
                      onClick={() => runPreset('D', 8)}
                      className="p-3 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                        <span>D = 8d (Complex Build)</span>
                        <span className="text-critical text-[10px] font-mono font-bold">+2d Delay</span>
                      </div>
                      <p className="text-[11px] text-ink-secondary mt-1">
                        Core Development expands to 8 days, pushing project finish to Day 20.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB C: Schedule Crashing & Compression */}
            {activeTab === 'compression' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-warm border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-xs font-bold text-ink-primary">
                        Compress Activity {simTargetId} ({activeWorkingAct?.name})
                      </h5>
                      <p className="text-[11px] text-ink-secondary mt-0.5">
                        Test schedule crashing by shortening this activity. The engine checks if the project actually compresses or hits a parallel bottleneck.
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        currentSchedule.activities[simTargetId]?.isCritical
                          ? 'bg-critical-light text-critical border border-critical-border'
                          : 'bg-warm text-ink-secondary border border-border'
                      }`}
                    >
                      {currentSchedule.activities[simTargetId]?.isCritical ? 'Critical Path Task' : 'Non-Critical (Has Slack)'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {[1, 2, 3].map(days => (
                      <button
                        key={days}
                        onClick={() => {
                          setCrashReduction(days);
                          runCompressionSimulation(simTargetId, days);
                        }}
                        className="flex-1 py-2 rounded-lg bg-white hover:bg-surface-secondary border border-border text-xs font-mono font-bold text-ink-primary transition-colors flex items-center justify-center space-x-1"
                      >
                        <Scissors className="w-3.5 h-3.5 text-brand" />
                        <span>Crash -{days}d</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crashing Educational Insight */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border text-xs text-ink-secondary space-y-1.5">
                  <span className="font-bold text-ink-primary block uppercase tracking-wider text-[10px]">
                    PMBOK Crashing Principles
                  </span>
                  <p>
                    &bull; <strong>Shortening Critical Tasks:</strong> Accelerates total project delivery only until another parallel path becomes the controlling bottleneck.
                  </p>
                  <p>
                    &bull; <strong>Shortening Non-Critical Tasks:</strong> Does <em>not</em> accelerate the project finish date; it only expands unutilized total float.
                  </p>
                </div>
              </div>
            )}

            {/* TAB D: Dependency & PDM Simulation */}
            {activeTab === 'dependency' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-ink-primary">
                      Simulate Predecessors &amp; PDM Links for Activity {simTargetId}
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted">
                      {simDependencies.length} predecessors selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {currentActivities
                      .filter(a => a.id !== simTargetId)
                      .map(act => {
                        const dep = simDependencies.find(d => d.predecessorId === act.id);
                        const isChecked = Boolean(dep);

                        return (
                          <div
                            key={act.id}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              isChecked
                                ? 'bg-white border-brand shadow-xs text-ink-primary'
                                : 'bg-warm/60 border-border text-ink-secondary'
                            }`}
                          >
                            <div
                              onClick={() => toggleSimPredecessor(act.id)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="rounded text-brand accent-brand cursor-pointer"
                                />
                                <span className="font-mono font-bold text-ink-primary">{act.id}</span>
                                <span className="truncate text-[11px] font-medium">{act.name}</span>
                              </div>
                              <span className="font-mono text-[10px] text-ink-muted ml-1 whitespace-nowrap">
                                {act.duration}d
                              </span>
                            </div>

                            {isChecked && dep && (
                              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between gap-2">
                                <div className="flex items-center space-x-1">
                                  <span className="text-[9px] font-mono uppercase font-bold text-ink-muted">Type:</span>
                                  <select
                                    value={dep.type || 'FS'}
                                    onChange={e => updateSimRelType(act.id, e.target.value as RelationshipType)}
                                    className="px-1.5 py-0.5 rounded border border-border bg-white text-[10px] font-mono font-bold"
                                  >
                                    <option value="FS">FS</option>
                                    <option value="SS">SS</option>
                                    <option value="FF">FF</option>
                                    <option value="SF">SF</option>
                                  </select>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <span className="text-[9px] font-mono uppercase font-bold text-ink-muted">Lag:</span>
                                  <input
                                    type="number"
                                    value={dep.lag ?? 0}
                                    onChange={e => updateSimRelLag(act.id, parseInt(e.target.value) || 0)}
                                    className="w-12 px-1 py-0.5 rounded border border-border bg-white text-[10px] font-mono font-bold text-center"
                                  />
                                  <span className="text-[10px] font-mono text-ink-muted">d</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB E: PERT Three-Point Risk Simulation */}
            {activeTab === 'pert' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-warm border border-border">
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">
                      Optimistic (O)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={pertO}
                      onChange={e => setPertO(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white font-mono font-bold text-sm text-ink-primary focus:outline-none focus:border-brand"
                    />
                    <span className="text-[10px] text-ink-muted mt-1 block">Best-case timeline</span>
                  </div>

                  <div className="p-4 rounded-xl bg-warm border border-border">
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">
                      Most Likely (M)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={pertM}
                      onChange={e => setPertM(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white font-mono font-bold text-sm text-ink-primary focus:outline-none focus:border-brand"
                    />
                    <span className="text-[10px] text-ink-muted mt-1 block">Realistic modal estimate</span>
                  </div>

                  <div className="p-4 rounded-xl bg-warm border border-border">
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">
                      Pessimistic (P)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={pertP}
                      onChange={e => setPertP(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white font-mono font-bold text-sm text-ink-primary focus:outline-none focus:border-brand"
                    />
                    <span className="text-[10px] text-ink-muted mt-1 block">Worst-case obstacles</span>
                  </div>
                </div>

                {/* PERT Calculation Card & Preview Action */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Expected (μ)</span>
                      <span className="font-bold text-sm text-ink-primary">{pertExpected} days</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Std Dev (σ)</span>
                      <span className="font-bold text-sm text-ink-primary">±{pertStdDev}d</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Variance (σ²)</span>
                      <span className="font-bold text-sm text-ink-primary">{pertVariance}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => runPertSimulation(simTargetId, pertO, pertM, pertP)}
                    className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-colors shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Preview PERT Estimate ({Math.round(pertExpected)}d) in Schedule</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Authoritative Live Impact Panel */}
          {activeSimulation && (
            <div className="border-t border-border bg-warm/80 p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-ink-primary">
                      {activeSimulation.description}
                    </h5>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      {activeSimulation.comparison.explanation}
                    </p>
                  </div>
                </div>

                {/* Actions: Apply / Discard / Reset */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={discardActiveSimulation}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-border hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Discard</span>
                  </button>

                  <button
                    onClick={applyActiveSimulation}
                    className="px-4 py-1.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Apply to Working Schedule</span>
                  </button>
                </div>
              </div>

              {/* Impact Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                <div className="p-3 bg-white rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">Duration Delta</span>
                  <span
                    className={`font-bold text-base ${
                      activeSimulation.comparison.projectDurationDelta > 0
                        ? 'text-critical'
                        : activeSimulation.comparison.projectDurationDelta < 0
                        ? 'text-success'
                        : 'text-amber-800'
                    }`}
                  >
                    {activeSimulation.comparison.projectDurationDelta > 0
                      ? `+${activeSimulation.comparison.projectDurationDelta} workdays`
                      : activeSimulation.comparison.projectDurationDelta < 0
                      ? `${activeSimulation.comparison.projectDurationDelta} workdays`
                      : '0 days (Absorbed)'}
                  </span>
                  <span className="text-[10px] text-ink-muted block mt-0.5">
                    {currentSchedule.projectDuration}d &rarr; {previewSchedule?.projectDuration}d
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">Critical Path Shift</span>
                  <span className="font-bold text-sm text-ink-primary block mt-0.5">
                    {activeSimulation.comparison.criticalPathsChanged ? 'Yes (Altered)' : 'No (Stable)'}
                  </span>
                  <span className="text-[10px] text-ink-muted block">
                    {previewSchedule?.criticalPaths.length} Critical Path(s)
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">Affected Tasks</span>
                  <span className="font-bold text-sm text-ink-primary block mt-0.5">
                    {activeSimulation.comparison.affectedActivityIds.length} tasks impacted
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeSimulation.comparison.affectedActivityIds.slice(0, 4).map(id => (
                      <span key={id} className="px-1 py-0.2 rounded bg-warm text-[9px] font-bold">
                        {id}
                      </span>
                    ))}
                    {activeSimulation.comparison.affectedActivityIds.length > 4 && (
                      <span className="text-[9px] text-ink-muted">+{activeSimulation.comparison.affectedActivityIds.length - 4}</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">Status Shifts</span>
                  {activeSimulation.comparison.newCriticalActivities.length > 0 && (
                    <span className="text-[10px] text-critical font-bold block">
                      New Crit: {activeSimulation.comparison.newCriticalActivities.join(', ')}
                    </span>
                  )}
                  {activeSimulation.comparison.lostCriticalActivities.length > 0 && (
                    <span className="text-[10px] text-success font-bold block">
                      Lost Crit: {activeSimulation.comparison.lostCriticalActivities.join(', ')}
                    </span>
                  )}
                  {activeSimulation.comparison.newCriticalActivities.length === 0 &&
                    activeSimulation.comparison.lostCriticalActivities.length === 0 && (
                      <span className="text-[10px] text-ink-secondary block mt-1">No critical set shifts</span>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
