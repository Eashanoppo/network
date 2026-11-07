import React, { useState, useMemo } from 'react';
import { calculatePert, PertInputs } from '../../../engine/pertEngine';
import { SectionHeader } from '../../common/SectionHeader';
import {
  Clock,
  Sparkles,
  Calculator,
  Sliders,
  TrendingUp,
  Info,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const PertEstimator: React.FC = () => {
  const [inputs, setInputs] = useState<PertInputs>({
    optimistic: 3,
    mostLikely: 6,
    pessimistic: 15,
  });

  const result = useMemo(() => calculatePert(inputs), [inputs]);

  const updateInput = (key: keyof PertInputs, val: number) => {
    const clamped = Math.max(1, Math.min(30, val));
    setInputs(prev => {
      const next = { ...prev, [key]: clamped };
      // Keep O <= M <= P
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
  };

  const resetPert = () => {
    setInputs({ optimistic: 3, mostLikely: 6, pessimistic: 15 });
  };

  return (
    <section id="module-06" className="py-12 border-b border-border scroll-mt-20">
      <SectionHeader
        moduleNumber="Supporting Module"
        member="Academic Extension"
        title="Program Evaluation and Review Technique (PERT) Estimator"
        subtitle="When activity durations are uncertain, project managers use PERT three-point estimation. Explore the weighted beta-distribution formula and discover why the Most Likely estimate receives four times the weight."
        tagline="Probabilistic Three-Point Estimation"
      />

      {/* Main PERT Studio Card */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Interactive Component
              </span>
              <span className="text-xs text-ink-muted">&bull; Beta Distribution Weighting</span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary">
              Three-Point Estimating Studio (O, M, P)
            </h3>
            <p className="text-xs text-ink-secondary">
              Adjust the Optimistic, Most Likely, and Pessimistic sliders to compute the weighted expected duration and variance.
            </p>
          </div>

          <button
            onClick={resetPert}
            className="self-start sm:self-center px-3 py-1.5 rounded-md text-xs font-medium bg-canvas border border-border hover:bg-white text-ink-secondary hover:text-ink-primary transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* 3 Input Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* Optimistic */}
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-primary">Optimistic (O)</span>
              <span className="font-mono font-bold text-sm text-brand bg-white px-2 py-0.5 rounded border border-border">
                {inputs.optimistic} days
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={inputs.optimistic}
              onChange={e => updateInput('optimistic', Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <p className="mt-2 text-[11px] text-ink-muted leading-tight">
              Best-case scenario assuming everything proceeds flawlessly with zero unforeseen obstacles (weight: 1/6).
            </p>
          </div>

          {/* Most Likely */}
          <div className="p-4 rounded-xl bg-brand-light/30 border border-brand-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand">Most Likely (M) &bull; 4× Weight</span>
              <span className="font-mono font-bold text-sm text-brand bg-white px-2 py-0.5 rounded border border-brand-border">
                {inputs.mostLikely} days
              </span>
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
              The realistic mode based on standard team velocity and historical precedent (weight: 4/6 or 66.7%).
            </p>
          </div>

          {/* Pessimistic */}
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-primary">Pessimistic (P)</span>
              <span className="font-mono font-bold text-sm text-critical bg-white px-2 py-0.5 rounded border border-border">
                {inputs.pessimistic} days
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={inputs.pessimistic}
              onChange={e => updateInput('pessimistic', Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <p className="mt-2 text-[11px] text-ink-muted leading-tight">
              Worst-case catastrophic scenario with multiple cascading blockers (weight: 1/6).
            </p>
          </div>
        </div>

        {/* Weighted Math Display & Results */}
        <div className="p-5 rounded-xl bg-canvas border border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Weighted Formula Breakdown
              </span>
              <div className="mt-1 font-mono text-sm sm:text-base font-bold text-ink-primary">
                PERT = (O + 4M + P) / 6 = ({inputs.optimistic} + 4({inputs.mostLikely}) + {inputs.pessimistic}) / 6
              </div>
              <div className="mt-0.5 font-mono text-xs text-brand">
                = ({inputs.optimistic} + {4 * inputs.mostLikely} + {inputs.pessimistic}) / 6 = {inputs.optimistic + 4 * inputs.mostLikely + inputs.pessimistic} / 6
              </div>
            </div>

            <div className="text-left lg:text-right shrink-0 bg-white p-3 rounded-xl border border-border">
              <span className="text-[10px] uppercase font-bold text-ink-muted block">Expected Duration (TE)</span>
              <span className="font-mono text-2xl font-extrabold text-brand">
                {result.expectedDuration} Workdays
              </span>
            </div>
          </div>

          {/* Statistical Spread Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] uppercase text-ink-muted block">Std Deviation (&sigma;)</span>
              <span className="font-mono font-bold text-ink-primary text-sm">{result.standardDeviation}d</span>
              <span className="text-[10px] text-ink-muted block mt-0.5">(P - O) / 6</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] uppercase text-ink-muted block">Variance (&sigma;&sup2;)</span>
              <span className="font-mono font-bold text-ink-primary text-sm">{result.variance}</span>
              <span className="text-[10px] text-ink-muted block mt-0.5">[(P - O) / 6]&sup2;</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] uppercase text-ink-muted block">68% Confidence</span>
              <span className="font-mono font-bold text-brand text-sm">{result.confidence68[0]}–{result.confidence68[1]}d</span>
              <span className="text-[10px] text-ink-muted block mt-0.5">TE &plusmn; 1&sigma;</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] uppercase text-ink-muted block">95% Confidence</span>
              <span className="font-mono font-bold text-ink-primary text-sm">{result.confidence95[0]}–{result.confidence95[1]}d</span>
              <span className="text-[10px] text-ink-muted block mt-0.5">TE &plusmn; 2&sigma;</span>
            </div>
          </div>

          {/* Why Most Likely Gets 4x Weight Explanation */}
          <div className="mt-4 pt-3 border-t border-border text-xs text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary">Why does the Most Likely (M) estimate receive 4× weight?</strong>{' '}
            Traditional PERT was developed by the U.S. Navy for the Polaris missile program. It approximates a continuous unimodal <em>Beta Probability Distribution</em>. Unlike a simple triangular average $(O+M+P)/3$, the beta weighting places 66.7% ($4/6$) of the statistical confidence around the modal estimate while allowing asymmetric tails for optimistic breakthroughs and pessimistic catastrophes.
          </div>
        </div>
      </div>
    </section>
  );
};

