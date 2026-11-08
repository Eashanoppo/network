import React, { useState, useRef } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { ActivityEditorModal } from './ActivityEditorModal';
import { ProjectModal } from './ProjectModal';
import {
  Folder,
  Plus,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Sliders,
  Settings,
} from 'lucide-react';

export const ProjectControlBar: React.FC = () => {
  const {
    projects,
    activeProjectId,
    activeProject,
    schedule,
    baselineSchedule,
    switchProject,
    duplicateProject,
    resetProjectToBaseline,
    setProjectAsNewBaseline,
    exportProject,
    importProject,
    isModified,
  } = useSchedule();

  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importProject(content);
        if (!result.success) {
          alert(`Import Error: ${result.error || 'Failed to parse project JSON.'}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full bg-white rounded-xl border border-border p-5 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
        {/* Active Project Identity */}
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-warm border border-border flex items-center justify-center text-ink-primary shrink-0 shadow-2xs">
            <Folder className="w-5 h-5 text-brand" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                Active Project
              </span>
              {activeProject.metadata?.isSample && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-secondary text-ink-secondary font-mono border border-border">
                  Standard Benchmark
                </span>
              )}
              {isModified && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-warning-light text-warning font-sans font-bold border border-warning-border">
                  Schedule Modified
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink-primary font-sans">
              {activeProject.name}
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">
              {activeProject.description || 'Dynamic project network model.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>

          <button
            onClick={() => setProjectModalMode('create')}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white text-ink-secondary hover:text-ink-primary border border-border hover:bg-warm transition-colors flex items-center space-x-1"
            title="Create a new project"
          >
            <Folder className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            onClick={() => duplicateProject(activeProjectId)}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white text-ink-secondary hover:text-ink-primary border border-border hover:bg-warm transition-colors flex items-center space-x-1"
            title="Duplicate active project"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={() => exportProject(activeProjectId)}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white text-ink-secondary hover:text-ink-primary border border-border hover:bg-warm transition-colors flex items-center space-x-1"
            title="Export project JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white text-ink-secondary hover:text-ink-primary border border-border hover:bg-warm transition-colors flex items-center space-x-1"
            title="Import project JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {isModified && (
            <button
              onClick={() => {
                if (window.confirm(`Reset "${activeProject.name}" schedule back to approved baseline (${baselineSchedule.projectDuration} workdays)? All working edits will be reverted.`)) {
                  resetProjectToBaseline(activeProjectId);
                }
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-warning-light text-warning border border-warning-border hover:bg-warning/20 transition-colors flex items-center space-x-1"
              title="Reset schedule to approved baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Project Selector Pills Row */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          Switch Project:
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {projects.map(proj => {
            const isSelected = proj.id === activeProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => switchProject(proj.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-ink-primary text-white shadow-xs'
                    : 'bg-warm text-ink-secondary hover:text-ink-primary border border-border hover:border-ink-secondary'
                }`}
              >
                <span>{proj.name}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-secondary text-ink-muted'
                  }`}
                >
                  {proj.activities.length}a
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {isActivityModalOpen && (
        <ActivityEditorModal
          isOpen={true}
          onClose={() => setIsActivityModalOpen(false)}
        />
      )}

      {projectModalMode && (
        <ProjectModal
          isOpen={true}
          mode={projectModalMode}
          onClose={() => setProjectModalMode(null)}
        />
      )}
    </div>
  );
};
