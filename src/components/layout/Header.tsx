import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../data/educationalContent';
import { ProjectSwitcher } from '../project/ProjectSwitcher';
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
    baselineSchedule,
    viewMode,
    setViewMode,
    activeSimulation,
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

  // Clean single-column dropdown items matching Bland.ai style
  const curriculumItems = [
    { num: 1, id: 'chapter-01', title: '01 Overview & WBS Scope' },
    { num: 2, id: 'chapter-02', title: '02 Schedule Management' },
    { num: 3, id: 'chapter-03', title: '03 Six PMBOK Processes' },
    { num: 4, id: 'chapter-04', title: '04 Dependencies & PDM' },
    { num: 5, id: 'chapter-05', title: '05 Network Diagram (AON)' },
    { num: 6, id: 'chapter-06', title: '06 Critical Path Studio' },
    { num: 7, id: 'chapter-07', title: '07 Gantt Chart Studio' },
    { num: 8, id: 'chapter-08', title: '08 PERT Estimator' },
    { num: 9, id: 'chapter-09', title: '09 Knowledge Check Quiz' },
  ];

  const studioMenuItems = [
    { id: 'section-activity-studio', chapterNum: 1, name: 'Activity Studio' },
    { id: 'chapter-05', chapterNum: 5, name: 'AON Network Canvas' },
    { id: 'chapter-06', chapterNum: 6, name: 'Critical Path Studio' },
    { id: 'chapter-07', chapterNum: 7, name: 'Gantt Chart Studio' },
    { id: 'section-simulations', chapterNum: 6, name: 'Simulation Lab' },
    { id: 'chapter-08', chapterNum: 8, name: 'PERT Estimator' },
    { id: 'chapter-09', chapterNum: 9, name: 'Mastery Quiz' },
  ];

  // Interactive Studios items for mobile drawer
  const studioItems = [
    {
      id: 'section-activity-studio',
      chapterNum: 1,
      icon: Layers,
      name: 'Activity Management Studio',
      tag: 'Multi-Project Editor',
    },
    {
      id: 'chapter-05',
      chapterNum: 5,
      icon: Network,
      name: 'AON Network Canvas',
      tag: 'Vector Graph',
    },
    {
      id: 'chapter-06',
      chapterNum: 6,
      icon: Calculator,
      name: 'Critical Path Studio',
      tag: 'Calculation Table',
    },
    {
      id: 'chapter-07',
      chapterNum: 7,
      icon: BarChart3,
      name: 'Gantt Chart Studio',
      tag: 'Dual Timeline',
    },
    {
      id: 'section-simulations',
      chapterNum: 6,
      icon: Sliders,
      name: 'Delay Simulation Lab',
      tag: 'Scenario Stress Test',
    },
    {
      id: 'chapter-08',
      chapterNum: 8,
      icon: TrendingUp,
      name: 'PERT Beta Estimator',
      tag: 'Three-Point Model',
    },
    {
      id: 'chapter-09',
      chapterNum: 9,
      icon: Sparkles,
      name: 'Mastery Exam & Challenge',
      tag: 'Interactive Quiz',
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

      {/* Desktop Dropdown Dismiss Scrim */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px] hidden lg:block"
          onClick={() => setActiveDropdown(null)}
          aria-hidden="true"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity (Bland.ai clean brand style) */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => scrollTo('chapter-01', 1)}
          >
            <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-bold text-xs tracking-tight">
              <span>PM</span>
            </div>
            <span className="font-bold text-black tracking-tight text-sm sm:text-base">
              PM Project Schedule
            </span>
          </div>

          {/* Desktop Navigation (Bland.ai clean style) */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center space-x-1 text-xs font-medium text-ink-secondary"
            aria-label="Main Navigation"
          >
            {/* Overview Quick Link */}
            <button
              onClick={() => scrollTo('chapter-01', 1)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSectionId === 'chapter-01'
                  ? 'text-ink-primary bg-warm font-semibold'
                  : 'hover:text-ink-primary hover:bg-warm/60'
              }`}
            >
              Overview
            </button>

            {/* Curriculum Dropdown - Single column vertical list (Bland.ai style) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownHover('curriculum')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                onClick={() => toggleDropdown('curriculum')}
                aria-expanded={activeDropdown === 'curriculum'}
                aria-haspopup="true"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
                  activeDropdown === 'curriculum' || (activeSectionId.startsWith('chapter-') && activeSectionId !== 'chapter-01')
                    ? 'text-ink-primary bg-warm font-semibold'
                    : 'hover:text-ink-primary hover:bg-warm/60'
                }`}
              >
                <span>Curriculum</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    activeDropdown === 'curriculum' ? 'rotate-180 text-ink-primary' : 'text-ink-muted'
                  }`}
                />
              </button>

              <div
                style={{ backgroundColor: '#ffffff' }}
                className={`absolute top-full left-0 mt-1.5 w-60 bg-white border border-border rounded-lg shadow-lg py-1.5 z-[60] transition-all duration-150 transform ${
                  activeDropdown === 'curriculum'
                    ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                    : 'opacity-0 -translate-y-1 pointer-events-none invisible'
                }`}
              >
                {curriculumItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id, item.num)}
                    className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      activeSectionId === item.id
                        ? 'text-ink-primary font-semibold bg-warm'
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-warm'
                    }`}
                  >
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Studios Dropdown - Single column vertical list (Bland.ai style) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownHover('studios')}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                onClick={() => toggleDropdown('studios')}
                aria-expanded={activeDropdown === 'studios'}
                aria-haspopup="true"
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
                  activeDropdown === 'studios' || activeSectionId === 'section-simulations'
                    ? 'text-ink-primary bg-warm font-semibold'
                    : 'hover:text-ink-primary hover:bg-warm/60'
                }`}
              >
                <span>Studios</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    activeDropdown === 'studios' ? 'rotate-180 text-ink-primary' : 'text-ink-muted'
                  }`}
                />
              </button>

              <div
                style={{ backgroundColor: '#ffffff' }}
                className={`absolute top-full left-0 mt-1.5 w-52 bg-white border border-border rounded-lg shadow-lg py-1.5 z-[60] transition-all duration-150 transform ${
                  activeDropdown === 'studios'
                    ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                    : 'opacity-0 -translate-y-1 pointer-events-none invisible'
                }`}
              >
                {studioMenuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id, item.chapterNum)}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-ink-secondary hover:text-ink-primary hover:bg-warm transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Quick Link */}
            <button
              onClick={() => scrollTo('section-faq')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSectionId === 'section-faq'
                  ? 'text-ink-primary bg-warm font-semibold'
                  : 'hover:text-ink-primary hover:bg-warm/60'
              }`}
            >
              FAQ
            </button>
          </nav>

          {/* Clean Status & Action Controls (Bland.ai right-side style) */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Desktop Project Switcher */}
            <div className="hidden md:block">
              <ProjectSwitcher variant="header" />
            </div>

            {/* Live Duration Badge */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
                schedule.projectDuration > 18
                  ? 'bg-critical-light text-critical border-critical-border'
                  : 'bg-warm text-ink-primary border-border'
              }`}
              title={`Project duration: ${schedule.projectDuration} workdays`}
            >
              <Clock className="w-3.5 h-3.5 text-ink-muted" />
              <span>{schedule.projectDuration}d</span>
            </div>

            {/* Presenter Mode Toggle (Outline button matching Bland.ai 'Try for free') */}
            <button
              onClick={togglePresenterMode}
              className={`hidden sm:flex px-3 py-1.5 rounded-md text-xs font-medium transition-colors items-center space-x-1.5 border ${
                presenterMode
                  ? 'bg-ink-primary text-white border-ink-primary'
                  : 'bg-white text-ink-primary border-border hover:bg-warm'
              }`}
              title="Toggle Classroom Presenter Stage bar"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Presenter</span>
            </button>

            {/* Reset Button (Only visible when schedule is modified) */}
            {isModified && (
              <button
                onClick={() => {
                  if (window.confirm(`Reset schedule back to approved baseline (${baselineSchedule.projectDuration} workdays)?`)) {
                    resetToBaseline();
                  }
                }}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center space-x-1"
                title={`Reset schedule back to baseline (${baselineSchedule.projectDuration} workdays)`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}

            {/* Primary Action Button (Solid black button matching Bland.ai 'Book a call') */}
            <button
              onClick={() => scrollTo('section-simulations', 6)}
              className="hidden sm:flex px-3.5 py-1.5 rounded-md text-xs font-semibold bg-ink-primary text-white hover:bg-ink-primary/90 shadow-xs transition-colors items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
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

          {/* Mobile Project Switcher */}
          <div className="pb-2 border-b border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
              Active Project
            </span>
            <ProjectSwitcher variant="inline" />
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
