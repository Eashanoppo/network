import React, { useState, useMemo, useEffect } from 'react';
import { calculatePert, PertInputs } from '../../../engine/pertEngine';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { ScheduleViewModeBanner } from '../../common/ScheduleViewModeBanner';
import {
  Clock,
  Sparkles,
  Calculator,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Send,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  Check,
  X,
} from 'lucide-react';

export const PertEstimator: React.FC = () => {
  const {
    activeProject,
    currentActivities,
    updateActivityDuration,
    runPertSimulation,
    selectedActivityId,
    setSelectedActivityId,
    activeSimulation,
    applyActiveSimulation,
    discardActiveSimulation,
    schedule,
    currentSchedule,
    previewSchedule,
    viewMode,
  } = useSchedule();

  const currentTargetId =
    selectedActivityId && currentActivities.some(a => a.id === selectedActivityId)
      ? selectedActivityId
      : currentActivities[0]?.id || 'D';

  const activeAct = currentActivities.find(a => a.id === currentTargetId) || currentActivities[0];

  const [inputs, setInputs] = useState<PertInputs>({
    optimistic: Math.max(1, (activeAct?.duration ?? 6) - 2),
    mostLikely: activeAct?.duration ?? 6,
    pessimistic: (activeAct?.duration ?? 6) + 4,
  });

  const [calculationOnlyNotice, setCalculationOnlyNotice] = useState<boolean>(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Sync inputs when active activity changes
  useEffect(() => {
    if (activeAct) {
      if (activeAct.pert) {
        setInputs({
          optimistic: activeAct.pert.optimistic,
          mostLikely: activeAct.pert.mostLikely,
          pessimistic: activeAct.pert.pessimistic,
        });
      } else {
        setInputs({
          optimistic: Math.max(1, activeAct.duration - 2),
          mostLikely: activeAct.duration,
          pessimistic: activeAct.duration + 4,
        });
      }
      setCalculationOnlyNotice(false);
      setAppliedNotice(null);
    }
  }, [currentTargetId, activeAct?.id]);

  const chapter8 = CHAPTERS_DATA[7];

  // Validation: O <= M <= P and O > 0
  const validationError = useMemo(() => {
    if (inputs.optimistic <= 0 || inputs.mostLikely <= 0 || inputs.pessimistic <= 0) {
      return 'Durations must be positive numbers greater than 0.';
    }
    if (inputs.optimistic > inputs.mostLikely) {
      return `Optimistic estimate (${inputs.optimistic}d) cannot exceed Most Likely estimate (${inputs.mostLikely}d).`;
    }
    if (inputs.mostLikely > inputs.pessimistic) {
      return `Most Likely estimate (${inputs.mostLikely}d) cannot exceed Pessimistic estimate (${inputs.pessimistic}d).`;
    }
    return null;
  }, [inputs]);

  const isValid = !validationError;

  // Safe PERT calculation
  const result = useMemo(() => {
    if (!isValid) {
      // Fallback safe calculation
      return {
        expectedDuration: inputs.mostLikely,
        variance: 0,
        standardDeviation: 0,
        confidence68: [inputs.mostLikely, inputs.mostLikely] as [number, number],
        confidence95: [inputs.mostLikely, inputs.mostLikely] as [number, number],
        confidence99: [inputs.mostLikely, inputs.mostLikely] as [number, number],
      };
    }
    const res = calculatePert(inputs);
    const te = res.expectedDuration;
    const sigma = res.standardDeviation;
    return {
      ...res,
      confidence99: [
        Math.max(0, Math.round((te - 3 * sigma) * 10) / 10),
        Math.round((te + 3 * sigma) * 10) / 10,
      ] as [number, number],
    };
  }, [inputs, isValid]);

  const updateInput = (key: keyof PertInputs, val: number) => {
    const rounded = Math.max(0, Math.round(val));
    setInputs(prev => ({ ...prev, [key]: rounded }));
    setAppliedNotice(null);
    setCalculationOnlyNotice(false);
  };

  // Action 1: Calculate Only (stat calculations without changing schedule)
  const handleCalculateOnly = () => {
    setCalculationOnlyNotice(true);
    setAppliedNotice(null);
  };

  // Action 2: Preview in Schedule (unified simulation preview mode)
  const handlePreviewInSchedule = () => {
    if (!activeAct || !isValid) return;
    runPertSimulation(activeAct.id, inputs.optimistic, inputs.mostLikely, inputs.pessimistic);
    setCalculationOnlyNotice(false);
    setAppliedNotice(null);
  };

  // Action 3: Apply to Working Schedule
  const handleApplyToSchedule = () => {
    if (!activeAct || !isValid) return;
    const rounded = Math.max(1, Math.round(result.expectedDuration));
    updateActivityDuration(activeAct.id, rounded);
    setAppliedNotice(
      `Applied ${rounded} workdays to Activity ${activeAct.id} (${activeAct.name}) in ${activeProject.name}! Working schedule recalculated.`
    );
    setCalculationOnlyNotice(false);
  };

  const resetPert = () => {
    if (!activeAct) return;
    setInputs({
      optimistic: Math.max(1, activeAct.duration - 2),
      mostLikely: activeAct.duration,
      pessimistic: activeAct.duration + 4,
    });
    setAppliedNotice(null);
    setCalculationOnlyNotice(false);
  };

  return (
    <section id="chapter-08" className="w-full bg-white py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter8}
          tagline="Probabilistic Three-Point Estimating &amp; Beta Weighting"
        />

        <PresenterNotes
          member="Member 5 (Speaker 5)"
          timeAllocation="3 minutes"
          keyTakeaway="When durations are uncertain, single-point estimates introduce severe project risk. PERT uses beta weighting to incorporate optimistic and pessimistic variance."
          talkingPoints={[
            'Explain why single-point estimates fail in complex IT projects (developer optimism vs catastrophic bugs).',
            'Introduce the three estimates: Optimistic (best-case), Most Likely (realistic mode), Pessimistic (worst-case).',
            'Explain the beta distribution weighting: (O + 4M + P) / 6.',
            'Demonstrate the "Apply to Activity" action: update Development (D) and observe the ripple effect in CPM.',
          ]}
          audiencePrompt="Why does PERT give the Most Likely estimate four times the weight of the Optimistic or Pessimistic estimates?"
        />

        {/* Unified View Mode Banner */}
        <ScheduleViewModeBanner className="mb-6" />

        {/* Main Studio Card */}
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Interactive Risk Studio
                </span>
                <span className="text-xs text-ink-muted">&bull; Three-Point Beta Distribution</span>
              </div>
              <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                PERT Three-Point Estimation Studio
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Select an activity from <strong>{activeProject.name}</strong>, adjust O, M, P, calculate statistics, preview what-if impacts, or apply.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Activity Picker */}
              <div className="flex items-center space-x-2 bg-warm px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">
                <span className="text-ink-secondary">Target Task:</span>
                <select
                  value={currentTargetId}
                  onChange={e => {
                    setSelectedActivityId(e.target.value);
                  }}
                  className="bg-white text-ink-primary font-bold rounded px-2 py-0.5 border border-border focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  {currentActivities.map(act => (
                    <option key={act.id} value={act.id}>
                      {act.id}: {act.name} ({act.duration}d)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetPert}
                className="p-1.5 rounded-md border border-border hover:bg-warm text-ink-secondary"
                title="Reset slider defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Validation Alert Banner */}
          {validationError && (
            <div className="mt-5 p-3.5 rounded-lg bg-critical-light border border-critical text-xs font-medium text-critical flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Invalid PERT Estimates:</strong> {validationError} (Constraint: 0 &lt; O &le; M &le; P)
              </span>
            </div>
          )}

          {/* Sliders: Optimistic, Most Likely, Pessimistic with Direct Numeric Entry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {/* Optimistic */}
            <div className={`p-5 rounded-lg border transition-colors ${inputs.optimistic > inputs.mostLikely ? 'bg-critical-light border-critical' : 'bg-warm border-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                  Optimistic (O)
                </span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={inputs.optimistic}
                    onChange={e => updateInput('optimistic', Number(e.target.value))}
                    className="w-14 font-mono font-bold text-xs text-ink-primary bg-white px-2 py-0.5 rounded border border-border text-center focus:ring-1 focus:ring-brand"
                  />
                  <span className="text-xs text-ink-muted">days</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(30, inputs.pessimistic)}
                value={inputs.optimistic}
                onChange={e => updateInput('optimistic', Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
              <p className="mt-2 text-[11px] text-ink-secondary leading-tight">
                Best-case scenario: zero unforeseen obstacles, maximum velocity (weight: 1/6).
              </p>
            </div>

            {/* Most Likely */}
            <div className={`p-5 rounded-lg border transition-colors ${inputs.mostLikely < inputs.optimistic || inputs.mostLikely > inputs.pessimistic ? 'bg-critical-light border-critical' : 'bg-warm border-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                  Most Likely (M) &bull; 4× Weight
                </span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={inputs.mostLikely}
                    onChange={e => updateInput('mostLikely', Number(e.target.value))}
                    className="w-14 font-mono font-bold text-xs text-ink-primary bg-white px-2 py-0.5 rounded border border-border text-center focus:ring-1 focus:ring-brand"
                  />
                  <span className="text-xs text-ink-secondary font-semibold">days</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(30, inputs.pessimistic)}
                value={inputs.mostLikely}
                onChange={e => updateInput('mostLikely', Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
              <p className="mt-2 text-[11px] text-ink-secondary leading-tight">
                Realistic modal estimate based on standard engineering capacity (weight: 4/6 or 66.7%).
              </p>
            </div>

            {/* Pessimistic */}
            <div className={`p-5 rounded-lg border transition-colors ${inputs.pessimistic < inputs.mostLikely ? 'bg-critical-light border-critical' : 'bg-warm border-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                  Pessimistic (P)
                </span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={inputs.pessimistic}
                    onChange={e => updateInput('pessimistic', Number(e.target.value))}
                    className="w-14 font-mono font-bold text-xs text-critical bg-white px-2 py-0.5 rounded border border-border text-center focus:ring-1 focus:ring-brand"
                  />
                  <span className="text-xs text-ink-muted">days</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(30, inputs.pessimistic + 5)}
                value={inputs.pessimistic}
                onChange={e => updateInput('pessimistic', Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
              <p className="mt-2 text-[11px] text-ink-secondary leading-tight">
                Worst-case catastrophe: unexpected technical blockers, rework (weight: 1/6).
              </p>
            </div>
          </div>

          {/* Math Calculation & Separated Action Controls */}
          <div className="p-6 rounded-lg bg-warm border border-border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Weighted Beta Formula &amp; Live Substitution
                </span>
                <div className="mt-1 font-mono text-sm sm:text-base font-bold text-ink-primary">
                  PERT Expected = (O + 4M + P) / 6 = ({inputs.optimistic} + 4({inputs.mostLikely}) + {inputs.pessimistic}) / 6
                </div>
                <div className="mt-0.5 font-mono text-xs text-ink-secondary font-semibold">
                  = ({inputs.optimistic} + {4 * inputs.mostLikely} + {inputs.pessimistic}) / 6 = {inputs.optimistic + 4 * inputs.mostLikely + inputs.pessimistic} / 6 = {result.expectedDuration} workdays
                </div>
              </div>

              {/* Action Buttons: Calculate Only vs Preview vs Apply */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="bg-white p-3 rounded-lg border border-border text-right shadow-xs mr-2">
                  <span className="text-[9px] uppercase font-bold text-ink-muted block">Expected (TE)</span>
                  <span className="font-mono text-xl font-bold text-ink-primary">
                    {result.expectedDuration} Days
                  </span>
                </div>

                {/* 1. Calculate Only Button */}
                <button
                  onClick={handleCalculateOnly}
                  disabled={!isValid}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-border hover:bg-surface-secondary text-ink-primary disabled:opacity-40 transition-colors shadow-xs flex items-center space-x-1.5"
                  title="Recalculate statistical metrics only without altering schedule"
                >
                  <Calculator className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Calculate Only</span>
                </button>

                {/* 2. Preview in Schedule (Unified Preview Mode) */}
                <button
                  onClick={handlePreviewInSchedule}
                  disabled={!isValid}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-colors shadow-xs flex items-center space-x-1.5"
                  title="Simulate schedule impact in Preview Mode without committing changes"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preview in Schedule</span>
                </button>

                {/* 3. Apply to Working Schedule */}
                <button
                  onClick={handleApplyToSchedule}
                  disabled={!isValid}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover disabled:opacity-40 transition-colors shadow-xs flex items-center space-x-1.5"
                  title="Commit expected duration directly to working schedule"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply to Activity {activeAct?.id}</span>
                </button>
              </div>
            </div>

            {/* Notification Feedback Banners */}
            {calculationOnlyNotice && (
              <div className="mt-4 p-3 rounded-md bg-white border border-border text-xs font-medium text-ink-primary flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                <span>
                  Calculated statistics for Activity {activeAct?.id}: Expected TE = {result.expectedDuration}d, Std Dev &sigma; = {result.standardDeviation}d. (Working schedule untouched).
                </span>
              </div>
            )}

            {appliedNotice && (
              <div className="mt-4 p-3 rounded-md bg-success-light border border-success-border text-xs font-medium text-success flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{appliedNotice}</span>
              </div>
            )}

            {/* 4 Statistical Metrics Cards with KaTeX Math Symbols */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 text-xs">
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Std Deviation (&sigma;)</span>
                <span className="font-mono font-bold text-ink-primary text-sm">{result.standardDeviation}d</span>
                <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">(P - O) / 6</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Variance (&sigma;&sup2;)</span>
                <span className="font-mono font-bold text-ink-primary text-sm">{result.variance}</span>
                <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">[(P - O) / 6]&sup2;</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">68% Confidence</span>
                <span className="font-mono font-bold text-ink-primary text-sm">{result.confidence68[0]}–{result.confidence68[1]}d</span>
                <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">TE &plusmn; 1&sigma;</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">95% Confidence</span>
                <span className="font-mono font-bold text-ink-primary text-sm">{result.confidence95[0]}–{result.confidence95[1]}d</span>
                <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">TE &plusmn; 2&sigma;</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">99.7% Confidence</span>
                <span className="font-mono font-bold text-ink-primary text-sm">{result.confidence99[0]}–{result.confidence99[1]}d</span>
                <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">TE &plusmn; 3&sigma;</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border text-xs text-ink-secondary leading-relaxed">
              <strong className="text-ink-primary">Academic Beta Rationale:</strong> PERT addresses the natural human tendency toward optimistic underestimation. Weighting Most Likely by 4 creates a smooth unimodal Beta distribution. Standard deviation $\sigma = (P - O) / 6$ and variance $\sigma^2$ allow project managers to quantify schedule confidence levels.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
