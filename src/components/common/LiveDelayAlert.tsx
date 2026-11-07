import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { AlertTriangle, Info, RotateCcw, ArrowRight } from 'lucide-react';

export const LiveDelayAlert: React.FC = () => {
  const { delayImpact, isModified, resetToBaseline, schedule } = useSchedule();

  if (!isModified || !delayImpact) return null;

  const isDelayExtended = delayImpact.projectDurationDelta > 0;
  const criticalPathStr = schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ');

  return (
    <div
      className={`mb-6 rounded-lg border p-4 transition-all shadow-subtle ${
        isDelayExtended
          ? 'bg-critical-light/70 border-critical-border text-critical'
          : 'bg-warning-light/80 border-warning-border text-ink-primary'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {isDelayExtended ? (
              <AlertTriangle className="w-5 h-5 text-critical shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-warning shrink-0" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Live Dynamic Schedule Recalculation Active
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-white border border-border">
                Activity {delayImpact.changedActivityId}: {delayImpact.oldDuration}d → {delayImpact.newDuration}d
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
              {delayImpact.explanation}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="text-ink-primary">
                Current Duration: <strong className="font-mono text-ink-primary">{schedule.projectDuration} workdays</strong>
              </span>
              <span className="text-ink-muted">&bull;</span>
              <span className="text-ink-primary flex items-center space-x-1">
                <span>Critical Path:</span>
                <strong className="font-mono text-critical font-bold">{criticalPathStr}</strong>
              </span>
              <span className="text-ink-muted">&bull;</span>
              <span className="italic text-ink-secondary">{delayImpact.keyTakeaway}</span>
            </div>
          </div>
        </div>

        <button
          onClick={resetToBaseline}
          className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-border hover:bg-canvas text-ink-primary transition-colors flex items-center space-x-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-warning" />
          <span>Reset Baseline (18d)</span>
        </button>
      </div>
    </div>
  );
};

