import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Check,
  X,
  Play,
  Zap,
} from 'lucide-react';

export const SimulationWorkspace: React.FC = () => {
  const {
    schedule,
    baselineSchedule,
    activeSimulation,
    activities,
    runDurationSimulation,
    runDelaySimulation,
    applyActiveSimulation,
    discardActiveSimulation,
    resetToBaseline,
    isModified,
    selectedActivityId,
    setSelectedActivityId,
  } = useSchedule();

  const [simTargetId, setSimTargetId] = useState<string>('C');
  const [targetDuration, setTargetDuration] = useState<number>(
    schedule.activities['C']?.duration || 3
  );
  const [delayDays, setDelayDays] = useState<number>(1);

  const activeTargetAct = schedule.activities[simTargetId];

  // Presets
  const runPreset = (actId: string, newDuration: number) => {
    setSimTargetId(actId);
    setTargetDuration(newDuration);
    runDurationSimulation(actId, newDuration);
  };

  return (
    <section id="section-simulations" className="w-full bg-warm py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-brand text-ink-primary">
              SECTION H
            </span>
            <span className="text-xs text-ink-muted">&bull; Three-Tier Reactive Scheduling Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-primary font-sans leading-tight">
            Real-Time Simulation Workspace
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
            Stage what-if scenarios without altering your approved project baseline. Test duration increases, analyze slack absorption, and commit or discard changes with full transparency.
          </p>
        </div>

        {/* 3-Tier State Comparison Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Tier 1: Baseline */}
          <div className="p-5 rounded-xl bg-white border border-border shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Tier 1 &bull; Approved Baseline
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-warm text-ink-secondary border border-border">
                Immutable
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-ink-primary">
              {baselineSchedule.projectDuration} Workdays
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Path: <span className="font-mono text-ink-primary">{baselineSchedule.criticalPaths[0]?.activityIds.join('→')}</span>
            </p>
          </div>

          {/* Tier 2: Current Working Schedule */}
          <div className="p-5 rounded-xl bg-white border border-border shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-primary">
                Tier 2 &bull; Working Schedule
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-warm text-ink-primary border border-border">
                Active
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-ink-primary">
              {schedule.projectDuration} Workdays
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Path: <span className="font-mono text-critical font-semibold">{schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ')}</span>
            </p>
          </div>

          {/* Tier 3: Staged Simulation Preview */}
          <div className={`p-5 rounded-xl border transition-all shadow-xs ${
            activeSimulation
              ? 'bg-white border-ink-primary'
              : 'bg-white/70 border-border opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Tier 3 &bull; Staged Simulation
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                activeSimulation
                  ? 'bg-ink-primary text-white font-bold'
                  : 'bg-warm text-ink-muted border border-border'
              }`}>
                {activeSimulation ? 'Previewing' : 'No Simulation'}
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-ink-primary">
              {activeSimulation ? `${activeSimulation.schedule.projectDuration} Workdays` : '—'}
            </div>
            <p className="text-xs text-ink-secondary mt-1 truncate">
              {activeSimulation ? (
                <span className="text-ink-primary font-semibold">{activeSimulation.description}</span>
              ) : (
                'Run a scenario below to preview'
              )}
            </p>
          </div>
        </div>

        {/* Main Simulation Workbench */}
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-8 shadow-xs">
          {/* Preset Scenarios Buttons */}
          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-3">
              One-Click Benchmark Scenarios
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => runPreset('C', 4)}
                className="p-3.5 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                  <span>Absorb Float (C = 4d)</span>
                  <span className="text-success text-[11px]">0d Delay</span>
                </div>
                <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                  Activity C absorbs its 1d float. Overall duration stays 18d, but creates 2 critical paths!
                </p>
              </button>

              <button
                onClick={() => runPreset('C', 5)}
                className="p-3.5 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                  <span>Breach Float (C = 5d)</span>
                  <span className="text-critical text-[11px]">+1d Delay</span>
                </div>
                <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                  Activity C exceeds buffer by 1 day. Path A-C-D-E-F becomes the new Critical Path (19d).
                </p>
              </button>

              <button
                onClick={() => runPreset('B', 6)}
                className="p-3.5 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                  <span>Critical Delay (B = 6d)</span>
                  <span className="text-critical text-[11px]">+2d Delay</span>
                </div>
                <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                  Delaying critical task System Design (B) slips the entire delivery date from 18 to 20 days.
                </p>
              </button>

              <button
                onClick={() => runPreset('D', 8)}
                className="p-3.5 rounded-lg border border-border bg-warm hover:bg-surface-secondary text-left transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                  <span>Complex Build (D = 8d)</span>
                  <span className="text-critical text-[11px]">+2d Delay</span>
                </div>
                <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                  Development (D) expands to 8 days, pushing completion from Day 18 to Day 20.
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Custom Sliders */}
          <div className="p-5 bg-warm rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Custom Parameter Simulation
                </span>
                <h4 className="text-base font-bold text-ink-primary mt-0.5">
                  Simulate Duration Changes on Target Activity
                </h4>
              </div>

              {/* Target Activity Selector */}
              <div className="flex items-center space-x-1.5">
                {activities.map(act => (
                  <button
                    key={act.id}
                    onClick={() => {
                      setSimTargetId(act.id);
                      setTargetDuration(act.duration);
                      setSelectedActivityId(act.id);
                    }}
                    className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all ${
                      simTargetId === act.id
                        ? 'bg-ink-primary text-white shadow-xs'
                        : 'bg-white text-ink-primary border border-border hover:bg-warm'
                    }`}
                  >
                    {act.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-ink-primary mb-2">
                  <span>
                    Activity {simTargetId} ({activeTargetAct?.name}) Duration:
                  </span>
                  <span className="font-mono text-sm font-bold bg-white px-2.5 py-0.5 rounded border border-border">
                    {targetDuration} workdays
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={targetDuration}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setTargetDuration(val);
                    runDurationSimulation(simTargetId, val);
                  }}
                  className="w-full accent-brand cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-1">
                  <span>1 day (Crash)</span>
                  <span>Baseline: {activeTargetAct?.duration}d</span>
                  <span>12 days (Worst-case)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-ink-primary mb-2">
                  <span>Quick Slippage Delay (+Days):</span>
                  <span className="font-mono text-sm font-bold bg-white px-2.5 py-0.5 rounded border border-border">
                    +{delayDays}d
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4].map(d => (
                    <button
                      key={d}
                      onClick={() => {
                        setDelayDays(d);
                        runDelaySimulation(simTargetId, d);
                      }}
                      className="flex-1 py-1.5 rounded bg-white hover:bg-surface-secondary border border-border text-xs font-semibold text-ink-primary transition-colors"
                    >
                      +{d} Day{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Diagnostic Impact Card */}
          {activeSimulation && (
            <div className="mt-6 p-5 rounded-lg bg-warm border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-brand" />
                  <div>
                    <h5 className="text-sm font-bold text-ink-primary">
                      Simulation Impact: {activeSimulation.description}
                    </h5>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      {activeSimulation.comparison.explanation}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Apply or Discard */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={discardActiveSimulation}
                    className="px-3 py-2 sm:py-1.5 rounded-md text-xs font-semibold bg-white border border-border hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors flex items-center justify-center space-x-1 min-h-[44px] sm:min-h-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>

                  <button
                    onClick={applyActiveSimulation}
                    className="px-4 py-2 sm:py-1.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs flex items-center justify-center space-x-1 min-h-[44px] sm:min-h-0"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Commit to Schedule</span>
                  </button>
                </div>
              </div>

              {/* Impact Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 bg-white rounded border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">
                    Project Duration Delta
                  </span>
                  <span className={`font-mono font-bold text-sm ${
                    activeSimulation.comparison.projectDurationDelta > 0 ? 'text-critical' : 'text-success'
                  }`}>
                    {activeSimulation.comparison.projectDurationDelta > 0
                      ? `+${activeSimulation.comparison.projectDurationDelta} workdays`
                      : activeSimulation.comparison.projectDurationDelta < 0
                      ? `${activeSimulation.comparison.projectDurationDelta} workdays`
                      : '0 workdays (Absorbed)'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">
                    Critical Path Shift
                  </span>
                  <span className="font-semibold text-xs text-ink-primary">
                    {activeSimulation.comparison.criticalPathsChanged ? 'Yes (Path altered)' : 'No (Path unchanged)'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">
                    Affected Activities
                  </span>
                  <span className="font-mono font-semibold text-xs text-ink-primary">
                    {activeSimulation.comparison.affectedActivityIds.length} tasks impacted
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-border shadow-xs">
                  <span className="text-[10px] text-ink-muted uppercase font-bold block">
                    Baseline Drift
                  </span>
                  <span className="font-semibold text-xs text-ink-secondary">
                    {isModified ? 'Already modified' : 'From pure baseline'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
