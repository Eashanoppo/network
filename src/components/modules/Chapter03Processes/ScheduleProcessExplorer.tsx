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
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ScheduleProcessExplorer: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [showDetailedIto, setShowDetailedIto] = useState<boolean>(false);

  const chapter3 = CHAPTERS_DATA[2];
  const selectedStep = SCHEDULE_PROCESSES[selectedStepIndex] || SCHEDULE_PROCESSES[0];

  const handleNext = () => {
    setSelectedStepIndex(prev => (prev + 1) % SCHEDULE_PROCESSES.length);
  };

  const handlePrev = () => {
    setSelectedStepIndex(prev => (prev - 1 + SCHEDULE_PROCESSES.length) % SCHEDULE_PROCESSES.length);
  };

  return (
    <section id="chapter-03" className="w-full bg-white py-14 lg:py-16 border-b border-border scroll-mt-20">
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

        {/* Visual Stepper Journey Header */}
        <div className="bg-warm rounded-2xl border border-border p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                Sequential Workflow Journey &bull; Stage 0{selectedStep.stepNumber} of 06
              </span>
              <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                The 6 Schedule Management Processes
              </h3>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-border bg-white text-ink-secondary hover:text-ink-primary hover:bg-warm transition-colors"
                title="Previous process"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-ink-primary px-2">
                0{selectedStep.stepNumber} / 06
              </span>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-border bg-white text-ink-secondary hover:text-ink-primary hover:bg-warm transition-colors"
                title="Next process"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Visual Process Sequence (Desktop) / Grid (Mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
            {SCHEDULE_PROCESSES.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const isPast = idx < selectedStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-ink-primary text-white border-ink-primary shadow-xs ring-2 ring-ink-primary/20 scale-[1.02]'
                      : isPast
                      ? 'bg-white text-ink-primary border-border hover:border-ink-secondary'
                      : 'bg-white/70 text-ink-muted border-border hover:text-ink-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-brand' : 'text-ink-muted'}`}>
                      0{step.stepNumber}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />}
                    {isPast && <CheckCircle2 className="w-3 h-3 text-success shrink-0" />}
                  </div>

                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-ink-primary'}`}>
                    {step.shortTag}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-ink-secondary'}`}>
                    {step.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Spotlight Card (Concise & Focused) */}
          <div className="bg-white rounded-xl p-6 border border-border shadow-xs transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-border">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-light text-brand border border-brand-border">
                    STAGE 0{selectedStep.stepNumber}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted">PMBOK 6.{selectedStep.stepNumber}</span>
                </div>
                <h4 className="text-xl font-bold text-ink-primary mt-1">
                  {selectedStep.name}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
                  {selectedStep.definition}
                </p>
              </div>

              {/* Primary Output Highlight Pill */}
              <div className="p-4 rounded-xl bg-warm border border-border shrink-0 max-w-xs">
                <span className="text-[9px] font-mono uppercase font-bold text-ink-muted block mb-1">
                  Core Output &amp; Deliverable
                </span>
                <span className="font-bold text-xs text-ink-primary block">
                  {selectedStep.primaryOutputs[0] || 'Schedule Baseline'}
                </span>
                <span className="text-[11px] text-ink-secondary mt-1 block">
                  {selectedStep.whyImportant}
                </span>
              </div>
            </div>

            {/* Progressive Disclosure: Inputs, Tools & Outputs (ITTOs) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                  Process Mechanics (ITTOs)
                </span>
                <button
                  onClick={() => setShowDetailedIto(prev => !prev)}
                  className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors flex items-center space-x-1"
                >
                  <span>{showDetailedIto ? 'Hide Detailed ITTOs' : 'Reveal Full Inputs, Tools & Outputs'}</span>
                </button>
              </div>

              {showDetailedIto ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs animate-in fade-in duration-200">
                  <div className="bg-warm p-3.5 rounded-lg border border-border">
                    <span className="font-bold text-ink-primary flex items-center space-x-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-ink-secondary" />
                      <span>Key Inputs</span>
                    </span>
                    <ul className="space-y-1 text-ink-secondary text-[11px]">
                      {selectedStep.inputs.map((inp, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-ink-muted font-bold">&bull;</span>
                          <span>{inp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-warm p-3.5 rounded-lg border border-border">
                    <span className="font-bold text-ink-primary flex items-center space-x-1.5 mb-2">
                      <Wrench className="w-3.5 h-3.5 text-brand" />
                      <span>Tools &amp; Techniques</span>
                    </span>
                    <ul className="space-y-1 text-ink-secondary text-[11px]">
                      {selectedStep.toolsAndTechniques.map((tool, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-brand font-bold">&bull;</span>
                          <span>{tool}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-warm p-3.5 rounded-lg border border-border">
                    <span className="font-bold text-ink-primary flex items-center space-x-1.5 mb-2">
                      <PackageCheck className="w-3.5 h-3.5 text-success" />
                      <span>Key Outputs</span>
                    </span>
                    <ul className="space-y-1 text-ink-secondary text-[11px]">
                      {selectedStep.primaryOutputs.map((out, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-success font-bold">&bull;</span>
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-warm rounded-lg border border-border flex items-center justify-between text-xs text-ink-secondary">
                  <div className="flex items-center space-x-3">
                    <span className="text-ink-primary font-medium">
                      Tools: <strong>{selectedStep.toolsAndTechniques.slice(0, 2).join(', ')}</strong>
                    </span>
                    <span className="text-ink-muted">&bull;</span>
                    <span>Outputs: <strong>{selectedStep.primaryOutputs.slice(0, 2).join(', ')}</strong></span>
                  </div>
                  <span className="text-[10px] text-ink-muted font-mono">Click above to expand</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
