import React from 'react';
import { BookOpen, ExternalLink, GraduationCap, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border mt-20 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-border">
          {/* Column 1: Academic Foundation */}
          <div>
            <div className="flex items-center space-x-2 text-ink-primary font-semibold text-sm mb-3">
              <BookOpen className="w-4 h-4 text-brand" />
              <span>Primary Academic Literature</span>
            </div>
            <ul className="text-xs text-ink-secondary space-y-2.5">
              <li className="leading-relaxed">
                <strong className="text-ink-primary">Schwalbe, Kathy (2019).</strong>{' '}
                <em>Information Technology Project Management (9th Edition)</em>. Chapter 6: Project Schedule Management. Cengage Learning.
              </li>
              <li className="leading-relaxed">
                <strong className="text-ink-primary">Project Management Institute (2021).</strong>{' '}
                <em>A Guide to the Project Management Body of Knowledge (PMBOK® Guide — 6th &amp; 7th Editions)</em>. Standard for Precedence Diagramming Method (PDM) &amp; CPM.
              </li>
              <li className="leading-relaxed">
                <strong className="text-ink-primary">Microsoft Project Documentation.</strong>{' '}
                <em>Task Dependencies, Critical Path Engine, and Gantt Visualizations</em>. Microsoft Support &amp; Technical Reference.
              </li>
            </ul>
          </div>

          {/* Column 2: Educational Principles */}
          <div>
            <div className="flex items-center space-x-2 text-ink-primary font-semibold text-sm mb-3">
              <GraduationCap className="w-4 h-4 text-brand" />
              <span>Core Scheduling Principles</span>
            </div>
            <div className="text-xs text-ink-secondary space-y-2">
              <div className="p-2.5 bg-canvas rounded-md border border-border">
                <span className="font-semibold text-ink-primary block mb-0.5">Network Diagram:</span>
                Answers <em>&ldquo;What depends on what?&rdquo;</em> Models project logic, parallel workflows, and structural dependencies.
              </div>
              <div className="p-2.5 bg-canvas rounded-md border border-border">
                <span className="font-semibold text-ink-primary block mb-0.5">Gantt Chart:</span>
                Answers <em>&ldquo;When does each activity happen?&rdquo;</em> Models calendar timeline, durations, concurrency, and execution.
              </div>
              <div className="p-2.5 bg-canvas rounded-md border border-border">
                <span className="font-semibold text-ink-primary block mb-0.5">Convention:</span>
                Workday inclusive numbering ($ES = 1$, $EF = ES + D - 1$, $LS = LF - D + 1$).
              </div>
            </div>
          </div>

          {/* Column 3: 5-Member Team Presentation Architecture */}
          <div>
            <div className="flex items-center space-x-2 text-ink-primary font-semibold text-sm mb-3">
              <Users className="w-4 h-4 text-brand" />
              <span>5-Member Presentation Architecture</span>
            </div>
            <div className="text-xs text-ink-secondary space-y-1.5">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="font-medium text-ink-primary">Member 1</span>
                <span>Schedule Management &amp; 6 Processes</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="font-medium text-ink-primary">Member 2</span>
                <span>Dependencies &amp; 4 Relationship Types</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="font-medium text-ink-primary">Member 3</span>
                <span>Network Diagram (AON / PDM)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="font-medium text-ink-primary">Member 4</span>
                <span>Critical Path Method (CPM) Studio</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-ink-primary">Member 5</span>
                <span>Gantt Chart &amp; Comparative Analysis</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted">
          <p>© University Academic Project Team. Interactive Educational Scheduling Suite.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">Dynamic CPM Engine • Inclusive Workday Standard • Pure TypeScript</p>
        </div>
      </div>
    </footer>
  );
};

