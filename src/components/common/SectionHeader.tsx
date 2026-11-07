import React from 'react';

interface SectionHeaderProps {
  moduleNumber: string;
  member: string;
  title: string;
  subtitle: string;
  tagline?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  moduleNumber,
  member,
  title,
  subtitle,
  tagline,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-ink-primary text-white">
          {moduleNumber}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warm text-ink-secondary border border-border">
          {member}
        </span>
        {tagline && (
          <span className="text-xs text-ink-muted">
            &bull; {tagline}
          </span>
        )}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary font-sans">
        {title}
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-ink-secondary max-w-3xl leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};
