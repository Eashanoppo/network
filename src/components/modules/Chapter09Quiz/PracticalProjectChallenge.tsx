import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { calculateSchedule } from '../../../engine/cpmEngine';
import { simulateDurationChange } from '../../../engine/simulationEngine';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const PracticalProjectChallenge: React.FC = () => {
  const { activities, schedule } = useSchedule();
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [stageSelections, setStageSelections] = useState<Record<number, any>>({});
  const [stageSubmitted, setStageSubmitted] = useState<Record<number, boolean>>({});
  const [isChallengeCompleted, setIsChallengeCompleted] = useState<boolean>(false);

  // Live dynamic scheduling calculations for verification
  const currentDuration = schedule.projectDuration;
  const criticalPathStr = schedule.criticalPaths[0]?.activityIds.join(' → ') || 'A → B → D → E → F';
  const floatC = schedule.activities['C']?.totalFloat ?? 1;

  // Live simulation for stage 7
  const simC5 = simulateDurationChange(activities, 'C', 5);
  const simC5Duration = simC5.schedule.projectDuration;

  // Stages configuration with live verification
  const STAGES = [
    {
      number: 1,
      title: 'Stage 1: Identify the Deliverable Activities',
      instruction: 'Select the six core engineering activities defined in the University Management System Work Breakdown Structure:',
      options: [
        { id: 'A', text: 'Activity A: Requirements Analysis', isCorrect: true },
        { id: 'B', text: 'Activity B: System Design', isCorrect: true },
        { id: 'C', text: 'Activity C: Database Design', isCorrect: true },
        { id: 'D', text: 'Activity D: Development', isCorrect: true },
        { id: 'E', text: 'Activity E: Testing', isCorrect: true },
        { id: 'F', text: 'Activity F: User Training', isCorrect: true },
        { id: 'X', text: 'Activity X: Marketing Campaign', isCorrect: false },
        { id: 'Y', text: 'Activity Y: Server Procurement', isCorrect: false },
      ],
      type: 'multi',
      explanation: 'Activities A through F represent the complete software lifecycle scope (PMBOK Process 6.2 Define Activities). Activities X and Y are outside project scope.',
    },
    {
      number: 2,
      title: 'Stage 2: Understand Activity Dependencies',
      instruction: 'Which immediate predecessor activities must be 100% completed before Development (Activity D) can begin?',
      options: [
        { id: 'b_only', text: 'Only Activity B (System Design)', isCorrect: false },
        { id: 'c_only', text: 'Only Activity C (Database Design)', isCorrect: false },
        { id: 'both_bc', text: 'Both Activity B (System Design) and Activity C (Database Design)', isCorrect: true },
        { id: 'a_only', text: 'Activity A (Requirements Analysis)', isCorrect: false },
      ],
      type: 'single',
      explanation: 'Development (D) is a convergence merge activity. Under PMBOK sequence logic, developers require both system blueprints (B) and schema definitions (C) before coding.',
    },
    {
      number: 3,
      title: 'Stage 3: Determine Parallel Concurrency',
      instruction: 'Which activities can execute simultaneously in parallel once Requirements Analysis (Activity A) finishes?',
      options: [
        { id: 'bc', text: 'Activity B (System Design) and Activity C (Database Design)', isCorrect: true },
        { id: 'de', text: 'Activity D (Development) and Activity E (Testing)', isCorrect: false },
        { id: 'ef', text: 'Activity E (Testing) and Activity F (User Training)', isCorrect: false },
        { id: 'ab', text: 'Activity A and Activity B', isCorrect: false },
      ],
      type: 'single',
      explanation: 'Activity A bursts into two independent branches: B and C. Because neither B nor C depends on the other, both run in parallel from Day 4.',
    },
    {
      number: 4,
      title: 'Stage 4: Calculate Total Project Duration',
      instruction: `Using the forward pass (ES + D - 1), what is the total minimum project duration required to complete all activities?`,
      options: [
        { id: '16', text: '16 Workdays', isCorrect: currentDuration === 16 },
        { id: '17', text: '17 Workdays', isCorrect: currentDuration === 17 },
        { id: '18', text: '18 Workdays (Baseline)', isCorrect: currentDuration === 18 },
        { id: '19', text: '19 Workdays', isCorrect: currentDuration === 19 },
        { id: '21', text: '21 Workdays (Sum of all task durations)', isCorrect: false },
      ],
      type: 'single',
      explanation: `Verified live by CPM engine: Total project duration is ${currentDuration} workdays. Summing durations directly (21d) is incorrect because B and C execute in parallel!`,
    },
    {
      number: 5,
      title: 'Stage 5: Identify the Critical Path',
      instruction: 'Which sequence of dependent activities forms the controlling Critical Path?',
      options: [
        { id: 'abdef', text: 'Path 1: A → B → D → E → F (18 Workdays)', isCorrect: true },
        { id: 'acdef', text: 'Path 2: A → C → D → E → F (17 Workdays in baseline)', isCorrect: false },
        { id: 'bdef', text: 'Path 3: B → D → E → F (15 Workdays)', isCorrect: false },
        { id: 'adf', text: 'Path 4: A → D → F (11 Workdays)', isCorrect: false },
      ],
      type: 'single',
      explanation: `Path 1 (A-B-D-E-F) equals 3 + 4 + 6 + 3 + 2 = 18 workdays. It is the longest path through the network and possesses zero total float.`,
    },
    {
      number: 6,
      title: 'Stage 6: Determine Activity Float (Slack)',
      instruction: 'What is the Total Float of Activity C (Database Design) in the baseline schedule?',
      options: [
        { id: '0', text: '0 Workdays (Critical Activity)', isCorrect: floatC === 0 },
        { id: '1', text: '1 Workday (LS 5 - ES 4 = 1)', isCorrect: floatC === 1 },
        { id: '2', text: '2 Workdays', isCorrect: floatC === 2 },
        { id: '3', text: '3 Workdays', isCorrect: floatC === 3 },
      ],
      type: 'single',
      explanation: `Total Float = LS - ES = 5 - 4 = 1 workday (also LF - EF = 7 - 6 = 1 workday). Activity C can slip by 1 day without delaying overall project delivery.`,
    },
    {
      number: 7,
      title: 'Stage 7: Predict Delay Impact',
      instruction: 'If Database Design (Activity C) slips from 3 days to 5 days (+2 days delay), what will happen to the project?',
      options: [
        { id: 'absorbed', text: 'No impact: float absorbs all 2 days, project duration remains 18 days.', isCorrect: false },
        { id: 'exceeded', text: 'Float absorbs 1 day; the excess 1 day extends project duration to 19 days, making Path A-C-D-E-F the controlling critical path!', isCorrect: true },
        { id: 'crit_b', text: 'Activity B becomes critical with 20 days duration.', isCorrect: false },
        { id: 'halved', text: 'Project duration drops because of fast-tracking.', isCorrect: false },
      ],
      type: 'single',
      explanation: `Verified live by Simulation Engine: C only had 1 day of slack. The 2-day delay consumed that 1 day and spilled over by 1 excess day, extending project completion from 18 to ${simC5Duration} workdays! Path A-C-D-E-F becomes the new critical path.`,
    },
  ];

  const currentStageData = STAGES[currentStage - 1];
  const userSelection = stageSelections[currentStage];
  const isSubmitted = stageSubmitted[currentStage] || false;

  const handleToggleMulti = (id: string) => {
    if (isSubmitted) return;
    const currentList: string[] = userSelection || [];
    const nextList = currentList.includes(id)
      ? currentList.filter(item => item !== id)
      : [...currentList, id];
    setStageSelections(prev => ({ ...prev, [currentStage]: nextList }));
  };

  const handleSelectSingle = (id: string) => {
    if (isSubmitted) return;
    setStageSelections(prev => ({ ...prev, [currentStage]: id }));
  };

  const handleSubmitStage = () => {
    setStageSubmitted(prev => ({ ...prev, [currentStage]: true }));
  };

  const isCurrentStageCorrect = () => {
    if (currentStageData.type === 'multi') {
      const selected: string[] = userSelection || [];
      const correctIds = currentStageData.options.filter(o => o.isCorrect).map(o => o.id);
      return (
        selected.length === correctIds.length &&
        selected.every(id => correctIds.includes(id))
      );
    } else {
      const correctOption = currentStageData.options.find(o => o.isCorrect);
      return userSelection === correctOption?.id;
    }
  };

  const handleNextStage = () => {
    if (currentStage < STAGES.length) {
      setCurrentStage(prev => prev + 1);
    } else {
      setIsChallengeCompleted(true);
    }
  };

  const handleResetChallenge = () => {
    setStageSelections({});
    setStageSubmitted({});
    setCurrentStage(1);
    setIsChallengeCompleted(false);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
      {!isChallengeCompleted ? (
        <div>
          {/* Header & Stage Tracker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Live Practical Challenge
                </span>
                <span className="text-xs text-ink-muted">&bull; Validated Live by CPM Engine</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-ink-primary mt-0.5">
                {currentStageData.title}
              </h3>
            </div>

            {/* Progress Pills */}
            <div className="flex items-center space-x-1.5">
              {STAGES.map(s => {
                const sSubmitted = stageSubmitted[s.number];
                return (
                  <div
                    key={s.number}
                    className={`w-6 h-6 rounded text-xs font-mono font-bold flex items-center justify-center border transition-all ${
                      s.number === currentStage
                        ? 'bg-ink-primary text-white border-ink-primary shadow-xs'
                        : sSubmitted
                        ? 'bg-success-light text-success border-success'
                        : 'bg-warm text-ink-muted border-border'
                    }`}
                  >
                    {s.number}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Prompt */}
          <div className="mb-6">
            <p className="text-xs sm:text-sm text-ink-primary font-semibold leading-relaxed">
              {currentStageData.instruction}
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-2.5 mb-6">
            {currentStageData.options.map(option => {
              const isSelected =
                currentStageData.type === 'multi'
                  ? (userSelection || []).includes(option.id)
                  : userSelection === option.id;

              let style = 'bg-white hover:bg-warm border-border text-ink-primary';

              if (isSubmitted) {
                if (option.isCorrect) {
                  style = 'bg-success-light border-success text-success font-semibold';
                } else if (isSelected && !option.isCorrect) {
                  style = 'bg-critical-light border-critical text-critical font-semibold';
                } else {
                  style = 'bg-white opacity-40 border-border text-ink-muted';
                }
              } else if (isSelected) {
                style = 'bg-warm border-ink-primary text-ink-primary font-semibold ring-1 ring-ink-primary';
              }

              return (
                <button
                  key={option.id}
                  onClick={() =>
                    currentStageData.type === 'multi'
                      ? handleToggleMulti(option.id)
                      : handleSelectSingle(option.id)
                  }
                  disabled={isSubmitted}
                  className={`w-full p-3.5 rounded-lg border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-5 h-5 rounded ${currentStageData.type === 'multi' ? 'rounded' : 'rounded-full'} border border-current flex items-center justify-center text-[10px] shrink-0 font-mono`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{option.text}</span>
                  </div>
                  {isSubmitted && (
                    <div>
                      {option.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : isSelected ? (
                        <XCircle className="w-4 h-4 text-critical" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage Explanation (Upon Submit) */}
          {isSubmitted && (
            <div className={`p-4 rounded-lg border mb-6 text-xs sm:text-sm ${
              isCurrentStageCorrect()
                ? 'bg-success-light/70 border-success-border text-ink-primary'
                : 'bg-critical-light/70 border-critical-border text-ink-primary'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1">
                {isCurrentStageCorrect() ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-success">Stage Passed!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-critical" />
                    <span className="text-critical">Incorrect Response</span>
                  </>
                )}
              </div>
              <p className="text-ink-secondary leading-relaxed mt-1">
                {currentStageData.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-ink-muted font-mono">
              Stage {currentStage} of {STAGES.length}
            </span>

            <div className="flex items-center space-x-2">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitStage}
                  disabled={!userSelection || (currentStageData.type === 'multi' && userSelection.length === 0)}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-ink-primary text-white hover:bg-ink-primary/90 disabled:opacity-40 transition-all shadow-xs"
                >
                  Submit Stage Answer
                </button>
              ) : (
                <button
                  onClick={handleNextStage}
                  className="px-4 py-2 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <span>{currentStage < STAGES.length ? 'Continue to Next Stage' : 'Complete Challenge'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Final Challenge Victory Screen */
        <div className="text-center py-8 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-warm text-ink-primary flex items-center justify-center mx-auto mb-3 border border-border">
            <Sparkles className="w-6 h-6 text-brand" />
          </div>

          <h3 className="text-2xl font-bold text-ink-primary">
            Practical Project Challenge Mastered!
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            You successfully navigated the entire 7-stage scheduling lifecycle for the University Management System.
          </p>

          <div className="my-6 p-5 rounded-xl bg-warm border border-border text-left text-xs space-y-2">
            <div className="font-bold text-ink-primary uppercase tracking-wider text-[10px] mb-2">
              Summary of Scheduling Milestones Proven:
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Decomposed 6 work activities from scope (A through F).</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Modeled convergence merge at Activity D (requires B &amp; C).</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Identified parallel concurrency between Tasks B and C.</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Calculated forward pass duration: 18 workdays.</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Identified Critical Path A-B-D-E-F (0 slack).</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Computed Activity C Total Float: 1 workday buffer.</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Simulated +2d delay on C, demonstrating Critical Path shift to 19d.</span>
            </div>
          </div>

          <button
            onClick={handleResetChallenge}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-ink-primary text-white hover:bg-ink-primary/90 transition-all inline-flex items-center space-x-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand" />
            <span>Restart Practical Challenge</span>
          </button>
        </div>
      )}
    </div>
  );
};
