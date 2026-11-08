import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
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
  Sliders,
  Flag,
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
    updateActivityProgress,
    resetToBaseline,
    isModified,
  } = useSchedule();

  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [viewCompareMode, setViewCompareMode] = useState<'matrix' | 'cards'>('matrix');
  const [showConnectors, setShowConnectors] = useState<boolean>(true);

  const chapter7 = CHAPTERS_DATA[6];
  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

  // Max display days on the timeline
  const timelineMaxDays = Math.max(schedule.projectDuration + 4, 22);
  const dayColumns = Array.from({ length: timelineMaxDays }, (_, i) => i + 1);

  // Helper to calculate bar styling (percentage based)
  const getBarStyle = (es: number, ef: number) => {
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

  return (
    <section id="chapter-07" className="w-full bg-white py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter7}
          tagline="Calendar Execution Timeline &amp; Comparative Synthesis"
        />

        <PresenterNotes
          member="Member 5 (Speaker 5 &amp; Team Closer)"
          timeAllocation="5 minutes"
          keyTakeaway="Network Diagrams show WHY tasks connect (logic); Gantt Charts show WHEN tasks will occur (calendar). Modern project teams use both representations as complementary twins."
          talkingPoints={[
            'Explain the anatomy of the Gantt chart: horizontal calendar axis, task bars, start and finish dates, concurrency.',
            'Point out Days 4–6: System Design (B) and Database Design (C) run in parallel simultaneously.',
            'Point out Activity C\'s float buffer: visualized as a dashed extension showing where schedule delay is absorbed.',
            'Demonstrate progress tracking: show the filled portion of the bar representing completed work without altering planned durations.',
            'Deliver the comparative climax: "Network Diagram = What depends on what? Gantt Chart = When does each activity happen?"',
            'Invite the audience to test the final quiz to consolidate university learning.',
          ]}
          audiencePrompt="If a stakeholder asks: 'Can we assign the exact same lead engineer to both System Design (B) and Database Design (C)?', which chart immediately warns you of a concurrency conflict?"
        />

        <LiveDelayAlert />

      {/* Main Gantt Studio Card */}
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-10">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Interactive Component
              </span>
              <span className="text-xs text-ink-muted">&bull; Synchronized Timeline Engine</span>
            </div>
            <h3 className="text-xl font-bold text-ink-primary mt-0.5">
              Interactive Gantt Chart Studio
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
              Hover over or select any task bar. Notice how parallel tasks (B &amp; C) overlap between Days 4 and 6.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Critical Path Toggle */}
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center space-x-2 ${
                showCriticalPath
                  ? 'bg-critical-light text-critical border-critical-border'
                  : 'bg-warm text-ink-secondary border-border hover:bg-surface-secondary'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-critical"></span>
              <span>Critical Bars</span>
            </button>

            {/* Float Toggle */}
            <button
              onClick={() => setShowFloat(!showFloat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                showFloat
                  ? 'bg-warm text-ink-primary border-ink-primary'
                  : 'bg-warm text-ink-secondary border-border hover:bg-surface-secondary'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-ink-secondary" />
              <span>Slack (Float) Bars</span>
            </button>

            {isModified && (
              <button
                onClick={resetToBaseline}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-warm border border-border hover:bg-surface-secondary text-ink-primary transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Reset Baseline</span>
              </button>
            )}
          </div>
        </div>

        {/* Timeline Grid Area */}
        <div className="sm:hidden flex items-center space-x-1 text-[11px] text-ink-muted mt-3 mb-1">
          <span className="font-semibold text-brand">Swipe timeline horizontally for full 22-day calendar &rarr;</span>
        </div>
        <div className="mt-2 sm:mt-4 overflow-x-auto">
          <div className="min-w-[920px] relative select-none pb-4">
            {/* Timeline Header (Workdays Ruler) */}
            <div className="flex border-b border-border pb-2.5 mb-2 text-xs font-mono">
              <div className="w-56 shrink-0 font-sans font-bold text-ink-primary text-xs flex items-center justify-between pr-3">
                <span>Activity</span>
                <span className="text-[11px] text-ink-muted">Progress</span>
              </div>
              <div className="w-20 shrink-0 font-sans text-ink-muted text-xs text-center font-medium">
                Duration
              </div>
              <div className="flex-1 relative flex">
                {dayColumns.map(day => (
                  <div
                    key={day}
                    className={`flex-1 text-center py-1 text-xs border-l border-border/60 ${
                      day === schedule.projectDuration
                        ? 'bg-critical-light text-critical font-bold'
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
              {/* Vertical Day Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none" style={{ left: '19rem' }}>
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

              {/* Milestone Vertical Guideline */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
                style={{
                  left: `calc(19rem + ${((schedule.projectDuration - 0.5) / timelineMaxDays) * 100}%)`,
                }}
              >
                <div className="w-2.5 h-2.5 bg-critical rotate-45 shadow-xs" title="Project Milestone" />
                <div className="w-px flex-1 bg-critical/50 border-l border-dashed border-critical" />
              </div>

              {schedule.activityList.map(act => {
                const isSelected = selectedActivityId === act.id;
                const isHovered = hoveredActivityId === act.id;
                const isCrit = showCriticalPath && act.isCritical;
                const barStyle = getBarStyle(act.es, act.ef);
                const floatStyle = getFloatStyle(act.ef, act.totalFloat);
                const progressPct = act.progress ?? 0;

                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivityId(act.id)}
                    onMouseEnter={() => setHoveredActivityId(act.id)}
                    onMouseLeave={() => setHoveredActivityId(null)}
                    className={`flex items-center h-11 rounded-lg transition-colors cursor-pointer relative z-10 ${
                      isSelected
                        ? 'bg-warm'
                        : isHovered
                        ? 'bg-warm/60'
                        : ''
                    }`}
                  >
                    {/* Activity Label & Progress Indicator */}
                    <div className="w-56 shrink-0 flex items-center justify-between pr-3">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-6 h-6 rounded bg-ink-primary text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {act.id}
                        </span>
                        <span className="text-xs font-semibold text-ink-primary truncate" title={act.name}>
                          {act.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-ink-muted shrink-0">
                        {progressPct}%
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
                        className="w-5 h-5 rounded bg-warm border border-border text-xs flex items-center justify-center disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="font-bold w-6 text-center">{act.duration}d</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateActivityDuration(act.id, act.duration + 1);
                        }}
                        className="w-5 h-5 rounded bg-warm border border-border text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Timeline Track with Activity Bar */}
                    <div className="flex-1 relative h-8 flex items-center">
                      {/* Active Planned Task Bar */}
                      <div
                        className={`absolute h-7 rounded-md overflow-hidden flex items-center justify-between px-2 text-xs font-medium text-white shadow-xs transition-all duration-300 ${
                          isCrit
                            ? 'bg-critical'
                            : 'bg-ink-primary'
                        } ${isSelected ? 'ring-2 ring-brand' : ''}`}
                        style={barStyle}
                      >
                        {/* Actual Progress Fill */}
                        {progressPct > 0 && (
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-white/25 pointer-events-none"
                            style={{ width: `${progressPct}%` }}
                          />
                        )}

                        <span className="truncate relative z-10 text-[10px] font-mono">
                          D{act.es}–D{act.ef}
                        </span>
                        <span className="font-mono text-[10px] opacity-95 shrink-0 ml-1 relative z-10 font-bold">
                          {progressPct > 0 ? `${progressPct}%` : `${act.duration}d`}
                        </span>
                      </div>

                      {/* Float / Slack extension bar */}
                      {showFloat && act.totalFloat > 0 && (
                        <div
                          className="absolute h-6 rounded-r-md border border-dashed border-success bg-success-light/80 flex items-center justify-center text-[10px] font-mono font-semibold text-success pointer-events-none px-2"
                          style={floatStyle}
                          title={`Total Float: ${act.totalFloat} workday(s)`}
                        >
                          +{act.totalFloat}d slack
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Project Milestone Completion Footer */}
            <div className="mt-5 pt-3.5 border-t border-border flex flex-wrap items-center justify-between text-xs text-ink-secondary gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-critical"></span>
                  <span className="font-semibold text-critical">Critical Path (0 Slack)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-ink-primary"></span>
                  <span className="font-medium text-ink-primary">Non-Critical Task</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-ink-secondary/30"></span>
                  <span className="font-medium text-ink-secondary">Actual Progress Fill</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-dashed border-success bg-success-light"></span>
                  <span className="font-medium text-success">Total Float Buffer</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-ink-muted">Milestone Go-Live:</span>
                <span className="px-2 py-0.5 rounded bg-critical-light text-critical font-bold border border-critical-border flex items-center space-x-1">
                  <Flag className="w-3 h-3" />
                  <span>Day {schedule.projectDuration}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Activity Progress & Details Inspector */}
        {selectedAct && (
          <div className="mt-6 p-4 rounded-lg bg-warm border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded bg-ink-primary text-white inline-flex items-center justify-center font-mono font-bold text-xs">
                    {selectedAct.id}
                  </span>
                  <span className="font-bold text-sm text-ink-primary">
                    {selectedAct.name}
                  </span>
                  <span className="text-xs text-ink-muted">
                    (Planned: {selectedAct.duration} workdays &bull; Days {selectedAct.es}–{selectedAct.ef})
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-1">
                  {selectedAct.description}
                </p>
              </div>

              {/* Interactive Progress Slider */}
              <div className="flex items-center space-x-3 bg-white px-3.5 py-2 rounded-lg border border-border shrink-0">
                <Sliders className="w-3.5 h-3.5 text-brand" />
                <span className="text-xs font-semibold text-ink-primary whitespace-nowrap">
                  Actual Progress:
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={selectedAct.progress ?? 0}
                  onChange={e => updateActivityProgress(selectedAct.id, Number(e.target.value))}
                  className="w-24 accent-brand cursor-pointer"
                />
                <span className="font-mono font-bold text-xs text-ink-primary w-10 text-right">
                  {selectedAct.progress ?? 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part 2: Academic Comparative Analysis Matrix */}
      <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Academic Comparative Synthesis
            </span>
            <h3 className="text-xl font-bold text-ink-primary">
              Network Diagram vs Gantt Chart: One Project, Two Perspectives
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
              The presentation conclusion synthesizes both tools. Understand why modern project managers use both representations synergistically.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border p-1 bg-warm text-xs font-semibold">
            <button
              onClick={() => setViewCompareMode('matrix')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewCompareMode === 'matrix'
                  ? 'bg-white text-ink-primary font-bold shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Side-by-Side Matrix
            </button>
            <button
              onClick={() => setViewCompareMode('cards')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewCompareMode === 'cards'
                  ? 'bg-white text-ink-primary font-bold shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Core Takeaways
            </button>
          </div>
        </div>

        {/* Dual Perspectives Banner */}
        <div className="p-6 rounded-xl bg-warm border border-border text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-3">
            The Fundamental Scheduling Dichotomy
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-lg border border-border text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Network Diagram (AON / PDM)
              </span>
              <h4 className="text-lg font-bold text-ink-primary font-sans">
                &ldquo;WHAT DEPENDS ON WHAT?&rdquo;
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                Visualizes pure project logic, dependency relationships, parallel concurrency, and float derivations regardless of calendar scale.
              </p>
            </div>

            <div className="p-5 bg-white rounded-lg border border-border text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                Gantt Chart (Bar Timeline)
              </span>
              <h4 className="text-lg font-bold text-ink-primary font-sans">
                &ldquo;WHEN DOES EACH ACTIVITY HAPPEN?&rdquo;
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                Visualizes time-scaled calendar progression, task concurrency, resource scheduling, and real-time execution tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        {viewCompareMode === 'matrix' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-warm text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/4">Evaluation Dimension</th>
                  <th className="py-3 px-4 w-3/8 text-ink-primary">Network Diagram (AON)</th>
                  <th className="py-3 px-4 w-3/8 text-ink-primary">Gantt Chart (Timeline)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink-secondary text-xs sm:text-sm">
                <tr className="hover:bg-warm/50">
                  <td className="py-3 px-4 font-bold text-ink-primary">Primary Purpose</td>
                  <td className="py-3 px-4">Shows project precedence logic, dependencies, and network relationships.</td>
                  <td className="py-3 px-4">Shows activity duration across a time scale and tracks actual vs planned progress.</td>
                </tr>
                <tr className="hover:bg-warm/50">
                  <td className="py-3 px-4 font-bold text-ink-primary">Central Question Answered</td>
                  <td className="py-3 px-4 font-semibold text-ink-primary">&ldquo;What depends on what?&rdquo;</td>
                  <td className="py-3 px-4 font-semibold text-ink-primary">&ldquo;When does each activity happen?&rdquo;</td>
                </tr>
                <tr className="hover:bg-warm/50">
                  <td className="py-3 px-4 font-bold text-ink-primary">Dependency Clarity</td>
                  <td className="py-3 px-4">Explicit directional arrows connect nodes; easy to trace complex merge/burst points.</td>
                  <td className="py-3 px-4">Lines can connect bars, but become crowded on complex schedules.</td>
                </tr>
                <tr className="hover:bg-warm/50">
                  <td className="py-3 px-4 font-bold text-ink-primary">Parallel Activities</td>
                  <td className="py-3 px-4">Branches separate visually into parallel paths regardless of duration.</td>
                  <td className="py-3 px-4">Shown as overlapping horizontal bars across the same calendar columns.</td>
                </tr>
                <tr className="hover:bg-warm/50">
                  <td className="py-3 px-4 font-bold text-ink-primary">Critical Path Identification</td>
                  <td className="py-3 px-4">Calculated via mathematical forward and backward passes (Total Float = 0).</td>
                  <td className="py-3 px-4">Identified by highlighting task bars that possess zero total slack.</td>
                </tr>
                <tr className="hover:bg-warm/50">
                  <td className="py-3 px-4 font-bold text-ink-primary">Executive Communication</td>
                  <td className="py-3 px-4">Best for engineering teams and project managers analyzing schedule risk.</td>
                  <td className="py-3 px-4">Widely preferred by executives and stakeholders because of its intuitive calendar layout.</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-warm border border-border">
              <span className="font-bold text-sm text-ink-primary block mb-2">
                When to Use Network Diagrams:
              </span>
              <ul className="list-disc list-inside text-xs sm:text-sm text-ink-secondary space-y-1.5 leading-relaxed">
                <li>Early in project planning when sequencing work packages.</li>
                <li>Identifying which tasks can execute concurrently in parallel.</li>
                <li>Calculating early and late dates through forward/backward passes.</li>
                <li>Computing total and free slack buffers for risk management.</li>
                <li>Determining the exact Critical Path controlling delivery.</li>
              </ul>
            </div>

            <div className="p-5 rounded-lg bg-warm border border-border">
              <span className="font-bold text-sm text-ink-primary block mb-2">
                When to Use Gantt Charts:
              </span>
              <ul className="list-disc list-inside text-xs sm:text-sm text-ink-secondary space-y-1.5 leading-relaxed">
                <li>During project execution to communicate deadlines and calendars.</li>
                <li>Assigning human resources across specific calendar weeks.</li>
                <li>Tracking actual progress percentage against the approved baseline.</li>
                <li>Reporting schedule milestones and status to non-technical executives.</li>
                <li>Spotting resource overload when too many parallel tasks overlap.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);
};
