import React from 'react';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';

export const Footer: React.FC = () => {
  const { goToChapter } = useSchedule();

  const scrollTo = (id: string, chNum: number) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else goToChapter(chNum);
  };

  return (
    <footer className="w-full bg-white border-t border-border pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border">
          {/* Column 1: Product Identity */}
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-7 h-7 rounded bg-ink-primary text-white flex items-center justify-center font-mono font-bold text-xs">
                PM
              </div>
              <span className="font-bold text-ink-primary text-sm tracking-tight">
                Project Schedule Management
              </span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed mb-4">
              A premium interactive educational platform designed for a 5-member university presentation on Network Diagrams, CPM, and Gantt Charts.
            </p>
            <div className="text-[11px] font-mono text-ink-muted">
              Built with React 19, TypeScript &amp; Tailwind CSS
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <span className="text-xs font-bold text-ink-primary uppercase tracking-wider block mb-3">
              Learning Modules
            </span>
            <ul className="text-xs text-ink-secondary space-y-2">
              <li>
                <button
                  onClick={() => scrollTo('chapter-01', 1)}
                  className="hover:text-ink-primary transition-colors"
                >
                  01. Project Overview &amp; Benchmark Case
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-02', 2)}
                  className="hover:text-ink-primary transition-colors"
                >
                  02. Schedule Management Fundamentals
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-03', 3)}
                  className="hover:text-ink-primary transition-colors"
                >
                  03. The Six PMBOK Processes
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-04', 4)}
                  className="hover:text-ink-primary transition-colors"
                >
                  04. Precedence &amp; Dependency Types
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-05', 5)}
                  className="hover:text-ink-primary transition-colors"
                >
                  05. Network Diagram (AON / PDM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-06', 6)}
                  className="hover:text-ink-primary transition-colors"
                >
                  06. Critical Path Method (CPM) Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-07', 7)}
                  className="hover:text-ink-primary transition-colors"
                >
                  07. Gantt Chart Studio &amp; Synthesis
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-08', 8)}
                  className="hover:text-ink-primary transition-colors"
                >
                  08. PERT Three-Point Estimation
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chapter-09', 9)}
                  className="hover:text-ink-primary transition-colors"
                >
                  09. Final Quiz &amp; Practical Challenge
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Literature */}
          <div>
            <span className="text-xs font-bold text-ink-primary uppercase tracking-wider block mb-3 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand" />
              <span>Academic Citations</span>
            </span>
            <ul className="text-xs text-ink-secondary space-y-2.5">
              <li className="leading-relaxed">
                <strong className="text-ink-primary">Schwalbe, Kathy (2019).</strong>{' '}
                <em>Information Technology Project Management (9th Edition)</em>. Chapter 6: Project Schedule Management. Cengage Learning.
              </li>
              <li className="leading-relaxed">
                <strong className="text-ink-primary">Project Management Institute (2021).</strong>{' '}
                <em>A Guide to the Project Management Body of Knowledge (PMBOK® Guide)</em>. Standard for Precedence Diagramming Method &amp; CPM.
              </li>
              <li className="leading-relaxed">
                <strong className="text-ink-primary">Convention:</strong> Workday inclusive indexing ($ES = 1, EF = ES + D - 1, LS = LF - D + 1$).
              </li>
            </ul>
          </div>

          {/* Column 4: 5-Member Team Architecture */}
          <div>
            <span className="text-xs font-bold text-ink-primary uppercase tracking-wider block mb-3 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-ink-primary" />
              <span>Team Presentation Mapping</span>
            </span>
            <div className="text-xs text-ink-secondary space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-semibold text-ink-primary">Member 1</span>
                <span>Processes &amp; Basics</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-semibold text-ink-primary">Member 2</span>
                <span>Dependencies &amp; Logic</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-semibold text-ink-primary">Member 3</span>
                <span>Network Diagram (AON)</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-semibold text-ink-primary">Member 4</span>
                <span>Critical Path Studio</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-ink-primary">Member 5</span>
                <span>Gantt Chart &amp; PERT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted">
          <p>© Academic Presentation Platform. Project Schedule Management Suite.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            Dynamic CPM Engine &bull; Inclusive Workday Standard &bull; Zero Server Dependencies
          </p>
        </div>
      </div>
    </footer>
  );
};
