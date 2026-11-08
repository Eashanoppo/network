import React from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { ProjectControlBar } from '../../project/ProjectControlBar';
import { ActivityManagementStudio } from '../../project/ActivityManagementStudio';
import { HeroNetworkVisualizer } from './HeroNetworkVisualizer';
import {
  Clock,
  Sparkles,
  GitBranch,
  Calendar,
  Layers,
  ArrowRight,
  GraduationCap,
  Sliders,
  Calculator,
  Compass,
  TrendingUp,
  Network,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  const {
    baselineSchedule,
    goToChapter,
    isModified,
    resetToBaseline,
  } = useSchedule();

  // Six concise visual feature items
  const visualCapabilities = [
    {
      num: '01',
      title: 'Schedule Management',
      desc: 'PMBOK 6-process framework balancing scope, time, and resources.',
      chapter: 2,
      id: 'chapter-02',
      icon: Compass,
      tag: 'Framework',
    },
    {
      num: '02',
      title: 'Dependencies & PDM',
      desc: 'FS, SS, FF, and SF precedence links with lead, lag, and hard/soft logic.',
      chapter: 4,
      id: 'chapter-04',
      icon: GitBranch,
      tag: 'Logic',
    },
    {
      num: '03',
      title: 'Network Diagram (AON)',
      desc: 'Topological graph visualizing parallel branches and merge points.',
      chapter: 5,
      id: 'chapter-05',
      icon: Network,
      tag: 'Topology',
    },
    {
      num: '04',
      title: 'Critical Path (CPM)',
      desc: 'Forward and backward passes calculating early/late dates and float slack.',
      chapter: 6,
      id: 'chapter-06',
      icon: Calculator,
      tag: 'Math Engine',
    },
    {
      num: '05',
      title: 'Gantt Chart Studio',
      desc: 'Time-scaled calendar execution with dependency links and milestones.',
      chapter: 7,
      id: 'chapter-07',
      icon: BarChart3,
      tag: 'Execution',
    },
    {
      num: '06',
      title: 'PERT Beta Estimation',
      desc: 'Probabilistic three-point modeling (O+4M+P)/6 with variance ranges.',
      chapter: 8,
      id: 'chapter-08',
      icon: TrendingUp,
      tag: 'Risk Modeling',
    },
  ];

  return (
    <section id="chapter-01" className="w-full bg-white pt-6 pb-16 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION A — HERO */}
        <div className="py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-warm text-ink-secondary text-xs font-medium border border-border mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-brand" />
              <span>Interactive Presentation Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-ink-primary tracking-tight leading-[1.08] font-sans">
              Plan smarter.<br />
              Schedule with confidence.
            </h1>

            <p className="mt-3 text-sm sm:text-base text-ink-secondary max-w-md leading-relaxed">
              Explore project scheduling through a living, interactive network.
            </p>

            {/* Action CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('chapter-02');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else goToChapter(2);
                }}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs flex items-center justify-center space-x-2 min-h-[42px]"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const simSection = document.getElementById('section-simulations');
                  if (simSection) simSection.scrollIntoView({ behavior: 'smooth' });
                  else goToChapter(6);
                }}
                className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-ink-primary hover:bg-warm border border-border transition-colors flex items-center justify-center space-x-2 min-h-[42px]"
              >
                <Sliders className="w-4 h-4 text-ink-secondary" />
                <span>Try Simulation Lab</span>
              </button>
            </div>

            {/* Dual Perspective Axiom */}
            <div className="mt-8 pt-5 border-t border-border flex items-center gap-4 text-xs text-ink-secondary">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-ink-primary" />
                <span className="font-semibold text-ink-primary">Network Diagram:</span>
                <span>Logic</span>
              </div>
              <span className="text-ink-muted">&bull;</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-brand" />
                <span className="font-semibold text-ink-primary">Gantt Chart:</span>
                <span>Calendar</span>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Live Hero Network Visualizer */}
          <div className="lg:col-span-7">
            <HeroNetworkVisualizer />
          </div>
        </div>

        {/* SECTION A.2 — DYNAMIC PROJECT CONTROL BAR */}
        <div className="mt-4">
          <ProjectControlBar />
        </div>

        {/* SECTION B — VISUAL CAPABILITIES (CLEAN EDITORIAL GRID) */}
        <div className="mt-14 pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Visual Capabilities
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-ink-primary mt-1 tracking-tight">
                Six dimensions of schedule engineering
              </h2>
            </div>
            <p className="text-xs text-ink-secondary max-w-sm">
              All views synchronize dynamically via the shared CPM calculation engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visualCapabilities.map(cap => {
              const IconComp = cap.icon;
              return (
                <div
                  key={cap.num}
                  onClick={() => {
                    const el = document.getElementById(cap.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else goToChapter(cap.chapter);
                  }}
                  className="p-4 rounded-xl border border-border bg-warm hover:bg-surface-secondary hover:border-ink-secondary transition-all cursor-pointer flex items-start space-x-3.5 group shadow-xs"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform shadow-xs">
                    <IconComp className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-ink-primary group-hover:text-brand transition-colors">
                        {cap.title}
                      </h3>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white text-ink-muted border border-border">
                        {cap.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-secondary leading-snug">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION C — ACTIVITY MANAGEMENT STUDIO */}
        <div className="mt-14 pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Activity Studio
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-ink-primary mt-0.5 tracking-tight">
                Work package breakdown &amp; activity management
              </h2>
            </div>
            <p className="text-xs text-ink-secondary">
              Inline CPM calculations update instantly upon modifying durations or predecessors.
            </p>
          </div>
          <ActivityManagementStudio />
        </div>

        {/* 5-MEMBER TEAM PRESENTATION MAPPING */}
        <div className="mt-14 pt-12 border-t border-border">
          <div className="rounded-xl border border-border bg-warm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-ink-muted">
                  University Management System Case &bull; {baselineSchedule.projectDuration} Workdays Baseline
                </span>
                <h3 className="text-lg font-bold text-ink-primary mt-0.5">
                  5-Speaker Presentation Flow &amp; Responsibilities
                </h3>
              </div>

              {isModified && (
                <button
                  onClick={resetToBaseline}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-white border border-border hover:bg-warm text-ink-primary transition-colors self-start sm:self-auto"
                >
                  Reset Baseline ({baselineSchedule.projectDuration}d)
                </button>
              )}
            </div>

            {/* 5-Member Delivery Architecture Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4">
              {[
                { member: 'Member 1', role: 'Speaker 1', title: 'Schedule Processes', scope: 'Ch 02 & 03', chapter: 2 },
                { member: 'Member 2', role: 'Speaker 2', title: 'Dependencies & Logic', scope: 'Ch 04', chapter: 4 },
                { member: 'Member 3', role: 'Speaker 3', title: 'Network Diagram', scope: 'Ch 05', chapter: 5 },
                { member: 'Member 4', role: 'Speaker 4', title: 'Critical Path (CPM)', scope: 'Ch 06', chapter: 6 },
                { member: 'Member 5', role: 'Speaker 5', title: 'Gantt & Synthesis', scope: 'Ch 07 & 08', chapter: 7 },
              ].map(m => (
                <div
                  key={m.member}
                  onClick={() => goToChapter(m.chapter)}
                  className="p-3 rounded-lg bg-white border border-border hover:border-ink-secondary transition-all cursor-pointer flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-primary">{m.member}</span>
                      <span className="text-[9px] font-mono text-ink-muted">{m.role}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-ink-secondary mt-0.5 truncate">{m.title}</div>
                  </div>
                  <div className="mt-2.5 pt-1.5 border-t border-border flex items-center justify-between text-[10px] text-ink-muted">
                    <span>{m.scope}</span>
                    <ArrowRight className="w-3 h-3 text-brand" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
