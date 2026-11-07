import React from 'react';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import {
  Clock,
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Calendar,
  CheckCircle2,
  Flag,
  ArrowRight,
} from 'lucide-react';

export const ScheduleManagementBasics: React.FC = () => {
  const chapter2 = CHAPTERS_DATA[1];

  return (
    <section id="chapter-02" className="w-full bg-warm py-16 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter2}
          tagline="Foundations &amp; The Triple Constraint"
        />

        <PresenterNotes
          member="Member 1 (Speaker 1)"
          timeAllocation="3 minutes"
          keyTakeaway="Time is the least flexible dimension in project management. Money and people can be added, but elapsed days can never be recovered."
          talkingPoints={[
            'Introduce Project Schedule Management: time is an unforgiving constraint.',
            'Walk through the Project Triple Constraint (Scope, Time, Cost).',
            'Explain why scheduling failures are the #1 cause of project conflict and cost overruns.',
            'Define the core building blocks: Activity, Duration, Predecessor, and Milestone.',
          ]}
          audiencePrompt="Why is time considered the least flexible constraint in a university software rollout?"
        />

        {/* Core Conceptual Foundation Layout (Clean White Floating Cards on Warm Neutral) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Definition */}
          <div className="p-6 rounded-xl bg-white border border-border shadow-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-ink-muted block mb-3">
                01 / DEFINITION
              </span>
              <h3 className="font-bold text-lg text-ink-primary mb-2">
                What is Schedule Management?
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                The Project Management Body of Knowledge (PMBOK®) defines Schedule Management as the processes required to manage the timely completion of the project. It provides the structured approach for defining work, determining sequence, estimating durations, and maintaining progress control.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-ink-secondary font-medium flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-ink-primary" />
              <span>PMBOK Chapter 6 Standard</span>
            </div>
          </div>

          {/* Card 2: The Triple Constraint */}
          <div className="p-6 rounded-xl bg-white border border-border shadow-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-ink-muted block mb-3">
                02 / REALITY
              </span>
              <h3 className="font-bold text-lg text-ink-primary mb-2">
                The Triple Constraint Reality
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Every project balances <strong>Scope</strong>, <strong>Time</strong>, and <strong>Cost</strong>. While budget can be adjusted and scope can be negotiated, time flows at an immutable rate. Unrealistic schedule promises inevitably force compromises in system architecture and quality.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-critical font-medium flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-critical" />
              <span>Time Cannot Be Stored or Reused</span>
            </div>
          </div>

          {/* Card 3: Four Schedule Elements */}
          <div className="p-6 rounded-xl bg-white border border-border shadow-xs flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-ink-muted block mb-3">
                03 / PRIMITIVES
              </span>
              <h3 className="font-bold text-lg text-ink-primary mb-2">
                The 4 Scheduling Primitives
              </h3>
              <ul className="text-xs sm:text-sm text-ink-secondary space-y-2 mt-2 leading-relaxed">
                <li><strong className="text-ink-primary">Activity:</strong> Discrete, measurable piece of work with an owner.</li>
                <li><strong className="text-ink-primary">Duration:</strong> The elapsed work periods required for completion.</li>
                <li><strong className="text-ink-primary">Predecessors:</strong> Logical prerequisites that must finish first.</li>
                <li><strong className="text-ink-primary">Milestones:</strong> Zero-duration markers of major achievement.</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-success font-medium flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Deterministic Model Foundation</span>
            </div>
          </div>
        </div>

        {/* Editorial Deep Dive: WBS Deliverables vs Schedule Activities */}
        <div className="rounded-xl border border-border bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl mb-6">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
              Decomposition Distinction
            </span>
            <h4 className="text-xl font-bold text-ink-primary mt-1">
              WBS Work Packages vs. Schedule Activities
            </h4>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1 leading-relaxed">
              A critical PMBOK distinction: A Work Breakdown Structure (WBS) decomposes scope into tangible deliverables. Schedule management decomposes those deliverables into sequenceable work activities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-lg bg-warm border border-border">
              <div className="flex items-center space-x-2 text-ink-primary font-bold mb-2">
                <Layers className="w-4 h-4 text-ink-secondary" />
                <span>WBS Work Package (Deliverable-Oriented)</span>
              </div>
              <p className="text-ink-secondary leading-relaxed">
                Describes <em>what</em> will be produced. Noun-oriented (e.g., &ldquo;1.3 Student Registration Subsystem&rdquo;). Work packages do not have start or finish dates; they are accounting and scope boundaries.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-warm border border-border">
              <div className="flex items-center space-x-2 text-ink-primary font-bold mb-2">
                <Calendar className="w-4 h-4 text-brand" />
                <span>Schedule Activity (Action-Oriented)</span>
              </div>
              <p className="text-ink-secondary leading-relaxed">
                Describes <em>how</em> work is executed. Verb-oriented (e.g., &ldquo;Develop Backend Authentication APIs&rdquo;). Has estimated duration, assigned resources, predecessors, and calendar start/finish boundaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
