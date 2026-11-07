import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { SectionHeader } from '../../common/SectionHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { LiveDelayAlert } from '../../common/LiveDelayAlert';
import {
  Clock,
  ArrowRight,
  Sliders,
  RotateCcw,
  Sparkles,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react';

export const CpmCalculationStudio: React.FC = () => {
  const {
    schedule,
    selectedActivityId,
    setSelectedActivityId,
    updateActivityDuration,
    resetToBaseline,
    isModified,
    delayImpact,
  } = useSchedule();

  const [activeFormulaInspect, setActiveFormulaInspect] = useState<{
    activityId: string;
    field: 'es' | 'ef' | 'ls' | 'lf' | 'float';
  }>({
    activityId: 'C',
    field: 'float',
  });

  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

  // Formula generator based on selected cell
  const getFormulaExplanation = (activityId: string, field: 'es' | 'ef' | 'ls' | 'lf' | 'float') => {
    const act = schedule.activities[activityId];
    if (!act) return null;

    if (field === 'es') {
      if (act.predecessors.length === 0) {
        return {
          title: `Earliest Start for ${act.id}`,
          formula: `ES = 1 (No predecessors)`,
          explanation: `Since ${act.id} has no predecessors, it can begin immediately on the project's very first workday morning (Day 1).`,
        };
      }
      const predEfs = act.predecessors.map(p => `${p}(EF=${schedule.activities[p]?.ef})`);
      const maxEf = Math.max(...act.predecessors.map(p => schedule.activities[p]?.ef || 0));
      return {
        title: `Earliest Start for ${act.id}`,
        formula: `ES = max(Predecessor EFs) + 1 = max(${predEfs.join(', ')}) + 1 = ${maxEf} + 1 = Day ${act.es}`,
        explanation: `${act.id} cannot start until all its prerequisite predecessors finish. Its latest-finishing predecessor finishes on Day ${maxEf}, so ${act.id} starts on Day ${act.es}.`,
      };
    }

    if (field === 'ef') {
      return {
        title: `Earliest Finish for ${act.id}`,
        formula: `EF = ES + Duration - 1 = ${act.es} + ${act.duration} - 1 = Day ${act.ef}`,
        explanation: `Under inclusive workday numbering, working ${act.duration} continuous workdays starting on Day ${act.es} concludes at the end of Day ${act.ef}.`,
      };
    }

    if (field === 'lf') {
      if (act.successors.length === 0) {
        return {
          title: `Latest Finish for ${act.id}`,
          formula: `LF = Project Duration = Day ${act.lf}`,
          explanation: `Since ${act.id} is a terminal task with no successors, its latest permissible completion date without delaying the project is the project deadline (Day ${schedule.projectDuration}).`,
        };
      }
      const succLss = act.successors.map(s => `${s}(LS=${schedule.activities[s]?.ls})`);
      const minLs = Math.min(...act.successors.map(s => schedule.activities[s]?.ls || 0));
      return {
        title: `Latest Finish for ${act.id}`,
        formula: `LF = min(Successor LSs) - 1 = min(${succLss.join(', ')}) - 1 = ${minLs} - 1 = Day ${act.lf}`,
        explanation: `${act.id} must conclude prior to the earliest required start date of any downstream successor task. The earliest successor Late Start is Day ${minLs}.`,
      };
    }

    if (field === 'ls') {
      return {
        title: `Latest Start for ${act.id}`,
        formula: `LS = LF - Duration + 1 = ${act.lf} - ${act.duration} + 1 = Day ${act.ls}`,
        explanation: `To finish by its latest deadline of Day ${act.lf}, an activity taking ${act.duration} workdays must begin no later than Day ${act.ls}.`,
      };
    }

    if (field === 'float') {
      return {
        title: `Total Float for ${act.id}`,
        formula: `Total Float = LS - ES = ${act.ls} - ${act.es} = ${act.totalFloat} day${act.totalFloat !== 1 ? 's' : ''} (also LF - EF = ${act.lf} - ${act.ef} = ${act.totalFloat})`,
        explanation: act.totalFloat === 0
          ? `${act.id} has ZERO float, making it a CRITICAL ACTIVITY. Any delay in this task will directly delay the entire project completion date!`
          : `${act.id} has ${act.totalFloat} day(s) of buffer (slack). It can be delayed by up to ${act.totalFloat} day(s) without extending the overall project duration.`,
      };
    }

    return null;
  };

  const inspectedFormula = getFormulaExplanation(
    activeFormulaInspect.activityId,
    activeFormulaInspect.field
  );

  return (
    <section id="module-04" className="py-12 border-b border-border scroll-mt-20">
      <SectionHeader
        moduleNumber="Module 04"
        member="Member 4"
        title="Critical Path Method (CPM) &amp; Calculation Studio"
        subtitle="The Critical Path is the longest path of dependent activities that dictates the earliest possible project completion. Explore the forward and backward passes, inspect mathematical formulas, and simulate real-time schedule delays."
        tagline="Mathematical Engine &amp; Slack Analysis"
      />

      <PresenterNotes
        member="Member 4 (Speaker 4)"
        timeAllocation="4–5 minutes"
        keyTakeaway="CPM removes guesswork. The forward pass computes earliest dates, the backward pass computes latest dates, and their difference reveals Float (Slack)."
        talkingPoints={[
          'Explain the forward pass: start at Day 1, compute ES and EF: EF = ES + Duration - 1.',
          'Explain the backward pass: start at project end, compute LF and LS: LS = LF - Duration + 1.',
          'Define Total Float (LS - ES) vs Free Float (slack without delaying successors).',
          'Demonstrate the Live Delay Simulator: Move Activity C from 3 to 4 days. Highlight that 1 day of float absorbed keeps duration at 18 days, but creates TWO critical paths!',
          'Move Activity C to 5 days. Watch duration jump to 19 days. Explain why non-critical tasks become critical once float is exhausted.',
        ]}
        audiencePrompt="What happens to the critical path if an activity WITH float gets delayed by less than its float?"
      />

      <LiveDelayAlert />

      {/* Core Formulas Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-border shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand mb-1">
            Forward Pass (Early Dates)
          </div>
          <div className="font-mono text-sm font-bold text-ink-primary my-1">
            EF = ES + Duration - 1
          </div>
          <p className="text-[11px] text-ink-secondary leading-snug">
            Successor ES = max(Predecessor EFs) + 1
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Backward Pass (Late Dates)
          </div>
          <div className="font-mono text-sm font-bold text-ink-primary my-1">
            LS = LF - Duration + 1
          </div>
          <p className="text-[11px] text-ink-secondary leading-snug">
            Predecessor LF = min(Successor LSs) - 1
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-success mb-1">
            Total Float (Total Slack)
          </div>
          <div className="font-mono text-sm font-bold text-ink-primary my-1">
            TF = LS - ES = LF - EF
          </div>
          <p className="text-[11px] text-ink-secondary leading-snug">
            Time an activity can slip without delaying project finish.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-critical mb-1">
            Critical Path Rule
          </div>
          <div className="font-mono text-sm font-bold text-critical my-1">
            Total Float = 0
          </div>
          <p className="text-[11px] text-ink-secondary leading-snug">
            Activities on the longest path have zero schedule slack.
          </p>
        </div>
      </div>

      {/* Main CPM Calculation Studio Table */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Interactive Component
            </span>
            <h3 className="text-lg font-bold text-ink-primary">
              CPM Dynamic Calculation Schedule Table
            </h3>
            <p className="text-xs text-ink-secondary">
              Click any value cell (ES, EF, LS, LF, Float) to inspect the exact underlying mathematical derivation.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-ink-muted">Project Duration:</span>
            <span className="font-mono font-bold text-sm text-ink-primary bg-canvas px-2.5 py-1 rounded border border-border">
              {schedule.projectDuration} Workdays
            </span>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-canvas/80 font-semibold text-ink-secondary uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Activity Description</th>
                <th className="py-2.5 px-3 text-center">Duration</th>
                <th className="py-2.5 px-3">Predecessors</th>
                <th className="py-2.5 px-3 text-center bg-brand-light/30">ES</th>
                <th className="py-2.5 px-3 text-center bg-brand-light/30">EF</th>
                <th className="py-2.5 px-3 text-center bg-canvas">LS</th>
                <th className="py-2.5 px-3 text-center bg-canvas">LF</th>
                <th className="py-2.5 px-3 text-center">Total Float</th>
                <th className="py-2.5 px-3 text-center">Free Float</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {schedule.activityList.map(act => {
                const isSelected = selectedActivityId === act.id;
                return (
                  <tr
                    key={act.id}
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-light/40 font-semibold'
                        : act.isCritical
                        ? 'hover:bg-critical-light/20'
                        : 'hover:bg-canvas'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-3 font-bold text-ink-primary">
                      <span className="w-6 h-6 rounded bg-canvas border border-border inline-flex items-center justify-center font-bold">
                        {act.id}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3 font-sans font-medium text-ink-primary text-xs">
                      {act.name}
                    </td>

                    {/* Duration with quick adjuster */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            updateActivityDuration(act.id, act.duration - 1);
                          }}
                          disabled={act.duration <= 1}
                          className="w-5 h-5 rounded bg-canvas hover:bg-border text-ink-primary text-[10px] flex items-center justify-center disabled:opacity-30"
                          title="Decrease duration"
                        >
                          -
                        </button>
                        <span className="font-bold w-6 text-center">{act.duration}d</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            updateActivityDuration(act.id, act.duration + 1);
                          }}
                          className="w-5 h-5 rounded bg-canvas hover:bg-border text-ink-primary text-[10px] flex items-center justify-center"
                          title="Increase duration"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Predecessors */}
                    <td className="py-3 px-3 text-ink-secondary text-xs">
                      {act.predecessors.length > 0 ? act.predecessors.join(', ') : '—'}
                    </td>

                    {/* ES */}
                    <td
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFormulaInspect({ activityId: act.id, field: 'es' });
                      }}
                      className={`py-3 px-3 text-center text-brand font-bold cursor-help hover:underline ${
                        activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'es'
                          ? 'ring-2 ring-brand/40 bg-white rounded'
                          : ''
                      }`}
                      title="Click to inspect Earliest Start formula"
                    >
                      {act.es}
                    </td>

                    {/* EF */}
                    <td
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFormulaInspect({ activityId: act.id, field: 'ef' });
                      }}
                      className={`py-3 px-3 text-center text-brand font-bold cursor-help hover:underline ${
                        activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'ef'
                          ? 'ring-2 ring-brand/40 bg-white rounded'
                          : ''
                      }`}
                      title="Click to inspect Earliest Finish formula"
                    >
                      {act.ef}
                    </td>

                    {/* LS */}
                    <td
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFormulaInspect({ activityId: act.id, field: 'ls' });
                      }}
                      className={`py-3 px-3 text-center text-ink-secondary cursor-help hover:underline ${
                        activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'ls'
                          ? 'ring-2 ring-brand/40 bg-white rounded'
                          : ''
                      }`}
                      title="Click to inspect Latest Start formula"
                    >
                      {act.ls}
                    </td>

                    {/* LF */}
                    <td
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFormulaInspect({ activityId: act.id, field: 'lf' });
                      }}
                      className={`py-3 px-3 text-center text-ink-secondary cursor-help hover:underline ${
                        activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'lf'
                          ? 'ring-2 ring-brand/40 bg-white rounded'
                          : ''
                      }`}
                      title="Click to inspect Latest Finish formula"
                    >
                      {act.lf}
                    </td>

                    {/* Total Float */}
                    <td
                      onClick={e => {
                        e.stopPropagation();
                        setActiveFormulaInspect({ activityId: act.id, field: 'float' });
                      }}
                      className={`py-3 px-3 text-center font-bold cursor-help hover:underline ${
                        act.isCritical ? 'text-critical' : 'text-success'
                      } ${
                        activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'float'
                          ? 'ring-2 ring-brand/40 bg-white rounded'
                          : ''
                      }`}
                      title="Click to inspect Total Float calculation"
                    >
                      {act.totalFloat}
                    </td>

                    {/* Free Float */}
                    <td className="py-3 px-3 text-center text-ink-muted">
                      {act.freeFloat}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                          act.isCritical
                            ? 'bg-critical-light text-critical'
                            : 'bg-success-light text-success'
                        }`}
                      >
                        {act.isCritical ? 'Critical' : 'Float Available'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Mathematical Formula Inspector Box */}
        {inspectedFormula && (
          <div className="mt-5 p-4 rounded-xl bg-canvas border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-brand" />
                <span className="text-xs font-bold text-ink-primary font-sans">
                  Formula Derivation Inspector: {inspectedFormula.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-ink-muted">Inclusive Workday Standard</span>
            </div>
            <div className="mt-2 text-xs">
              <div className="p-2.5 bg-white rounded-md border border-border font-mono font-bold text-ink-primary text-xs sm:text-sm">
                {inspectedFormula.formula}
              </div>
              <p className="mt-2 text-ink-secondary text-xs leading-relaxed font-sans">
                {inspectedFormula.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Interactive Delay Simulator */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-critical">
                Advanced Interactive Feature
              </span>
              <span className="text-xs text-ink-muted">&bull; Live Schedule Recalculation Engine</span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary">
              Dynamic Delay &amp; Slack Sensitivity Simulator
            </h3>
            <p className="text-xs text-ink-secondary">
              Simulate schedule variations. Move Activity C (Database Design) to 4 days, then to 5 days, and observe how slack absorbs delays versus creates project breaches.
            </p>
          </div>

          {isModified && (
            <button
              onClick={resetToBaseline}
              className="self-start sm:self-center px-3 py-1.5 rounded-md text-xs font-medium bg-warning-light border border-warning-border text-warning hover:bg-warning/20 transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline (18d)</span>
            </button>
          )}
        </div>

        {/* Preset High-Yield Scenario Quick Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-primary">Test Classic Exam Scenarios:</span>

          <button
            onClick={() => updateActivityDuration('C', 3)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
              schedule.activities['C']?.duration === 3
                ? 'bg-ink-primary text-white font-bold shadow-xs'
                : 'bg-canvas text-ink-secondary hover:text-ink-primary border-border'
            }`}
          >
            Baseline: C = 3d (18d, C float = 1)
          </button>

          <button
            onClick={() => updateActivityDuration('C', 4)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
              schedule.activities['C']?.duration === 4
                ? 'bg-warning text-white font-bold shadow-xs'
                : 'bg-warning-light text-ink-primary border-warning-border hover:bg-warning/10'
            }`}
            title="Absorb C's 1 day of float: duration stays 18d, dual critical paths emerge!"
          >
            Scenario 1: C = 4d (Absorbs Float &rarr; 2 Critical Paths)
          </button>

          <button
            onClick={() => updateActivityDuration('C', 5)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
              schedule.activities['C']?.duration === 5
                ? 'bg-critical text-white font-bold shadow-xs'
                : 'bg-critical-light text-critical border-critical-border hover:bg-critical/10'
            }`}
            title="Exceed float by 1 day: overall duration increases to 19 days!"
          >
            Scenario 2: C = 5d (Exceeds Float &rarr; 19d Duration)
          </button>

          <button
            onClick={() => updateActivityDuration('B', 6)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
              schedule.activities['B']?.duration === 6
                ? 'bg-critical text-white font-bold shadow-xs'
                : 'bg-canvas text-ink-secondary hover:text-ink-primary border-border'
            }`}
            title="Delay critical activity B by 2 days: project duration increases to 20 days!"
          >
            Scenario 3: Delay Critical Task B (+2d)
          </button>
        </div>

        {/* Interactive Sliders for all 6 Activities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {schedule.activityList.map(act => (
            <div
              key={act.id}
              className={`p-3.5 rounded-xl border transition-all ${
                act.isCritical
                  ? 'bg-critical-light/20 border-critical-border'
                  : 'bg-canvas border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded font-mono font-bold text-xs bg-white border border-border flex items-center justify-center">
                    {act.id}
                  </span>
                  <span className="text-xs font-bold text-ink-primary truncate max-w-[130px]">
                    {act.name}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-ink-primary bg-white px-2 py-0.5 rounded border border-border">
                  {act.duration}d
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={1}
                max={12}
                value={act.duration}
                onChange={e => updateActivityDuration(act.id, Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />

              <div className="flex items-center justify-between mt-1 text-[11px] text-ink-muted font-mono">
                <span>Float: {act.totalFloat}d</span>
                <span className={act.isCritical ? 'text-critical font-bold' : 'text-success font-medium'}>
                  {act.isCritical ? 'Zero Slack' : 'Buffer OK'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time simulation feedback explanation */}
        {delayImpact && (
          <div className="p-4 rounded-xl bg-canvas border border-border text-xs">
            <span className="font-bold text-ink-primary block mb-1">
              Simulation Diagnostic Insight:
            </span>
            <p className="text-ink-secondary leading-relaxed">
              {delayImpact.explanation}
            </p>
            <div className="mt-2 text-brand font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>{delayImpact.keyTakeaway}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

