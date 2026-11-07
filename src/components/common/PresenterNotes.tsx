import React from 'react';
import { Presentation, Lightbulb, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';

interface PresenterNotesProps {
  member: string;
  timeAllocation: string;
  keyTakeaway: string;
  talkingPoints: string[];
  audiencePrompt: string;
}

export const PresenterNotes: React.FC<PresenterNotesProps> = ({
  member,
  timeAllocation,
  keyTakeaway,
  talkingPoints,
  audiencePrompt,
}) => {
  const { presenterMode } = useSchedule();

  if (!presenterMode) return null;

  return (
    <div className="mb-6 rounded-lg bg-brand-light/70 border border-brand-border p-4 shadow-subtle transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
        <div className="flex items-center space-x-2">
          <Presentation className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-brand uppercase tracking-wider">
            Presenter Guide &bull; {member}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-brand font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeAllocation}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
        <div>
          <span className="font-semibold text-ink-primary flex items-center space-x-1 mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-warning" />
            <span>Core Message:</span>
          </span>
          <p className="text-ink-secondary leading-relaxed">{keyTakeaway}</p>
        </div>

        <div>
          <span className="font-semibold text-ink-primary flex items-center space-x-1 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-brand" />
            <span>Key Speaking Cues:</span>
          </span>
          <ul className="list-disc list-inside text-ink-secondary space-y-0.5">
            {talkingPoints.map((point, idx) => (
              <li key={idx} className="leading-snug">{point}</li>
            ))}
          </ul>
        </div>

        <div>
          <span className="font-semibold text-ink-primary flex items-center space-x-1 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-success" />
            <span>Audience Interaction:</span>
          </span>
          <p className="text-ink-secondary leading-relaxed bg-white/60 p-2 rounded border border-brand-border/40 italic">
            &ldquo;{audiencePrompt}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

