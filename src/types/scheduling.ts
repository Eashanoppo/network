export interface Activity {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
  description?: string;
  category?: 'Planning' | 'Design' | 'Engineering' | 'Quality' | 'Deployment';
}

export interface CalculatedActivity extends Activity {
  es: number; // Earliest Start (1-indexed inclusive)
  ef: number; // Earliest Finish
  ls: number; // Latest Start
  lf: number; // Latest Finish
  totalFloat: number; // LS - ES or LF - EF
  freeFloat: number; // min(successors.ES) - EF - 1 (or 0 for terminal)
  isCritical: boolean;
  successors: string[];
}

export interface ProjectPath {
  id: string;
  activityIds: string[];
  totalDuration: number;
  isCritical: boolean;
  description: string;
}

export interface ScheduleCalculationResult {
  activities: Record<string, CalculatedActivity>;
  activityList: CalculatedActivity[];
  projectDuration: number;
  criticalPaths: ProjectPath[];
  allPaths: ProjectPath[];
  criticalActivityIds: string[];
  hasCycle: boolean;
  cycleNodes?: string[];
  errorMessage?: string;
}

export interface DelayImpactAnalysis {
  changedActivityId: string;
  oldDuration: number;
  newDuration: number;
  durationDelta: number;
  oldProjectDuration: number;
  newProjectDuration: number;
  projectDurationDelta: number;
  oldCriticalPaths: string[][];
  newCriticalPaths: string[][];
  criticalPathChanged: boolean;
  explanation: string;
  keyTakeaway: string;
}

export type DependencyClassification = 'Mandatory' | 'Discretionary' | 'External' | 'Internal';

export type RelationshipType = 'FS' | 'SS' | 'FF' | 'SF';

export interface RelationshipDetails {
  type: RelationshipType;
  name: string;
  abbreviation: string;
  rule: string;
  formulaDescription: string;
  predecessorEvent: 'Finish' | 'Start';
  successorEvent: 'Start' | 'Finish';
  commonality: string;
  practicalExample: string;
  universityExample: string;
}

export interface ProcessStep {
  stepNumber: number;
  id: string;
  name: string;
  shortTag: string;
  definition: string;
  whyImportant: string;
  inputs: string[];
  toolsAndTechniques: string[];
  primaryOutputs: string[];
  universityExample: string;
  nextStepConnection: string;
}

export interface QuizQuestion {
  id: number;
  category: 'Process' | 'Classification' | 'Relationships' | 'Network' | 'CPM' | 'Slack' | 'Gantt' | 'PERT' | 'Simulation';
  memberTag: string; // e.g. "Member 1", "Member 4"
  question: string;
  scenario?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  academicNote: string;
}

