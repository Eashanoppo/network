import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { ScheduleViewMode } from '../../types/scheduling';

interface ScheduleViewModeBannerProps {
  compact?: boolean;
  className?: string;
  showSwitcher?: boolean;
}

export const ScheduleViewModeBanner: React.FC<ScheduleViewModeBannerProps> = ({
  compact = false,
  className = '',
  showSwitcher = true,
}) => {
  const {
    viewMode,
    setViewMode,
    currentSchedule,
    baselineSchedule,
    previewSchedule,
    activeSimulation,
    applyActiveSimulation,
    discardActiveSimulation,
    resetPreview,
  } = useSchedule();

  const isPreview = viewMode === 'preview' && previewSchedule !== null;
  const isBaseline = viewMode === 'baseline';

  const durationDelta = previewSchedule
    ? previewSchedule.projectDuration - currentSchedule.projectDuration
    : 0;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isPreview
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
          : isBaseline
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-950'
          : 'bg-warm border-border text-ink-primary'
      } ${compact ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'} ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* State Badge & Information */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isPreview
                ? 'bg-amber-500 text-white shadow-xs'
                : isBaseline
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-ink-primary text-white'
            }`}
          >
            {isPreview ? (
              <Sparkles className="w-4 h-4 animate-pulse" />
            ) : isBaseline ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {isPreview
                  ? '⚡ Simulation Preview Mode'
                  : isBaseline
                  ? '📋 Approved Baseline Mode'
                  : '✓ Current Working Schedule'}
              </span>

              {isPreview && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                  Hypothetical
                </span>
              )}
            </div>

            <p className="text-[11px] text-ink-secondary truncate mt-0.5">
              {isPreview ? (
                <span>
                  Previewing: <strong className="text-ink-primary font-mono">{previewSchedule?.projectDuration}d</strong>{' '}
                  (Current: {currentSchedule.projectDuration}d, Baseline: {baselineSchedule.projectDuration}d) &bull;{' '}
                  <span
                    className={`font-semibold font-mono ${
                      durationDelta > 0
                        ? 'text-critical'
                        : durationDelta < 0
                        ? 'text-success'
                        : 'text-amber-800'
                    }`}
                  >
                    {durationDelta > 0
                      ? `+${durationDelta}d delay`
                      : durationDelta < 0
                      ? `${durationDelta}d crash`
                      : '0d delay (absorbed)'}
                  </span>
                </span>
              ) : isBaseline ? (
                <span>
                  Reference view of original project baseline: <strong className="text-ink-primary font-mono">{baselineSchedule.projectDuration} workdays</strong>.
                </span>
              ) : (
                <span>
                  Active applied project state: <strong className="text-ink-primary font-mono">{currentSchedule.projectDuration} workdays</strong> across all modules.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          {showSwitcher && (
            <div className="inline-flex items-center rounded-lg bg-white/80 p-0.5 border border-border shadow-xs text-xs font-mono">
              <button
                onClick={() => setViewMode('current')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  viewMode === 'current'
                    ? 'bg-ink-primary text-white shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="View active working schedule"
              >
                Current ({currentSchedule.projectDuration}d)
              </button>

              <button
                onClick={() => {
                  if (activeSimulation) {
                    setViewMode('preview');
                  } else {
                    setViewMode('preview');
                  }
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 font-semibold ${
                  viewMode === 'preview'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : activeSimulation
                    ? 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/50'
                    : 'text-ink-muted hover:text-ink-secondary'
                }`}
                title={activeSimulation ? 'View staged simulation preview' : 'No active simulation staged'}
              >
                <span>⚡ Preview</span>
                {previewSchedule && (
                  <span className="text-[10px] opacity-90">({previewSchedule.projectDuration}d)</span>
                )}
              </button>

              <button
                onClick={() => setViewMode('baseline')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  viewMode === 'baseline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="View approved reference baseline"
              >
                Baseline ({baselineSchedule.projectDuration}d)
              </button>
            </div>
          )}

          {/* Quick Apply / Discard buttons when in Preview */}
          {isPreview && (
            <div className="flex items-center space-x-1.5 pl-1">
              <button
                onClick={discardActiveSimulation}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-border hover:bg-warm text-ink-secondary hover:text-ink-primary transition-colors flex items-center space-x-1 shadow-xs"
                title="Discard temporary simulation and restore working schedule"
              >
                <X className="w-3 h-3 text-ink-muted" />
                <span className="hidden xs:inline">Discard</span>
              </button>

              <button
                onClick={applyActiveSimulation}
                className="px-3 py-1 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs flex items-center space-x-1"
                title="Commit simulation changes into the working schedule"
              >
                <Check className="w-3 h-3 text-white" />
                <span>Apply</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

