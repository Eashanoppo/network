import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { LiveDelayAlert } from '../../common/LiveDelayAlert';
import {
  Clock,
  ArrowRight,
  Sliders,
  RotateCcw,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Layers,
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

  const [activeTab, setActiveTab] = useState<'table' | 'walkthrough'>('table');
  const [walkthroughStep, setWalkthroughStep] = useState<number>(1);

  const [activeFormulaInspect, setActiveFormulaInspect] = useState<{
    activityId: string;
    field: 'es' | 'ef' | 'ls' | 'lf' | 'float';
  }>({
    activityId: 'C',
    field: 'float',
  });

  const chapter6 = CHAPTERS_DATA[5];
  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

  // Formula generator based on selected cell with dynamic live values
  const getFormulaExplanation = (activityId: string, field: 'es' | 'ef' | 'ls' | 'lf' | 'float') => {
    const act = schedule.activities[activityId];
    if (!act) return null;

    if (field === 'es') {
      if (act.predecessors.length === 0) {
        return {
          title: `Earliest Start (ES) for Activity ${act.id}`,
          formula: `ES = 1 (Root activity starting project on morning of Day 1)`,
          explanation: `Since ${act.id} has no predecessors, work begins immediately on the morning of Day 1.`,
        };
      }
      const predEfs = act.predecessors.map(p => `${p}(EF=${schedule.activities[p]?.ef})`);
      const maxEf = Math.max(...act.predecessors.map(p => schedule.activities[p]?.ef || 0));
      return {
        title: `Earliest Start (ES) for Activity ${act.id}`,
        formula: `ES = max(Predecessor EFs) + 1 = max(${predEfs.join(', ')}) + 1 = ${maxEf} + 1 = Day ${act.es}`,
        explanation: `${act.id} cannot begin until all immediate predecessors finish. The latest-finishing predecessor completes on Day ${maxEf}, so ${act.id} starts on Day ${act.es}.`,
      };
    }

    if (field === 'ef') {
      return {
        title: `Earliest Finish (EF) for Activity ${act.id}`,
        formula: `EF = ES + Duration - 1 = ${act.es} + ${act.duration} - 1 = Day ${act.ef}`,
        explanation: `Under inclusive workday numbering, working ${act.duration} continuous workdays starting Day ${act.es} completes at the end of Day ${act.ef}.`,
      };
    }

    if (field === 'lf') {
      if (act.successors.length === 0) {
        return {
          title: `Latest Finish (LF) for Activity ${act.id}`,
          formula: `LF = Project Duration = Day ${act.lf}`,
          explanation: `As a terminal task with no successors, ${act.id} must conclude by the final project completion date (Day ${schedule.projectDuration}).`,
        };
      }
      const succLss = act.successors.map(s => `${s}(LS=${schedule.activities[s]?.ls})`);
      const minLs = Math.min(...act.successors.map(s => schedule.activities[s]?.ls || 0));
      return {
        title: `Latest Finish (LF) for Activity ${act.id}`,
        formula: `LF = min(Successor LSs) - 1 = min(${succLss.join(', ')}) - 1 = ${minLs} - 1 = Day ${act.lf}`,
        explanation: `${act.id} must finish before the earliest necessary start date of any downstream successor task (min LS = Day ${minLs}).`,
      };
    }

    if (field === 'ls') {
      return {
        title: `Latest Start (LS) for Activity ${act.id}`,
        formula: `LS = LF - Duration + 1 = ${act.lf} - ${act.duration} + 1 = Day ${act.ls}`,
        explanation: `To finish on or before Day ${act.lf}, an activity requiring ${act.duration} workdays must start no later than Day ${act.ls}.`,
      };
    }

    if (field === 'float') {
      return {
        title: `Total Float (Slack) for Activity ${act.id}`,
        formula: `Total Float = LS - ES = ${act.ls} - ${act.es} = ${act.totalFloat} day${act.totalFloat !== 1 ? 's' : ''} (also LF - EF = ${act.lf} - ${act.ef} = ${act.totalFloat})`,
        explanation:
          act.totalFloat === 0
            ? `${act.id} has ZERO float, making it a CRITICAL ACTIVITY. Any delay directly extends the overall project deadline!`
            : `${act.id} has ${act.totalFloat} day(s) of buffer. It can slip by up to ${act.totalFloat} day(s) without delaying overall project delivery.`,
      };
    }

    return null;
  };

  const inspectedFormula = getFormulaExplanation(
    activeFormulaInspect.activityId,
    activeFormulaInspect.field
  );

  // Walkthrough steps data
  const WALKTHROUGH_STEPS = [
    {
      step: 1,
      title: 'Step 1: Forward Pass (Earliest Dates: ES & EF)',
      direction: 'Left-to-Right (Start to End)',
      rule: 'ES = max(Predecessor EFs) + 1 | EF = ES + Duration - 1',
      description:
        'We begin at Activity A on Day 1. Requirements (A, 3d) finishes on Day 3. Concurrently, both System Design (B, 4d) and Database Design (C, 3d) start on Day 4. B finishes Day 7, C finishes Day 6. Development (D) requires BOTH B and C to complete, so D starts on Day max(7, 6) + 1 = Day 8! Moving forward, Testing (E) runs Days 14–16, and User Training (F) concludes on Day 18.',
      focusActivity: 'D',
    },
    {
      step: 2,
      title: 'Step 2: Backward Pass (Latest Dates: LF & LS)',
      direction: 'Right-to-Left (End to Start)',
      rule: 'LF = min(Successor LSs) - 1 | LS = LF - Duration + 1',
      description:
        `We anchor the terminal Activity F at total project duration (Day ${schedule.projectDuration}). F must start by Day ${schedule.activities['F']?.ls}. Testing (E) must finish before F starts (Day ${schedule.activities['E']?.lf}). Stepping backwards, Development (D) must finish by Day ${schedule.activities['D']?.lf}. When D's Latest Start is Day 8, both B and C must finish on Day 8 - 1 = Day 7.`,
      focusActivity: 'C',
    },
    {
      step: 3,
      title: 'Step 3: Calculating Total Float (Slack)',
      direction: 'Mathematical Difference (Late - Early)',
      rule: 'Total Float = LS - ES = LF - EF',
      description:
        'Subtracting Early Start from Late Start reveals the slack buffer for every activity. For Activities A, B, D, E, F: LS - ES = 0 (Zero Slack). For Activity C: LS - ES = 5 - 4 = 1 workday of Total Float! Database Design can slip by 1 day without jeopardizing project completion.',
      focusActivity: 'C',
    },
    {
      step: 4,
      title: 'Step 4: Identifying the Critical Path',
      direction: 'Continuous Zero-Slack Sequence',
      rule: 'Critical Path = Sequence of activities with Total Float = 0',
      description:
        `Tracing all activities with Total Float = 0 yields the Critical Path: ${schedule.criticalPaths.map(p => p.activityIds.join(' → ')).join(', ')}. Its total duration is ${schedule.projectDuration} workdays. This path governs project delivery time.`,
      focusActivity: 'B',
    },
  ];

  const currentStepData = WALKTHROUGH_STEPS[walkthroughStep - 1];

  return (
    <section id="chapter-06" className="w-full bg-warm py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter6}
          tagline="Forward &amp; Backward Pass Mathematical Derivations"
        />

        <PresenterNotes
          member="Member 4 (Speaker 4)"
          timeAllocation="5 minutes"
          keyTakeaway="The Critical Path Method is deterministic algebra. The forward pass calculates earliest dates, the backward pass calculates latest dates, and their difference reveals float."
          talkingPoints={[
            'Explain the forward pass: start at Day 1, calculate ES and EF: EF = ES + Duration - 1.',
            'Explain the backward pass: start at project end, calculate LF and LS: LS = LF - Duration + 1.',
            'Demonstrate how Total Float = LS - ES. Show why critical tasks have Float = 0.',
            'Trigger Scenario 1: Increase Activity C to 4 days. Show that absorbing 1 day of float leaves duration at 18 days, but creates TWO critical paths!',
            'Trigger Scenario 2: Increase Activity C to 5 days. Watch duration increase to 19 days. Emphasize why non-critical tasks become controlling when float is exceeded.',
          ]}
          audiencePrompt="If Activity C has 1 day of float, why does extending it by 1 day NOT delay the project completion date?"
        />

        <LiveDelayAlert />

        {/* Prominent Formulas Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-lg bg-white border border-border shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
              Forward Pass (Early Dates)
            </span>
            <div className="font-mono text-xs font-bold text-ink-primary my-1">
              EF = ES + Duration - 1
            </div>
            <p className="text-[11px] text-ink-secondary">
              Successor ES = max(Predecessor EFs) + 1
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-border shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
              Backward Pass (Late Dates)
            </span>
            <div className="font-mono text-xs font-bold text-ink-primary my-1">
              LS = LF - Duration + 1
            </div>
            <p className="text-[11px] text-ink-secondary">
              Predecessor LF = min(Successor LSs) - 1
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-border shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-success block mb-1">
              Total Float (Slack)
            </span>
            <div className="font-mono text-xs font-bold text-ink-primary my-1">
              TF = LS - ES = LF - EF
            </div>
            <p className="text-[11px] text-ink-secondary">
              Buffer before project deadline is delayed.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-border shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-critical block mb-1">
              Critical Path Rule
            </span>
            <div className="font-mono text-xs font-bold text-critical my-1">
              Total Float = 0
            </div>
            <p className="text-[11px] text-ink-secondary">
              Longest path determining earliest completion.
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Interactive Schedule Table vs Guided Walkthrough */}
        <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'table'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive CPM Schedule Table</span>
            </button>

            <button
              onClick={() => setActiveTab('walkthrough')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'walkthrough'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guided Step-by-Step Walkthrough</span>
            </button>
          </div>
        </div>

        {activeTab === 'walkthrough' ? (
          /* Guided Step-by-Step Walkthrough Card */
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Interactive Guided CPM Tutorial
                </span>
                <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                  {currentStepData.title}
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5 font-medium">
                  Traversal Flow: <strong>{currentStepData.direction}</strong>
                </p>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setWalkthroughStep(prev => Math.max(1, prev - 1))}
                  disabled={walkthroughStep === 1}
                  className="px-2.5 py-1 rounded-md border border-border text-xs font-medium text-ink-primary hover:bg-warm disabled:opacity-40 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Step</span>
                </button>
                <span className="font-mono text-xs font-bold px-2 text-ink-primary">
                  {walkthroughStep} / 4
                </span>
                <button
                  onClick={() => setWalkthroughStep(prev => Math.min(4, prev + 1))}
                  disabled={walkthroughStep === 4}
                  className="px-2.5 py-1 rounded-md bg-ink-primary text-white text-xs font-medium hover:bg-ink-primary/90 disabled:opacity-40 flex items-center space-x-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-lg bg-warm border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Governing Equation:
                </span>
                <span className="font-mono text-xs font-bold text-ink-primary bg-white px-2 py-0.5 rounded border border-border">
                  {currentStepData.rule}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mt-2 font-sans">
                {currentStepData.description}
              </p>
            </div>

            {/* Quick Interactive Mini Highlight of the Selected Step's Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 mt-5">
              {schedule.activityList.map(act => (
                <div
                  key={act.id}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    act.id === currentStepData.focusActivity
                      ? 'border-ink-primary bg-warm shadow-xs font-semibold'
                      : 'bg-white border-border'
                  }`}
                >
                  <span className="font-mono font-bold text-xs block text-ink-primary">
                    Activity {act.id} ({act.duration}d)
                  </span>
                  <div className="font-mono text-[11px] mt-1 space-y-0.5">
                    <div className="text-ink-primary">ES:{act.es} EF:{act.ef}</div>
                    <div className="text-ink-secondary">LS:{act.ls} LF:{act.lf}</div>
                    <div className={act.isCritical ? 'text-critical font-bold' : 'text-success font-semibold'}>
                      TF: {act.totalFloat}d
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tab 1: Dynamic Calculation Schedule Table */
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Interactive Component
                </span>
                <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                  CPM Calculation Schedule Table
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                  Click any value cell (ES, EF, LS, LF, Float) to inspect the exact mathematical derivation.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-ink-secondary font-medium">Project Duration:</span>
                <span className="font-mono font-bold text-xs text-ink-primary bg-warm px-2.5 py-1 rounded border border-border">
                  {schedule.projectDuration} Workdays
                </span>
              </div>
            </div>

            {/* Calculation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-warm text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Activity Description</th>
                    <th className="py-2.5 px-3 text-center">Duration</th>
                    <th className="py-2.5 px-3">Predecessors</th>
                    <th className="py-2.5 px-3 text-center text-ink-primary font-bold">ES</th>
                    <th className="py-2.5 px-3 text-center text-ink-primary font-bold">EF</th>
                    <th className="py-2.5 px-3 text-center">LS</th>
                    <th className="py-2.5 px-3 text-center">LF</th>
                    <th className="py-2.5 px-3 text-center">Total Float</th>
                    <th className="py-2.5 px-3 text-center">Free Float</th>
                    <th className="py-2.5 px-3 text-center">Critical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-xs sm:text-sm">
                  {schedule.activityList.map(act => {
                    const isSelected = selectedActivityId === act.id;
                    return (
                      <tr
                        key={act.id}
                        onClick={() => setSelectedActivityId(act.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-warm font-semibold'
                            : act.isCritical
                            ? 'hover:bg-critical-light/20'
                            : 'hover:bg-warm/60'
                        }`}
                      >
                        {/* ID */}
                        <td className="py-3 px-3 font-bold text-ink-primary">
                          <span className="w-6 h-6 rounded bg-ink-primary text-white inline-flex items-center justify-center font-bold text-xs">
                            {act.id}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-3 font-sans font-medium text-ink-primary">
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
                              className="w-5 h-5 rounded bg-warm hover:bg-border text-ink-primary text-xs flex items-center justify-center disabled:opacity-30"
                            >
                              -
                            </button>
                            <span className="font-bold w-6 text-center">{act.duration}d</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                updateActivityDuration(act.id, act.duration + 1);
                              }}
                              className="w-5 h-5 rounded bg-warm hover:bg-border text-ink-primary text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Predecessors */}
                        <td className="py-3 px-3 text-ink-secondary">
                          {act.predecessors.length > 0 ? act.predecessors.join(', ') : '—'}
                        </td>

                        {/* ES */}
                        <td
                          onClick={e => {
                            e.stopPropagation();
                            setActiveFormulaInspect({ activityId: act.id, field: 'es' });
                          }}
                          className={`py-3 px-3 text-center text-ink-primary font-bold cursor-help hover:underline ${
                            activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'es'
                              ? 'bg-warm rounded'
                              : ''
                          }`}
                        >
                          {act.es}
                        </td>

                        {/* EF */}
                        <td
                          onClick={e => {
                            e.stopPropagation();
                            setActiveFormulaInspect({ activityId: act.id, field: 'ef' });
                          }}
                          className={`py-3 px-3 text-center text-ink-primary font-bold cursor-help hover:underline ${
                            activeFormulaInspect.activityId === act.id && activeFormulaInspect.field === 'ef'
                              ? 'bg-warm rounded'
                              : ''
                          }`}
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
                              ? 'bg-warm rounded'
                              : ''
                          }`}
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
                              ? 'bg-warm rounded'
                              : ''
                          }`}
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
                              ? 'bg-warm rounded'
                              : ''
                          }`}
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
                            className={`text-[11px] font-bold px-2 py-0.5 rounded inline-block ${
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

            {/* Expandable Mathematical Formula Derivation Inspector */}
            {inspectedFormula && (
              <div className="mt-6 p-4 rounded-lg bg-warm border border-border">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-3.5 h-3.5 text-ink-primary" />
                    <span className="text-xs font-bold text-ink-primary font-sans">
                      Formula Derivation: {inspectedFormula.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted">Inclusive Workdays</span>
                </div>
                <div className="mt-2 text-xs sm:text-sm">
                  <div className="p-3 bg-white rounded border border-border font-mono font-bold text-ink-primary text-xs sm:text-sm">
                    {inspectedFormula.formula}
                  </div>
                  <p className="mt-2 text-ink-secondary leading-relaxed font-sans text-xs sm:text-sm">
                    {inspectedFormula.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
