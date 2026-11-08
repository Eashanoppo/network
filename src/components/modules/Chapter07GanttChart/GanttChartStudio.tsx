import React, { useState, useMemo } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { LiveDelayAlert } from '../../common/LiveDelayAlert';
import { ScheduleViewModeBanner } from '../../common/ScheduleViewModeBanner';
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
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export const GanttChartStudio: React.FC = () => {
  const {
    activeProject,
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
  const [zoomLevel, setZoomLevel] = useState<'compact' | 'standard' | 'expanded'>('standard');

  const chapter7 = CHAPTERS_DATA[6];
  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

  // Max display days on the timeline
  const timelineMaxDays = Math.max(schedule.projectDuration + 4, 22);
  const dayColumns = Array.from({ length: timelineMaxDays }, (_, i) => i + 1);

  // Helper to calculate bar styling (percentage based)
  const getBarStyle = (es: number, ef: number) => {
    const leftPercent = (es / timelineMaxDays) * 100;
    const durationDays = Math.max(0.05, ef - es);
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

  // Timeline container min-width based on zoom level
  const containerMinWidthClass =
    zoomLevel === 'compact'
      ? 'min-w-[780px]'
      : zoomLevel === 'expanded'
      ? 'min-w-[1200px]'
      : 'min-w-[940px]';

  // Dependency links for SVG connector overlay
  const dependencyLinks = useMemo(() => {
    const links: {
      predId: string;
      succId: string;
      predIndex: number;
      succIndex: number;
      fromXPercent: number;
      toXPercent: number;
      isCritical: boolean;
    }[] = [];

    schedule.activityList.forEach((act, succIndex) => {
      act.predecessors.forEach(predId => {
        const predIndex = schedule.activityList.findIndex(a => a.id === predId);
        const predAct = schedule.activities[predId];
        if (predIndex !== -1 && predAct) {
          const fromXPercent = (predAct.ef / timelineMaxDays) * 100;
          const toXPercent = (act.es / timelineMaxDays) * 100;
          const isCritical = act.isCritical && predAct.isCritical && act.totalFloat === 0;

          links.push({
            predId,
            succId: act.id,
            predIndex,
            succIndex,
            fromXPercent,
            toXPercent,
            isCritical,
          });
        }
      });
    });

    return links;
  }, [schedule.activityList, schedule.activities, timelineMaxDays]);

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
            'Point out parallel tasks running simultaneously.',
            'Point out float buffers: visualized as a dashed extension showing where schedule delay is absorbed.',
            'Demonstrate progress tracking: show the filled portion of the bar representing completed work without altering planned durations.',
            'Deliver the comparative climax: "Network Diagram = What depends on what? Gantt Chart = When does each activity happen?"',
          ]}
          audiencePrompt="If a stakeholder asks: 'Can we assign the exact same lead engineer to both concurrent tasks?', which chart immediately warns you of a concurrency conflict?"
        />

        <LiveDelayAlert />

        {/* Unified View Mode Banner */}
        <ScheduleViewModeBanner className="mb-6" />

        {/* Main Gantt Studio Card */}
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-10 shadow-xs">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Interactive Gantt Studio
                </span>
                <span className="text-xs text-ink-muted">&bull; {activeProject.name}</span>
              </div>
              <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                Interactive Gantt Chart Studio
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Hover over or select any task bar. Notice how concurrent activities overlap along the calendar timeline.
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
                <span>Float (Slack) Bars</span>
              </button>

              {/* Dependency Connectors Toggle */}
              <button
                onClick={() => setShowConnectors(!showConnectors)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                  showConnectors
                    ? 'bg-warm text-ink-primary border-ink-primary'
                    : 'bg-warm text-ink-secondary border-border hover:bg-surface-secondary'
                }`}
                title="Toggle dependency connector lines between task bars"
              >
                <GitBranch className="w-3.5 h-3.5 text-brand" />
                <span>Connectors</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center rounded-md border border-border bg-warm p-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => setZoomLevel('compact')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    zoomLevel === 'compact'
                      ? 'bg-white font-bold text-ink-primary shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Compact
                </button>
                <button
                  onClick={() => setZoomLevel('standard')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    zoomLevel === 'standard'
                      ? 'bg-white font-bold text-ink-primary shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setZoomLevel('expanded')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    zoomLevel === 'expanded'
                      ? 'bg-white font-bold text-ink-primary shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Expanded
                </button>
              </div>

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
            <span className="font-semibold text-brand">Swipe timeline horizontally for full calendar &rarr;</span>
          </div>

          <div className="mt-2 sm:mt-4 overflow-x-auto">
            <div className={`${containerMinWidthClass} relative select-none pb-4`}>
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

              {/* Task Rows Container */}
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

                {/* SVG Dependency Connector Lines Layer */}
                {showConnectors && dependencyLinks.length > 0 && (
                  <svg
                    className="absolute inset-y-0 pointer-events-none z-10"
                    style={{ left: '19rem', right: 0, width: 'calc(100% - 19rem)', height: '100%' }}
                  >
                    <defs>
                      <marker
                        id="gantt-arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#F26522" />
                      </marker>
                      <marker
                        id="gantt-arrow-crit"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#BE645A" />
                      </marker>
                    </defs>

                    {dependencyLinks.map((link, idx) => {
                      // Row heights: h-11 = 44px, gap = 12px (space-y-3), total row stride = 56px
                      const startY = link.predIndex * 56 + 22;
                      const endY = link.succIndex * 56 + 22;
                      const startX = `${link.fromXPercent}%`;
                      const endX = `${link.toXPercent}%`;

                      const strokeColor = link.isCritical && showCriticalPath ? '#BE645A' : '#F26522';
                      const strokeWidth = link.isCritical && showCriticalPath ? 2 : 1.5;
                      const marker = link.isCritical && showCriticalPath ? 'url(#gantt-arrow-crit)' : 'url(#gantt-arrow)';

                      return (
                        <g key={`gantt-link-${idx}`}>
                          <path
                            d={`M calc(${startX}) ${startY} L calc(${startX} + 6px) ${startY} L calc(${startX} + 6px) ${endY} L calc(${endX}) ${endY}`}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={link.isCritical ? undefined : '3,2'}
                            opacity={0.8}
                            markerEnd={marker}
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* Milestone Vertical Guideline */}
                {schedule.activityList.length > 0 && (
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
                    style={{
                      left: `calc(19rem + ${((schedule.projectDuration - 0.5) / timelineMaxDays) * 100}%)`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 bg-critical rotate-45 shadow-xs" title="Project Milestone" />
                    <div className="w-px flex-1 bg-critical/50 border-l border-dashed border-critical" />
                  </div>
                )}

                {schedule.activityList.length === 0 ? (
                  <div className="py-20 text-center text-xs text-ink-muted flex flex-col items-center justify-center">
                    <span>No activities in this project yet. Add activities to render the Gantt chart.</span>
                  </div>
                ) : (
                  schedule.activityList.map(act => {
                    const isSelected = selectedActivityId === act.id;
                    const isHovered = hoveredActivityId === act.id;
                    const isCrit = showCriticalPath && act.isCritical;
                    const isMilestone = act.duration === 0 || act.isMilestone;
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
                            disabled={act.duration <= 0}
                            className="w-5 h-5 rounded bg-warm border border-border text-xs flex items-center justify-center disabled:opacity-30 hover:bg-surface-secondary"
                          >
                            -
                          </button>
                          <span className="font-bold w-6 text-center">{act.duration}d</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              updateActivityDuration(act.id, act.duration + 1);
                            }}
                            className="w-5 h-5 rounded bg-warm border border-border text-xs flex items-center justify-center hover:bg-surface-secondary"
                          >
                            +
                          </button>
                        </div>

                        {/* Timeline Track with Activity Bar or Milestone Diamond */}
                        <div className="flex-1 relative h-8 flex items-center">
                          {isMilestone ? (
                            /* Zero-Duration Milestone Marker (Diamond) */
                            <div
                              className={`absolute w-5 h-5 rotate-45 -translate-x-1/2 flex items-center justify-center transition-all ${
                                isCrit
                                  ? 'bg-critical ring-2 ring-critical-border'
                                  : 'bg-brand ring-2 ring-brand-border'
                              } ${isSelected ? 'scale-125' : ''}`}
                              style={{ left: `${(act.es / timelineMaxDays) * 100}%` }}
                              title={`Milestone: ${act.name} (Day ${act.es})`}
                            >
                              <Flag className="w-2.5 h-2.5 text-white -rotate-45" />
                            </div>
                          ) : (
                            /* Active Planned Task Bar */
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
                          )}

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
                  })
                )}
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
                    <span className="font-medium text-ink-secondary">Progress Fill</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-dashed border-success bg-success-light"></span>
                    <span className="font-medium text-success">Total Float Buffer</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-brand rotate-45 inline-block"></span>
                    <span className="font-medium text-brand">Milestone Task (0d)</span>
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
                      (Planned: {selectedAct.duration} workdays &bull; Days {selectedAct.es}–{selectedAct.ef} &bull; Float: {selectedAct.totalFloat}d)
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    {selectedAct.description}
                  </p>
                </div>

                {/* Interactive Duration & Progress Modifiers */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Inline Duration Input */}
                  <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-border shadow-xs">
                    <span className="text-xs font-semibold text-ink-primary">Duration:</span>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={selectedAct.duration}
                      onChange={e => updateActivityDuration(selectedAct.id, Number(e.target.value))}
                      className="w-12 font-mono font-bold text-xs text-ink-primary bg-warm px-1.5 py-0.5 rounded border border-border text-center"
                    />
                    <span className="text-xs text-ink-muted">days</span>
                  </div>

                  {/* Interactive Progress Slider */}
                  <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-border shadow-xs">
                    <Sliders className="w-3.5 h-3.5 text-brand" />
                    <span className="text-xs font-semibold text-ink-primary whitespace-nowrap">
                      Progress:
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
                    <span className="font-mono font-bold text-xs text-ink-primary w-8 text-right">
                      {selectedAct.progress ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Part 2: Academic Comparative Analysis Matrix */}
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-xs">
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
                  &ldquo;What depends on what?&rdquo;
                </h4>
                <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                  Focuses purely on logical structure, precedence flow, topological dependencies, and algorithmic float calculation. Calendar scale is absent.
                </p>
              </div>

              <div className="p-5 bg-white rounded-lg border border-border text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                  Gantt Chart (Bar Timeline)
                </span>
                <h4 className="text-lg font-bold text-ink-primary font-sans">
                  &ldquo;When does it happen?&rdquo;
                </h4>
                <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                  Focuses on chronological execution, calendar dates, resource allocation over time, concurrent workloads, and real-time completion tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
