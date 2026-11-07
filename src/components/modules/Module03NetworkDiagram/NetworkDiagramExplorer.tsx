import React, { useState } from 'react';
import { useSchedule } from '../../../context/ScheduleContext';
import { SectionHeader } from '../../common/SectionHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { LiveDelayAlert } from '../../common/LiveDelayAlert';
import {
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Info,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  GitCommit,
  ZoomIn,
} from 'lucide-react';

interface NodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_LAYOUTS: Record<string, NodeLayout> = {
  A: { id: 'A', x: 70, y: 155, width: 140, height: 86 },
  B: { id: 'B', x: 280, y: 65, width: 140, height: 86 },
  C: { id: 'C', x: 280, y: 245, width: 140, height: 86 },
  D: { id: 'D', x: 490, y: 155, width: 140, height: 86 },
  E: { id: 'E', x: 700, y: 155, width: 140, height: 86 },
  F: { id: 'F', x: 900, y: 155, width: 140, height: 86 },
};

interface EdgeDefinition {
  from: string;
  to: string;
}

const EDGES: EdgeDefinition[] = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'C', to: 'D' },
  { from: 'D', to: 'E' },
  { from: 'E', to: 'F' },
];

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
  } = useSchedule();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodeViewMode, setNodeViewMode] = useState<'standard' | 'cpmBox'>('cpmBox');

  const selectedAct = selectedActivityId ? schedule.activities[selectedActivityId] : null;

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

  // Generate smooth cubic bezier path for an edge
  const getEdgePath = (fromId: string, toId: string) => {
    const fromNode = NODE_LAYOUTS[fromId];
    const toNode = NODE_LAYOUTS[toId];
    if (!fromNode || !toNode) return '';

    const startX = fromNode.x + fromNode.width;
    const startY = fromNode.y + fromNode.height / 2;
    const endX = toNode.x;
    const endY = toNode.y + toNode.height / 2;

    const dx = endX - startX;
    const cp1x = startX + dx * 0.45;
    const cp1y = startY;
    const cp2x = startX + dx * 0.55;
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  return (
    <section id="module-03" className="py-12 border-b border-border scroll-mt-20">
      <SectionHeader
        moduleNumber="Module 03"
        member="Member 3"
        title="Network Diagram &amp; Precedence Architecture"
        subtitle="Network Diagrams answer the fundamental question: 'What depends on what?' Discover the Activity-on-Node (AON) convention, trace parallel paths, and inspect merging dependencies that constrain the project."
        tagline="Activity-on-Node (AON) Model"
      />

      <PresenterNotes
        member="Member 3 (Speaker 3)"
        timeAllocation="4–5 minutes"
        keyTakeaway="The Network Diagram visually proves project logic. It reveals where work can happen in parallel (burst from A) and where work is bottlenecked (merge into D)."
        talkingPoints={[
          'Define Activity-on-Node (AON / PDM): nodes are tasks, arrows are precedence rules.',
          'Explain the 6-cell node standard: ES, Duration, EF on top; LS, Float, LF on bottom.',
          'Point out the parallel branches: why System Design (B) and Database Design (C) happen concurrently.',
          'Point out the merge at Activity D: D cannot start until BOTH B and C are 100% finished!',
          'Demonstrate the path highlighting: Path 1 (A-B-D-E-F = 18d) vs Path 2 (A-C-D-E-F = 17d).',
        ]}
        audiencePrompt="Why can't Development (D) start on Day 7 when Database Design (C) finishes on Day 6?"
      />

      <LiveDelayAlert />

      {/* Network Diagram Studio Card */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 mb-8">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Interactive Component
              </span>
              <span className="text-xs text-ink-muted">&bull; Pure Vector SVG</span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary">
              Activity-on-Node (AON) Network Diagram Explorer
            </h3>
            <p className="text-xs text-ink-secondary">
              Click any node to inspect its predecessors, successors, and float calculations. Hover over connections to trace precedence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Standard vs CPM 6-Box */}
            <div className="inline-flex rounded-md border border-border p-0.5 bg-canvas text-xs">
              <button
                onClick={() => setNodeViewMode('cpmBox')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  nodeViewMode === 'cpmBox'
                    ? 'bg-white text-ink-primary shadow-xs font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="Display standard academic 6-cell CPM node layout (ES, D, EF, LS, Float, LF)"
              >
                6-Box CPM Node
              </button>
              <button
                onClick={() => setNodeViewMode('standard')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  nodeViewMode === 'standard'
                    ? 'bg-white text-ink-primary shadow-xs font-semibold'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="Display compact card node"
              >
                Compact Card
              </button>
            </div>

            {/* Critical Path Toggle */}
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                showCriticalPath
                  ? 'bg-critical-light text-critical border-critical-border font-semibold'
                  : 'bg-white text-ink-secondary border-border hover:bg-canvas'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-critical"></span>
              <span>Highlight Critical Path</span>
            </button>

            {/* Float Badge Toggle */}
            <button
              onClick={() => setShowFloat(!showFloat)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                showFloat
                  ? 'bg-brand-light text-brand border-brand-border font-semibold'
                  : 'bg-white text-ink-secondary border-border hover:bg-canvas'
              }`}
            >
              <Eye className="w-3 h-3 text-brand" />
              <span>Float Badges</span>
            </button>
          </div>
        </div>

        {/* Path Tracer Quick Filters */}
        <div className="pt-3 pb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ink-muted font-semibold text-[11px] uppercase tracking-wider">
            Trace Network Paths:
          </span>
          <button
            onClick={() => setHighlightedPathId(null)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
              highlightedPathId === null
                ? 'bg-ink-primary text-white font-semibold'
                : 'bg-canvas text-ink-secondary hover:text-ink-primary border border-border'
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
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                  isSelected
                    ? path.isCritical
                      ? 'bg-critical text-white border-critical font-bold shadow-xs'
                      : 'bg-brand text-white border-brand font-bold shadow-xs'
                    : path.isCritical
                    ? 'bg-critical-light text-critical border-critical-border'
                    : 'bg-white text-ink-secondary border-border hover:border-brand-border'
                }`}
              >
                <span>{path.description}</span>
                <span className="font-mono text-[10px] opacity-90">({path.totalDuration}d)</span>
                {path.isCritical && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1 rounded bg-white/20">
                    Crit
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SVG Network Canvas Container */}
        <div className="relative mt-3 bg-canvas rounded-xl border border-border p-4 overflow-x-auto">
          <svg
            viewBox="0 0 1100 390"
            className="w-full min-w-[900px] h-auto select-none"
            style={{ maxHeight: '420px' }}
          >
            {/* SVG Definitions: Arrow Markers */}
            <defs>
              {/* Default Arrow */}
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#8F9CAE" />
              </marker>

              {/* Critical Arrow */}
              <marker
                id="arrow-critical"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#D66B68" />
              </marker>

              {/* Highlighted Arrow */}
              <marker
                id="arrow-highlighted"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#477CB8" />
              </marker>
            </defs>

            {/* Background Structural Legend / Annotations in SVG */}
            <g className="text-[11px] font-sans fill-ink-muted">
              <text x="350" y="45" textAnchor="middle" className="font-semibold text-xs fill-brand">
                Parallel Concurrency Branch (Tasks B &amp; C)
              </text>
              <line x1="280" y1="52" x2="420" y2="52" stroke="#D0DFEF" strokeWidth="1" strokeDasharray="3,3" />

              <text x="560" y="135" textAnchor="middle" className="font-semibold text-xs fill-ink-secondary">
                Merge Point (Requires Both B &amp; C)
              </text>
            </g>

            {/* 1. EDGES (Connecting arrows) */}
            {EDGES.map((edge, idx) => {
              const pathD = getEdgePath(edge.from, edge.to);
              const isCrit = showCriticalPath && isEdgeCritical(edge.from, edge.to);
              const isOnHighlightedPath = isEdgeOnPath(edge.from, edge.to, highlightedPathId);
              const isConnectedToSelected =
                selectedActivityId === edge.from || selectedActivityId === edge.to;
              const isConnectedToHovered =
                hoveredNodeId === edge.from || hoveredNodeId === edge.to;

              let strokeColor = '#CBD2DC';
              let strokeWidth = 2;
              let markerEnd = 'url(#arrow-default)';

              if (isCrit) {
                strokeColor = '#D66B68';
                strokeWidth = 3;
                markerEnd = 'url(#arrow-critical)';
              }

              if (isOnHighlightedPath) {
                strokeColor = '#477CB8';
                strokeWidth = 3.5;
                markerEnd = 'url(#arrow-highlighted)';
              } else if (isConnectedToSelected || isConnectedToHovered) {
                strokeColor = '#477CB8';
                strokeWidth = 2.5;
                markerEnd = 'url(#arrow-highlighted)';
              }

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={markerEnd}
                    className={`transition-all duration-300 ${
                      isCrit ? 'animate-critical-glow' : ''
                    } ${isOnHighlightedPath ? 'animate-dash-flow' : ''}`}
                  />
                </g>
              );
            })}

            {/* 2. NODES (Standard 6-box AON Node Format) */}
            {schedule.activityList.map(act => {
              const layout = NODE_LAYOUTS[act.id];
              if (!layout) return null;

              const isSelected = selectedActivityId === act.id;
              const isHovered = hoveredNodeId === act.id;
              const isCrit = showCriticalPath && act.isCritical;
              const isOnPath = highlightedPathId
                ? schedule.allPaths
                    .find(p => p.id === highlightedPathId)
                    ?.activityIds.includes(act.id)
                : false;

              let nodeBorderColor = '#CBD2DC';
              let nodeBgColor = '#FFFFFF';

              if (isCrit) {
                nodeBorderColor = '#D66B68';
                nodeBgColor = '#FDF6F6';
              }

              if (isOnPath) {
                nodeBorderColor = '#477CB8';
                nodeBgColor = '#F4F8FC';
              }

              if (isSelected) {
                nodeBorderColor = '#477CB8';
                nodeBgColor = isCrit ? '#FFF5F5' : '#EEF4FA';
              }

              return (
                <g
                  key={act.id}
                  transform={`translate(${layout.x}, ${layout.y})`}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedActivityId(act.id)}
                  onMouseEnter={() => setHoveredNodeId(act.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Outer Node Card */}
                  <rect
                    width={layout.width}
                    height={layout.height}
                    rx="8"
                    ry="8"
                    fill={nodeBgColor}
                    stroke={nodeBorderColor}
                    strokeWidth={isSelected ? 3 : isCrit ? 2.5 : 1.5}
                    filter={isSelected ? 'drop-shadow(0 4px 8px rgba(71, 124, 184, 0.2))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.05))'}
                  />

                  {nodeViewMode === 'cpmBox' ? (
                    /* Standard Academic 6-cell CPM Node Grid */
                    <g>
                      {/* Top Horizontal Divider */}
                      <line x1="0" y1="26" x2={layout.width} y2="26" stroke={nodeBorderColor} strokeWidth="1" />
                      {/* Bottom Horizontal Divider */}
                      <line x1="0" y1="60" x2={layout.width} y2="60" stroke={nodeBorderColor} strokeWidth="1" />

                      {/* Top Row Vertical Dividers (ES | D | EF) */}
                      <line x1="45" y1="0" x2="45" y2="26" stroke={nodeBorderColor} strokeWidth="1" />
                      <line x1="95" y1="0" x2="95" y2="26" stroke={nodeBorderColor} strokeWidth="1" />

                      {/* Bottom Row Vertical Dividers (LS | TF | LF) */}
                      <line x1="45" y1="60" x2="45" y2={layout.height} stroke={nodeBorderColor} strokeWidth="1" />
                      <line x1="95" y1="60" x2="95" y2={layout.height} stroke={nodeBorderColor} strokeWidth="1" />

                      {/* TOP ROW: ES | DURATION | EF */}
                      <text x="22.5" y="17" textAnchor="middle" className="text-[11px] font-mono font-bold fill-brand">
                        {act.es}
                      </text>
                      <text x="70" y="17" textAnchor="middle" className="text-[11px] font-mono font-bold fill-ink-primary">
                        {act.duration}d
                      </text>
                      <text x="117.5" y="17" textAnchor="middle" className="text-[11px] font-mono font-bold fill-brand">
                        {act.ef}
                      </text>

                      {/* MIDDLE ROW: ACTIVITY ID & NAME */}
                      <text x="12" y="47" className="text-sm font-mono font-bold fill-ink-primary">
                        {act.id}
                      </text>
                      <text x="32" y="47" className="text-xs font-semibold fill-ink-primary truncate">
                        {act.name.length > 13 ? `${act.name.substring(0, 12)}…` : act.name}
                      </text>

                      {/* BOTTOM ROW: LS | TOTAL FLOAT | LF */}
                      <text x="22.5" y="77" textAnchor="middle" className="text-[11px] font-mono font-bold fill-ink-secondary">
                        {act.ls}
                      </text>
                      <text
                        x="70"
                        y="77"
                        textAnchor="middle"
                        className={`text-[11px] font-mono font-bold ${
                          act.isCritical ? 'fill-critical' : 'fill-success'
                        }`}
                      >
                        {act.totalFloat === 0 ? 'TF:0' : `TF:${act.totalFloat}`}
                      </text>
                      <text x="117.5" y="77" textAnchor="middle" className="text-[11px] font-mono font-bold fill-ink-secondary">
                        {act.lf}
                      </text>
                    </g>
                  ) : (
                    /* Compact Card Mode */
                    <g>
                      <text x="15" y="30" className="text-base font-mono font-bold fill-ink-primary">
                        {act.id}
                      </text>
                      <text x="38" y="30" className="text-xs font-bold fill-ink-primary">
                        {act.name.length > 13 ? `${act.name.substring(0, 12)}…` : act.name}
                      </text>
                      <text x="15" y="52" className="text-[11px] font-mono fill-ink-secondary">
                        Duration: {act.duration} workdays
                      </text>
                      <text x="15" y="70" className="text-[11px] font-mono fill-ink-muted">
                        ES:{act.es} EF:{act.ef} &bull; Float: {act.totalFloat}d
                      </text>
                    </g>
                  )}

                  {/* Critical Star or Badge */}
                  {isCrit && (
                    <circle cx={layout.width - 6} cy="6" r="5" fill="#D66B68" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Legend / Guide */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between text-xs text-ink-secondary gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-ink-primary">6-Box Node Anatomy:</span>
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-brand font-bold">[ES]</span>
              <span>Early Start</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-ink-primary font-bold">[D]</span>
              <span>Duration</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-brand font-bold">[EF]</span>
              <span>Early Finish</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-ink-secondary font-bold">[LS]</span>
              <span>Late Start</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-success font-bold">[TF]</span>
              <span>Total Float</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-ink-secondary font-bold">[LF]</span>
              <span>Late Finish</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-1 bg-critical inline-block rounded"></span>
              <span className="font-semibold text-critical">Critical Path (TF = 0)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-1 bg-brand inline-block rounded"></span>
              <span>Non-Critical Logic</span>
            </span>
          </div>
        </div>
      </div>

      {/* Selected Node Deep Inspector Panel */}
      {selectedAct && (
        <div className="bg-canvas rounded-xl border border-border p-5 shadow-subtle mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-mono font-bold text-sm">
                  {selectedAct.id}
                </span>
                <h4 className="text-base font-bold text-ink-primary">
                  {selectedAct.name}
                </h4>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    selectedAct.isCritical
                      ? 'bg-critical-light text-critical'
                      : 'bg-success-light text-success'
                  }`}
                >
                  {selectedAct.isCritical ? 'Critical Activity' : 'Non-Critical (Has Slack)'}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-secondary">
                {selectedAct.description}
              </p>
            </div>

            {/* Quick Duration Modifier */}
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-border shrink-0">
              <span className="text-xs font-semibold text-ink-primary">Modify Duration:</span>
              <button
                onClick={() => updateActivityDuration(selectedAct.id, selectedAct.duration - 1)}
                disabled={selectedAct.duration <= 1}
                className="w-6 h-6 rounded bg-canvas border border-border flex items-center justify-center font-bold text-xs disabled:opacity-40"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-ink-primary w-8 text-center">
                {selectedAct.duration}d
              </span>
              <button
                onClick={() => updateActivityDuration(selectedAct.id, selectedAct.duration + 1)}
                className="w-6 h-6 rounded bg-canvas border border-border flex items-center justify-center font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Metrics & Precedence Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 my-4">
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-ink-muted block">Duration</span>
              <span className="font-mono text-base font-bold text-ink-primary">{selectedAct.duration} days</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-ink-muted block">Early Start (ES)</span>
              <span className="font-mono text-base font-bold text-brand">Day {selectedAct.es}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-ink-muted block">Early Finish (EF)</span>
              <span className="font-mono text-base font-bold text-brand">Day {selectedAct.ef}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-ink-muted block">Late Start (LS)</span>
              <span className="font-mono text-base font-bold text-ink-secondary">Day {selectedAct.ls}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-ink-muted block">Late Finish (LF)</span>
              <span className="font-mono text-base font-bold text-ink-secondary">Day {selectedAct.lf}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-border text-center">
              <span className="text-[10px] font-bold uppercase text-ink-muted block">Total Float</span>
              <span className={`font-mono text-base font-bold ${selectedAct.isCritical ? 'text-critical' : 'text-success'}`}>
                {selectedAct.totalFloat} day{selectedAct.totalFloat !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Predecessor & Successor Logic Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="font-bold text-ink-primary block mb-1">
                Prerequisites (Immediate Predecessors):
              </span>
              {selectedAct.predecessors.length === 0 ? (
                <p className="text-ink-secondary">
                  None. This is an initial project activity starting at Day 1.
                </p>
              ) : (
                <div className="space-y-1">
                  {selectedAct.predecessors.map(predId => {
                    const predAct = schedule.activities[predId];
                    return (
                      <div key={predId} className="flex items-center justify-between text-ink-secondary">
                        <span>Activity {predId} ({predAct?.name}):</span>
                        <span className="font-mono font-semibold text-ink-primary">
                          Finishes Day {predAct?.ef}
                        </span>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-brand font-medium pt-1">
                    Earliest Start = max(EF of predecessors) + 1 = {selectedAct.es}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="font-bold text-ink-primary block mb-1">
                Downstream Dependents (Immediate Successors):
              </span>
              {selectedAct.successors.length === 0 ? (
                <p className="text-ink-secondary">
                  None. This is a terminal project activity culminating at the project finish date.
                </p>
              ) : (
                <div className="space-y-1">
                  {selectedAct.successors.map(succId => {
                    const succAct = schedule.activities[succId];
                    return (
                      <div key={succId} className="flex items-center justify-between text-ink-secondary">
                        <span>Activity {succId} ({succAct?.name}):</span>
                        <span className="font-mono font-semibold text-ink-primary">
                          Starts Day {succAct?.es} (LS: Day {succAct?.ls})
                        </span>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-ink-secondary pt-1">
                    Late Finish = min(LS of successors) - 1 = {selectedAct.lf}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

