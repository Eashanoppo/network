import React, { useState, useMemo } from 'react';
import { calculatePert, PertInputs } from '../../../engine/pertEngine';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
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
} from 'lucide-react';

export const PertEstimator: React.FC = () => {
  const {
    activities,
    updateActivityDuration,
    selectedActivityId,
    setSelectedActivityId,
  } = useSchedule();

  const currentTargetId = selectedActivityId || 'D';
  const [inputs, setInputs] = useState<PertInputs>({
    optimistic: 4,
    mostLikely: 6,
    pessimistic: 14,
  });
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const chapter8 = CHAPTERS_DATA[7];
  const result = useMemo(() => calculatePert(inputs), [inputs]);
  const activeAct = activities.find(a => a.id === currentTargetId);

  const updateInput = (key: keyof PertInputs, val: number) => {
    const clamped = Math.max(1, Math.min(30, Math.round(val)));
    setInputs(prev => {
      const next = { ...prev, [key]: clamped };
      if (key === 'optimistic' && next.optimistic > next.mostLikely) {
        next.mostLikely = next.optimistic;
      }
      if (key === 'pessimistic' && next.pessimistic < next.mostLikely) {
        next.mostLikely = next.pessimistic;
      }
      if (key === 'mostLikely') {
        if (next.mostLikely < next.optimistic) next.optimistic = next.mostLikely;
        if (next.mostLikely > next.pessimistic) next.pessimistic = next.mostLikely;
      }
      return next;
    });
    setAppliedNotice(null);
  };

  const applyToSchedule = () => {
    if (!activeAct) return;
    const rounded = Math.round(result.expectedDuration);
    updateActivityDuration(activeAct.id, rounded);
    setAppliedNotice(
      `Applied ${rounded} workdays to Activity ${activeAct.id} (${activeAct.name})! Schedule dynamically recalculated.`
    );
  };

  const resetPert = () => {
    setInputs({ optimistic: 4, mostLikely: 6, pessimistic: 14 });
    setAppliedNotice(null);
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

      {/* Main Studio Card */}
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Interactive Component
              </span>
              <span className="text-xs text-ink-muted">&bull; Schedule-Connected Estimator</span>
            </div>
            <h3 className="text-xl font-bold text-ink-primary mt-0.5">
              PERT Three-Point Estimation Studio
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
              Select an activity from the University Management System, adjust O, M, P, and apply the expected duration.
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
                  setAppliedNotice(null);
                }}
                className="bg-white text-ink-primary font-bold rounded px-2 py-0.5 border border-border focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {activities.map(act => (
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

        {/* Sliders: Optimistic, Most Likely, Pessimistic with Direct Numeric Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* Optimistic */}
          <div className="p-5 rounded-lg bg-warm border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                Optimistic (O)
              </span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={inputs.optimistic}
                  onChange={e => updateInput('optimistic', Number(e.target.value))}
                  className="w-12 font-mono font-bold text-xs text-ink-primary bg-white px-2 py-0.5 rounded border border-border text-center"
                />
                <span className="text-xs text-ink-muted">days</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={inputs.optimistic}
              onChange={e => updateInput('optimistic', Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <p className="mt-2 text-[11px] text-ink-secondary leading-tight">
              Best-case scenario: zero unforeseen obstacles, maximum velocity (weight: 1/6).
            </p>
          </div>

          {/* Most Likely */}
          <div className="p-5 rounded-lg bg-warm border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                Most Likely (M) &bull; 4× Weight
              </span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={inputs.mostLikely}
                  onChange={e => updateInput('mostLikely', Number(e.target.value))}
                  className="w-12 font-mono font-bold text-xs text-ink-primary bg-white px-2 py-0.5 rounded border border-border text-center"
                />
                <span className="text-xs text-ink-secondary font-semibold">days</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={inputs.mostLikely}
              onChange={e => updateInput('mostLikely', Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <p className="mt-2 text-[11px] text-ink-secondary leading-tight">
              Realistic modal estimate based on standard engineering capacity (weight: 4/6 or 66.7%).
            </p>
          </div>

          {/* Pessimistic */}
          <div className="p-5 rounded-lg bg-warm border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                Pessimistic (P)
              </span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={inputs.pessimistic}
                  onChange={e => updateInput('pessimistic', Number(e.target.value))}
                  className="w-12 font-mono font-bold text-xs text-critical bg-white px-2 py-0.5 rounded border border-border text-center"
                />
                <span className="text-xs text-ink-muted">days</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={inputs.pessimistic}
              onChange={e => updateInput('pessimistic', Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <p className="mt-2 text-[11px] text-ink-secondary leading-tight">
              Worst-case catastrophe: multiple cascading dependency delays (weight: 1/6).
            </p>
          </div>
        </div>

        {/* Math Calculation & Apply Action */}
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

            <div className="flex items-center space-x-4 shrink-0">
              <div className="bg-white p-3 rounded-lg border border-border text-right shadow-xs">
                <span className="text-[9px] uppercase font-bold text-ink-muted block">Expected (TE)</span>
                <span className="font-mono text-xl font-bold text-ink-primary">
                  {result.expectedDuration} Days
                </span>
              </div>

              <button
                onClick={applyToSchedule}
                className="px-3.5 py-2.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-all flex items-center space-x-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply to Task {currentTargetId}</span>
              </button>
            </div>
          </div>

          {/* Success Banner when Applied */}
          {appliedNotice && (
            <div className="mt-4 p-3 rounded-md bg-success-light border border-success-border text-xs font-medium text-success flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {/* Statistical Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-xs">
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
          </div>

          <div className="mt-4 pt-3 border-t border-border text-xs text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary">Statistical Note:</strong> PERT assumes activity durations approximate a unimodal <em>Beta Probability Distribution</em> with variance $\sigma^2 = ((P - O) / 6)^2$. The project manager applies the expected duration to CPM without affecting the baseline until committed.
          </div>
        </div>
      </div>
    </div>
  </section>
);
};
