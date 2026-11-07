import React from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import {
  Clock,
  Sparkles,
  GitBranch,
  Calendar,
  Layers,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Calculator,
  Compass,
  Activity as ActivityIcon,
} from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  const {
    schedule,
    selectedActivityId,
    setSelectedActivityId,
    goToChapter,
    isModified,
    resetToBaseline,
  } = useSchedule();

  const capabilities = [
    {
      num: '01',
      title: 'Project Schedule Management',
      desc: 'The 6 PMBOK lifecycle stages, activity decomposition from WBS deliverables, and the triple constraint balance.',
      chapter: 2,
      id: 'chapter-02',
    },
    {
      num: '02',
      title: 'Dependency Analysis',
      desc: 'Mandatory, discretionary, external, and internal logic alongside FS, SS, FF, and SF relationship types with lead and lag.',
      chapter: 4,
      id: 'chapter-04',
    },
    {
      num: '03',
      title: 'Network Diagram (AON)',
      desc: 'Activity-on-Node precedence graph illustrating structural logic, parallel concurrency, and downstream merge points.',
      chapter: 5,
      id: 'chapter-05',
    },
    {
      num: '04',
      title: 'Critical Path Method (CPM)',
      desc: 'Inclusive workday forward and backward passes, calculating ES, EF, LS, LF, total float, and free float.',
      chapter: 6,
      id: 'chapter-06',
    },
    {
      num: '05',
      title: 'Gantt Chart Studio',
      desc: 'Calendar execution timeline, planned vs actual progress tracking, milestone diamonds, and float buffer bars.',
      chapter: 7,
      id: 'chapter-07',
    },
    {
      num: '06',
      title: 'PERT Three-Point Estimation',
      desc: 'Probabilistic Beta-weighted duration modeling using optimistic, most likely, and pessimistic estimates.',
      chapter: 8,
      id: 'chapter-08',
    },
  ];

  return (
    <section id="chapter-01" className="w-full bg-white pt-6 pb-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION A — HERO */}
        <div className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-warm text-ink-secondary text-xs font-medium border border-border mb-6">
              <GraduationCap className="w-3.5 h-3.5 text-ink-primary" />
              <span>Academic Presentation Suite &bull; Software Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-primary tracking-tight leading-[1.08] font-sans">
              Plan smarter.<br />
              Schedule with confidence.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-ink-secondary max-w-xl leading-relaxed">
              Explore project scheduling through interactive network diagrams, critical path calculations, Gantt charts, precedence dependencies, and real-time schedule simulations.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('chapter-02');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else goToChapter(2);
                }}
                className="px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs flex items-center space-x-2"
              >
                <span>Explore the platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const simSection = document.getElementById('section-simulations');
                  if (simSection) simSection.scrollIntoView({ behavior: 'smooth' });
                  else goToChapter(6);
                }}
                className="px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-white text-ink-primary hover:bg-warm border border-border transition-colors flex items-center space-x-2"
              >
                <Sliders className="w-4 h-4 text-ink-secondary" />
                <span>Try interactive simulations</span>
              </button>
            </div>

            {/* Dual Perspective Axiom */}
            <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-ink-secondary">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-ink-primary"></span>
                <strong className="text-ink-primary">Network Diagram:</strong>
                <span>What depends on what? (Logic)</span>
              </div>
              <span className="hidden sm:inline text-ink-muted">&bull;</span>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                <strong className="text-ink-primary">Gantt Chart:</strong>
                <span>When does it happen? (Calendar)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Application Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
              {/* Mock Application Window Header */}
              <div className="bg-warm px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E6DE] border border-[#D8D9D4]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E6DE] border border-[#D8D9D4]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E6DE] border border-[#D8D9D4]"></span>
                  <span className="ml-2 font-mono text-[11px] text-ink-muted">cpm-engine://live-model</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white text-ink-secondary border border-border">
                  Deterministic CPM
                </span>
              </div>

              {/* Application Preview Content */}
              <div className="p-5 space-y-4">
                {/* Primary Vital Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-warm border border-border">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                      Project Duration
                    </span>
                    <span className="text-xl font-bold font-mono text-ink-primary mt-0.5 block">
                      {schedule.projectDuration} Workdays
                    </span>
                    <span className="text-[10px] text-ink-secondary">Inclusive standard (1..18)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-warm border border-border">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                      Critical Path
                    </span>
                    <span className="text-base font-bold font-mono text-critical mt-0.5 block truncate">
                      {schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ')}
                    </span>
                    <span className="text-[10px] text-ink-secondary">Zero total slack</span>
                  </div>
                </div>

                {/* Interactive Mini-Topology Node Matrix */}
                <div className="p-3.5 rounded-lg border border-border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ink-primary">Interactive Topology Nodes</span>
                    <span className="text-[10px] text-ink-muted">Select node to inspect</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {schedule.activityList.map(act => {
                      const isSelected = selectedActivityId === act.id;
                      return (
                        <button
                          key={act.id}
                          onClick={() => setSelectedActivityId(act.id)}
                          className={`p-2 rounded-md border text-left transition-all ${
                            isSelected
                              ? 'bg-ink-primary text-white border-ink-primary'
                              : act.isCritical
                              ? 'bg-critical-light/40 border-critical-border text-ink-primary hover:border-critical'
                              : 'bg-warm border-border text-ink-primary hover:border-ink-secondary'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs">{act.id}</span>
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-ink-secondary'}`}>
                              {act.duration}d
                            </span>
                          </div>
                          <div className={`text-[10px] truncate mt-1 ${isSelected ? 'text-white/90' : 'text-ink-secondary'}`}>
                            {act.name}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
                            <span className={isSelected ? 'text-white/70' : 'text-ink-muted'}>
                              TF:{act.totalFloat}d
                            </span>
                            {act.isCritical && (
                              <span className={`font-semibold ${isSelected ? 'text-orange-400' : 'text-critical'}`}>
                                CRITICAL
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Activity Detail Pill */}
                {selectedActivityId && (
                  <div className="p-3 rounded-lg bg-warm border border-border text-xs flex items-center justify-between">
                    <div>
                      <span className="text-ink-muted text-[10px] block uppercase font-bold">Selected Node</span>
                      <strong className="text-ink-primary">
                        Activity {selectedActivityId} &bull; {schedule.activities[selectedActivityId]?.name}
                      </strong>
                    </div>
                    <div className="font-mono text-[11px] text-ink-secondary text-right">
                      <span>ES:{schedule.activities[selectedActivityId]?.es} EF:{schedule.activities[selectedActivityId]?.ef}</span>
                      <br />
                      <span>LS:{schedule.activities[selectedActivityId]?.ls} LF:{schedule.activities[selectedActivityId]?.lf}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B — PLATFORM CAPABILITIES (EDITORIAL GRID) */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary mt-1 tracking-tight">
              Six dimensions of project schedule engineering
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-secondary leading-relaxed">
              Every module is dynamically synchronized through an authoritative reactive scheduling engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map(cap => (
              <div
                key={cap.num}
                onClick={() => {
                  const el = document.getElementById(cap.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else goToChapter(cap.chapter);
                }}
                className="p-5 rounded-xl border border-border bg-warm hover:bg-surface-secondary hover:border-border-strong transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-ink-muted group-hover:text-ink-primary transition-colors">
                    {cap.num}
                  </span>
                  <h3 className="text-base font-bold text-ink-primary mt-2">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                    {cap.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-ink-secondary group-hover:text-ink-primary transition-colors">
                  <span>Explore capability</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CASE STUDY & 5-MEMBER TEAM PRESENTATION MAPPING */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="rounded-xl border border-border bg-warm p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-ink-primary border border-border">
                    Shared Benchmark Scenario
                  </span>
                  <span className="text-xs text-ink-secondary">6 Activities &bull; Baseline Duration: 18 Workdays</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-ink-primary mt-1.5">
                  Developing a University Management System
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-2xl leading-relaxed">
                  All five team members anchor their theoretical and quantitative presentations on this exact software deployment project.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {isModified && (
                  <button
                    onClick={resetToBaseline}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-border hover:bg-warm text-ink-primary transition-colors"
                  >
                    Reset to 18d Baseline
                  </button>
                )}
              </div>
            </div>

            {/* 5-Member Delivery Architecture Cards */}
            <div className="mt-6">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-3">
                5-Member Presentation Delegation
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  {
                    member: 'Member 1',
                    role: 'Speaker 1',
                    title: 'Schedule Processes',
                    scope: 'Chapters 02 & 03',
                    chapter: 2,
                  },
                  {
                    member: 'Member 2',
                    role: 'Speaker 2',
                    title: 'Dependencies & Logic',
                    scope: 'Chapter 04',
                    chapter: 4,
                  },
                  {
                    member: 'Member 3',
                    role: 'Speaker 3',
                    title: 'Network Diagram',
                    scope: 'Chapter 05',
                    chapter: 5,
                  },
                  {
                    member: 'Member 4',
                    role: 'Speaker 4',
                    title: 'Critical Path (CPM)',
                    scope: 'Chapter 06',
                    chapter: 6,
                  },
                  {
                    member: 'Member 5',
                    role: 'Speaker 5',
                    title: 'Gantt & Synthesis',
                    scope: 'Chapters 07 & 08',
                    chapter: 7,
                  },
                ].map(m => (
                  <div
                    key={m.member}
                    onClick={() => goToChapter(m.chapter)}
                    className="p-3.5 rounded-lg bg-white border border-border hover:border-ink-secondary transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-primary">{m.member}</span>
                        <span className="text-[10px] font-mono text-ink-muted">{m.role}</span>
                      </div>
                      <div className="text-xs font-semibold text-ink-secondary mt-1">{m.title}</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-ink-muted">
                      <span>{m.scope}</span>
                      <ArrowRight className="w-3 h-3 text-ink-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
