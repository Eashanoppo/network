import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Why does Activity C having 1 day of float mean it is not on the critical path?',
    answer:
      'Total Float (Slack) represents the amount of time an activity can slip without delaying the final project delivery date. Because Activity C has Total Float = 1, it has a 1-day safety buffer. The Critical Path is defined strictly as the sequence of activities that have zero total float (Total Float = 0). Slipping Activity C by up to 1 day is absorbed by the downstream schedule buffer without altering the 18-workday completion milestone.',
  },
  {
    id: 'faq-2',
    question: 'How does inclusive workday numbering (ES = 1, EF = ES + Duration - 1) differ from zero-based indexing?',
    answer:
      'In engineering and business scheduling (e.g. MS Project and PMBOK standards), activities start on the morning of an integer day and conclude at the close of business. If an activity starts on the morning of Day 1 and requires 3 full workdays, work takes place during Day 1, Day 2, and Day 3, concluding at the end of Day 3 (EF = 1 + 3 - 1 = 3). Zero-based elapsed time notation would give 1 + 3 = 4, which would erroneously consume 4 calendar dates.',
  },
  {
    id: 'faq-3',
    question: 'What is the mathematical difference between Free Float and Total Float?',
    answer:
      'Total Float is the maximum duration an activity can slip without delaying the overall project finish date (LF - EF or LS - ES). Free Float is the duration an activity can slip without delaying the Early Start of any immediate successor activity (min(Successor ES) - EF - 1 under inclusive counting). Total Float is a shared buffer along an entire network path, whereas Free Float is an exclusive local buffer.',
  },
  {
    id: 'faq-4',
    question: 'When should a project manager use a Network Diagram versus a Gantt Chart?',
    answer:
      'A Network Diagram (Activity-on-Node) answers "What depends on what?" by modeling pure logical dependencies, parallel bursts, and convergence merges independent of timeline spacing. A Gantt Chart answers "When does each activity happen?" by plotting tasks along a calendar time scale, communicating deadlines, concurrency, and actual percentage complete to executive stakeholders. Modern project teams use both as complementary representations.',
  },
  {
    id: 'faq-5',
    question: 'Can a project have multiple critical paths simultaneously?',
    answer:
      'Yes. If two or more independent or branching paths through the network tie for the exact same longest duration, every one of those paths is critical and all their constituent activities will have Total Float = 0. In our simulation, if Activity C is extended from 3 to 4 days, both Path 1 (A-B-D-E-F = 18d) and Path 2 (A-C-D-E-F = 18d) become critical simultaneously, doubling project risk.',
  },
  {
    id: 'faq-6',
    question: 'How does fast-tracking differ from crashing when attempting schedule compression?',
    answer:
      'Crashing adds resources or budget to critical path activities (e.g. paying overtime or adding developers) to shorten duration without altering sequence logic, increasing project cost. Fast-tracking modifies dependency relationships (such as converting a Finish-to-Start dependency into a concurrent Start-to-Start) so tasks execute in parallel, increasing project rework risk without directly increasing expenditure.',
  },
];

export const ScheduleFaq: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section id="section-faq" className="w-full bg-white py-16 lg:py-24 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            SECTION K &bull; REFERENCE ARCHIVE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary mt-1 tracking-tight font-sans">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Clear answers to foundational scheduling questions, PMBOK conventions, and mathematical derivations.
          </p>
        </div>

        {/* Minimalist Accordion with Thin Separators */}
        <div className="divide-y divide-border border-t border-b border-border max-w-3xl">
          {FAQ_ITEMS.map(item => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-4">
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full flex items-center justify-between text-left py-1 text-sm sm:text-base font-semibold text-ink-primary hover:text-ink-secondary transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-ink-primary' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-3 text-xs sm:text-sm text-ink-secondary leading-relaxed pr-6 animate-fadeIn">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

