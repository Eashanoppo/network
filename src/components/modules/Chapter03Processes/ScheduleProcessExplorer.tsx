import React, { useState } from 'react';
import { SCHEDULE_PROCESSES, CHAPTERS_DATA } from '../../../data/educationalContent';
import { ProcessStep } from '../../../types/scheduling';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import {
  CheckCircle2,
  FileText,
  Wrench,
  PackageCheck,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const ScheduleProcessExplorer: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<ProcessStep>(SCHEDULE_PROCESSES[0]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const chapter3 = CHAPTERS_DATA[2];

  return (
    <section id="chapter-03" className="w-full bg-white py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter3}
          tagline="The 6 Core PMBOK Workflow Stages"
        />

        <PresenterNotes
          member="Member 1 (Speaker 1)"
          timeAllocation="4 minutes"
          keyTakeaway="Scheduling is a strict 6-stage lifecycle. You cannot sequence what has not been defined, and you cannot develop dates without activity network logic."
          talkingPoints={[
            'Walk through the 6 stages in order: Plan, Define, Sequence, Estimate, Develop, Control.',
            'Emphasize how Define Activities takes the WBS deliverables and decomposes them into tasks.',
            'Explain why Sequence Activities creates the Network Diagram (Activity-on-Node).',
            'Highlight that Develop Schedule runs CPM calculations to create the approved Baseline and Gantt Chart.',
          ]}
          audiencePrompt="Which process is responsible for identifying that Development cannot begin until both System Design and Database Design are complete?"
        />

        {/* Main Interactive Process Stepper Studio */}
        <div className="bg-warm rounded-xl border border-border p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Interactive Component &bull; Process 0{selectedStep.stepNumber} of 06
              </span>
              <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                The Six Schedule Management Processes
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Select any PMBOK process to inspect its inputs, techniques, outputs, and case study application.
              </p>
            </div>

            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-white border border-border text-ink-primary self-start sm:self-auto">
              Stage 0{selectedStep.stepNumber} Active
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
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-ink-primary text-white border-ink-primary shadow-xs'
                      : 'bg-white hover:bg-surface-secondary text-ink-primary border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white/70' : 'text-ink-muted'}`}>
                      0{step.stepNumber}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>}
                  </div>
                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-ink-primary'}`}>
                    {step.shortTag}
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-ink-secondary'}`}>
                    {step.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Process Detail Canvas */}
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-border shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-ink-primary text-white">
                    PROCESS 0{selectedStep.stepNumber}
                  </span>
                  <h4 className="text-lg font-bold text-ink-primary">
                    {selectedStep.name}
                  </h4>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-ink-secondary max-w-3xl leading-relaxed">
                  {selectedStep.definition}
                </p>
              </div>

              <div className="p-3.5 bg-warm rounded-lg border border-border text-xs max-w-sm shrink-0">
                <span className="font-bold text-ink-primary block mb-1 flex items-center space-x-1.5 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-brand" />
                  <span>Why This Step Matters:</span>
                </span>
                <p className="text-ink-secondary leading-relaxed">
                  {selectedStep.whyImportant}
                </p>
              </div>
            </div>

            {/* Inputs, Tools, Outputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
              <div className="bg-warm p-4 rounded-lg border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-1.5 mb-2.5">
                  <FileText className="w-3.5 h-3.5 text-ink-primary" />
                  <span>Key Inputs</span>
                </span>
                <ul className="text-xs text-ink-secondary space-y-1.5">
                  {selectedStep.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-ink-muted font-bold">&bull;</span>
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-warm p-4 rounded-lg border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-1.5 mb-2.5">
                  <Wrench className="w-3.5 h-3.5 text-brand" />
                  <span>Tools &amp; Techniques</span>
                </span>
                <ul className="text-xs text-ink-secondary space-y-1.5">
                  {selectedStep.toolsAndTechniques.map((tool, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-brand font-bold">&bull;</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-warm p-4 rounded-lg border border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center space-x-1.5 mb-2.5">
                  <PackageCheck className="w-3.5 h-3.5 text-success" />
                  <span>Primary Outputs</span>
                </span>
                <ul className="text-xs text-ink-secondary space-y-1.5">
                  {selectedStep.primaryOutputs.map((out, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-success font-bold">&bull;</span>
                      <span className="font-semibold text-ink-primary">{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* University Example & Next Handoff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-border text-xs">
              <div className="bg-warm p-4 rounded-lg border border-border">
                <span className="font-bold text-xs text-ink-primary block mb-1">
                  Real Case Study Application:
                </span>
                <p className="text-ink-secondary leading-relaxed">
                  {selectedStep.universityExample}
                </p>
              </div>

              <div className="bg-warm p-4 rounded-lg border border-border flex items-start justify-between">
                <div>
                  <span className="font-bold text-xs text-brand block mb-1">
                    Logical Handoff to Next Process:
                  </span>
                  <p className="text-ink-secondary leading-relaxed">
                    {selectedStep.nextStepConnection}
                  </p>
                </div>
                {selectedStep.stepNumber < 6 && (
                  <button
                    onClick={() => setSelectedStep(SCHEDULE_PROCESSES[selectedStep.stepNumber])}
                    className="mt-1 ml-2 p-1.5 rounded-md bg-white text-ink-primary hover:bg-warm border border-border transition-colors shrink-0 shadow-xs"
                    title="Advance to next process"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Engagement Quiz Card */}
        <div className="bg-warm rounded-xl p-6 border border-border shadow-xs">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="w-4 h-4 text-brand" />
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              Classroom Quick Check &bull; Member 1
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink-primary mb-4">
            If project stakeholders demand an earlier completion date, which process owns evaluating schedule compression techniques (crashing &amp; fast-tracking) to update the baseline?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'opt1', text: 'Define Activities', correct: false, note: 'Define Activities produces the activity list, not schedule models.' },
              { id: 'opt2', text: 'Develop Schedule', correct: true, note: 'Correct! Develop Schedule applies CPM, crashing, and fast-tracking to establish the baseline.' },
              { id: 'opt3', text: 'Sequence Activities', correct: false, note: 'Sequence Activities determines dependency logic, not duration tradeoffs.' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setQuizAnswer(opt.id)}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  quizAnswer === opt.id
                    ? opt.correct
                      ? 'bg-success-light border-success text-success font-semibold'
                      : 'bg-critical-light border-critical text-critical font-semibold'
                    : 'bg-white hover:bg-surface-secondary border-border text-ink-primary'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{opt.text}</span>
                  {quizAnswer === opt.id && (opt.correct ? '✓ Correct' : '✗ Incorrect')}
                </div>
                {quizAnswer === opt.id && (
                  <p className="text-[11px] mt-1.5 font-normal opacity-90 leading-tight">
                    {opt.note}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
