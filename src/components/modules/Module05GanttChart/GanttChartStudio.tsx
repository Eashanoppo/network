import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { SectionHeader } from '../../common/SectionHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { LiveDelayAlert } from '../../common/LiveDelayAlert';
import {
  Calendar,
  Layers,
  Sparkles,
  RotateCcw,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitBranch,
  Info,
  Sliders,
  Maximize2,
} from 'lucide-react';

export const GanttChartStudio: React.FC = () => {
  const {
    schedule,
    selectedActivityId,
    setSelectedActivityId,
    showCriticalPath,
    setShowCriticalPath,
    showFloat,
    setShowFloat,
    updateActivityDuration,
    resetToBaseline,
    isModified,
  } = useSchedule();

  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [viewCompareMode, setViewCompareMode] = useState<'matrix' | 'cards'>('matrix');

  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

  // Max display days on the timeline
  const timelineMaxDays = Math.max(schedule.projectDuration + 3, 22);
  const dayColumns = Array.from({ length: timelineMaxDays }, (_, i) => i + 1);

  // Helper to calculate bar styling (percentage based)
  const getBarStyle = (es: number, ef: number) => {
    // inclusive workday: day 1 starts at 0%, finishes at 1/timelineMaxDays * 100%
    const leftPercent = ((es - 1) / timelineMaxDays) * 100;
    const durationDays = ef - es + 1;
    const widthPercent = (durationDays / timelineMaxDays) * 100;
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Helper for float extension (dotted bar)
  const getFloatStyle = (ef: number, totalFloat: number) => {
    const leftPercent = (ef / timelineMaxDays) * 100;
    const widthPercent = (totalFloat / timelineMaxDays) * 100;
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Detect concurrent overlap (e.g. days where more than 1 task is active)
  const getOverlappingActivities = (day: number) => {
    return schedule.activityList.filter(act => day >= act.es && day <= act.ef);
  };

  return (
    <section id="module-05" className="py-12 border-b border-border scroll-mt-20">
      <SectionHeader
        moduleNumber="Module 05"
        member="Member 5"
        title="Gantt Chart Studio &amp; Comparative Synthesis"
        subtitle="The Gantt Chart transforms abstract dependency logic into a concrete calendar timeline. Inspect task concurrency, track total float extensions, and explore the definitive comparison between Network Diagrams and Gantt Charts."
        tagline="Timeline Execution &amp; Dual Perspectives"
      />

      <PresenterNotes
        member="Member 5 (Speaker 5 &amp; Team Closer)"
        timeAllocation="4–5 minutes"
        keyTakeaway="Network Diagrams show WHY tasks must connect (logic); Gantt Charts show WHEN tasks will actually occur (timeline). Neither is sufficient alone; they are complementary twins."
        talkingPoints={[
          'Explain the anatomy of the Gantt chart: horizontal time axis, task bars, start and finish dates, concurrency.',
          'Point out Days 4–6: System Design (B) and Database Design (C) run concurrently in parallel.',
          'Point out Activity C\'s float buffer: visualized as a dashed extension showing exactly where slack lives.',
          'Deliver the comparative climax: "Network Diagram = What depends on what? Gantt Chart = When does each activity happen?"',
          'Invite the audience to test the final quiz to consolidate university learning.',
        ]}
        audiencePrompt="If a stakeholder asks: 'Can we assign the same senior engineer to both System Design (B) and Database Design (C)?', which chart immediately warns you of a resource conflict?"
      />

      <LiveDelayAlert />

      {/* Main Gantt Studio Card */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 mb-10">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Interactive Component
              </span>
              <span className="text-xs text-ink-muted">&bull; Synchronized Timeline Engine</span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary">
              Interactive Gantt Chart Timeline
            </h3>
            <p className="text-xs text-ink-secondary">
              Hover over or click any task bar to inspect start/finish dates. Notice how parallel tasks (B and C) overlap between Days 4 and 6.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                showCriticalPath
                  ? 'bg-critical-light text-critical border-critical-border font-semibold'
                  : 'bg-white text-ink-secondary border-border hover:bg-canvas'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-critical"></span>
              <span>Critical Bars</span>
            </button>

            <button
              onClick={() => setShowFloat(!showFloat)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                showFloat
                  ? 'bg-brand-light text-brand border-brand-border font-semibold'
                  : 'bg-white text-ink-secondary border-border hover:bg-canvas'
              }`}
            >
              <Eye className="w-3 h-3 text-brand" />
              <span>Slack (Float) Bars</span>
            </button>

            {isModified && (
              <button
                onClick={resetToBaseline}
                className="px-2.5 py-1 rounded text-xs font-medium bg-warning-light border border-warning-border text-warning hover:bg-warning/20 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (18d)</span>
              </button>
            )}
          </div>
        </div>

        {/* Gantt Timeline Grid Area */}
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[850px] relative select-none">
            {/* Timeline Header (Workdays) */}
            <div className="flex border-b border-border pb-2 mb-2 text-xs font-mono">
              <div className="w-48 shrink-0 font-sans font-bold text-ink-primary text-xs">
                Activity
              </div>
              <div className="w-20 shrink-0 font-sans text-ink-muted text-xs text-center">
                Duration
              </div>
              <div className="flex-1 relative flex">
                {dayColumns.map(day => (
                  <div
                    key={day}
                    className={`flex-1 text-center py-1 text-[11px] border-l border-border/50 ${
                      day === schedule.projectDuration
                        ? 'bg-critical-light/50 font-bold text-critical'
                        : 'text-ink-secondary'
                    }`}
                  >
                    D{day}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-3 relative py-2">
              {/* Background vertical day grid lines */}
              <div className="absolute inset-0 left-68 flex pointer-events-none" style={{ left: '17rem' }}>
                {dayColumns.map(day => (
                  <div
                    key={day}
                    className={`flex-1 border-l h-full ${
                      day === schedule.projectDuration
                        ? 'border-critical/30 bg-critical-light/10'
                        : 'border-border/30'
                    }`}
                  />
                ))}
              </div>

              {schedule.activityList.map(act => {
                const isSelected = selectedActivityId === act.id;
                const isHovered = hoveredActivityId === act.id;
                const isCrit = showCriticalPath && act.isCritical;
                const barStyle = getBarStyle(act.es, act.ef);
                const floatStyle = getFloatStyle(act.ef, act.totalFloat);

                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivityId(act.id)}
                    onMouseEnter={() => setHoveredActivityId(act.id)}
                    onMouseLeave={() => setHoveredActivityId(null)}
                    className={`flex items-center h-10 rounded-lg transition-colors cursor-pointer relative z-10 ${
                      isSelected
                        ? 'bg-brand-light/30'
                        : isHovered
                        ? 'bg-canvas'
                        : ''
                    }`}
                  >
                    {/* Activity Label */}
                    <div className="w-48 shrink-0 flex items-center space-x-2 pr-2">
                      <span className="w-6 h-6 rounded bg-canvas border border-border flex items-center justify-center font-mono font-bold text-xs text-ink-primary shrink-0">
                        {act.id}
                      </span>
                      <span className="text-xs font-semibold text-ink-primary truncate">
                        {act.name}
                      </span>
                    </div>

                    {/* Duration with in-line adjuster */}
                    <div className="w-20 shrink-0 flex items-center justify-center space-x-1 font-mono text-xs">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateActivityDuration(act.id, act.duration - 1);
                        }}
                        disabled={act.duration <= 1}
                        className="w-4 h-4 rounded bg-canvas border border-border text-[9px] flex items-center justify-center disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="font-bold w-6 text-center">{act.duration}d</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateActivityDuration(act.id, act.duration + 1);
                        }}
                        className="w-4 h-4 rounded bg-canvas border border-border text-[9px] flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Timeline Track with Activity Bar */}
                    <div className="flex-1 relative h-7 flex items-center">
                      {/* Active Task Bar */}
                      <div
                        className={`absolute h-7 rounded-md flex items-center justify-between px-2 text-[11px] font-semibold text-white shadow-xs transition-all duration-300 ${
                          isCrit
                            ? 'bg-critical shadow-critical/20'
                            : 'bg-brand shadow-brand/20'
                        } ${isSelected ? 'ring-2 ring-ink-primary' : ''}`}
                        style={barStyle}
                      >
                        <span className="truncate">
                          {act.id}: Days {act.es}–{act.ef}
                        </span>
                        <span className="font-mono text-[10px] opacity-90 shrink-0 ml-1">
                          {act.duration}d
                        </span>
                      </div>

                      {/* Float / Slack extension bar (if float > 0 and enabled) */}
                      {showFloat && act.totalFloat > 0 && (
                        <div
                          className="absolute h-6 rounded-r border-2 border-dashed border-success/70 bg-success-light/50 flex items-center justify-center text-[10px] font-mono font-bold text-success pointer-events-none"
                          style={floatStyle}
                          title={`Total Float: ${act.totalFloat} workday(s)`}
                        >
                          +{act.totalFloat}d float
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Project Deadline Marker */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-ink-secondary">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-critical"></span>
                  <span className="font-medium text-critical">Critical Activity (0 Float)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-brand"></span>
                  <span className="font-medium text-brand">Non-Critical Activity</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded border border-dashed border-success bg-success-light"></span>
                  <span className="font-medium text-success">Slack (Float) Window</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-ink-muted">Project Completion Date:</span>
                <span className="px-2 py-0.5 rounded bg-critical-light text-critical font-bold border border-critical-border">
                  Day {schedule.projectDuration} (Milestone)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Task Details in Gantt Studio */}
        {selectedAct && (
          <div className="mt-6 p-4 rounded-xl bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-ink-primary">
                  Activity {selectedAct.id}: {selectedAct.name}
                </span>
                <span className="font-mono text-ink-muted">
                  (Days {selectedAct.es} to {selectedAct.ef})
                </span>
              </div>
              <p className="text-ink-secondary mt-1">
                Predecessors: {selectedAct.predecessors.length > 0 ? selectedAct.predecessors.join(', ') : 'None (Start)'} &bull; Successors: {selectedAct.successors.length > 0 ? selectedAct.successors.join(', ') : 'None (Finish)'}
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0 font-mono">
              <div className="text-center">
                <span className="text-[10px] text-ink-muted uppercase block">Start Date</span>
                <span className="font-bold text-ink-primary">Day {selectedAct.es}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-ink-muted uppercase block">Finish Date</span>
                <span className="font-bold text-ink-primary">Day {selectedAct.ef}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-ink-muted uppercase block">Slack</span>
                <span className={`font-bold ${selectedAct.isCritical ? 'text-critical' : 'text-success'}`}>
                  {selectedAct.totalFloat}d
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part 2: Comparative Analysis — Network Diagram vs Gantt Chart */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Academic Comparative Analysis
            </span>
            <h3 className="text-lg font-bold text-ink-primary">
              Network Diagram vs Gantt Chart: One Project, Two Perspectives
            </h3>
            <p className="text-xs text-ink-secondary">
              A university team presentation must synthesize both tools. Understand why modern project managers use both representations synergistically.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border p-1 bg-canvas text-xs">
            <button
              onClick={() => setViewCompareMode('matrix')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewCompareMode === 'matrix'
                  ? 'bg-white text-ink-primary font-bold shadow-xs'
                  : 'text-ink-secondary'
              }`}
            >
              Side-by-Side Matrix
            </button>
            <button
              onClick={() => setViewCompareMode('cards')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewCompareMode === 'cards'
                  ? 'bg-white text-ink-primary font-bold shadow-xs'
                  : 'text-ink-secondary'
              }`}
            >
              Core Takeaways
            </button>
          </div>
        </div>

        {/* The Golden Dichotomy Banner */}
        <div className="p-5 rounded-xl bg-canvas border border-border text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
            The Fundamental Architectural Principle
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="p-4 bg-white rounded-lg border border-border shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-brand block mb-1">
                Network Diagram (AON / PDM)
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-ink-primary font-sans">
                &ldquo;WHAT DEPENDS ON WHAT?&rdquo;
              </h4>
              <p className="text-xs text-ink-secondary mt-1">
                Visualizes pure project logic, precedence constraints, parallel workflows, and float derivations regardless of calendar scale.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-border shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-success block mb-1">
                Gantt Chart (Timeline)
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-ink-primary font-sans">
                &ldquo;WHEN DOES EACH ACTIVITY HAPPEN?&rdquo;
              </h4>
              <p className="text-xs text-ink-secondary mt-1">
                Visualizes time-scaled calendar progression, task concurrency, resource scheduling, and real-time execution tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Side-by-Side Comparison Matrix */}
        {viewCompareMode === 'matrix' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-canvas/80 text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/4">Evaluation Dimension</th>
                  <th className="py-3 px-4 w-3/8 text-brand">Network Diagram (AON)</th>
                  <th className="py-3 px-4 w-3/8 text-success">Gantt Chart (Bar Timeline)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink-secondary">
                <tr>
                  <td className="py-3 px-4 font-bold text-ink-primary">Primary Purpose</td>
                  <td className="py-3 px-4">Shows project precedence logic, dependencies, and network relationships.</td>
                  <td className="py-3 px-4">Shows activity duration across a time scale and tracks actual vs planned progress.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-ink-primary">Central Question Answered</td>
                  <td className="py-3 px-4 font-semibold text-brand">&ldquo;What depends on what?&rdquo;</td>
                  <td className="py-3 px-4 font-semibold text-success">&ldquo;When does each activity happen?&rdquo;</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-ink-primary">Dependency Clarity</td>
                  <td className="py-3 px-4">Explicit directional arrows connect nodes; easy to trace complex merge/burst points.</td>
                  <td className="py-3 px-4">Lines can be shown between bars, but become cluttered on large projects.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-ink-primary">Parallel Activities</td>
                  <td className="py-3 px-4">Branches separate visually into parallel paths regardless of duration.</td>
                  <td className="py-3 px-4">Shown as overlapping horizontal bars across the same calendar columns.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-ink-primary">Critical Path Identification</td>
                  <td className="py-3 px-4">Calculated via mathematical forward and backward passes (Float = 0).</td>
                  <td className="py-3 px-4">Identified by highlighting bars that possess zero total slack.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-ink-primary">Executive Communication</td>
                  <td className="py-3 px-4">Best for engineering teams and project managers analyzing schedule risk.</td>
                  <td className="py-3 px-4">Widely preferred by executives and stakeholders because of its intuitive timeline.</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-canvas border border-border">
              <span className="font-bold text-sm text-ink-primary block mb-1">
                When to Use Network Diagrams:
              </span>
              <ul className="list-disc list-inside text-xs text-ink-secondary space-y-1">
                <li>During initial project planning to validate logical sequencing.</li>
                <li>When computing ES, EF, LS, LF and discovering total float buffers.</li>
                <li>When identifying merge risks (tasks with 3+ predecessors).</li>
                <li>When restructuring logic for fast-tracking or crashing.</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-border">
              <span className="font-bold text-sm text-ink-primary block mb-1">
                When to Use Gantt Charts:
              </span>
              <ul className="list-disc list-inside text-xs text-ink-secondary space-y-1">
                <li>During project execution to monitor daily and weekly progress.</li>
                <li>When assigning resources and preventing team over-allocation.</li>
                <li>For stakeholder presentations and milestone reporting.</li>
                <li>To visualize delivery dates against real calendar constraints.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

