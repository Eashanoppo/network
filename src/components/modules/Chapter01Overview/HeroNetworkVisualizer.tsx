import React, { useState, useEffect, useMemo, useRef } from 'react';
import { calculateSchedule } from '../../../engine/cpmEngine';
import { Activity } from '../../../types/scheduling';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
} from 'lucide-react';

export const HERO_DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'A',
    name: 'Requirements',
    duration: 3,
    predecessors: [],
    category: 'Analysis',
  },
  {
    id: 'B',
    name: 'System Design',
    duration: 4,
    predecessors: ['A'],
    category: 'Design',
  },
  {
    id: 'C',
    name: 'Database Design',
    duration: 3,
    predecessors: ['A'],
    category: 'Design',
  },
  {
    id: 'D',
    name: 'UI Development',
    duration: 5,
    predecessors: ['B'],
    category: 'Development',
  },
  {
    id: 'E',
    name: 'Backend Dev',
    duration: 6,
    predecessors: ['B', 'C'],
    category: 'Development',
  },
  {
    id: 'F',
    name: 'Integration',
    duration: 3,
    predecessors: ['D', 'E'],
    category: 'Development',
  },
  {
    id: 'G',
    name: 'Testing',
    duration: 4,
    predecessors: ['F'],
    category: 'Quality',
  },
  {
    id: 'H',
    name: 'Deployment',
    duration: 2,
    predecessors: ['G'],
    category: 'Deployment',
  },
];

interface NodeLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  stage: number;
}

const HERO_NODE_LAYOUTS: Record<string, NodeLayout> = {
  A: { id: 'A', x: 25, y: 122, w: 90, h: 56, stage: 0 },
  B: { id: 'B', x: 145, y: 52, w: 96, h: 56, stage: 1 },
  C: { id: 'C', x: 145, y: 192, w: 104, h: 56, stage: 1 },
  D: { id: 'D', x: 280, y: 52, w: 102, h: 56, stage: 2 },
  E: { id: 'E', x: 280, y: 192, w: 98, h: 56, stage: 2 },
  F: { id: 'F', x: 418, y: 122, w: 92, h: 56, stage: 3 },
  G: { id: 'G', x: 540, y: 122, w: 78, h: 56, stage: 4 },
  H: { id: 'H', x: 648, y: 122, w: 86, h: 56, stage: 5 },
};

