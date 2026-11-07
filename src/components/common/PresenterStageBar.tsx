import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../data/educationalContent';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Presentation,
  Users,
  Clock,
  X,
} from 'lucide-react';

export const PresenterStageBar: React.FC = () => {
  const {
    presenterMode,
    togglePresenterMode,
    activeChapter,
    nextChapter,
    prevChapter,
    goToChapter,
    presentationTimerSeconds,
    isTimerRunning,
    toggleTimer,
    resetTimer,
  } = useSchedule();

  if (!presenterMode) return null;

  const currentChapter = CHAPTERS_DATA[activeChapter - 1] || CHAPTERS_DATA[0];

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-elevated p-3 pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Left: Speaker & Chapter Status */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-md bg-ink-primary text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
            {activeChapter < 10 ? `0${activeChapter}` : activeChapter}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-ink-primary text-xs sm:text-sm truncate max-w-[220px] sm:max-w-[280px]">
                {currentChapter.title}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-warm text-ink-secondary border border-border shrink-0">
                {currentChapter.member}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary truncate max-w-[280px] sm:max-w-md mt-0.5">
              Takeaway: {currentChapter.keyTakeaway}
            </p>
          </div>
        </div>

        {/* Center/Right: Timer & Navigation Stepper */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
          {/* Presentation Timer */}
          <div className="flex items-center space-x-1.5 bg-warm px-2 py-1 rounded-md border border-border">
            <Clock className="w-3.5 h-3.5 text-ink-secondary" />
            <span className="font-mono font-bold text-ink-primary text-xs w-11 text-center">
              {formatTimer(presentationTimerSeconds)}
            </span>
            <button
              onClick={toggleTimer}
              className="p-1 rounded hover:bg-white text-ink-secondary hover:text-ink-primary"
              title={isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3 text-warning" /> : <Play className="w-3 h-3 text-success" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-1 rounded hover:bg-white text-ink-secondary hover:text-ink-primary"
              title="Reset timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Stepper buttons with keyboard hints */}
          <div className="flex items-center space-x-1">
            <button
              onClick={prevChapter}
              disabled={activeChapter <= 1}
              className="px-2.5 py-1 rounded-md border border-border bg-white hover:bg-warm text-ink-primary font-medium flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              title="Previous chapter (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[10px] text-ink-muted">←</span>
            </button>

            <span className="font-mono text-xs font-semibold px-1 text-ink-muted">
              {activeChapter}/{CHAPTERS_DATA.length}
            </span>

            <button
              onClick={nextChapter}
              disabled={activeChapter >= CHAPTERS_DATA.length}
              className="px-2.5 py-1 rounded-md border border-border bg-ink-primary text-white font-medium flex items-center space-x-1 hover:bg-ink-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              title="Next chapter (Right Arrow)"
            >
              <span className="hidden md:inline font-mono text-[10px] text-white/80">→</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close stage mode */}
          <button
            onClick={togglePresenterMode}
            className="p-1 rounded hover:bg-warm text-ink-muted hover:text-ink-primary"
            title="Exit Presenter Stage"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
