import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { AlertTriangle, Info, RotateCcw, AlertCircle, X } from 'lucide-react';

export const LiveDelayAlert: React.FC = () => {
  const { delayImpact, isModified, resetToBaseline, schedule, scheduleError, clearScheduleError } =
    useSchedule();

  if (scheduleError) {
    return (
      <div className="mb-6 rounded-xl border p-4 transition-all bg-critical-light border-critical-border text-critical">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-critical shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                Invalid Schedule Modification Rejected
              </span>
              <p className="mt-1 text-xs text-ink-primary font-medium leading-relaxed font-mono">
                {scheduleError}
              </p>
            </div>
          </div>
          <button
            onClick={clearScheduleError}
            className="p-1 rounded-md hover:bg-critical/10 text-critical transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!isModified || !delayImpact) return null;

  const isDelayExtended = delayImpact.projectDurationDelta > 0;
  const criticalPathStr = schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ');

  return (
    <div
      className={`mb-6 rounded-xl border p-4 transition-all shadow-xs ${
        isDelayExtended
          ? 'bg-critical-light border-critical-border text-ink-primary'
          : 'bg-warm border-border text-ink-primary'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {isDelayExtended ? (
              <AlertTriangle className="w-4 h-4 text-critical shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-brand shrink-0" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isDelayExtended ? 'Project Deadline Impact Warning' : 'Float Buffer Absorbed'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-border">
                {isDelayExtended
                  ? `+${delayImpact.projectDurationDelta} Workdays`
                  : '0 Workday Extension'}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
              {delayImpact.explanation}
            </p>
            <div className="mt-1 text-[11px] text-ink-muted">
              Active Critical Path: <strong className="font-mono text-ink-primary">{criticalPathStr}</strong> (Total: {schedule.projectDuration} workdays)
            </div>
          </div>
        </div>

        <button
          onClick={resetToBaseline}
          className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-border hover:bg-warm text-ink-primary transition-colors flex items-center space-x-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
          <span>Reset to Baseline (18d)</span>
        </button>
      </div>
    </div>
  );
};