export const HeroNetworkVisualizer: React.FC = () => {
  const [heroActivities, setHeroActivities] = useState<Activity[]>(HERO_DEMO_ACTIVITIES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('E');
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true);

  // Animation Timeline States (0: initial -> 6: fully settled)
  const [animStage, setAnimStage] = useState<number>(6);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute live schedule using the genuine scheduling engine
  const heroSchedule = useMemo(() => {
    return calculateSchedule(heroActivities);
  }, [heroActivities]);

  // Baseline reference for live delta calculations
  const defaultSchedule = useMemo(() => {
    return calculateSchedule(HERO_DEMO_ACTIVITIES);
  }, []);

  const selectedActivity = heroActivities.find(a => a.id === selectedNodeId) || heroActivities[0];
  const selectedCpm = heroSchedule.activities[selectedActivity.id];

  // Duration delta from default
  const durationDelta = heroSchedule.projectDuration - defaultSchedule.projectDuration;

  // Animation sequence driver (approx 10s sequence)
  const startAnimation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnimStage(0);
    setIsPlaying(true);

    const timeouts = [
      setTimeout(() => setAnimStage(1), 1200),
      setTimeout(() => setAnimStage(2), 2600),
      setTimeout(() => setAnimStage(3), 4200),
      setTimeout(() => setAnimStage(4), 5800),
      setTimeout(() => setAnimStage(5), 7200),
      setTimeout(() => {
        setAnimStage(6);
        setIsPlaying(false);
      }, 9000),
    ];

    timerRef.current = timeouts[timeouts.length - 1];
  };

  const handlePauseResume = () => {
    if (isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsPlaying(false);
    } else {
      if (animStage >= 6) {
        startAnimation();
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    setHeroActivities(HERO_DEMO_ACTIVITIES);
    setSelectedNodeId('E');
    setAnimStage(6);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Modify activity duration in the live hero model
  const handleUpdateDuration = (delta: number) => {
    setHeroActivities(prev =>
      prev.map(a => {
        if (a.id === selectedNodeId) {
          const nextDur = Math.max(1, Math.min(15, a.duration + delta));
          return { ...a, duration: nextDur };
        }
        return a;
      })
    );
  };

  // Generate smooth cubic bezier edge paths
  const getEdgePath = (fromId: string, toId: string) => {
    const from = HERO_NODE_LAYOUTS[fromId];
    const to = HERO_NODE_LAYOUTS[toId];
    if (!from || !to) return '';

    const startX = from.x + from.w;
    const startY = from.y + from.h / 2;
    const endX = to.x;
    const endY = to.y + to.h / 2;

    const dx = endX - startX;
    const cp1x = startX + dx * 0.45;
    const cp2x = startX + dx * 0.55;

    return `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;
  };

  // Check if an edge is critical
  const isEdgeCritical = (fromId: string, toId: string) => {
    return heroSchedule.criticalPaths.some(p => {
      const idxFrom = p.activityIds.indexOf(fromId);
      const idxTo = p.activityIds.indexOf(toId);
      return idxFrom !== -1 && idxTo === idxFrom + 1;
    });
  };

  const edges = useMemo(() => {
    const list: { from: string; to: string; stage: number }[] = [];
    heroActivities.forEach(act => {
      act.predecessors.forEach(pId => {
        const toStage = HERO_NODE_LAYOUTS[act.id]?.stage ?? 0;
        list.push({ from: pId, to: act.id, stage: toStage });
      });
    });
    return list;
  }, [heroActivities]);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-elevated overflow-hidden transition-all select-none">
      {/* Top Application Ribbon */}
      <div className="bg-warm px-4 py-2.5 border-b border-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E6DE] border border-[#D8D9D4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E6DE] border border-[#D8D9D4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E6DE] border border-[#D8D9D4]" />
          <span className="ml-2 font-mono text-[11px] text-ink-muted">hero-engine://live-topology</span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowCriticalPath(prev => !prev)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all flex items-center space-x-1 ${
              showCriticalPath
                ? 'bg-critical-light text-critical border-critical-border'
                : 'bg-white text-ink-secondary border-border hover:text-ink-primary'
            }`}
            title="Toggle critical path glow"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-critical" />
            <span className="hidden xs:inline">Critical Path</span>
          </button>

          <button
            onClick={startAnimation}
            className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-white border border-transparent hover:border-border transition-colors"
            title="Replay entrance animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="p-3 sm:p-5 relative bg-[#FCFCFA] overflow-hidden">
        {/* Subtle grid pattern background */}
        <svg
          viewBox="0 0 760 300"
          className="w-full h-auto max-h-[340px]"
          style={{ minHeight: '260px' }}
        >
          <defs>
            {/* Standard Gray Arrowhead */}
            <marker
              id="hero-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#B0B0A8" />
            </marker>

            {/* Critical Path Coral Arrowhead */}
            <marker
              id="hero-arrow-crit"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#BE645A" />
            </marker>

            {/* Selected Node Arrowhead */}
            <marker
              id="hero-arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#151515" />
            </marker>
          </defs>

          {/* 1. EDGES */}
          {edges.map((edge, idx) => {
            const pathD = getEdgePath(edge.from, edge.to);
            const isVisible = animStage >= edge.stage;
            const isCrit = showCriticalPath && isEdgeCritical(edge.from, edge.to) && animStage >= 5;
            const isConnectedToSelected = selectedNodeId === edge.from || selectedNodeId === edge.to;

            const strokeColor = isCrit ? '#BE645A' : isConnectedToSelected ? '#151515' : '#D8D9D4';
            const strokeWidth = isCrit ? 2.75 : isConnectedToSelected ? 2.25 : 1.5;
            const marker = isCrit
              ? 'url(#hero-arrow-crit)'
              : isConnectedToSelected
              ? 'url(#hero-arrow-selected)'
              : 'url(#hero-arrow)';

            return (
              <path
                key={`hero-edge-${idx}`}
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={marker}
                className="transition-all duration-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: `${edge.stage * 120}ms`,
                }}
              />
            );
          })}

          {/* 2. NODES */}
          {heroActivities.map(act => {
            const layout = HERO_NODE_LAYOUTS[act.id];
            if (!layout) return null;

            const isVisible = animStage >= layout.stage;
            const isSelected = selectedNodeId === act.id;
            const isCrit = showCriticalPath && heroSchedule.activities[act.id]?.isCritical && animStage >= 5;

            const nodeBg = isSelected ? '#FFFFFF' : isCrit ? '#FFF9F8' : '#FFFFFF';
            const nodeBorder = isSelected
              ? '#151515'
              : isCrit
              ? '#BE645A'
              : '#E5E6DE';

            return (
              <g
                key={act.id}
                transform={`translate(${layout.x}, ${layout.y})`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedNodeId(act.id)}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? `translate(${layout.x}px, ${layout.y}px)`
                    : `translate(${layout.x}px, ${layout.y + 10}px)`,
                  transitionDelay: `${layout.stage * 100}ms`,
                }}
              >
                {/* Outer Card */}
                <rect
                  width={layout.w}
                  height={layout.h}
                  rx="7"
                  ry="7"
                  fill={nodeBg}
                  stroke={nodeBorder}
                  strokeWidth={isSelected ? 2.5 : isCrit ? 2 : 1.25}
                  filter={isSelected ? 'drop-shadow(0 4px 6px rgba(21, 21, 21, 0.08))' : 'drop-shadow(0 1px 2px rgba(21, 21, 21, 0.03))'}
                />

                {/* Top Badge & Duration */}
                <rect
                  x="6"
                  y="6"
                  width="18"
                  height="16"
                  rx="3"
                  fill={isSelected ? '#151515' : isCrit ? '#BE645A' : '#F4F5F0'}
                />
                <text
                  x="15"
                  y="18"
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'fill-white' : isCrit ? 'fill-white' : 'fill-ink-primary'
                  }`}
                >
                  {act.id}
                </text>

                <text
                  x={layout.w - 8}
                  y="18"
                  textAnchor="end"
                  className="text-[10px] font-mono font-bold fill-ink-secondary"
                >
                  {act.duration}d
                </text>

                {/* Name */}
                <text
                  x="8"
                  y="36"
                  className="text-[11px] font-bold fill-ink-primary"
                >
                  {act.name.length > 12 ? `${act.name.substring(0, 11)}…` : act.name}
                </text>

                {/* Bottom Float Metric */}
                <text
                  x="8"
                  y="49"
                  className={`text-[9px] font-mono font-semibold ${
                    isCrit ? 'fill-critical' : 'fill-ink-muted'
                  }`}
                >
                  {isCrit ? 'Float: 0d' : `TF: ${heroSchedule.activities[act.id]?.totalFloat ?? 0}d`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Project Vital Badges Overlay */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-border/70 text-xs">
          <div className="p-2.5 rounded-lg bg-warm/80 border border-border">
            <span className="text-[10px] uppercase font-bold text-ink-muted block">Duration</span>
            <span className="font-mono text-base font-bold text-ink-primary">
              {heroSchedule.projectDuration} Workdays
            </span>
            {durationDelta !== 0 && (
              <span className={`text-[10px] font-mono block font-bold ${durationDelta > 0 ? 'text-critical' : 'text-success'}`}>
                {durationDelta > 0 ? `+${durationDelta}d delay` : `${durationDelta}d faster`}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-warm/80 border border-border">
            <span className="text-[10px] uppercase font-bold text-ink-muted block">Critical Path</span>
            <span className="font-mono text-xs font-bold text-critical truncate block mt-0.5">
              {heroSchedule.criticalPaths.map(p => p.activityIds.join('→')).join(' & ')}
            </span>
            <span className="text-[10px] text-ink-muted block">
              {heroSchedule.criticalPaths.length} path{heroSchedule.criticalPaths.length > 1 ? 's' : ''} (0 slack)
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-warm/80 border border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-muted block">Active Node</span>
              <span className="font-mono font-bold text-xs text-ink-primary">
                Task {selectedActivity.id} ({selectedActivity.duration}d)
              </span>
            </div>

            {/* Quick Interactive Duration Slider / Stepper */}
            <div className="flex items-center space-x-1 font-mono">
              <button
                onClick={() => handleUpdateDuration(-1)}
                disabled={selectedActivity.duration <= 1}
                className="w-5 h-5 rounded bg-white border border-border text-xs flex items-center justify-center font-bold hover:bg-warm disabled:opacity-30"
              >
                -
              </button>
              <span className="font-bold w-6 text-center text-xs">{selectedActivity.duration}d</span>
              <button
                onClick={() => handleUpdateDuration(+1)}
                disabled={selectedActivity.duration >= 15}
                className="w-5 h-5 rounded bg-white border border-border text-xs flex items-center justify-center font-bold hover:bg-warm disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Float & Causal Explanation Pill */}
        {selectedCpm && (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-white border border-border text-[11px] flex flex-wrap items-center justify-between text-ink-secondary gap-2">
            <div>
              <strong className="text-ink-primary">Activity {selectedActivity.id} ({selectedActivity.name}):</strong>{' '}
              {selectedCpm.isCritical ? (
                <span className="text-critical font-semibold">
                  Critical Task (0 Float). Delaying directly slips total completion!
                </span>
              ) : (
                <span>
                  Has <strong>{selectedCpm.totalFloat}d Total Float</strong> (Free Float: {selectedCpm.freeFloat}d). Buffer absorbs minor slippages.
                </span>
              )}
            </div>

            {durationDelta !== 0 && (
              <button
                onClick={handleReset}
                className="text-[10px] text-brand hover:text-brand-hover font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Hero Demo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

