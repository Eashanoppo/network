import React, { useState } from 'react';
import { SCHEDULE_PROCESSES } from '../../../data/educationalContent';
import { ProcessStep } from '../../../types/scheduling';
import { SectionHeader } from '../../common/SectionHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  FileText,
  Wrench,
  PackageCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const ScheduleProcessExplorer: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<ProcessStep>(SCHEDULE_PROCESSES[0]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  return (
    <section id="module-01" className="py-12 border-b border-border scroll-mt-20">
      <SectionHeader
        moduleNumber="Module 01"
        member="Member 1"
        title="Project Schedule Management &amp; The 6 Core Processes"
        subtitle="Project Schedule Management encompasses the processes required to manage the timely completion of the project. Learn how high-level deliverables are transformed into a sequence of measurable, time-bounded activities."
        tagline="Foundation &amp; Architecture"
      />

      <PresenterNotes
        member="Member 1 (Speaker 1)"
        timeAllocation="3–4 minutes"
        keyTakeaway="Project scheduling is not just drawing dates; it is a rigorous 6-step discipline that converts raw scope into an optimized execution model."
        talkingPoints={[
          'Define Project Schedule Management: time is the most inflexible constraint in the project triple constraint (Scope, Time, Cost).',
          'Introduce the 6 sequential processes from PMBOK Chapter 6.',
          'Emphasize how Define Activities breaks down the WBS into tasks, while Sequence Activities finds their logical links.',
          'Introduce our University Management System scenario (Activities A through F).',
        ]}
        audiencePrompt="Can anyone tell me why we must sequence activities BEFORE we can develop the schedule?"
      />

      {/* Conceptual Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-border shadow-subtle">
          <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand mb-3 font-bold text-sm">
            01
          </div>
          <h4 className="font-bold text-ink-primary text-sm mb-1">What is Schedule Management?</h4>
          <p className="text-xs text-ink-secondary leading-relaxed">
            The defined knowledge area responsible for establishing the policies, activity definitions, logical order, duration estimates, baseline timelines, and ongoing schedule control throughout the project lifecycle.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-subtle">
          <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center text-success mb-3 font-bold text-sm">
            02
          </div>
          <h4 className="font-bold text-ink-primary text-sm mb-1">Why is Scheduling Vital?</h4>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Schedule issues are the #1 cause of project conflict and cost overruns. A validated schedule aligns cross-functional engineering teams, identifies critical bottlenecks before coding starts, and coordinates vendor commitments.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-subtle">
          <div className="w-8 h-8 rounded-lg bg-warning-light flex items-center justify-center text-warning mb-3 font-bold text-sm">
            03
          </div>
          <h4 className="font-bold text-ink-primary text-sm mb-1">Core Scheduling Elements</h4>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Every task possesses an <strong>Activity ID</strong>, a finite <strong>Duration</strong>, one or more <strong>Predecessors</strong> (logical dependencies), and planned <strong>Start/Finish</strong> boundaries.
          </p>
        </div>
      </div>

      {/* Interactive Process Pipeline Explorer */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Interactive Component
            </span>
            <h3 className="text-lg font-bold text-ink-primary">
              The Six Schedule Management Processes Explorer
            </h3>
            <p className="text-xs text-ink-secondary">
              Click any of the six PMBOK processes below to inspect its inputs, techniques, outputs, and practical application.
            </p>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            Step {selectedStep.stepNumber} of 6
          </span>
        </div>

        {/* Process Step Selector Track */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {SCHEDULE_PROCESSES.map(step => {
            const isSelected = selectedStep.id === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step)}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-brand text-white border-brand shadow-sm ring-2 ring-brand/30'
                    : 'bg-canvas hover:bg-canvas/80 text-ink-primary border-border hover:border-brand-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white/80' : 'text-ink-muted'}`}>
                    0{step.stepNumber}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className={`text-xs font-bold tracking-tight leading-snug ${isSelected ? 'text-white' : 'text-ink-primary'}`}>
                  {step.shortTag}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-ink-secondary'}`}>
                  {step.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Process Detail Canvas */}
        <div className="bg-canvas rounded-xl p-5 border border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-border/80">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand text-white">
                  PROCESS 0{selectedStep.stepNumber}
                </span>
                <h4 className="text-base font-bold text-ink-primary">
                  {selectedStep.name}
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-ink-secondary max-w-3xl leading-relaxed">
                {selectedStep.definition}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-border text-xs max-w-sm shrink-0">
              <span className="font-semibold text-ink-primary block mb-0.5 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-brand" />
                <span>Why This Matters:</span>
              </span>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                {selectedStep.whyImportant}
              </p>
            </div>
          </div>

          {/* Inputs, Tools, Outputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-1 mb-2">
                <FileText className="w-3.5 h-3.5 text-brand" />
                <span>Key Inputs</span>
              </span>
              <ul className="text-xs text-ink-secondary space-y-1">
                {selectedStep.inputs.map((inp, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-brand font-bold">&bull;</span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-1 mb-2">
                <Wrench className="w-3.5 h-3.5 text-warning" />
                <span>Tools &amp; Techniques</span>
              </span>
              <ul className="text-xs text-ink-secondary space-y-1">
                {selectedStep.toolsAndTechniques.map((tool, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-warning font-bold">&bull;</span>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-1 mb-2">
                <PackageCheck className="w-3.5 h-3.5 text-success" />
                <span>Primary Outputs</span>
              </span>
              <ul className="text-xs text-ink-secondary space-y-1">
                {selectedStep.primaryOutputs.map((out, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-success font-bold">&bull;</span>
                    <span className="font-medium text-ink-primary">{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Real Project Example & Next Process Connection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/80 text-xs">
            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="font-bold text-ink-primary block mb-1">
                Real Case Study Application:
              </span>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                {selectedStep.universityExample}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-border flex items-start justify-between">
              <div>
                <span className="font-bold text-brand block mb-1">
                  Logical Handoff to Next Step:
                </span>
                <p className="text-ink-secondary text-[11px] leading-relaxed">
                  {selectedStep.nextStepConnection}
                </p>
              </div>
              {selectedStep.stepNumber < 6 && (
                <button
                  onClick={() => setSelectedStep(SCHEDULE_PROCESSES[selectedStep.stepNumber])}
                  className="mt-1 ml-2 p-1.5 rounded bg-brand-light text-brand hover:bg-brand hover:text-white transition-colors shrink-0"
                  title="Advance to next process"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Audience Engagement Check */}
      <div className="bg-canvas rounded-xl p-5 border border-border">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
            Quick Audience Engagement Challenge (Member 1)
          </span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-ink-primary mb-3">
          If your project sponsor requests an urgent deadline compression before development begins, which process owns evaluating crashing or fast-tracking options to produce a revised baseline?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: 'opt1', text: 'Define Activities', correct: false, note: 'Define Activities breaks down scope, not schedule compression.' },
            { id: 'opt2', text: 'Develop Schedule', correct: true, note: 'Correct! Develop Schedule applies CPM, crashing, and fast-tracking to build the schedule model.' },
            { id: 'opt3', text: 'Sequence Activities', correct: false, note: 'Sequence Activities identifies dependencies, not compression tradeoffs.' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setQuizAnswer(opt.id)}
              className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                quizAnswer === opt.id
                  ? opt.correct
                    ? 'bg-success-light border-success text-success font-bold'
                    : 'bg-critical-light border-critical text-critical font-bold'
                  : 'bg-white hover:bg-white/80 border-border text-ink-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt.text}</span>
                {quizAnswer === opt.id && (opt.correct ? '✓' : '✗')}
              </div>
              {quizAnswer === opt.id && (
                <p className="text-[11px] mt-1 font-normal opacity-90 leading-tight">
                  {opt.note}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

