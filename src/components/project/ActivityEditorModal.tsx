import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ActivityDependency, RelationshipType } from '../../types/scheduling';
import { useSchedule } from '../../context/ScheduleContext';
import { generateNextActivityId } from '../../utils/projectStorage';
import { detectCycles, normalizeActivityDependencies } from '../../engine/cpmEngine';
import {
  X,
  Plus,
  Edit2,
  Check,
  AlertTriangle,
  Flag,
  Calendar,
  Layers,
  ArrowRight,
  Hash,
  Percent,
} from 'lucide-react';

interface ActivityEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialActivity?: Activity | null;
}

export const ActivityEditorModal: React.FC<ActivityEditorModalProps> = ({
  isOpen,
  onClose,
  initialActivity,
}) => {
  const { activeProject, addActivity, updateActivity } = useSchedule();
  const isEditing = !!initialActivity;

  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [duration, setDuration] = useState<number>(3);
  const [isMilestone, setIsMilestone] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Engineering');
  const [description, setDescription] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [dependencies, setDependencies] = useState<ActivityDependency[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form state
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    if (initialActivity) {
      setId(initialActivity.id);
      setName(initialActivity.name);
      setDuration(initialActivity.duration);
      setIsMilestone(!!initialActivity.isMilestone || initialActivity.duration === 0);
      setCategory(initialActivity.category || 'General');
      setDescription(initialActivity.description || '');
      setProgress(initialActivity.progress || 0);
      setDependencies(normalizeActivityDependencies(initialActivity));
    } else {
      const nextId = generateNextActivityId(activeProject.activities);
      setId(nextId);
      setName('');
      setDuration(3);
      setIsMilestone(false);
      setCategory('General');
      setDescription('');
      setProgress(0);
      setDependencies([]);
    }
    setError(null);
  }, [isOpen, initialActivity, activeProject.activities]);

  // Available activities for predecessor selection (excluding current editing node)
  const availablePredecessors = useMemo(() => {
    return activeProject.activities.filter(a => !isEditing || a.id !== initialActivity?.id);
  }, [activeProject.activities, isEditing, initialActivity]);

  // Handle predecessor toggle
  const togglePredecessor = (predId: string) => {
    setDependencies(prev => {
      if (prev.some(d => d.predecessorId === predId)) {
        return prev.filter(d => d.predecessorId !== predId);
      }
      return [...prev, { predecessorId: predId, type: 'FS', lag: 0 }];
    });
    setError(null);
  };

  const updateDependencyType = (predId: string, type: RelationshipType) => {
    setDependencies(prev =>
      prev.map(d => (d.predecessorId === predId ? { ...d, type } : d))
    );
  };

  const updateDependencyLag = (predId: string, lag: number) => {
    setDependencies(prev =>
      prev.map(d => (d.predecessorId === predId ? { ...d, lag } : d))
    );
  };

  // Handle milestone toggle
  const handleMilestoneToggle = (checked: boolean) => {
    setIsMilestone(checked);
    if (checked) {
      setDuration(0);
    } else if (duration === 0) {
      setDuration(1);
    }
  };

  // Form submission with rigorous validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = id.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanId) {
      setError('Activity ID is required.');
      return;
    }

    if (!cleanName) {
      setError('Activity name is required.');
      return;
    }

    if (duration < 0) {
      setError('Duration cannot be negative.');
      return;
    }

    // Check duplicate ID
    const duplicate = activeProject.activities.find(
      a => a.id.toUpperCase() === cleanId && (!isEditing || a.id !== initialActivity?.id)
    );
    if (duplicate) {
      setError(`An activity with ID "${cleanId}" already exists.`);
      return;
    }

    // Check self-dependency
    const predIds = dependencies.map(d => d.predecessorId);
    if (predIds.includes(cleanId)) {
      setError('An activity cannot depend on itself.');
      return;
    }

    // Prepare hypothetical activity list to test for circular dependency
    const candidateActivity: Activity = {
      id: cleanId,
      name: cleanName,
      duration: isMilestone ? 0 : Number(duration),
      predecessors: predIds,
      dependencyRelations: dependencies,
      description: description.trim(),
      category: category.trim() || 'General',
      progress: Math.min(100, Math.max(0, Number(progress))),
      isMilestone,
      dependencyClassification: predIds.length > 0 ? 'Mandatory' : undefined,
    };

    let testList: Activity[];
    if (isEditing) {
      testList = activeProject.activities.map(a => {
        if (a.id === initialActivity!.id) {
          return candidateActivity;
        }
        if (cleanId !== initialActivity!.id) {
          return {
            ...a,
            predecessors: a.predecessors.map(p => (p === initialActivity!.id ? cleanId : p)),
            dependencyRelations: a.dependencyRelations?.map(r =>
              r.predecessorId === initialActivity!.id ? { ...r, predecessorId: cleanId } : r
            ),
          };
        }
        return a;
      });
    } else {
      testList = [...activeProject.activities, candidateActivity];
    }

    const cycleCheck = detectCycles(testList);
    if (cycleCheck.hasCycle) {
      setError(
        `Circular Dependency Error: Setting this activity creates an infinite loop (${cycleCheck.cycleNodes?.join(
          ' → '
        )}). Please adjust predecessor links.`
      );
      return;
    }

    // Commit to ScheduleContext
    if (isEditing) {
      updateActivity(initialActivity!.id, candidateActivity);
    } else {
      addActivity(candidateActivity);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink-primary/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-xl border border-border shadow-elevated overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-warm px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-ink-primary shadow-xs">
              {isEditing ? <Edit2 className="w-4 h-4 text-brand" /> : <Plus className="w-4 h-4 text-brand" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-primary font-sans leading-tight">
                {isEditing ? `Edit Activity ${initialActivity?.id}` : 'Create New Activity'}
              </h3>
              <span className="text-[11px] text-ink-muted">
                {activeProject.name} &bull; Deterministic AON Node
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-critical-light border border-critical-border flex items-start space-x-2.5 text-xs text-critical">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Activity ID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Activity ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={id}
                  onChange={e => {
                    setId(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="e.g. G"
                  className="w-full px-3 py-2 rounded-md border border-border text-sm font-mono font-bold text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                  maxLength={8}
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Activity Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Security Vulnerability Audit"
                className="w-full px-3 py-2 rounded-md border border-border text-sm font-medium text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                required
              />
            </div>
          </div>

          {/* Duration & Milestone & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Duration (Days) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  disabled={isMilestone}
                  value={duration}
                  onChange={e => {
                    setDuration(Math.max(0, parseInt(e.target.value) || 0));
                    setError(null);
                  }}
                  className={`w-full px-3 py-2 rounded-md border border-border text-sm font-mono font-bold text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand ${
                    isMilestone ? 'opacity-50 cursor-not-allowed bg-warm' : ''
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Engineering"
                className="w-full px-3 py-2 rounded-md border border-border text-sm text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              />
            </div>

            <div className="h-full flex items-center pt-2 sm:pt-0">
              <label className="flex items-center space-x-2 text-xs font-semibold text-ink-primary cursor-pointer select-none px-3 py-2 rounded-md border border-border hover:bg-warm transition-colors w-full">
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={e => handleMilestoneToggle(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand accent-brand"
                />
                <Flag className="w-3.5 h-3.5 text-brand" />
                <span>Zero-Duration Milestone</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
              Scope &amp; Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline deliverables, technical criteria, or team responsibilities..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand leading-relaxed"
            />
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Execution Progress
              </span>
              <span className="font-mono font-bold text-ink-primary">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          {/* Predecessor & Generalized Precedence (PDM) Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Predecessors & PDM Precedence (FS, SS, FF, SF, Lead/Lag)
              </label>
              <span className="text-[10px] text-ink-muted font-mono font-bold">
                {dependencies.length} selected
              </span>
            </div>

            {availablePredecessors.length === 0 ? (
              <p className="text-xs text-ink-secondary italic p-3 rounded-md bg-warm border border-border">
                No other activities available yet in this project. This will be an initial root activity.
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border p-2 space-y-2 bg-warm/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availablePredecessors.map(act => {
                    const dep = dependencies.find(d => d.predecessorId === act.id);
                    const isChecked = Boolean(dep);
                    return (
                      <div
                        key={act.id}
                        onClick={() => togglePredecessor(act.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-colors ${
                          isChecked
                            ? 'bg-white border-brand shadow-xs text-ink-primary'
                            : 'bg-white/60 border-border text-ink-secondary hover:bg-white hover:border-ink-secondary'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Controlled by parent div
                              className="rounded border-border text-brand focus:ring-brand accent-brand"
                            />
                            <span className="font-mono font-bold text-ink-primary">{act.id}</span>
                            <span className="truncate text-[11px] font-medium">{act.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-ink-muted ml-1 whitespace-nowrap">
                            {act.duration}d
                          </span>
                        </div>

                        {/* Inline PDM Relationship & Lag Controls */}
                        {isChecked && dep && (
                          <div
                            className="mt-2 pt-2 border-t border-border flex items-center justify-between gap-1.5"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-[9px] uppercase font-mono font-bold text-ink-muted">Rel:</span>
                              <select
                                value={dep.type || 'FS'}
                                onChange={e => updateDependencyType(act.id, e.target.value as RelationshipType)}
                                className="px-1 py-0.5 rounded border border-border bg-white text-[10px] font-mono font-bold text-ink-primary focus:outline-none focus:border-brand"
                              >
                                <option value="FS">FS</option>
                                <option value="SS">SS</option>
                                <option value="FF">FF</option>
                                <option value="SF">SF</option>
                              </select>
                            </div>

                            <div className="flex items-center space-x-1">
                              <span className="text-[9px] uppercase font-mono font-bold text-ink-muted">Lag:</span>
                              <input
                                type="number"
                                value={dep.lag ?? 0}
                                onChange={e => updateDependencyLag(act.id, parseInt(e.target.value) || 0)}
                                className="w-12 px-1 py-0.5 rounded border border-border bg-white text-[10px] font-mono text-center font-bold text-ink-primary focus:outline-none focus:border-brand"
                                title="Lag in workdays (negative numbers represent lead)"
                              />
                              <span className="text-[10px] text-ink-muted font-mono">d</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-white text-ink-secondary hover:text-ink-primary border border-border hover:bg-warm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Activity' : 'Create Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
