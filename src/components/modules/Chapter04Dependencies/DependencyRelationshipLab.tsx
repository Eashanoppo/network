import React, { useState, useMemo } from 'react';
import {
  RELATIONSHIP_TYPES_DATA,
  DEPENDENCY_CLASSIFICATIONS_DATA,
  CHAPTERS_DATA,
} from '../../../data/educationalContent';
import { RelationshipType, DependencyClassification, ActivityDependency } from '../../../types/scheduling';
import { useSchedule } from '../../../context/ScheduleContext';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import { ScheduleViewModeBanner } from '../../common/ScheduleViewModeBanner';
import { normalizeActivityDependencies } from '../../../engine/cpmEngine';
import {
  GitBranch,
  ArrowRight,
  Info,
  CheckCircle2,
  Sliders,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Zap,
  Layers,
  AlertCircle,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Check,
  X,
  Clock,
  ChevronDown,
} from 'lucide-react';

export const DependencyRelationshipLab: React.FC = () => {
  const {
    activeProject,
    activities,
    currentActivities,
    schedule,
    updateActivityDependencies,
    runDependencySimulation,
    resetToBaseline,
    selectedActivityId,
    setSelectedActivityId,
    activeSimulation,
    applyActiveSimulation,
    discardActiveSimulation,
  } = useSchedule();

  // Tab: Guided Demo vs Live Project Editor vs Registry
  const [activeTab, setActiveTab] = useState<'pdmLab' | 'liveEditor' | 'registry'>('liveEditor');

  // Guided demo state (independent A/B model)
  const [selectedRelType, setSelectedRelType] = useState<RelationshipType>('FS');
  const [selectedClassification, setSelectedClassification] =
    useState<DependencyClassification>('Mandatory');
  const [lagDays, setLagDays] = useState<number>(0);
  const [classQuizSelection, setClassQuizSelection] = useState<string | null>(null);
  const [showTaxonomy, setShowTaxonomy] = useState<boolean>(false);

  // Live Project Dependency Editor State
  const defaultSuccId =
    selectedActivityId && currentActivities.some(a => a.id === selectedActivityId)
      ? selectedActivityId
      : currentActivities[1]?.id || currentActivities[0]?.id || '';

  const [liveSuccessorId, setLiveSuccessorId] = useState<string>(defaultSuccId);
  const [livePredecessorId, setLivePredecessorId] = useState<string>(
    currentActivities.find(a => a.id !== defaultSuccId)?.id || ''
  );
  const [liveRelType, setLiveRelType] = useState<RelationshipType>('FS');
  const [liveLag, setLiveLag] = useState<number>(0);
  const [liveClassification, setLiveClassification] = useState<DependencyClassification>('Mandatory');
  const [editorNotice, setEditorNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const chapter4 = CHAPTERS_DATA[3];
  const currentRel =
    RELATIONSHIP_TYPES_DATA.find(r => r.type === selectedRelType) || RELATIONSHIP_TYPES_DATA[0];

  // Visual simulation coordinates for teaching demonstration
  const durationA = 4;
  const durationB = 3;

  let startB = 1;
  let finishB = 1;

  if (selectedRelType === 'FS') {
    startB = durationA + 1 + lagDays;
    finishB = startB + durationB - 1;
  } else if (selectedRelType === 'SS') {
    startB = 1 + lagDays;
    finishB = startB + durationB - 1;
  } else if (selectedRelType === 'FF') {
    finishB = durationA + lagDays;
    startB = finishB - durationB + 1;
  } else if (selectedRelType === 'SF') {
    finishB = 1 + lagDays;
    startB = finishB - durationB + 1;
  }

  // Active activities for live editor
  const liveSuccessorAct = currentActivities.find(a => a.id === liveSuccessorId) || currentActivities[0];
  const livePredecessorAct = currentActivities.find(a => a.id === livePredecessorId);

  // Existing normalized dependency relations for the live successor
  const currentSuccessorRelations = useMemo(() => {
    if (!liveSuccessorAct) return [];
    return normalizeActivityDependencies(liveSuccessorAct);
  }, [liveSuccessorAct]);

  // Derived math explanation for the live dependency pair
  const liveMathDerivation = useMemo(() => {
    if (!livePredecessorAct || !liveSuccessorAct) return null;
    const pred = schedule.activities[livePredecessorAct.id] || livePredecessorAct;
    const succ = schedule.activities[liveSuccessorAct.id] || liveSuccessorAct;
    const pES = pred.es ?? 1;
    const pEF = pred.ef ?? (pES + pred.duration - 1);
    const sDur = succ.duration ?? 1;

    let reqStart = 1;
    let formula = '';
    let description = '';

    if (liveRelType === 'FS') {
      reqStart = pEF + 1 + liveLag;
      formula = `ES_succ ≥ EF_pred + 1 + lag = ${pEF} + 1 + (${liveLag}) = Day ${reqStart}`;
      description = `${succ.name} cannot begin until ${liveLag >= 0 ? `${liveLag} days after` : `${Math.abs(liveLag)} days before`} ${pred.name} completes on Day ${pEF}.`;
    } else if (liveRelType === 'SS') {
      reqStart = pES + liveLag;
      formula = `ES_succ ≥ ES_pred + lag = ${pES} + (${liveLag}) = Day ${reqStart}`;
      description = `${succ.name} start is anchored to ${pred.name} start (Day ${pES}) plus ${liveLag} days.`;
    } else if (liveRelType === 'FF') {
      const reqFinish = pEF + liveLag;
      reqStart = reqFinish - sDur + 1;
      formula = `EF_succ ≥ EF_pred + lag = ${pEF} + (${liveLag}) = Day ${reqFinish} (ES ≥ ${reqStart})`;
      description = `${succ.name} finish is anchored to ${pred.name} finish (Day ${pEF}) plus ${liveLag} days.`;
    } else if (liveRelType === 'SF') {
      const reqFinish = pES - 1 + liveLag;
      reqStart = reqFinish - sDur + 1;
      formula = `EF_succ ≥ ES_pred - 1 + lag = ${pES} - 1 + (${liveLag}) = Day ${reqFinish}`;
      description = `${succ.name} finish is anchored to ${pred.name} start (Day ${pES}) plus ${liveLag} days.`;
    }

    return {
      predName: pred.name,
      succName: succ.name,
      pES,
      pEF,
      sDur,
      reqStart,
      formula,
      description,
    };
  }, [livePredecessorAct, liveSuccessorAct, liveRelType, liveLag, schedule.activities]);

  // Handle adding/updating a dependency in live project
  const handleAddLiveDependency = () => {
    if (!liveSuccessorAct || !livePredecessorAct) return;
    if (liveSuccessorAct.id === livePredecessorAct.id) {
      setEditorNotice({ type: 'error', message: 'An activity cannot depend on itself.' });
      return;
    }

    // Build new list of dependencies
    const filtered = currentSuccessorRelations.filter(
      r => r.predecessorId !== livePredecessorAct.id
    );
    const newRelations: ActivityDependency[] = [
      ...filtered,
      {
        predecessorId: livePredecessorAct.id,
        type: liveRelType,
        lag: liveLag,
        classification: liveClassification,
      },
    ];

    const result = updateActivityDependencies(liveSuccessorAct.id, newRelations);
    if (result.success) {
      setEditorNotice({
        type: 'success',
        message: `Added ${liveRelType} dependency (${livePredecessorAct.id} → ${liveSuccessorAct.id}) to ${activeProject.name}!`,
      });
      setTimeout(() => setEditorNotice(null), 4000);
    } else {
      setEditorNotice({
        type: 'error',
        message: result.error || 'Failed to add dependency (cycle detected).',
      });
    }
  };

  // Handle previewing dependency impact via unified simulation
  const handlePreviewLiveDependency = () => {
    if (!liveSuccessorAct || !livePredecessorAct) return;
    if (liveSuccessorAct.id === livePredecessorAct.id) {
      setEditorNotice({ type: 'error', message: 'An activity cannot depend on itself.' });
      return;
    }

    const filtered = currentSuccessorRelations.filter(
      r => r.predecessorId !== livePredecessorAct.id
    );
    const newRelations: ActivityDependency[] = [
      ...filtered,
      {
        predecessorId: livePredecessorAct.id,
        type: liveRelType,
        lag: liveLag,
        classification: liveClassification,
      },
    ];

    const sim = runDependencySimulation(liveSuccessorAct.id, newRelations);
    if (!sim.isValid) {
      setEditorNotice({
        type: 'error',
        message: sim.validationErrors[0]?.message || 'Invalid simulation (circular dependency detected).',
      });
    } else {
      setEditorNotice({
        type: 'success',
        message: `Previewing ${liveRelType} link in Simulation Preview mode! Duration: ${sim.schedule.projectDuration}d (${sim.comparison.explanation})`,
      });
    }
  };

  // Handle removing a dependency
  const handleRemoveLiveDependency = (predIdToRemove: string) => {
    if (!liveSuccessorAct) return;
    const remaining = currentSuccessorRelations.filter(r => r.predecessorId !== predIdToRemove);
    const result = updateActivityDependencies(liveSuccessorAct.id, remaining);
    if (result.success) {
      setEditorNotice({
        type: 'success',
        message: `Removed predecessor ${predIdToRemove} from Activity ${liveSuccessorAct.id}!`,
      });
      setTimeout(() => setEditorNotice(null), 4000);
    } else {
      setEditorNotice({
        type: 'error',
        message: result.error || 'Failed to remove dependency.',
      });
    }
  };

  return (
    <section id="chapter-04" className="w-full bg-warm py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter4}
          tagline="PDM Logic, Relationships &amp; Classification Boundaries"
        />

        <PresenterNotes
          member="Member 2 (Speaker 2)"
          timeAllocation="4 minutes"
          keyTakeaway="Always separate the 'WHY' (dependency classification) from the 'HOW' (relationship type). FS is the workhorse of project scheduling."
          talkingPoints={[
            'Define Predecessor (prerequisite activity) and Successor (downstream dependent activity).',
            'Highlight the academic boundary: Dependency Classifications explain nature/origin, whereas Relationship Types define math.',
            'Demonstrate FS, SS, FF, SF using the interactive precedence simulator.',
            'Show why SF is rare (e.g. handover of security guard shifts, legacy server cutover).',
            'Review the 4 classifications: Mandatory (hard logic), Discretionary (soft logic), External, Internal.',
            'Explain why Discretionary dependencies (like Testing → Training) are the primary targets for Fast-Tracking.',
          ]}
          audiencePrompt="Why are Discretionary dependencies the primary target when a project manager needs to fast-track a delayed schedule?"
        />

        {/* Unified View Mode Banner */}
        <ScheduleViewModeBanner className="mb-6" />

        {/* Crucial Academic Distinction Callout */}
        <div className="bg-white border border-border rounded-lg px-4 py-2.5 mb-6 flex items-center justify-between shadow-xs text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="text-ink-secondary">
              <strong className="text-ink-primary">Academic Distinction:</strong> <em>Classifications</em> explain <strong>why</strong> dependencies exist; <em>PDM Types (FS, SS, FF, SF)</em> govern <strong>how</strong> start and finish dates are mathematically chained.
            </span>
          </div>
          <span className="text-[10px] font-mono text-ink-muted uppercase hidden md:inline-block">
            PMBOK 7th Ed.
          </span>
        </div>

        {/* Primary Section Mode Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('liveEditor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'liveEditor'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-brand" />
              <span>1. Live Project Dependency Editor ({activeProject.name})</span>
            </button>

            <button
              onClick={() => setActiveTab('pdmLab')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'pdmLab'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>2. PDM Concept Demonstration (A/B Model)</span>
            </button>

            <button
              onClick={() => setActiveTab('registry')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'registry'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Project Dependency Registry &amp; Taxonomy</span>
            </button>
          </div>

          <div className="text-xs font-mono text-ink-muted">
            Active Project: <strong className="text-ink-primary">{activeProject.name}</strong>
          </div>
        </div>

        {/* TAB 1: LIVE PROJECT DEPENDENCY EDITOR */}
        {activeTab === 'liveEditor' && (
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Active Project Scheduling Engine
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-brand-light text-brand border border-brand-border">
                    Real-time CPM Recalculation
                  </span>
                </div>
                <h3 className="text-xl font-bold text-ink-primary mt-1">
                  Live Project Dependency Editor
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                  Select activities from <strong>{activeProject.name}</strong>, configure dependency type (FS, SS, FF, SF), adjust lead/lag, and immediately test or apply.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={resetToBaseline}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-warm text-ink-secondary text-xs font-semibold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Project</span>
                </button>
              </div>
            </div>

            {/* Editor Notice Alert */}
            {editorNotice && (
              <div
                className={`mb-6 p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                  editorNotice.type === 'success'
                    ? 'bg-success-light border-success text-success'
                    : 'bg-critical-light border-critical text-critical'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {editorNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{editorNotice.message}</span>
                </div>
                <button onClick={() => setEditorNotice(null)} className="opacity-70 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Interactive Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Successor Activity (Target Task) */}
                <div className="p-4 rounded-lg bg-warm border border-border">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                    1. Successor Activity (Dependent Task)
                  </label>
                  <select
                    value={liveSuccessorId}
                    onChange={e => {
                      setLiveSuccessorId(e.target.value);
                      setSelectedActivityId(e.target.value);
                    }}
                    className="w-full bg-white text-ink-primary font-bold text-xs rounded-lg p-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {currentActivities.map(act => (
                      <option key={act.id} value={act.id}>
                        {act.id}: {act.name} ({act.duration}d) — Starts Day {schedule.activities[act.id]?.es ?? 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Predecessor Activity */}
                <div className="p-4 rounded-lg bg-warm border border-border">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                    2. Predecessor Activity (Prerequisite Task)
                  </label>
                  <select
                    value={livePredecessorId}
                    onChange={e => setLivePredecessorId(e.target.value)}
                    className="w-full bg-white text-ink-primary font-bold text-xs rounded-lg p-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="" disabled>
                      Select a predecessor…
                    </option>
                    {currentActivities
                      .filter(a => a.id !== liveSuccessorId)
                      .map(act => (
                        <option key={act.id} value={act.id}>
                          {act.id}: {act.name} ({act.duration}d) — Finishes Day {schedule.activities[act.id]?.ef ?? act.duration}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. Relationship Type & Lag */}
                <div className="p-4 rounded-lg bg-warm border border-border space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                      3. Relationship Type (PDM)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['FS', 'SS', 'FF', 'SF'] as RelationshipType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setLiveRelType(t)}
                          className={`py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                            liveRelType === t
                              ? 'bg-ink-primary text-white shadow-xs'
                              : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Lead / Lag (Workdays)
                      </label>
                      <span className="font-mono text-xs font-bold text-ink-primary">
                        {liveLag > 0 ? `+${liveLag}d lag` : liveLag < 0 ? `${liveLag}d lead` : '0d'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-4}
                      max={8}
                      value={liveLag}
                      onChange={e => setLiveLag(Number(e.target.value))}
                      className="w-full accent-brand cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-0.5">
                      <span>-4d (Lead)</span>
                      <span>0d (Standard)</span>
                      <span>+8d (Lag)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                      Dependency Classification
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {(['Mandatory', 'Discretionary', 'External', 'Internal'] as DependencyClassification[]).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setLiveClassification(c)}
                          className={`py-1 px-2 rounded-md font-semibold text-left transition-all ${
                            liveClassification === c
                              ? 'bg-warm border border-ink-primary text-ink-primary font-bold'
                              : 'bg-white text-ink-secondary border border-border hover:text-ink-primary'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={handlePreviewLiveDependency}
                    disabled={!livePredecessorId || livePredecessorId === liveSuccessorId}
                    className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-colors shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preview in Schedule</span>
                  </button>

                  <button
                    onClick={handleAddLiveDependency}
                    disabled={!livePredecessorId || livePredecessorId === liveSuccessorId}
                    className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover disabled:opacity-40 transition-colors shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Apply to Project</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Relationship Diagram & Existing Links */}
              <div className="lg:col-span-7 space-y-6">
                {/* Mini Visual Diagram of Selected Relationship */}
                <div className="p-5 rounded-xl border border-border bg-warm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-3">
                    Relationship Geometry &amp; Precedence Vector
                  </span>

                  {liveMathDerivation ? (
                    <div>
                      {/* SVG Mini Precedence Diagram */}
                      <div className="bg-white rounded-lg p-4 border border-border mb-4 flex items-center justify-center">
                        <svg viewBox="0 0 460 110" className="w-full max-w-[460px] h-auto select-none">
                          <defs>
                            <marker
                              id="arrow-live-pdm"
                              viewBox="0 0 10 10"
                              refX="9"
                              refY="5"
                              markerWidth="6"
                              markerHeight="6"
                              orient="auto-start-reverse"
                            >
                              <path d="M 0 1 L 10 5 L 0 9 z" fill="#F26522" />
                            </marker>
                          </defs>

                          {/* Predecessor Box */}
                          <g transform="translate(15, 20)">
                            <rect width="140" height="70" rx="8" fill="#F4F5F0" stroke="#151515" strokeWidth="2" />
                            <rect x="0" y="0" width="30" height="24" rx="6" fill="#151515" />
                            <text x="15" y="16" textAnchor="middle" className="text-xs font-mono font-bold fill-white">
                              {livePredecessorAct?.id}
                            </text>
                            <text x="38" y="16" className="text-xs font-bold fill-ink-primary truncate">
                              {livePredecessorAct?.name.substring(0, 12)}
                            </text>
                            <line x1="0" y1="26" x2="140" y2="26" stroke="#E5E6DE" strokeWidth="1" />
                            <text x="10" y="44" className="text-[10px] font-mono fill-ink-muted">
                              Duration: {livePredecessorAct?.duration}d
                            </text>
                            <text x="10" y="60" className="text-[10px] font-mono font-bold fill-ink-primary">
                              ES:{liveMathDerivation.pES} &bull; EF:{liveMathDerivation.pEF}
                            </text>
                          </g>

                          {/* Connecting Bezier Connector Arc */}
                          <path
                            d={
                              liveRelType === 'FS'
                                ? 'M 155 55 C 220 55, 240 55, 303 55'
                                : liveRelType === 'SS'
                                ? 'M 15 55 C -5 55, 260 20, 303 35'
                                : liveRelType === 'FF'
                                ? 'M 155 75 C 240 95, 280 85, 445 75'
                                : 'M 15 55 C 100 100, 350 100, 445 75'
                            }
                            fill="none"
                            stroke="#F26522"
                            strokeWidth="2.5"
                            markerEnd="url(#arrow-live-pdm)"
                          />

                          {/* Relationship Badge on Line */}
                          <g transform="translate(205, 38)">
                            <rect width="70" height="24" rx="12" fill="#151515" />
                            <text x="35" y="16" textAnchor="middle" className="text-[10px] font-mono font-bold fill-white">
                              {liveRelType} {liveLag > 0 ? `+${liveLag}d` : liveLag < 0 ? `${liveLag}d` : ''}
                            </text>
                          </g>

                          {/* Successor Box */}
                          <g transform="translate(305, 20)">
                            <rect width="140" height="70" rx="8" fill="#FFFFFF" stroke="#F26522" strokeWidth="2.5" />
                            <rect x="0" y="0" width="30" height="24" rx="6" fill="#F26522" />
                            <text x="15" y="16" textAnchor="middle" className="text-xs font-mono font-bold fill-white">
                              {liveSuccessorAct?.id}
                            </text>
                            <text x="38" y="16" className="text-xs font-bold fill-ink-primary truncate">
                              {liveSuccessorAct?.name.substring(0, 12)}
                            </text>
                            <line x1="0" y1="26" x2="140" y2="26" stroke="#E5E6DE" strokeWidth="1" />
                            <text x="10" y="44" className="text-[10px] font-mono fill-ink-muted">
                              Duration: {liveSuccessorAct?.duration}d
                            </text>
                            <text x="10" y="60" className="text-[10px] font-mono font-bold fill-brand">
                              Feasible ES ≥ Day {liveMathDerivation.reqStart}
                            </text>
                          </g>
                        </svg>
                      </div>

                      {/* Causal Explanation Box */}
                      <div className="bg-white p-3.5 rounded-lg border border-border text-xs space-y-1.5 font-mono">
                        <div className="font-bold text-ink-primary">{liveMathDerivation.formula}</div>
                        <p className="text-ink-secondary font-sans text-xs">{liveMathDerivation.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-ink-muted">
                      Select both a successor and predecessor to generate the relationship preview.
                    </div>
                  )}
                </div>

                {/* Current Dependencies Table for the Selected Successor */}
                <div className="p-4 rounded-xl border border-border bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ink-primary">
                      Configured Predecessors of Activity {liveSuccessorAct?.id} ({liveSuccessorAct?.name})
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted">
                      {currentSuccessorRelations.length} predecessor{currentSuccessorRelations.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {currentSuccessorRelations.length === 0 ? (
                    <div className="p-4 rounded-lg bg-warm border border-border text-xs text-ink-muted text-center italic">
                      Activity {liveSuccessorAct?.id} has no predecessors (Root project starter, starts on Day 1).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentSuccessorRelations.map(rel => {
                        const pAct = currentActivities.find(a => a.id === rel.predecessorId);
                        return (
                          <div
                            key={rel.predecessorId}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-warm border border-border text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded bg-ink-primary text-white inline-flex items-center justify-center font-mono font-bold text-[10px]">
                                {rel.predecessorId}
                              </span>
                              <span className="font-semibold text-ink-primary">{pAct?.name || rel.predecessorId}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white border border-border text-brand font-bold">
                                {rel.type || 'FS'}
                                {typeof rel.lag === 'number' && rel.lag !== 0
                                  ? rel.lag > 0
                                    ? ` +${rel.lag}d`
                                    : ` ${rel.lag}d`
                                  : ''}
                              </span>
                              {rel.classification && (
                                <span className="text-[10px] text-ink-secondary">
                                  ({rel.classification})
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemoveLiveDependency(rel.predecessorId)}
                              className="p-1 rounded text-ink-muted hover:text-critical hover:bg-critical-light transition-colors"
                              title={`Remove ${rel.predecessorId} as predecessor`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GUIDED PDM CONCEPT DEMO (A/B MODEL) */}
        {activeTab === 'pdmLab' && (
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Interactive Teaching Laboratory
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-warm border border-border text-ink-secondary">
                    Generic Model: Task A &bull; Task B
                  </span>
                </div>
                <h3 className="text-xl font-bold text-ink-primary mt-1">
                  Precedence Diagramming Method (PDM) Relationship Visualizer
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                  Select a logical relationship and adjust lag/lead to observe how the timeline anchors shift.
                </p>
              </div>

              {/* Relationship Buttons */}
              <div className="grid grid-cols-4 sm:inline-flex rounded-lg border border-border p-1 bg-warm w-full sm:w-auto">
                {RELATIONSHIP_TYPES_DATA.map(rel => (
                  <button
                    key={rel.type}
                    onClick={() => {
                      setSelectedRelType(rel.type);
                      setLagDays(0);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold text-center transition-all ${
                      selectedRelType === rel.type
                        ? 'bg-white text-ink-primary shadow-xs font-bold'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {rel.type}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Lab Workspace */}
            <div className="bg-warm rounded-lg p-4 sm:p-6 border border-border mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-ink-primary text-white font-mono">
                      {currentRel.type}
                    </span>
                    <span className="text-base font-bold text-ink-primary">
                      {currentRel.name}
                    </span>
                    <span className="text-xs text-ink-muted">
                      ({currentRel.commonality})
                    </span>
                  </div>
                  <p className="text-xs font-mono text-ink-secondary mt-1">
                    {currentRel.formulaDescription}
                  </p>
                </div>

                {/* Interactive Lag Slider */}
                <div className="flex items-center justify-between sm:justify-start space-x-3 bg-white px-3.5 py-2 rounded-lg border border-border shadow-xs">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-brand" />
                    <label className="text-xs font-semibold text-ink-primary whitespace-nowrap">
                      Lag / Lead:
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min={-2}
                      max={4}
                      value={lagDays}
                      onChange={e => setLagDays(Number(e.target.value))}
                      className="w-20 sm:w-24 accent-brand cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-ink-primary w-14 text-right">
                      {lagDays > 0 ? `+${lagDays}d lag` : lagDays < 0 ? `${lagDays}d lead` : '0d'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Bar Demonstration */}
              <div className="py-6 overflow-x-auto">
                <div className="sm:hidden flex items-center space-x-1 text-[11px] text-ink-muted mb-2">
                  <span className="font-semibold text-brand">Swipe timeline horizontally &rarr;</span>
                </div>
                <div className="min-w-[600px] relative">
                  {/* Day Header */}
                  <div className="flex border-b border-border pb-2 mb-4 text-xs font-mono text-ink-muted">
                    <div className="w-36 shrink-0 font-sans font-bold text-ink-primary">Activity</div>
                    <div className="flex-1 grid grid-cols-10 gap-1 text-center">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="border-l border-border pl-1 font-semibold text-[11px]">
                          Day {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity A */}
                  <div className="flex items-center mb-6">
                    <div className="w-36 shrink-0 text-xs">
                      <div className="font-bold text-ink-primary text-sm">Task A (Pred)</div>
                      <div className="text-xs text-ink-muted font-mono">Duration: 4 days</div>
                    </div>
                    <div className="flex-1 relative h-10 flex items-center">
                      <div
                        className="h-9 rounded-lg bg-ink-primary text-white flex items-center justify-between px-3 text-xs font-medium shadow-xs relative z-10"
                        style={{ width: '40%', marginLeft: '0%' }}
                      >
                        <span>Start: Day 1</span>
                        <span>Finish: Day 4</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Dependency Connector Indicator */}
                  <div className="relative h-6 my-1">
                    <div className="absolute left-36 right-0 flex items-center justify-center">
                      <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-white border border-border shadow-xs text-xs font-mono font-medium text-ink-primary">
                        <span>Anchor: [{currentRel.predecessorEvent} of A]</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand" />
                        <span>[{currentRel.successorEvent} of B]</span>
                        {lagDays !== 0 && (
                          <span className="text-brand font-bold">
                            ({lagDays > 0 ? `+${lagDays}d lag` : `${lagDays}d lead`})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity B */}
                  <div className="flex items-center mt-2">
                    <div className="w-36 shrink-0 text-xs">
                      <div className="font-bold text-ink-primary text-sm flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0"></span>
                        <span>Task B (Succ)</span>
                      </div>
                      <div className="text-xs text-ink-muted font-mono">Duration: 3 days</div>
                    </div>
                    <div className="flex-1 relative h-10 flex items-center">
                      <div
                        className="h-9 rounded-lg bg-brand text-white flex items-center justify-between px-3 text-xs font-bold shadow-xs transition-all duration-300 relative z-10"
                        style={{
                          width: '30%',
                          marginLeft: `${Math.max(0, (startB - 1) * 10)}%`,
                        }}
                      >
                        <span>Start: Day {startB}</span>
                        <span>Finish: Day {finishB}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-border text-xs sm:text-sm">
                <div className="bg-white p-4 rounded-lg border border-border shadow-xs">
                  <span className="font-bold text-ink-primary block mb-1">
                    Precedence Rule Explained:
                  </span>
                  <p className="text-ink-secondary leading-relaxed">{currentRel.rule}</p>
                  <p className="text-ink-primary font-medium mt-2">
                    {currentRel.practicalExample}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-border shadow-xs">
                  <span className="font-bold text-ink-primary block mb-1">
                    Classroom Example Application:
                  </span>
                  <p className="text-ink-secondary leading-relaxed">
                    {currentRel.universityExample}
                  </p>
                  <div className="mt-2 text-xs text-ink-muted italic">
                    Note: In our primary University Management System, baseline dependencies are modeled as Finish-to-Start (FS).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT DEPENDENCY REGISTRY & TAXONOMY */}
        {activeTab === 'registry' && (
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-10 shadow-xs">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {activeProject.name}
              </span>
              <h3 className="text-xl font-bold text-ink-primary mt-1">
                Live Project Dependency Registry &amp; Fast-Tracking Analysis
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Inspect the dependency classification and fast-tracking feasibility for all activities in {activeProject.name}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-warm text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                    <th className="py-2.5 px-3">Activity</th>
                    <th className="py-2.5 px-3">Immediate Predecessors</th>
                    <th className="py-2.5 px-3">Relationship Type</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">ES / EF</th>
                    <th className="py-2.5 px-3 text-center">Fast-Trackable?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs sm:text-sm">
                  {currentActivities.map(act => {
                    const relations = normalizeActivityDependencies(act);
                    const predLabels =
                      relations.length === 0
                        ? 'None (Root Node)'
                        : relations.map(r => `${r.predecessorId}${r.type !== 'FS' ? ` (${r.type})` : ''}`).join(', ');

                    const relTypeLabel =
                      relations.length === 0
                        ? '—'
                        : Array.from(new Set(relations.map(r => r.type))).join(', ');

                    const classLabel =
                      relations[0]?.classification || (relations.length === 0 ? 'Internal' : 'Mandatory');

                    const isFastTrackable = classLabel === 'Discretionary';

                    return (
                      <tr key={act.id} className="hover:bg-warm transition-colors">
                        <td className="py-3 px-3 font-bold text-ink-primary flex items-center space-x-2">
                          <span className="w-6 h-6 rounded bg-ink-primary text-white inline-flex items-center justify-center font-mono text-xs">
                            {act.id}
                          </span>
                          <span>{act.name}</span>
                        </td>
                        <td className="py-3 px-3 text-ink-secondary font-mono">{predLabels}</td>
                        <td className="py-3 px-3 font-mono font-medium text-ink-primary">{relTypeLabel}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                              classLabel === 'Mandatory'
                                ? 'bg-critical-light text-critical'
                                : classLabel === 'Discretionary'
                                ? 'bg-warm text-ink-primary border border-border'
                                : classLabel === 'External'
                                ? 'bg-warning-light text-warning'
                                : 'bg-warm text-ink-primary'
                            }`}
                          >
                            {classLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-ink-secondary">
                          Day {schedule.activities[act.id]?.es ?? 1} → Day {schedule.activities[act.id]?.ef ?? act.duration}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isFastTrackable ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-success-light text-success font-semibold text-[11px]">
                              <Zap className="w-3 h-3" />
                              <span>Yes (Soft Logic)</span>
                            </span>
                          ) : (
                            <span className="text-ink-muted text-[11px]">No (Hard/Fixed)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 p-4 bg-warm rounded-lg border border-border text-xs text-ink-secondary leading-relaxed">
              <strong className="text-ink-primary">Why Discretionary dependencies matter for schedule recovery:</strong> When a project is delayed, project managers cannot violate mandatory physical dependencies (you cannot build code before designing it). They must evaluate <strong>Discretionary Dependencies</strong> and decide if accepting higher rework risk allows starting them in parallel (Fast-Tracking).
            </div>
          </div>
        )}

        {/* The 4 Dependency Classifications & Audience Challenge (Progressive Disclosure) */}
        <div className="bg-white rounded-xl border border-border p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Academic Taxonomy
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-warm text-ink-secondary border border-border">
                  PMBOK 7th Ed.
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-ink-primary mt-0.5">
                The 4 Dependency Classifications &amp; Logic Origins
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Mandatory, Discretionary, External, and Internal logic boundaries.
              </p>
            </div>

            <button
              onClick={() => setShowTaxonomy(prev => !prev)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-warm hover:bg-border text-ink-primary transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <span>{showTaxonomy ? 'Hide Classifications & Challenge' : 'Explore 4 Classifications & Challenge'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTaxonomy ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showTaxonomy && (
            <div className="pt-6 mt-6 border-t border-border animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {DEPENDENCY_CLASSIFICATIONS_DATA.map(item => {
                  const isSelected = selectedClassification === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => setSelectedClassification(item.type)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-ink-primary bg-warm shadow-xs'
                          : 'border-border bg-white hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            item.type === 'Mandatory'
                              ? 'bg-critical-light text-critical'
                              : item.type === 'Discretionary'
                              ? 'bg-warm text-ink-primary border border-border'
                              : 'bg-warning-light text-warning'
                          }`}
                        >
                          {item.nature}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-ink-primary">{item.name}</h4>
                      <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                        {item.definition}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-border text-xs text-ink-primary">
                        <strong className="text-ink-secondary">Real-world:</strong> {item.projectExample}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Audience Interactive Mini-Challenge */}
              <div className="bg-warm rounded-lg p-5 border border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-brand" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                    Audience Engagement: Classify the Dependency
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-ink-secondary mb-4 leading-relaxed">
                  &ldquo;The University Registrar requires that student data cannot be migrated to the new database until the state data compliance inspector signs off on the encryption protocol.&rdquo; Which classification is this?
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'ext', label: 'External Dependency', correct: true, note: 'Correct! The state inspector is an external entity outside the project team\'s direct control.' },
                    { id: 'man', label: 'Mandatory Internal', correct: false, note: 'Incorrect. While mandatory, the constraint originates outside project jurisdiction.' },
                    { id: 'disc', label: 'Discretionary Dependency', correct: false, note: 'Incorrect. Regulatory compliance is not optional preferential best practice.' },
                    { id: 'sf', label: 'Start-to-Finish Relationship', correct: false, note: 'Incorrect. That is a relationship type, not a dependency classification!' },
                  ].map(choice => (
                    <button
                      key={choice.id}
                      onClick={() => setClassQuizSelection(choice.id)}
                      className={`p-3 rounded-lg border text-xs font-medium text-left transition-all ${
                        classQuizSelection === choice.id
                          ? choice.correct
                            ? 'bg-success-light border-success text-success font-semibold'
                            : 'bg-critical-light border-critical text-critical font-semibold'
                          : 'bg-white hover:bg-surface-secondary border-border text-ink-primary'
                      }`}
                    >
                      <div className="font-semibold">{choice.label}</div>
                      {classQuizSelection === choice.id && (
                        <p className="text-[11px] mt-1.5 font-normal opacity-90 leading-tight">
                          {choice.note}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
