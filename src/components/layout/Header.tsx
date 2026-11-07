import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../data/educationalContent';
import {
  RotateCcw,
  Clock,
  Presentation,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

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

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [chapterDropdownOpen, setChapterDropdownOpen] = useState<boolean>(false);

  // Synchronize active chapter with scroll position
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentChapter = CHAPTERS_DATA[activeChapter - 1] || CHAPTERS_DATA[0];

  const handleSelectChapter = (num: number) => {
    goToChapter(num);
    setChapterDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Overview', chapter: 1, id: 'chapter-01' },
    { label: 'Processes', chapter: 3, id: 'chapter-03' },
    { label: 'Dependencies', chapter: 4, id: 'chapter-04' },
    { label: 'Network', chapter: 5, id: 'chapter-05' },
    { label: 'CPM', chapter: 6, id: 'chapter-06' },
    { label: 'Gantt', chapter: 7, id: 'chapter-07' },
    { label: 'Simulations', chapter: 6, id: 'section-simulations' },
    { label: 'PERT', chapter: 8, id: 'chapter-08' },
    { label: 'Quiz', chapter: 9, id: 'chapter-09' },
  ];

  const scrollToSection = (id: string, chapterNum: number) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      goToChapter(chapterNum);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
      {/* Scroll progress bar - Minimal Amber Indicator */}
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
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => goToChapter(1)}
          >
            <div className="w-8 h-8 rounded-lg bg-ink-primary text-white flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
              <span className="font-mono">PM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand ml-0.5"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-ink-primary tracking-tight text-sm sm:text-base">
                  Project Schedule Management
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-warm text-ink-secondary border border-border">
                  Academic Presentation Suite
                </span>
              </div>
              <p className="text-[11px] text-ink-muted hidden sm:block">
                Network Diagrams &amp; Gantt Charts Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Editorial Minimalist) */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium text-ink-secondary">
            {navItems.map(item => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id, item.chapter)}
                className="px-2.5 py-1.5 rounded-md hover:text-ink-primary hover:bg-warm transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Status Indicators & Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Duration Pill */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-colors ${
                schedule.projectDuration > 18
                  ? 'bg-critical-light text-critical border-critical-border'
                  : 'bg-warm text-ink-primary border-border'
              }`}
              title="Calculated overall project duration"
            >
              <Clock className="w-3.5 h-3.5 text-ink-secondary" />
              <span>{schedule.projectDuration} Workdays</span>
            </div>

            {/* Presenter Mode Toggle */}
            <button
              onClick={togglePresenterMode}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                presenterMode
                  ? 'bg-ink-primary text-white border-ink-primary shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border-border hover:bg-warm'
              }`}
              title="Toggle University Classroom Presentation Stage"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Presenter</span>
            </button>

            {/* Reset Button (Visible when schedule is modified) */}
            {isModified ? (
              <button
                onClick={resetToBaseline}
                className="px-2.5 py-1 rounded-md text-xs font-semibold text-warning bg-warning-light border border-warning-border hover:bg-warning/20 transition-all flex items-center space-x-1"
                title="Reset durations back to baseline (18 days)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            ) : (
              <div className="hidden xl:flex items-center space-x-1 text-[11px] text-success font-medium bg-success-light px-2 py-0.5 rounded border border-success-border">
                <CheckCircle2 className="w-3 h-3" />
                <span>Baseline</span>
              </div>
            )}

            {/* Primary Action Button - Restrained Amber CTA */}
            <button
              onClick={() => {
                const simSection = document.getElementById('section-simulations');
                if (simSection) {
                  simSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  goToChapter(6);
                }
              }}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-xs transition-colors flex items-center space-x-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulations</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-warm border border-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border px-4 pt-3 pb-5 space-y-1 shadow-elevated">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-3 py-1">
            Presentation Navigation
          </div>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {navItems.map(item => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id, item.chapter)}
                className="px-3 py-2 rounded-md text-xs font-medium text-left text-ink-primary hover:bg-warm border border-border/50"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-3 py-1 pt-2 border-t border-border">
            Chapters (01–09)
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {CHAPTERS_DATA.map(ch => {
              const isCurrent = activeChapter === ch.number;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch.number)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-left ${
                    isCurrent
                      ? 'bg-ink-primary text-white font-medium'
                      : 'text-ink-primary hover:bg-warm'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px]">
                      {ch.number < 10 ? `0${ch.number}` : ch.number}
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isCurrent ? 'bg-white/20 text-white' : 'bg-warm text-ink-secondary'}`}>
                    {ch.member}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
