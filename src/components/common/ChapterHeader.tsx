import React from 'react';
import { Target, Lightbulb, Users, Clock } from 'lucide-react';
import { ChapterInfo } from '../../types/scheduling';

interface ChapterHeaderProps {
  chapter: ChapterInfo;
  tagline?: string;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({ chapter, tagline }) => {
  return (
    <div className="mb-10 pt-2">
      {/* Chapter Meta Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider uppercase bg-ink-primary text-white">
          Chapter {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
        </span>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-warm text-ink-secondary border border-border flex items-center space-x-1">
          <Users className="w-3 h-3 text-ink-muted" />
          <span>{chapter.member}</span>
        </span>
        <span className="px-2 py-0.5 rounded text-[11px] text-ink-muted flex items-center space-x-1 font-mono">
          <Clock className="w-3 h-3 text-ink-muted" />
          <span>~{chapter.durationMinutes} min</span>
        </span>
        {tagline && (
          <span className="text-xs text-ink-muted hidden md:inline">
            &bull; {tagline}
          </span>
        )}
      </div>

      {/* Main Title - Compact, elegant heading */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-primary font-sans leading-tight">
        {chapter.title}
      </h2>

      {/* Learning Objective & Key Takeaway in a Clean Strip */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-warm border border-border">
          <Target className="w-4 h-4 text-ink-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink-primary block uppercase tracking-wider text-[10px]">
              Learning Objective
            </span>
            <p className="text-ink-secondary mt-0.5 leading-relaxed">
              {chapter.learningObjective}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-warm border border-border">
          <Lightbulb className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink-primary block uppercase tracking-wider text-[10px]">
              Core Conceptual Takeaway
            </span>
            <p className="text-ink-secondary mt-0.5 leading-relaxed">
              {chapter.keyTakeaway}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
