import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { Activity, CalculatedActivity } from '../../types/scheduling';
import { ActivityEditorModal } from './ActivityEditorModal';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Flag,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Sparkles,
  Sliders,
  RotateCcw,
} from 'lucide-react';

export const ActivityManagementStudio: React.FC = () => {
  const {
    activeProject,
    schedule,
    selectedActivityId,
    setSelectedActivityId,
    updateActivityDuration,
    updateActivityProgress,
    duplicateActivity,
    deleteActivity,
    resetProjectToBaseline,
    isModified,
  } = useSchedule();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter activities by search query
  const filteredActivities = schedule.activityList.filter(act => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.id.toLowerCase().includes(q) ||
      act.name.toLowerCase().includes(q) ||
      (act.category && act.category.toLowerCase().includes(q))
    );
  });

  // Safe delete with cascade confirmation
  const handleDeleteClick = (act: CalculatedActivity) => {
    // Check if other activities depend on this activity
    const dependents = schedule.activityList.filter(a =>
      a.predecessors.includes(act.id)
    );

    let confirmMsg = `Are you sure you want to delete Activity "${act.id}: ${act.name}"?`;
    if (dependents.length > 0) {
      const depNames = dependents.map(d => d.id).join(', ');
      confirmMsg += `\n\nWarning: ${dependents.length} downstream activities (${depNames}) list Activity ${act.id} as a predecessor. Deleting it will automatically clean up these predecessor references.`;
    }

    if (window.confirm(confirmMsg)) {
      deleteActivity(act.id, true);
      if (selectedActivityId === act.id) {
        setSelectedActivityId(null);
      }
    }
  };

  return (
    <div id="section-activity-studio" className="w-full bg-white rounded-xl border border-border overflow-hidden shadow-xs">
      {/* Studio Header Toolbar */}
      <div className="bg-warm px-5 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Activity Management Studio
            </span>
            <span className="text-xs text-ink-muted">&bull;</span>
            <span className="text-xs font-semibold text-ink-primary">
              {activeProject.name}
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink-primary font-sans mt-0.5">
            Work Package Breakdown ({schedule.activityList.length} Activities)
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter activities..."
              className="pl-8 pr-3 py-1.5 rounded-md text-xs border border-border bg-white text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand w-36 sm:w-48"
            />
          </div>

          {/* Add Activity Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {schedule.activityList.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-xl bg-warm border border-border flex items-center justify-center text-ink-muted mb-3">
            <Sliders className="w-6 h-6 text-brand" />
          </div>
          <h4 className="text-base font-bold text-ink-primary font-sans">
            No activities in this project yet
          </h4>
          <p className="text-xs text-ink-secondary mt-1 max-w-md leading-relaxed mb-4">
            Start building your project schedule by adding your first task deliverable or milestone.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Activity</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-warm/60 border-b border-border text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                <th className="py-2.5 px-4 w-14">ID</th>
                <th className="py-2.5 px-4 min-w-[180px]">Activity Name</th>
                <th className="py-2.5 px-3 w-28 text-center">Duration</th>
                <th className="py-2.5 px-3 min-w-[120px]">Predecessors</th>
                <th className="py-2.5 px-3 w-24 text-center">ES &rarr; EF</th>
                <th className="py-2.5 px-3 w-24 text-center">LS &rarr; LF</th>
                <th className="py-2.5 px-3 w-24 text-center">Slack / TF</th>
                <th className="py-2.5 px-3 w-28">Progress</th>
                <th className="py-2.5 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredActivities.map(act => {
                const isSelected = selectedActivityId === act.id;
                const isMilestone = act.isMilestone || act.duration === 0;

                return (
                  <tr
                    key={act.id}
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-warm/90'
                        : act.isCritical
                        ? 'hover:bg-critical-light/30'
                        : 'hover:bg-warm/40'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs ${
                          act.isCritical
                            ? 'bg-critical-light text-critical border border-critical-border'
                            : 'bg-warm text-ink-primary border border-border'
                        }`}
                      >
                        {act.id}
                      </span>
                    </td>

                    {/* Name & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-ink-primary font-sans">{act.name}</span>
                        {isMilestone && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-brand/10 text-brand text-[10px] font-bold border border-brand/20">
                            <Flag className="w-2.5 h-2.5" />
                            <span>Milestone</span>
                          </span>
                        )}
                      </div>
                      {act.category && (
                        <span className="text-[10px] text-ink-muted block mt-0.5">
                          {act.category}
                        </span>
                      )}
                    </td>

                    {/* Duration with quick +/- buttons */}
                    <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center space-x-1 font-mono">
                        <button
                          onClick={() => updateActivityDuration(act.id, Math.max(0, act.duration - 1))}
                          disabled={isMilestone}
                          className="w-5 h-5 rounded border border-border hover:bg-warm text-ink-secondary flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Decrease duration by 1 day"
                        >
                          -
                        </button>
                        <span className="w-9 text-center font-bold text-ink-primary">
                          {act.duration}d
                        </span>
                        <button
                          onClick={() => updateActivityDuration(act.id, act.duration + 1)}
                          disabled={isMilestone}
                          className="w-5 h-5 rounded border border-border hover:bg-warm text-ink-secondary flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Increase duration by 1 day"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Predecessors */}
                    <td className="py-3 px-3">
                      {act.predecessors.length === 0 ? (
                        <span className="text-ink-muted text-[11px] italic">None (Root)</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {act.predecessors.map(pred => {
                            const rel = act.dependencyRelations?.find(r => r.predecessorId === pred);
                            const hasCustomType = rel && rel.type && rel.type !== 'FS';
                            const hasLag = rel && typeof rel.lag === 'number' && rel.lag !== 0;
                            return (
                              <span
                                key={pred}
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-border text-ink-secondary"
                                title={
                                  rel
                                    ? `${pred} (${rel.type || 'FS'}${hasLag ? (rel.lag! > 0 ? ` +${rel.lag}d` : ` ${rel.lag}d`) : ''})`
                                    : pred
                                }
                              >
                                <span>{pred}</span>
                                {(hasCustomType || hasLag) && (
                                  <span className="text-[9px] text-brand font-semibold">
                                    [{rel?.type || 'FS'}
                                    {hasLag ? (rel!.lag! > 0 ? `+${rel!.lag}d` : `${rel!.lag}d`) : ''}]
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* ES -> EF */}
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-ink-secondary">
                      {act.es} &rarr; {act.ef}
                    </td>

                    {/* LS -> LF */}
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-ink-secondary">
                      {act.ls} &rarr; {act.lf}
                    </td>

                    {/* Slack / Total Float */}
                    <td className="py-3 px-3 text-center font-mono">
                      {act.isCritical ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-critical-light text-critical border border-critical-border">
                          0d CRIT
                        </span>
                      ) : (
                        <span className="text-ink-primary font-medium">
                          {act.totalFloat}d float
                        </span>
                      )}
                    </td>

                    {/* Progress Slider */}
                    <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-warm rounded-full h-1.5 overflow-hidden border border-border">
                          <div
                            className="bg-brand h-full rounded-full"
                            style={{ width: `${act.progress || 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-ink-muted">
                          {act.progress || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setEditingActivity(act)}
                          className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-warm transition-colors"
                          title="Edit Activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => duplicateActivity(act.id)}
                          className="p-1 rounded text-ink-secondary hover:text-ink-primary hover:bg-warm transition-colors"
                          title="Duplicate Activity"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(act)}
                          className="p-1 rounded text-ink-secondary hover:text-critical hover:bg-critical-light transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Modals */}
      {isAddModalOpen && (
        <ActivityEditorModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {editingActivity && (
        <ActivityEditorModal
          isOpen={true}
          initialActivity={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
};
