import React, { useState, useRef, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { ProjectModal } from './ProjectModal';
import {
  Folder,
  ChevronDown,
  Plus,
  Copy,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Check,
  CheckCircle2,
  FolderPlus,
  Settings,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProjectSwitcherProps {
  className?: string;
  variant?: 'header' | 'inline' | 'compact';
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  className = '',
  variant = 'header',
}) => {
  const {
    projects,
    activeProjectId,
    activeProject,
    schedule,
    switchProject,
    duplicateProject,
    deleteProject,
    resetProjectToBaseline,
    exportProject,
    importProject,
  } = useSchedule();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit' | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle JSON Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importProject(content);
        if (!result.success) {
          setImportError(result.error || 'Failed to import project.');
        } else {
          setImportError(null);
          setIsOpen(false);
        }
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);

    // Reset input value so same file can be uploaded again if needed
    e.target.value = '';
  };

  // Safe deletion confirmation
  const handleDelete = (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert('Cannot delete the only remaining project.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete project "${projectName}"? This action cannot be undone.`
    );
    if (confirmed) {
      deleteProject(projectId);
    }
  };

  return (
    <>
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        {/* Trigger Button */}
        {variant === 'header' ? (
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-warm hover:bg-surface-secondary border border-border text-ink-primary transition-all max-w-[200px] sm:max-w-[240px] shadow-2xs"
            aria-expanded={isOpen}
            aria-haspopup="true"
            title={`Active Project: ${activeProject.name}`}
          >
            <Folder className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate text-left font-sans">{activeProject.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-ink-muted shrink-0 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-warm border border-border text-ink-primary shadow-xs transition-all"
            aria-expanded={isOpen}
          >
            <div className="flex items-center space-x-2 truncate">
              <Folder className="w-4 h-4 text-brand shrink-0" />
              <div className="text-left truncate">
                <span className="block font-bold truncate">{activeProject.name}</span>
                <span className="block text-[10px] text-ink-secondary">
                  {activeProject.activities.length} activities &bull; {schedule.projectDuration} workdays
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-ink-muted shrink-0 ml-2 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-border shadow-elevated z-50 overflow-hidden animate-fadeIn"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="bg-warm px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                  Project Workspace
                </span>
                <span className="text-xs font-bold text-ink-primary font-sans">
                  Switch or Manage Projects ({projects.length})
                </span>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setProjectModalMode('create');
                }}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-brand text-white hover:bg-brand-hover transition-colors flex items-center space-x-1 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>New Project</span>
              </button>
            </div>

            {/* Import Error Banner */}
            {importError && (
              <div className="p-3 bg-critical-light border-b border-critical-border text-xs text-critical flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Import Error</span>
                  <span className="text-[11px] leading-tight block">{importError}</span>
                </div>
                <button
                  onClick={() => setImportError(null)}
                  className="text-critical hover:text-ink-primary font-bold text-xs"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Projects List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-border/60 py-1">
              {projects.map(proj => {
                const isActive = proj.id === activeProjectId;
                const isSample = proj.metadata?.isSample;

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      switchProject(proj.id);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between group transition-colors ${
                      isActive ? 'bg-warm/80' : 'hover:bg-warm/40'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 truncate mr-2">
                      <div className="pt-0.5 shrink-0">
                        {isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-brand" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-border group-hover:border-ink-secondary" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-ink-primary' : 'text-ink-primary group-hover:text-brand'
                            }`}
                          >
                            {proj.name}
                          </span>
                          {isSample && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-secondary text-ink-secondary font-mono border border-border shrink-0">
                              Sample
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-secondary block truncate mt-0.5">
                          {proj.activities.length} {proj.activities.length === 1 ? 'activity' : 'activities'}
                          {proj.description ? ` &bull; ${proj.description}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!isSample && projects.length > 1 && (
                        <button
                          onClick={e => handleDelete(e, proj.id, proj.name)}
                          className="p-1 rounded text-ink-muted hover:text-critical hover:bg-critical-light transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Project Management Sub-bar */}
            <div className="bg-warm/60 px-4 py-2.5 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-muted font-medium">
                Active: <strong className="text-ink-primary">{activeProject.name}</strong>
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setProjectModalMode('edit');
                  }}
                  className="p-1 text-ink-secondary hover:text-ink-primary hover:bg-white rounded transition-colors"
                  title="Project Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    duplicateProject(activeProjectId);
                    setIsOpen(false);
                  }}
                  className="p-1 text-ink-secondary hover:text-ink-primary hover:bg-white rounded transition-colors"
                  title="Duplicate Active Project"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => resetProjectToBaseline(activeProjectId)}
                  className="p-1 text-ink-secondary hover:text-ink-primary hover:bg-white rounded transition-colors"
                  title="Restore Project Baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Import / Export Footer Bar */}
            <div className="p-2.5 bg-white border-t border-border flex items-center justify-between gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 px-2 rounded-md text-xs font-semibold bg-white hover:bg-warm border border-border text-ink-secondary hover:text-ink-primary transition-colors flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>

              <button
                onClick={() => exportProject(activeProjectId)}
                className="flex-1 py-1.5 px-2 rounded-md text-xs font-semibold bg-white hover:bg-warm border border-border text-ink-secondary hover:text-ink-primary transition-colors flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Project Creation / Edit Modal */}
      {projectModalMode && (
        <ProjectModal
          isOpen={true}
          mode={projectModalMode}
          onClose={() => setProjectModalMode(null)}
        />
      )}
    </>
  );
};
