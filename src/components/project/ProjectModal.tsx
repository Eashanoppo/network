import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { Project } from '../../types/scheduling';
import {
  X,
  FolderPlus,
  Edit3,
  Calendar,
  Layers,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  const { activeProject, createProject, updateProjectDetails } = useSchedule();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [workdaysPerWeek, setWorkdaysPerWeek] = useState<number>(5);
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [copyFromCurrent, setCopyFromCurrent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && activeProject) {
      setName(activeProject.name);
      setDescription(activeProject.description || '');
      setAuthor(activeProject.metadata?.author || '');
      setWorkdaysPerWeek(activeProject.calendarConfig?.workdaysPerWeek || 5);
      setHoursPerDay(activeProject.calendarConfig?.hoursPerDay || 8);
      setCopyFromCurrent(false);
    } else {
      setName('');
      setDescription('');
      setAuthor('Project Manager');
      setWorkdaysPerWeek(5);
      setHoursPerDay(8);
      setCopyFromCurrent(false);
    }
    setError(null);
  }, [isOpen, mode, activeProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Project name is required.');
      return;
    }

    if (mode === 'create') {
      createProject(
        cleanName,
        description.trim(),
        copyFromCurrent ? activeProject.activities : []
      );
    } else {
      updateProjectDetails(activeProject.id, {
        name: cleanName,
        description: description.trim(),
        metadata: {
          ...activeProject.metadata,
          author: author.trim() || 'Project Manager',
        },
        calendarConfig: {
          ...activeProject.calendarConfig,
          workdaysPerWeek,
          hoursPerDay,
        },
      });
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
        className="relative w-full max-w-lg bg-white rounded-xl border border-border shadow-elevated overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-warm px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-ink-primary shadow-xs">
              {mode === 'create' ? (
                <FolderPlus className="w-4 h-4 text-brand" />
              ) : (
                <Edit3 className="w-4 h-4 text-brand" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-primary font-sans leading-tight">
                {mode === 'create' ? 'Create New Project' : 'Edit Project Settings'}
              </h3>
              <span className="text-[11px] text-ink-muted">
                Multi-Project Workspace &bull; CPM Engine
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-critical-light border border-critical-border text-xs text-critical flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Next-Gen Mobile Portal Launch"
              className="w-full px-3 py-2 rounded-md border border-border text-sm font-semibold text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
              Description &bull; Strategic Scope
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Summary of project deliverables, objectives, and team boundaries..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Author / Lead
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Senior Project Manager"
                className="w-full px-3 py-2 rounded-md border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Workdays Per Week
              </label>
              <select
                value={workdaysPerWeek}
                onChange={e => setWorkdaysPerWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-border text-xs font-semibold text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              >
                <option value={5}>5-day standard work week (Mon-Fri)</option>
                <option value={6}>6-day work week (Mon-Sat)</option>
                <option value={7}>7-day continuous schedule</option>
              </select>
            </div>
          </div>

          {mode === 'create' && (
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 p-3 rounded-lg border border-border bg-warm/50 hover:bg-warm cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={copyFromCurrent}
                  onChange={e => setCopyFromCurrent(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand accent-brand mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-ink-primary block">
                    Clone activities from active project ({activeProject.name})
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    Start with a working copy of {activeProject.activities.length} activities rather than starting with a blank slate.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Action Footer */}
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
              <span>{mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
