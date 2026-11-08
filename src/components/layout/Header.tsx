import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../data/educationalContent';
import {
  RotateCcw,
  Clock,
  Presentation,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sliders,
  Sparkles,
  Network,
  Calculator,
  BarChart3,
  TrendingUp,
  BookOpen,
  HelpCircle,
  ArrowRight,
  GitBranch,
  Layers,
  Activity,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

type DropdownType = 'curriculum' | 'studios' | null;

export const Header: React.FC = () => {
  const {
    schedule,
    isModified,
    resetToBaseline,
    presenterMode,
    togglePresenterMode,
    activeChapter,
    goToChapter,
  } = useSchedule();

  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileAccordion, setMobileAccordion] = useState<'curriculum' | 'studios' | null>('curriculum');
  const [activeSectionId, setActiveSectionId] = useState<string>('chapter-01');

  const navContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize active section and scroll progress bar
  useEffect(() => {
    const sectionIds = [
      'chapter-01',
      'chapter-02',
      'chapter-03',
      'chapter-04',
      'chapter-05',
      'chapter-06',
      'section-simulations',
      'chapter-07',
      'chapter-08',
      'chapter-09',
      'section-faq',
    ];

    const handleScroll = () => {
      // Auto-close any open desktop dropdown when user scrolls
      setActiveDropdown(null);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      const scrollPos = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSectionId(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Graceful hover handlers to prevent jittery dropdown transitions
  const handleDropdownHover = (type: DropdownType) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDropdown(type);
  };

  const handleDropdownLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleDropdown = (type: DropdownType) => {
    setActiveDropdown(prev => (prev === type ? null : type));
  };

  // Click outside and Escape key handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Smooth scroll handler
  const scrollTo = useCallback((id: string, chapterNum?: number) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    if (chapterNum !== undefined) {
      goToChapter(chapterNum);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [goToChapter]);

  // Curriculum columns mapping
  const curriculumColumns = [
    {
      groupTitle: 'Foundations',
      presenter: 'Presenter 1',
      duration: '7 min',
      chapters: [
        {
          num: 1,
          id: 'chapter-01',
          title: 'Overview & WBS Scope',
          subtitle: 'University case & baseline deliverables',
          badge: 'Scope',
        },
        {
          num: 2,
          id: 'chapter-02',
          title: 'Schedule Management',
          subtitle: 'Triple constraint & scheduling rationale',
          badge: 'Core',
        },
        {
          num: 3,
          id: 'chapter-03',
          title: 'Six PMBOK Processes',
          subtitle: 'Plan, Define, Sequence, Estimate, Develop, Control',
          badge: 'Workflow',
        },
      ],
    },
    {
      groupTitle: 'Precedence & CPM',
      presenter: 'Presenters 2–4',
      duration: '14 min',
      chapters: [
        {
          num: 4,
          id: 'chapter-04',
          title: 'Dependencies & PDM',
          subtitle: 'Mandatory vs Discretionary & FS, SS, FF, SF',
          badge: 'Logic',
        },
        {
          num: 5,
          id: 'chapter-05',
          title: 'Network Diagram (AON)',
          subtitle: 'Vector node topology & parallel paths',
          badge: 'Topology',
        },
        {
          num: 6,
          id: 'chapter-06',
          title: 'Critical Path Studio',
          subtitle: 'Forward/backward pass & slack calculation',
          badge: 'CPM Engine',
        },
      ],
    },
    {
      groupTitle: 'Execution & Risk',
      presenter: 'Presenter 5 & Team',
      duration: '11 min',
      chapters: [
        {
          num: 7,
          id: 'chapter-07',
          title: 'Gantt Chart Studio',
          subtitle: 'Time-scaled dual-bar calendar schedule',
          badge: 'Timeline',
        },
        {
          num: 8,
          id: 'chapter-08',
          title: 'PERT Estimator Studio',
          subtitle: 'Three-point beta distribution (O+4M+P)/6',
          badge: 'Risk Analysis',
        },
        {
          num: 9,
          id: 'chapter-09',
          title: 'Knowledge Check Quiz',
          subtitle: 'Interactive quiz & practical scenario test',
          badge: 'Assessment',
        },
      ],
    },
  ];

  // Interactive Studios items
  const studioItems = [
    {
      id: 'chapter-05',
      chapterNum: 5,
      icon: Network,
      name: 'AON Network Canvas',
      tag: 'Vector Graph',
      description: 'Interactive zoom/pan graph showing activity nodes, dependencies, and critical path glow.',
      highlight: true,
    },
    {
      id: 'chapter-06',
      chapterNum: 6,
      icon: Calculator,
      name: 'Critical Path Studio',
      tag: 'Calculation Table',
      description: 'Live table showing ES, EF, LS, LF, Total Float, Free Float with inline duration editing.',
      highlight: false,
    },
    {
      id: 'chapter-07',
      chapterNum: 7,
      icon: BarChart3,
      name: 'Gantt Chart Studio',
      tag: 'Dual Timeline',
      description: 'Time-scaled calendar schedule with early vs. late bars and concurrency visualization.',
      highlight: false,
    },
    {
      id: 'section-simulations',
      chapterNum: 6,
      icon: Sliders,
      name: 'Delay Simulation Lab',
      tag: 'Scenario Stress Test',
      description: 'One-click scenarios testing Activity C delays (dual critical paths at 4d, path shift at 5d).',
      highlight: true,
    },
    {
      id: 'chapter-08',
      chapterNum: 8,
      icon: TrendingUp,
      name: 'PERT Beta Estimator',
      tag: 'Three-Point Model',
      description: 'Probabilistic duration estimates with standard deviation, applying updates directly to schedule.',
      highlight: false,
    },
    {
      id: 'chapter-09',
      chapterNum: 9,
      icon: Sparkles,
      name: 'Mastery Exam & Challenge',
      tag: 'Interactive Quiz',
      description: 'Self-paced 5-question exam with instantaneous feedback and scenario challenge review.',
      highlight: false,
    },
  ];

  const hasMultipleCriticalPaths = schedule.criticalPaths.length > 1;

  return (
    <header
      style={{ backgroundColor: '#ffffff' }}
      className="sticky top-0 z-50 bg-white border-b border-border transition-all"
    >
      {/* Scroll progress bar - Minimal Amber/Orange Indicator */}
      <div className="h-[2px] bg-border-subtle w-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group select-none"
            onClick={() => scrollTo('chapter-01', 1)}
          >
            <div className="w-8 h-8 rounded-lg bg-ink-primary text-white flex items-center justify-center font-bold text-xs tracking-tight transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs">
              <span className="font-mono">PM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand ml-0.5 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-ink-primary tracking-tight text-xs sm:text-base group-hover:text-brand transition-colors">
                  <span className="xs:hidden">PM Schedule</span>
                  <span className="hidden xs:inline sm:hidden">Project Schedule</span>
                  <span className="hidden sm:inline">Project Schedule Management</span>
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-warm text-ink-secondary border border-border">
                  Presentation Suite
                </span>
              </div>
              <p className="text-[11px] text-ink-muted hidden sm:block">
                Network Diagrams, CPM &amp; Gantt Charts
              </p>
            </div>
          </div>

          {/* Desktop Navigation with Submenus & Premium Motions */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center space-x-1 text-xs font-medium text-ink-secondary"
            aria-label="Main Navigation"
          >
            {/* Overview Quick Link */}
            <button
              onClick={() => scrollTo('chapter-01', 1)}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 ${
                activeSectionId === 'chapter-01'
                  ? 'text-ink-primary bg-warm font-semibold'
                  : 'hover:text-ink-primary hover:bg-warm/60'
              }`}
            >
              Overview
            </button>

            {/* Curriculum Mega-Menu Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownHover('curriculum')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                onClick={() => toggleDropdown('curriculum')}
                aria-expanded={activeDropdown === 'curriculum'}
                aria-haspopup="true"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-150 ${
                  activeDropdown === 'curriculum' || (activeSectionId.startsWith('chapter-') && activeSectionId !== 'chapter-01')
                    ? 'text-ink-primary bg-warm font-semibold'
                    : 'hover:text-ink-primary hover:bg-warm/60'
                }`}
              >
                <span>Curriculum</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'curriculum' ? 'rotate-180 text-brand' : 'text-ink-muted'
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel */}
              <div
                style={{ backgroundColor: '#ffffff' }}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[760px] max-w-[calc(100vw-2rem)] bg-white border border-border rounded-xl shadow-2xl shadow-black/10 p-5 z-50 transition-all duration-200 ease-out transform ${
                  activeDropdown === 'curriculum'
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
                }`}
              >
                {/* 3 Pillars of Presentation */}
                <div className="grid grid-cols-3 gap-4 pb-4">
                  {curriculumColumns.map((col, idx) => (
                    <div
                      key={col.groupTitle}
                      className={`space-y-2.5 ${idx < 2 ? 'border-r border-border/70 pr-4' : ''}`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                          {col.groupTitle}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-warm text-ink-secondary">
                          {col.duration}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-brand-dark flex items-center space-x-1">
                        <span>{col.presenter}</span>
                      </div>

                      <div className="space-y-1">
                        {col.chapters.map(ch => {
                          const isActive = activeSectionId === ch.id;
                          return (
                            <button
                              key={ch.id}
                              onClick={() => scrollTo(ch.id, ch.num)}
                              className={`w-full text-left p-2 rounded-lg transition-all duration-150 group flex items-start space-x-2 ${
                                isActive
                                  ? 'bg-warm border border-border font-medium'
                                  : 'hover:bg-warm/80 hover:border hover:border-border/50'
                              }`}
                            >
                              <span className="font-mono text-[10px] text-ink-muted pt-0.5 group-hover:text-brand transition-colors">
                                {ch.num < 10 ? `0${ch.num}` : ch.num}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-ink-primary truncate group-hover:text-brand transition-colors">
                                  {ch.title}
                                </div>
                                <div className="text-[10px] text-ink-secondary truncate">
                                  {ch.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submenu Bottom Ribbon */}
                <div
                  style={{ backgroundColor: '#F4F5F0' }}
                  className="bg-warm border-t border-border -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 text-ink-secondary">
                    <BookOpen className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[11px]">
                      5-Speaker Classroom Presentation • PMBOK 7th Ed. Aligned • Dynamic 18d Baseline
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      if (!presenterMode) togglePresenterMode();
                    }}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-brand hover:text-brand-hover transition-colors"
                  >
                    <span>{presenterMode ? 'Presenter Active' : 'Start Presentation Stage'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Studios Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownHover('studios')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                onClick={() => toggleDropdown('studios')}
                aria-expanded={activeDropdown === 'studios'}
                aria-haspopup="true"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-150 ${
                  activeDropdown === 'studios' || activeSectionId === 'section-simulations'
                    ? 'text-ink-primary bg-warm font-semibold'
                    : 'hover:text-ink-primary hover:bg-warm/60'
                }`}
              >
                <span>Studios</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-light text-brand">
                  5 Tools
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'studios' ? 'rotate-180 text-brand' : 'text-ink-muted'
                  }`}
                />
              </button>

              {/* Studios Dropdown Panel */}
              <div
                style={{ backgroundColor: '#ffffff' }}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] max-w-[calc(100vw-2rem)] bg-white border border-border rounded-xl shadow-2xl shadow-black/10 p-4 z-50 transition-all duration-200 ease-out transform ${
                  activeDropdown === 'studios'
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-2 gap-2.5 pb-3">
                  {studioItems.map(item => {
                    const IconComponent = item.icon;
                    const isActive = activeSectionId === item.id;
                    return (
                      <button
                        key={item.name}
                        onClick={() => scrollTo(item.id, item.chapterNum)}
                        className={`text-left p-2.5 rounded-lg border transition-all duration-150 group flex items-start space-x-3 ${
                          isActive
                            ? 'bg-warm border-border font-medium shadow-xs'
                            : 'bg-white border-transparent hover:bg-warm/70 hover:border-border/60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 ${
                            item.highlight
                              ? 'bg-brand-light text-brand group-hover:bg-brand group-hover:text-white'
                              : 'bg-warm text-ink-primary group-hover:bg-ink-primary group-hover:text-white'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink-primary group-hover:text-brand transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-warm text-ink-secondary">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-secondary mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all self-center" />
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Studios Banner */}
                <div
                  style={{ backgroundColor: '#F4F5F0' }}
                  className="bg-warm border-t border-border -mx-4 -mb-4 px-4 py-2.5 rounded-b-xl flex items-center justify-between text-xs"
                >
                  <span className="text-[11px] text-ink-secondary">
                    All tools sync in real time via the shared CPM schedule engine.
                  </span>
                  <button
                    onClick={() => scrollTo('section-simulations', 6)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-brand hover:text-brand-hover transition-colors"
                  >
                    <span>Run Delay Simulation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ Quick Link */}
            <button
              onClick={() => scrollTo('section-faq')}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 ${
                activeSectionId === 'section-faq'
                  ? 'text-ink-primary bg-warm font-semibold'
                  : 'hover:text-ink-primary hover:bg-warm/60'
              }`}
            >
              FAQ
            </button>
          </nav>

          {/* Status Indicators & Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Live Duration Pill with Critical Path Status */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-colors ${
                schedule.projectDuration > 18
                  ? 'bg-critical-light text-critical border-critical-border'
                  : 'bg-warm text-ink-primary border-border'
              }`}
              title={`Calculated project duration: ${schedule.projectDuration} workdays (${schedule.criticalPaths.length} critical path${schedule.criticalPaths.length > 1 ? 's' : ''})`}
            >
              <Clock className="w-3.5 h-3.5 text-ink-secondary" />
              <span>{schedule.projectDuration}d</span>
              {hasMultipleCriticalPaths && (
                <span className="hidden sm:inline-flex text-[9px] px-1 py-0.2 rounded bg-warning-light text-warning font-sans font-bold border border-warning-border">
                  2 Paths
                </span>
              )}
            </div>

            {/* Presenter Mode Toggle (Visible on tablet & desktop; available in mobile drawer) */}
            <button
              onClick={togglePresenterMode}
              className={`hidden sm:flex px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 items-center space-x-1.5 border ${
                presenterMode
                  ? 'bg-ink-primary text-white border-ink-primary shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border-border hover:bg-warm'
              }`}
              title="Toggle Classroom Presenter Stage bar"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Presenter</span>
            </button>

            {/* Reset Button (Visible when schedule is modified) */}
            {isModified ? (
              <button
                onClick={resetToBaseline}
                className="px-2 py-1 rounded-md text-xs font-semibold text-warning bg-warning-light border border-warning-border hover:bg-warning/20 transition-all flex items-center space-x-1 animate-pulse"
                title="Reset schedule back to baseline 18 workdays"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            ) : (
              <div className="hidden xl:flex items-center space-x-1 text-[11px] text-success font-medium bg-success-light px-2 py-0.5 rounded border border-success-border">
                <CheckCircle2 className="w-3 h-3" />
                <span>Baseline</span>
              </div>
            )}

            {/* Primary Action Button - Restrained Amber CTA (Available on tablet/desktop & in mobile drawer) */}
            <button
              onClick={() => scrollTo('section-simulations', 6)}
              className="hidden sm:flex px-3 py-1.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-xs transition-all duration-150 items-center space-x-1.5 group"
            >
              <Sliders className="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-12" />
              <span>Simulations</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-warm border border-border transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Accordion Submenus */}
      {mobileMenuOpen && (
        <div
          style={{ backgroundColor: '#ffffff' }}
          className="lg:hidden bg-white border-b border-border px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-4.5rem)] overflow-y-auto"
        >
          {/* Quick Actions Row */}
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-ink-primary">
                {schedule.projectDuration} Workdays
              </span>
              {isModified && (
                <button
                  onClick={resetToBaseline}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-warning bg-warning-light border border-warning-border"
                >
                  Reset Baseline
                </button>
              )}
            </div>
            <button
              onClick={togglePresenterMode}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                presenterMode ? 'bg-ink-primary text-white' : 'bg-warm text-ink-primary'
              }`}
            >
              Presenter Mode: {presenterMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Mobile Accordion 1: Curriculum */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setMobileAccordion(prev => (prev === 'curriculum' ? null : 'curriculum'))}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-warm/80 text-xs font-bold text-ink-primary"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-brand" />
                <span>Curriculum Modules (9 Chapters)</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-ink-secondary transition-transform duration-200 ${
                  mobileAccordion === 'curriculum' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileAccordion === 'curriculum' && (
              <div className="p-2 space-y-1 max-h-60 overflow-y-auto bg-white">
                {CHAPTERS_DATA.map(ch => {
                  const isCurrent = activeChapter === ch.number;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => scrollTo(ch.id, ch.number)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                        isCurrent
                          ? 'bg-ink-primary text-white font-medium'
                          : 'text-ink-primary hover:bg-warm'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-mono text-[10px] opacity-70">
                          {ch.number < 10 ? `0${ch.number}` : ch.number}
                        </span>
                        <span className="truncate">{ch.title}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ml-2 ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-warm text-ink-secondary'
                        }`}
                      >
                        {ch.member}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Accordion 2: Interactive Studios */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setMobileAccordion(prev => (prev === 'studios' ? null : 'studios'))}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-warm/80 text-xs font-bold text-ink-primary"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-brand" />
                <span>Interactive Studios (6 Tools)</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-ink-secondary transition-transform duration-200 ${
                  mobileAccordion === 'studios' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileAccordion === 'studios' && (
              <div className="p-2 grid grid-cols-1 gap-1 bg-white">
                {studioItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => scrollTo(item.id, item.chapterNum)}
                      className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-left hover:bg-warm transition-colors"
                    >
                      <div className="w-6 h-6 rounded bg-brand-light text-brand flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-ink-primary truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-ink-secondary truncate">
                          {item.tag}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Mobile Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => scrollTo('chapter-01', 1)}
              className="px-3 py-2.5 rounded-md text-xs font-semibold text-center text-ink-primary bg-warm hover:bg-border transition-colors min-h-[44px]"
            >
              Overview
            </button>
            <button
              onClick={() => scrollTo('section-faq')}
              className="px-3 py-2.5 rounded-md text-xs font-semibold text-center text-ink-primary bg-warm hover:bg-border transition-colors min-h-[44px]"
            >
              FAQ
            </button>
          </div>

          {/* Quick Simulation Launcher for Mobile */}
          <button
            onClick={() => scrollTo('section-simulations', 6)}
            className="w-full py-2.5 rounded-md text-xs font-bold text-center text-white bg-brand hover:bg-brand-hover shadow-xs flex items-center justify-center space-x-1.5 min-h-[44px]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch Delay Simulations (Scenario A &amp; B)</span>
          </button>
        </div>
      )}
    </header>
  );
};
