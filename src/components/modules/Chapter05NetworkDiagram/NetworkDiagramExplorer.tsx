import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { CHAPTERS_DATA } from '../../../data/educationalContent';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { LiveDelayAlert } from '../../common/LiveDelayAlert';
import {
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Maximize2,
  Minimize2,
  CheckCircle2,
  HelpCircle,
  GitCommit,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  AlertCircle,
} from 'lucide-react';

interface NodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_LAYOUTS: Record<string, NodeLayout> = {
  A: { id: 'A', x: 60, y: 160, width: 160, height: 96 },
  B: { id: 'B', x: 290, y: 60, width: 160, height: 96 },
  C: { id: 'C', x: 290, y: 260, width: 160, height: 96 },
  D: { id: 'D', x: 520, y: 160, width: 160, height: 96 },
  E: { id: 'E', x: 750, y: 160, width: 160, height: 96 },
  F: { id: 'F', x: 960, y: 160, width: 160, height: 96 },
};

interface EdgeDefinition {
  from: string;
  to: string;
}

export const NetworkDiagramExplorer: React.FC = () => {
  const {
    schedule,
    selectedActivityId,
    setSelectedActivityId,
    showCriticalPath,
    setShowCriticalPath,
    showFloat,
    setShowFloat,
    highlightedPathId,
    setHighlightedPathId,
    updateActivityDuration,
    updateActivityProgress,
    resetToBaseline,
    isModified,
  } = useSchedule();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<EdgeDefinition | null>(null);
  const [nodeViewMode, setNodeViewMode] = useState<'cpmBox' | 'standard'>('cpmBox');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  // Zoom and Pan controls
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const chapter5 = CHAPTERS_DATA[4];
  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(1.5, Number((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.7, Number((prev - 0.15).toFixed(2))));
  const handleFitToScreen = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pointer-based Pan Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: Math.round(e.clientX - dragStart.x),
      y: Math.round(e.clientY - dragStart.y),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard navigation & Esc exit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTheaterMode) {
          setIsTheaterMode(false);
        } else {
          setSelectedActivityId(null);
          setHighlightedPathId(null);
        }
      } else if (e.key === 'ArrowRight' && !isDragging) {
        const ids = schedule.activityList.map(a => a.id);
        if (ids.length === 0) return;
        const currentIndex = selectedActivityId ? ids.indexOf(selectedActivityId) : -1;
        const nextId = ids[(currentIndex + 1) % ids.length];
        setSelectedActivityId(nextId);
      } else if (e.key === 'ArrowLeft' && !isDragging) {
        const ids = schedule.activityList.map(a => a.id);
        if (ids.length === 0) return;
        const currentIndex = selectedActivityId ? ids.indexOf(selectedActivityId) : 0;
        const prevId = ids[(currentIndex - 1 + ids.length) % ids.length];
        setSelectedActivityId(prevId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTheaterMode, selectedActivityId, schedule.activityList, isDragging, setSelectedActivityId, setHighlightedPathId]);

  // Generate dynamic edges from active schedule topology
  const dynamicEdges = React.useMemo(() => {
    const list: EdgeDefinition[] = [];
    schedule.activityList.forEach(act => {
      act.predecessors.forEach(predId => {
        if (NODE_LAYOUTS[predId] && NODE_LAYOUTS[act.id]) {
          list.push({ from: predId, to: act.id });
        }
      });
    });
    return list;
  }, [schedule.activityList]);

  // Determine if an edge is critical
  const isEdgeCritical = (from: string, to: string) => {
    return schedule.criticalPaths.some(path => {
      const ids = path.activityIds;
      for (let i = 0; i < ids.length - 1; i++) {
        if (ids[i] === from && ids[i + 1] === to) return true;
      }
      return false;
    });
  };

  // Determine if an edge is on highlighted path
  const isEdgeOnPath = (from: string, to: string, pathId: string | null) => {
    if (!pathId) return false;
    const targetPath = schedule.allPaths.find(p => p.id === pathId);
    if (!targetPath) return false;
    const ids = targetPath.activityIds;
    for (let i = 0; i < ids.length - 1; i++) {
      if (ids[i] === from && ids[i + 1] === to) return true;
    }
    return false;
  };

  // Generate smooth cubic bezier path for an edge with clean arrow tip offset
  const getEdgePath = (fromId: string, toId: string) => {
    const fromNode = NODE_LAYOUTS[fromId];
    const toNode = NODE_LAYOUTS[toId];
    if (!fromNode || !toNode) return '';

    const startX = fromNode.x + fromNode.width;
    const startY = fromNode.y + fromNode.height / 2;
    // Set endX 2px before node left edge so the arrowhead tip is fully visible and not clipped by rect border
    const endX = toNode.x - 2;
    const endY = toNode.y + toNode.height / 2;

    const dx = endX - startX;
    const cp1x = startX + dx * 0.45;
    const cp1y = startY;
    const cp2x = startX + dx * 0.55;
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  const hasMultipleCriticalPaths = schedule.criticalPaths.length > 1;

  return (
    <section id="chapter-05" className="w-full bg-white py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter5}
          tagline="Activity-on-Node (AON) Topology &amp; Concurrency"
        />

        <PresenterNotes
          member="Member 3 (Speaker 3)"
          timeAllocation="5 minutes"
          keyTakeaway="The Network Diagram maps pure project logic. It reveals where tasks can execute concurrently in parallel and where downstream work is bottlenecked."
          talkingPoints={[
            'Define Activity-on-Node (AON / Precedence Diagramming Method): nodes represent activities, arrows represent dependencies.',
            'Explain the 6-cell node standard: top row is early dates (ES, D, EF); bottom row is late dates (LS, TF, LF).',
            'Point out the parallel branch: System Design (B) and Database Design (C) both burst from Requirements (A).',
            'Point out the merge at Activity D: Development requires BOTH B and C to complete before Day 8!',
            'Use path tracing to demonstrate Path 1 (A-B-D-E-F = 18d) vs Path 2 (A-C-D-E-F = 17d).',
            'Demonstrate zoom and pan for classroom projection clarity.',
          ]}
          audiencePrompt="Why can't Activity D (Development) begin on Day 7 when Database Design (C) finishes on Day 6?"
        />

        <LiveDelayAlert />

        {/* Theater Mode Backdrop Overlay */}
        {isTheaterMode && (
          <div
            className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsTheaterMode(false)}
          />
        )}

        {/* Main Vector SVG Network Diagram Workspace */}
        <div
          className={`bg-warm rounded-xl border border-border p-6 sm:p-8 mb-8 transition-all shadow-xs ${
            isTheaterMode
              ? 'fixed inset-3 sm:inset-6 z-50 overflow-y-auto shadow-elevated bg-white'
              : ''
          }`}
        >
          {/* Controls Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Interactive Component
                </span>
                <span className="text-xs text-ink-muted">&bull; Pure Vector SVG Canvas</span>
                {hasMultipleCriticalPaths && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-critical-light text-critical border border-critical-border">
                    Dual Critical Paths Detected ({schedule.criticalPaths.length})
                  </span>
                )}
                {isTheaterMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-warm text-ink-secondary border border-border">
                    Esc to exit
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-ink-primary mt-0.5">
                Activity-on-Node (AON) Network Diagram
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Click any node to inspect. Drag canvas to pan. Hover over arrows to trace logical dependencies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Zoom & Viewport Controls */}
              <div className="inline-flex items-center rounded-lg border border-border p-1 bg-white text-xs font-semibold shadow-xs">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.7}
                  className="p-1 rounded text-ink-secondary hover:text-ink-primary disabled:opacity-40"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold text-ink-primary">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 1.5}
                  className="p-1 rounded text-ink-secondary hover:text-ink-primary disabled:opacity-40"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFitToScreen}
                  className="px-2 py-0.5 rounded text-ink-secondary hover:text-ink-primary hover:bg-warm text-[11px] font-semibold ml-1"
                  title="Reset Zoom & Pan to Fit"
                >
                  Fit
                </button>
              </div>

              {/* 6-Box CPM Toggle */}
              <div className="inline-flex rounded-lg border border-border p-1 bg-white text-xs font-semibold shadow-xs">
                <button
                  onClick={() => setNodeViewMode('cpmBox')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    nodeViewMode === 'cpmBox'
                      ? 'bg-warm text-ink-primary shadow-xs font-bold'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  6-Box CPM Layout
                </button>
                <button
                  onClick={() => setNodeViewMode('standard')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    nodeViewMode === 'standard'
                      ? 'bg-warm text-ink-primary shadow-xs font-bold'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Simple Node
                </button>
              </div>

              {/* Critical Path Toggle */}
              <button
                onClick={() => setShowCriticalPath(!showCriticalPath)}
                className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all flex items-center space-x-1.5 shadow-xs ${
                  showCriticalPath
                    ? 'bg-critical-light text-critical border-critical-border'
                    : 'bg-white text-ink-secondary border-border hover:bg-surface-secondary'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-critical"></span>
                <span>Critical Path</span>
              </button>

              {/* Float Badges Toggle */}
              <button
                onClick={() => setShowFloat(!showFloat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all flex items-center space-x-1.5 shadow-xs ${
                  showFloat
                    ? 'bg-white text-ink-primary border-ink-primary'
                    : 'bg-white text-ink-secondary border-border hover:bg-surface-secondary'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Slack (Float)</span>
              </button>

              {/* Reset to Baseline Button (Active when durations modified) */}
              {isModified && (
                <button
                  onClick={resetToBaseline}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-white hover:bg-warm text-ink-primary transition-all flex items-center space-x-1 shadow-xs"
                  title="Reset all modified activity durations to original baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
                  <span>Reset Baseline</span>
                </button>
              )}

              {/* Theater / Fullscreen Toggle */}
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-white hover:bg-surface-secondary text-ink-primary transition-all flex items-center space-x-1 shadow-xs"
                title={isTheaterMode ? 'Exit theater view (Esc)' : 'Expand diagram for classroom projection'}
              >
                {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isTheaterMode ? 'Exit' : 'Expand'}</span>
              </button>
            </div>
          </div>

          {/* Path Tracer Controls */}
          <div className="pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink-muted font-bold text-[10px] uppercase tracking-wider">
                Trace Paths:
              </span>
              <button
                onClick={() => setHighlightedPathId(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  highlightedPathId === null
                    ? 'bg-ink-primary text-white shadow-xs'
                    : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
                }`}
              >
                All Paths
              </button>
              {schedule.allPaths.map(path => {
                const isSelected = highlightedPathId === path.id;
                return (
                  <button
                    key={path.id}
                    onClick={() => setHighlightedPathId(isSelected ? null : path.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                      isSelected
                        ? path.isCritical
                          ? 'bg-critical text-white border-critical font-bold shadow-xs'
                          : 'bg-ink-primary text-white border-ink-primary font-bold shadow-xs'
                        : path.isCritical
                        ? 'bg-critical-light text-critical border-critical-border'
                        : 'bg-white text-ink-secondary border-border hover:border-ink-secondary'
                    }`}
                  >
                    <span>{path.description}</span>
                    <span className="font-mono text-[11px] opacity-90 font-bold">({path.totalDuration}d)</span>
                    {path.isCritical && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1 rounded bg-white/20">
                        Crit
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              {(panOffset.x !== 0 || panOffset.y !== 0) && (
                <button
                  onClick={() => setPanOffset({ x: 0, y: 0 })}
                  className="text-[11px] font-mono text-ink-muted hover:text-ink-primary flex items-center space-x-1"
                  title="Center Pan Position"
                >
                  <Move className="w-3 h-3" />
                  <span>Reset Pan ({panOffset.x}, {panOffset.y})</span>
                </button>
              )}

              {hasMultipleCriticalPaths && (
                <div className="text-critical text-xs font-semibold flex items-center space-x-1.5 bg-critical-light px-2.5 py-1 rounded border border-critical-border">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Dual critical paths ({schedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ')})</span>
                </div>
              )}
            </div>
          </div>

          {/* Large Prominent Vector SVG Container with Zoom & Interactive Pan */}
          {/* Mobile Pan / Pinch Helper Hint */}
          <div className="sm:hidden flex items-center justify-between text-[11px] text-ink-muted mt-3 mb-1 px-1">
            <span className="flex items-center space-x-1">
              <Move className="w-3 h-3 text-brand" />
              <span>Drag to pan graph • Tap node to inspect</span>
            </span>
            <button
              onClick={handleFitToScreen}
              className="text-brand font-semibold hover:underline"
            >
              Reset View
            </button>
          </div>

          <div
            className={`relative mt-2 sm:mt-4 bg-white rounded-lg border border-border p-3 sm:p-6 overflow-hidden shadow-xs touch-none select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Live Hovered Edge Dependency HUD Pill */}
            {hoveredEdge && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-lg bg-ink-primary text-white text-xs font-mono shadow-elevated flex items-center space-x-2 animate-fadeIn pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                <span className="font-bold text-brand">Dependency Link:</span>
                <span>
                  {hoveredEdge.from} ({schedule.activities[hoveredEdge.from]?.name}) &rarr; {hoveredEdge.to} ({schedule.activities[hoveredEdge.to]?.name})
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider">
                  Finish-to-Start (FS)
                </span>
              </div>
            )}

            {/* Canvas Transform Wrapper */}
            <div
              className="w-full overflow-x-auto"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'top center',
                transition: isDragging ? 'none' : 'transform 150ms ease-out',
              }}
            >
              <svg
                viewBox="0 0 1180 420"
                className="w-full min-w-[980px] h-auto select-none"
                style={{ maxHeight: isTheaterMode ? '70vh' : '480px' }}
              >
                {/* SVG Definitions: Arrow Markers */}
                <defs>
                  <marker
                    id="arrow-default"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#92928A" />
                  </marker>

                  <marker
                    id="arrow-critical"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#BE645A" />
                  </marker>

                  <marker
                    id="arrow-highlighted"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#151515" />
                  </marker>
                </defs>

                {/* Structural Badges: Parallel Burst & Merge Convergence */}
                <g className="font-sans select-none pointer-events-none">
                  {/* Parallel Burst Callout directly aligned above Task B */}
                  <g transform="translate(290, 24)">
                    <rect x="0" y="0" width="160" height="22" rx="4" fill="#F4F5F0" stroke="#E5E6DE" strokeWidth="1" />
                    <text x="80" y="15" textAnchor="middle" className="text-[10px] font-bold fill-ink-primary">
                      Parallel Burst (Tasks B &amp; C)
                    </text>
                  </g>

                  {/* Merge Convergence Callout directly aligned above Task D */}
                  <g transform="translate(520, 124)">
                    <rect x="0" y="0" width="160" height="22" rx="4" fill="#F4F5F0" stroke="#E5E6DE" strokeWidth="1" />
                    <text x="80" y="15" textAnchor="middle" className="text-[10px] font-bold fill-ink-primary">
                      Merge Point (Needs Both B &amp; C)
                    </text>
                  </g>
                </g>

                {/* 1. EDGES */}
                {dynamicEdges.map((edge, idx) => {
                  const pathD = getEdgePath(edge.from, edge.to);
                  const isCrit = showCriticalPath && isEdgeCritical(edge.from, edge.to);
                  const isOnHighlightedPath = isEdgeOnPath(edge.from, edge.to, highlightedPathId);
                  const isConnectedToSelected =
                    selectedActivityId === edge.from || selectedActivityId === edge.to;
                  const isConnectedToHoveredNode =
                    hoveredNodeId === edge.from || hoveredNodeId === edge.to;
                  const isThisEdgeHovered =
                    hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to;

                  let strokeColor = '#D8D9D4';
                  let strokeWidth = 1.75;
                  let markerEnd = 'url(#arrow-default)';

                  if (isCrit) {
                    strokeColor = '#BE645A';
                    strokeWidth = 2.75;
                    markerEnd = 'url(#arrow-critical)';
                  }

                  if (isOnHighlightedPath) {
                    strokeColor = '#151515';
                    strokeWidth = 3;
                    markerEnd = 'url(#arrow-highlighted)';
                  } else if (isThisEdgeHovered || isConnectedToSelected || isConnectedToHoveredNode) {
                    strokeColor = '#151515';
                    strokeWidth = 2.5;
                    markerEnd = 'url(#arrow-highlighted)';
                  }

                  return (
                    <g
                      key={`edge-${idx}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredEdge(edge)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedActivityId(edge.to);
                      }}
                    >
                      {/* Invisible wider stroke for reliable hover hit detection */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={18}
                      />
                      {/* Visible Bezier Edge */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        markerEnd={markerEnd}
                        className={`transition-colors duration-200 ${
                          isCrit ? 'animate-critical-glow' : ''
                        } ${isOnHighlightedPath ? 'animate-dash-flow' : ''}`}
                      />
                    </g>
                  );
                })}

                {/* 2. NODES */}
                {schedule.activityList.map(act => {
                  const layout = NODE_LAYOUTS[act.id];
                  if (!layout) return null;

                  const isSelected = selectedActivityId === act.id;
                  const isHovered = hoveredNodeId === act.id;
                  const isEdgeConnected =
                    hoveredEdge?.from === act.id || hoveredEdge?.to === act.id;
                  const isCrit = showCriticalPath && act.isCritical;
                  const isOnPath = highlightedPathId
                    ? schedule.allPaths
                        .find(p => p.id === highlightedPathId)
                        ?.activityIds.includes(act.id)
                    : false;

                  let nodeBorderColor = '#E5E6DE';
                  let nodeBgColor = '#FFFFFF';

                  if (isCrit) {
                    nodeBorderColor = '#F5C2BC';
                    nodeBgColor = '#FFF9F8';
                  }

                  if (isOnPath) {
                    nodeBorderColor = '#151515';
                    nodeBgColor = '#FFFFFF';
                  }

                  if (isSelected || isEdgeConnected) {
                    nodeBorderColor = '#151515';
                    nodeBgColor = '#FFFFFF';
                  }

                  return (
                    <g
                      key={act.id}
                      transform={`translate(${layout.x}, ${layout.y})`}
                      className="cursor-pointer transition-all duration-200"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedActivityId(act.id);
                      }}
                      onMouseEnter={() => setHoveredNodeId(act.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <title>{`Activity ${act.id}: ${act.name}\nDuration: ${act.duration} workdays\nES: Day ${act.es}, EF: Day ${act.ef}\nLS: Day ${act.ls}, LF: Day ${act.lf}\nTotal Float: ${act.totalFloat}d ${act.isCritical ? '(CRITICAL)' : ''}`}</title>

                      {/* Outer Node Card */}
                      <rect
                        width={layout.width}
                        height={layout.height}
                        rx="8"
                        ry="8"
                        fill={nodeBgColor}
                        stroke={nodeBorderColor}
                        strokeWidth={isSelected ? 2.5 : isEdgeConnected ? 2 : isCrit ? 2 : 1.25}
                        filter={isSelected ? 'drop-shadow(0 4px 8px rgba(21, 21, 21, 0.12))' : 'drop-shadow(0 1px 3px rgba(21, 21, 21, 0.04))'}
                      />

                      {nodeViewMode === 'cpmBox' ? (
                        /* High-Yield 6-Cell CPM Node Grid with Micro-Labels */
                        <g>
                          {/* Horizontal Dividers */}
                          <line x1="0" y1="30" x2={layout.width} y2="30" stroke={nodeBorderColor} strokeWidth="1" />
                          <line x1="0" y1="66" x2={layout.width} y2="66" stroke={nodeBorderColor} strokeWidth="1" />

                          {/* Top Row Vertical Dividers */}
                          <line x1="52" y1="0" x2="52" y2="30" stroke={nodeBorderColor} strokeWidth="1" />
                          <line x1="108" y1="0" x2="108" y2="30" stroke={nodeBorderColor} strokeWidth="1" />

                          {/* Bottom Row Vertical Dividers */}
                          <line x1="52" y1="66" x2="52" y2={layout.height} stroke={nodeBorderColor} strokeWidth="1" />
                          <line x1="108" y1="66" x2="108" y2={layout.height} stroke={nodeBorderColor} strokeWidth="1" />

                          {/* TOP ROW: ES | DURATION | EF */}
                          <text x="8" y="11" className="text-[7px] font-mono font-bold fill-ink-muted">ES</text>
                          <text x="30" y="21" textAnchor="middle" className="text-xs font-mono font-bold fill-ink-primary">
                            {act.es}
                          </text>

                          <text x="60" y="11" className="text-[7px] font-mono font-bold fill-ink-muted">D</text>
                          <text x="80" y="21" textAnchor="middle" className="text-xs font-mono font-bold fill-ink-primary">
                            {act.duration}d
                          </text>

                          <text x="114" y="11" className="text-[7px] font-mono font-bold fill-ink-muted">EF</text>
                          <text x="134" y="21" textAnchor="middle" className="text-xs font-mono font-bold fill-ink-primary">
                            {act.ef}
                          </text>

                          {/* MIDDLE ROW: ACTIVITY ID BADGE & TRUNCATED NAME */}
                          <rect x="8" y="38" width="18" height="18" rx="3" fill="#151515" />
                          <text x="17" y="51" textAnchor="middle" className="text-[11px] font-mono font-bold fill-white">
                            {act.id}
                          </text>
                          <text x="32" y="52" className="text-xs font-bold fill-ink-primary">
                            {act.name.length > 15 ? `${act.name.substring(0, 14)}…` : act.name}
                          </text>

                          {/* BOTTOM ROW: LS | TOTAL FLOAT | LF */}
                          <text x="8" y="77" className="text-[7px] font-mono font-bold fill-ink-muted">LS</text>
                          <text x="30" y="86" textAnchor="middle" className="text-xs font-mono font-semibold fill-ink-secondary">
                            {act.ls}
                          </text>

                          <text x="60" y="77" className="text-[7px] font-mono font-bold fill-ink-muted">TF</text>
                          <text
                            x="80"
                            y="86"
                            textAnchor="middle"
                            className={`text-xs font-mono font-bold ${
                              act.isCritical ? 'fill-critical' : 'fill-success'
                            }`}
                          >
                            {act.totalFloat === 0 ? '0' : `${act.totalFloat}`}
                          </text>

                          <text x="114" y="77" className="text-[7px] font-mono font-bold fill-ink-muted">LF</text>
                          <text x="134" y="86" textAnchor="middle" className="text-xs font-mono font-semibold fill-ink-secondary">
                            {act.lf}
                          </text>
                        </g>
                      ) : (
                        /* Simple Node View */
                        <g>
                          <rect x="12" y="18" width="22" height="22" rx="4" fill="#151515" />
                          <text x="23" y="33" textAnchor="middle" className="text-xs font-mono font-bold fill-white">
                            {act.id}
                          </text>
                          <text x="42" y="34" className="text-xs font-bold fill-ink-primary">
                            {act.name.length > 15 ? `${act.name.substring(0, 14)}…` : act.name}
                          </text>
                          <text x="14" y="60" className="text-xs font-mono fill-ink-secondary">
                            Duration: {act.duration} workdays
                          </text>
                          <text x="14" y="80" className="text-xs font-mono fill-ink-muted">
                            ES:{act.es} EF:{act.ef} &bull; Float:{act.totalFloat}d
                          </text>
                        </g>
                      )}

                      {/* Critical Indicator Dot */}
                      {isCrit && (
                        <circle cx={layout.width - 8} cy="8" r="4" fill="#BE645A" />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Node Anatomy Legend */}
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-ink-secondary gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-ink-primary">6-Box Anatomy:</span>
              <span className="font-mono text-xs"><strong className="text-ink-primary">[ES]</strong> Early Start</span>
              <span className="font-mono text-xs"><strong className="text-ink-primary">[D]</strong> Duration</span>
              <span className="font-mono text-xs"><strong className="text-ink-primary">[EF]</strong> Early Finish</span>
              <span className="font-mono text-xs"><strong className="text-ink-secondary">[LS]</strong> Late Start</span>
              <span className="font-mono text-xs"><strong className="text-success">[TF]</strong> Total Float</span>
              <span className="font-mono text-xs"><strong className="text-ink-secondary">[LF]</strong> Late Finish</span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 font-semibold text-critical">
                <span className="w-3 h-1.5 bg-critical inline-block rounded"></span>
                <span>Critical Path (Float = 0)</span>
              </span>
              <span className="flex items-center space-x-1.5 font-semibold text-ink-secondary">
                <span className="w-3 h-1.5 bg-border-strong inline-block rounded"></span>
                <span>Non-Critical Logic</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node Contextual Inspector */}
        {selectedAct && (
          <div className="bg-warm rounded-xl border border-border p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-md bg-ink-primary text-white flex items-center justify-center font-mono font-bold text-sm">
                    {selectedAct.id}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-ink-primary">
                    {selectedAct.name}
                  </h4>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      selectedAct.isCritical
                        ? 'bg-critical-light text-critical'
                        : 'bg-success-light text-success'
                    }`}
                  >
                    {selectedAct.isCritical ? 'Critical Activity (0 Slack)' : 'Non-Critical (Has Buffer)'}
                  </span>
                  {selectedAct.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-border text-ink-secondary font-medium">
                      Category: {selectedAct.category}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-ink-secondary">
                  {selectedAct.description}
                </p>
              </div>

              {/* Quick Duration & Progress Modifiers */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-3 bg-white px-3.5 py-1.5 rounded-lg border border-border shrink-0 shadow-xs">
                  <span className="text-xs font-semibold text-ink-primary">Duration:</span>
                  <button
                    onClick={() => updateActivityDuration(selectedAct.id, selectedAct.duration - 1)}
                    disabled={selectedAct.duration <= 1}
                    className="w-6 h-6 rounded bg-warm border border-border flex items-center justify-center font-bold text-xs disabled:opacity-40 hover:bg-surface-secondary"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-ink-primary w-8 text-center">
                    {selectedAct.duration}d
                  </span>
                  <button
                    onClick={() => updateActivityDuration(selectedAct.id, selectedAct.duration + 1)}
                    className="w-6 h-6 rounded bg-warm border border-border flex items-center justify-center font-bold text-xs hover:bg-surface-secondary"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-lg border border-border shrink-0 shadow-xs">
                  <span className="text-xs font-semibold text-ink-primary">Progress:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={selectedAct.progress ?? 0}
                    onChange={e => updateActivityProgress(selectedAct.id, Number(e.target.value))}
                    className="w-20 accent-brand cursor-pointer"
                  />
                  <span className="font-mono font-bold text-xs text-ink-primary w-8 text-right">
                    {selectedAct.progress ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Duration</span>
                <span className="font-mono text-sm font-bold text-ink-primary">{selectedAct.duration} workdays</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Early Start (ES)</span>
                <span className="font-mono text-sm font-bold text-ink-primary">Day {selectedAct.es}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Early Finish (EF)</span>
                <span className="font-mono text-sm font-bold text-ink-primary">Day {selectedAct.ef}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Late Start (LS)</span>
                <span className="font-mono text-sm font-bold text-ink-secondary">Day {selectedAct.ls}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Late Finish (LF)</span>
                <span className="font-mono text-sm font-bold text-ink-secondary">Day {selectedAct.lf}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-border text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-ink-muted block">Total Float</span>
                <span className={`font-mono text-sm font-bold ${selectedAct.isCritical ? 'text-critical' : 'text-success'}`}>
                  {selectedAct.totalFloat} day{selectedAct.totalFloat !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Predecessors & Successors Inspection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div className="bg-white p-4 rounded-lg border border-border shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-primary block mb-2">
                  Immediate Predecessors (Incoming Work):
                </span>
                {selectedAct.predecessors.length === 0 ? (
                  <p className="text-xs text-ink-muted italic">None (Root project starting activity - begins Day 1)</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedAct.predecessors.map(predId => {
                      const predAct = schedule.activities[predId];
                      return (
                        <div key={predId} className="flex items-center justify-between text-xs bg-warm p-2 rounded-md border border-border">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded bg-ink-primary text-white inline-flex items-center justify-center font-mono font-bold text-[10px]">
                              {predId}
                            </span>
                            <span className="font-semibold text-ink-primary">{predAct?.name}</span>
                          </div>
                          <span className="font-mono text-ink-muted">Early Finish: Day {predAct?.ef}</span>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-ink-secondary font-mono mt-2">
                      ES Calculation: max({selectedAct.predecessors.map(p => `EF_${p}`).join(', ')}) + 1 = Day {selectedAct.es}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg border border-border shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-primary block mb-2">
                  Immediate Successors (Dependent Downstream Tasks):
                </span>
                {selectedAct.successors.length === 0 ? (
                  <p className="text-xs text-ink-muted italic">None (Terminal activity - marks project completion on Day {schedule.projectDuration})</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedAct.successors.map(succId => {
                      const succAct = schedule.activities[succId];
                      return (
                        <div key={succId} className="flex items-center justify-between text-xs bg-warm p-2 rounded-md border border-border">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded bg-ink-primary text-white inline-flex items-center justify-center font-mono font-bold text-[10px]">
                              {succId}
                            </span>
                            <span className="font-semibold text-ink-primary">{succAct?.name}</span>
                          </div>
                          <span className="font-mono text-ink-muted">Late Start: Day {succAct?.ls}</span>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-ink-secondary font-mono mt-2">
                      LF Calculation: min({selectedAct.successors.map(s => `LS_${s}`).join(', ')}) - 1 = Day {selectedAct.lf}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
