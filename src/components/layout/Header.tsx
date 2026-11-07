import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import {
  RotateCcw,
  Sparkles,
  GitBranch,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Menu,
  X,
  Presentation,
  CheckCircle2,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  member: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'module-01', label: 'Schedule Process', shortLabel: '01 Process', member: 'Member 1', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'module-02', label: 'Dependencies', shortLabel: '02 Logic', member: 'Member 2', icon: <GitBranch className="w-3.5 h-3.5" /> },
  { id: 'module-03', label: 'Network Diagram', shortLabel: '03 Network', member: 'Member 3', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'module-04', label: 'Critical Path (CPM)', shortLabel: '04 CPM', member: 'Member 4', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'module-05', label: 'Gantt Chart & Compare', shortLabel: '05 Gantt', member: 'Member 5', icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'module-06', label: 'PERT Estimator', shortLabel: '06 PERT', member: 'Support', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'module-07', label: 'Knowledge Check', shortLabel: '07 Quiz', member: 'All Team', icon: <HelpCircle className="w-3.5 h-3.5" /> },
];

export const Header: React.FC = () => {
  const {
    schedule,
    isModified,
    resetToBaseline,
    presenterMode,
    togglePresenterMode,
  } = useSchedule();

  const [activeSection, setActiveSection] = useState<string>('module-01');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Active section detection
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const criticalPathStr = schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-subtle transition-all">
      {/* Scroll progress bar */}
      <div className="h-0.5 bg-border/40 w-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tight">
              PM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-ink-primary tracking-tight text-sm sm:text-base">
                  Project Schedule Management
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-light text-brand border border-brand-border">
                  5-Member University Presentation
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary hidden sm:block">
                Network Diagrams &amp; Gantt Charts Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas'
                  }`}
                  title={`${item.label} (${item.member})`}
                >
                  <span className={isActive ? 'text-white' : 'text-ink-muted'}>{item.icon}</span>
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Schedule Status & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Project Duration Badge */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
                schedule.projectDuration > 18
                  ? 'bg-critical-light text-critical border-critical-border'
                  : 'bg-canvas text-ink-primary border-border'
              }`}
              title="Current dynamic project completion time"
            >
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>{schedule.projectDuration} Workdays</span>
            </div>

            {/* Presenter Mode Toggle */}
            <button
              onClick={togglePresenterMode}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                presenterMode
                  ? 'bg-brand text-white border-brand shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border-border hover:bg-canvas'
              }`}
              title="Toggle presenter cues and speaking notes for the 5-member team"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Presenter Mode</span>
            </button>

            {/* Reset Button */}
            {isModified ? (
              <button
                onClick={resetToBaseline}
                className="px-2.5 py-1 rounded-md text-xs font-medium text-warning bg-warning-light border border-warning-border hover:bg-warning/10 transition-colors flex items-center space-x-1 shadow-xs animate-pulse"
                title="Reset all activity durations back to baseline (18 days)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (18d)</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center space-x-1 text-[11px] text-success font-medium bg-success-light px-2 py-0.5 rounded border border-success-border">
                <CheckCircle2 className="w-3 h-3" />
                <span>Baseline</span>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-canvas border border-border"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border px-4 pt-2 pb-4 space-y-1 shadow-elevated">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider px-3 py-1">
            Presentation Modules
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-ink-primary hover:bg-canvas'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted'
                }`}>
                  {item.member}
                </span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-border mt-2 flex items-center justify-between text-xs px-2">
            <span className="text-ink-secondary">Schedule: <strong className="font-mono text-ink-primary">{schedule.projectDuration} days</strong></span>
            {isModified && (
              <button
                onClick={resetToBaseline}
                className="text-xs text-warning font-medium flex items-center space-x-1 underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to baseline</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

