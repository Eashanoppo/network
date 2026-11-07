import React from 'react';
import { ArrowRight, Sliders, BookOpen } from 'lucide-react';
import { useSchedule } from '../../../context/ScheduleContext';

export const FinalCta: React.FC = () => {
  const { goToChapter } = useSchedule();

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSimulations = () => {
    const el = document.getElementById('section-simulations');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else goToChapter(6);
  };

  return (
    <section className="w-full bg-warm py-20 lg:py-28 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-border p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block mb-3">
            SECTION L &bull; PLATFORM SYNTHESIS
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary tracking-tight font-sans">
            Understand the schedule.<br />
            Control the outcome.
          </h2>

          <p className="mt-4 text-xs sm:text-base text-ink-secondary max-w-xl mx-auto leading-relaxed">
            Explore the relationships, calculations, and decisions that shape a successful project schedule.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToHero}
              className="px-6 py-3 rounded-lg text-xs sm:text-sm font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-xs flex items-center space-x-2"
            >
              <span>Start exploring</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={scrollToSimulations}
              className="px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold bg-warm text-ink-primary hover:bg-surface-secondary border border-border transition-colors flex items-center space-x-2"
            >
              <Sliders className="w-4 h-4 text-ink-secondary" />
              <span>Launch simulations</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

