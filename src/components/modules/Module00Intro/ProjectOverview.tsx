import React from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import {
  Layers,
  GitBranch,
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  const { schedule, isModified, resetToBaseline, setSelectedActivityId, selectedActivityId } = useSchedule();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-8 pb-12 border-b border-border">
      {/* Hero Badge & Main Title */}
      <div className="text-center max-w-4xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold border border-brand-border mb-4">
          <GraduationCapIcon className="w-3.5 h-3.5" />
          <span>University Academic Presentation &bull; Software Engineering &amp; IT Management</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink-primary tracking-tight font-sans leading-tight">
          Project Schedule Management
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-brand font-medium">
          Network Diagrams &amp; Gantt Charts: From Logical Precedence to Time-Based Execution
        </p>
        <p className="mt-4 text-sm sm:text-base text-ink-secondary max-w-2xl mx-auto leading-relaxed">
          An interactive educational platform designed for a 5-member team presentation. Explore scheduling processes, dependency classifications, Activity-on-Node diagrams, Critical Path calculations, and synchronized Gantt chart timelines.
        </p>

        {/* Central Takeaway Pill */}
        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 bg-white px-5 py-3 rounded-xl border border-border shadow-card">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>
            <span className="text-xs font-bold text-ink-primary tracking-wide uppercase">Network Diagram:</span>
            <span className="text-xs font-semibold text-brand">What depends on what? (Project Logic)</span>
          </div>
          <span className="hidden sm:inline text-ink-muted">&bull;</span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
            <span className="text-xs font-bold text-ink-primary tracking-wide uppercase">Gantt Chart:</span>
            <span className="text-xs font-semibold text-success">When does each activity happen? (Timeline)</span>
          </div>
        </div>
      </div>

      {/* Shared Case Study Card: University Management System */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand bg-brand-light px-2.5 py-0.5 rounded border border-brand-border">
                Common Project Scenario
              </span>
              <span className="text-xs text-ink-muted">Shared Across All 5 Modules</span>
            </div>
            <h3 className="text-xl font-bold text-ink-primary mt-1">
              Developing a University Management System
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              All 5 team members utilize this exact 6-activity project. Any change in duration propagates dynamically across the entire application.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-canvas border border-border text-xs">
              <span className="text-ink-muted block text-[10px] uppercase font-semibold">Total Duration</span>
              <span className="font-mono font-bold text-ink-primary text-sm">{schedule.projectDuration} Workdays</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-canvas border border-border text-xs">
              <span className="text-ink-muted block text-[10px] uppercase font-semibold">Critical Path</span>
              <span className="font-mono font-bold text-critical text-sm">
                {schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ')}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-canvas border border-border text-xs">
              <span className="text-ink-muted block text-[10px] uppercase font-semibold">Activity C Slack</span>
              <span className="font-mono font-bold text-ink-primary text-sm">
                {schedule.activities['C']?.totalFloat ?? 0} Workday
              </span>
            </div>
          </div>
        </div>

        {/* 6 Activities Quick Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {schedule.activityList.map(act => {
            const isSelected = selectedActivityId === act.id;
            return (
              <div
                key={act.id}
                onClick={() => setSelectedActivityId(act.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-brand ring-2 ring-brand/20 bg-brand-light/30 shadow-subtle'
                    : act.isCritical
                    ? 'border-critical/30 bg-critical-light/20 hover:border-critical'
                    : 'border-border bg-canvas hover:border-brand-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm text-ink-primary">{act.id}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      act.isCritical
                        ? 'bg-critical-light text-critical'
                        : 'bg-white text-ink-secondary border border-border'
                    }`}
                  >
                    {act.duration}d
                  </span>
                </div>
                <div className="text-xs font-semibold text-ink-primary truncate" title={act.name}>
                  {act.name}
                </div>
                <div className="mt-1 text-[11px] text-ink-secondary font-mono flex items-center justify-between">
                  <span>Pred: {act.predecessors.length > 0 ? act.predecessors.join(', ') : 'None'}</span>
                  <span className={act.isCritical ? 'text-critical font-bold' : 'text-success font-semibold'}>
                    TF: {act.totalFloat}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Member Module Roadmap Cards */}
      <div>
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Collaborative Presentation Structure
          </span>
          <h3 className="text-lg font-bold text-ink-primary mt-0.5">
            Five Members, One Integrated Educational Platform
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              member: 'Member 1',
              title: 'Schedule Management',
              icon: <Layers className="w-4 h-4 text-brand" />,
              topics: '6 Core Processes, WBS decomposition, baseline definitions',
              interactive: 'Schedule Process Explorer & Output Pipeline',
              sectionId: 'module-01',
              accent: 'border-brand/40 hover:border-brand',
            },
            {
              member: 'Member 2',
              title: 'Activity Dependencies',
              icon: <GitBranch className="w-4 h-4 text-brand" />,
              topics: 'Mandatory vs Discretionary, FS / SS / FF / SF relationships',
              interactive: 'Relationship Lab & Dependency Classifier',
              sectionId: 'module-02',
              accent: 'border-brand/40 hover:border-brand',
            },
            {
              member: 'Member 3',
              title: 'Network Diagram',
              icon: <Sparkles className="w-4 h-4 text-brand" />,
              topics: 'Activity-on-Node (AON), parallel paths, merging nodes',
              interactive: 'Interactive SVG Network Diagram Explorer',
              sectionId: 'module-03',
              accent: 'border-brand/40 hover:border-brand',
            },
            {
              member: 'Member 4',
              title: 'Critical Path Method',
              icon: <Clock className="w-4 h-4 text-brand" />,
              topics: 'Forward pass, backward pass, ES/EF/LS/LF, Float/Slack',
              interactive: 'CPM Calculation Studio & Live Delay Simulator',
              sectionId: 'module-04',
              accent: 'border-critical/40 hover:border-critical',
            },
            {
              member: 'Member 5',
              title: 'Gantt Chart & Compare',
              icon: <Calendar className="w-4 h-4 text-brand" />,
              topics: 'Time-scaled bars, overlaps, Network vs Gantt synthesis',
              interactive: 'Gantt Chart Studio & Comparative Matrix',
              sectionId: 'module-05',
              accent: 'border-success/40 hover:border-success',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              onClick={() => scrollToSection(card.sectionId)}
              className={`bg-white rounded-lg border p-4 shadow-subtle hover:shadow-card transition-all cursor-pointer flex flex-col justify-between ${card.accent}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    {card.member}
                  </span>
                  <div className="p-1 rounded bg-canvas">{card.icon}</div>
                </div>
                <h4 className="font-bold text-sm text-ink-primary leading-snug">{card.title}</h4>
                <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed line-clamp-2">
                  {card.topics}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <div className="text-[11px] font-medium text-brand flex items-center justify-between">
                  <span>{card.interactive}</span>
                  <ArrowRight className="w-3 h-3 ml-1 shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

