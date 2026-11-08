import React, { useState } from 'react';
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
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const ScheduleManagementBasics: React.FC = () => {
  const chapter2 = CHAPTERS_DATA[1];
  const [activePrimitive, setActivePrimitive] = useState<'activity' | 'duration' | 'predecessor' | 'milestone'>('activity');
  const [showWbsComparison, setShowWbsComparison] = useState<boolean>(false);

  const primitives = [
    {
      id: 'activity' as const,
      name: 'Activity',
      badge: 'Action',
      desc: 'Discrete, assignable work package with a clear owner.',
      example: 'e.g., "Build Database Queries"',
    },
    {
      id: 'duration' as const,
      name: 'Duration',
      badge: 'Time',
      desc: 'Elapsed business workdays needed for completion.',
      example: 'e.g., 4 workdays (inclusive count)',
    },
    {
      id: 'predecessor' as const,
      name: 'Predecessor',
      badge: 'Logic',
      desc: 'Prerequisite activity that must be satisfied first.',
      example: 'e.g., Requirements (A) before System Design (B)',
    },
    {
      id: 'milestone' as const,
      name: 'Milestone',
      badge: 'Marker',
      desc: 'Zero-duration checkpoint representing major delivery.',
      example: 'e.g., "Go-Live Deployment"',
    },
  ];

  return (
    <section id="chapter-02" className="w-full bg-warm py-14 lg:py-16 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter2}
          tagline="Foundations &amp; The Triple Constraint"
        />

        <PresenterNotes
          member="Member 1 (Speaker 1)"
          timeAllocation="3 minutes"
          keyTakeaway="Time is the least flexible constraint in project management. Money and people can be scaled, but elapsed schedule days can never be recovered."
          talkingPoints={[
            'Introduce Project Schedule Management: time is an unforgiving constraint.',
            'Walk through the Project Triple Constraint (Scope, Time, Cost).',
            'Explain why scheduling failures are the #1 cause of project conflict and cost overruns.',
            'Define the core building blocks: Activity, Duration, Predecessor, and Milestone.',
          ]}
          audiencePrompt="Why is time considered the least flexible constraint in a university software rollout?"
        />

        {/* Visual Triple Constraint & Reality Hero Banner */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Concise Text */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                The Triple Constraint
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-ink-primary mt-1 tracking-tight">
                Time is the least flexible dimension
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Budget can be supplemented and scope can be adjusted, but elapsed workdays can never be stored or reused. Managing the schedule provides the critical backbone for timely project completion.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-warm text-ink-primary font-semibold border border-border flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand" />
                  <span>Scope: What gets built</span>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-critical-light text-critical font-semibold border border-critical-border flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-critical" />
                  <span>Time: Inflexible deadline</span>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-warm text-ink-secondary font-semibold border border-border flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-muted" />
                  <span>Cost: Financial budget</span>
                </span>
              </div>
            </div>

            {/* Right: Interactive Visual Triple Constraint Diagram */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[320px] aspect-square rounded-2xl bg-warm border border-border p-6 flex flex-col items-center justify-between relative shadow-xs">
                {/* Apex: Scope */}
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-ink-primary border border-border shadow-xs">
                    Scope
                  </span>
                  <span className="text-[10px] text-ink-muted block mt-0.5">Deliverables</span>
                </div>

                {/* Center Core: Quality & Risk */}
                <div className="w-24 h-24 rounded-full bg-white border-2 border-brand flex flex-col items-center justify-center text-center shadow-xs">
                  <Clock className="w-5 h-5 text-brand mb-0.5" />
                  <span className="text-xs font-bold text-ink-primary">Schedule</span>
                  <span className="text-[9px] text-ink-muted font-mono">Heartbeat</span>
                </div>

                {/* Bottom Row: Time & Cost */}
                <div className="w-full flex items-center justify-between">
                  <div className="text-center">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-critical text-white shadow-xs">
                      Time
                    </span>
                    <span className="text-[10px] text-critical font-medium block mt-0.5">Fixed Deadline</span>
                  </div>

                  <div className="text-center">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-ink-primary border border-border shadow-xs">
                      Cost
                    </span>
                    <span className="text-[10px] text-ink-muted block mt-0.5">Resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Scheduling Primitives (Interactive Visual Selector) */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                Deterministic Model Foundation
              </span>
              <h4 className="text-lg font-bold text-ink-primary mt-0.5">
                The 4 Scheduling Primitives
              </h4>
            </div>
            <span className="text-xs text-ink-secondary">
              Select an element to inspect its role in CPM calculation.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {primitives.map(prim => {
              const isSelected = activePrimitive === prim.id;
              return (
                <div
                  key={prim.id}
                  onClick={() => setActivePrimitive(prim.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-warm border-ink-primary ring-2 ring-ink-primary/10 shadow-xs'
                      : 'bg-white hover:bg-warm/60 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-ink-primary text-white' : 'bg-warm text-ink-muted'
                    }`}>
                      {prim.badge}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                  </div>

                  <h5 className="font-bold text-sm text-ink-primary">{prim.name}</h5>
                  <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                    {prim.desc}
                  </p>
                  <span className="text-[10px] font-mono text-ink-muted mt-2 block truncate">
                    {prim.example}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progressive Disclosure Toggle: WBS vs Schedule Activities */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={() => setShowWbsComparison(prev => !prev)}
              className="w-full flex items-center justify-between text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors py-1"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-brand" />
                <span>PMBOK Concept: WBS Deliverables vs. Schedule Activities</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showWbsComparison ? 'rotate-180' : ''}`} />
            </button>

            {showWbsComparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/60 text-xs animate-in fade-in duration-200">
                <div className="p-3.5 rounded-lg bg-warm border border-border">
                  <strong className="text-ink-primary block mb-1">WBS Work Package (Noun)</strong>
                  <p className="text-ink-secondary leading-relaxed">
                    Describes <em>what</em> is delivered (e.g., &ldquo;1.3 Student Registration Portal&rdquo;). Work packages represent scope boundaries without calendar start/finish dates.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-warm border border-border">
                  <strong className="text-ink-primary block mb-1">Schedule Activity (Verb)</strong>
                  <p className="text-ink-secondary leading-relaxed">
                    Describes <em>how</em> work is done (e.g., &ldquo;Develop Authentication API&rdquo;). Has duration, assigned resources, predecessors, and exact early/late dates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
