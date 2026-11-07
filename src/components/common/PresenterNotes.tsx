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
    <div className="mb-8 rounded-xl bg-warm border border-border p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Presentation className="w-4 h-4 text-ink-primary" />
          <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
            Presenter Talking Points &bull; {member}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-ink-secondary font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeAllocation}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
        <div>
          <span className="font-semibold text-ink-primary flex items-center space-x-1.5 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-brand" />
            <span>Core Delivery Message:</span>
          </span>
          <p className="text-ink-secondary leading-relaxed">{keyTakeaway}</p>
        </div>

        <div>
          <span className="font-semibold text-ink-primary flex items-center space-x-1.5 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-ink-primary" />
            <span>Key Speaking Cues:</span>
          </span>
          <ul className="list-disc list-inside text-ink-secondary space-y-1">
            {talkingPoints.map((point, idx) => (
              <li key={idx} className="leading-snug">{point}</li>
            ))}
          </ul>
        </div>

        <div>
          <span className="font-semibold text-ink-primary flex items-center space-x-1.5 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-success" />
            <span>Engage the Classroom:</span>
          </span>
          <p className="text-ink-secondary leading-relaxed bg-white p-3 rounded-lg border border-border italic">
            &ldquo;{audiencePrompt}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
