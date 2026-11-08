export interface ActivityDependency {
  predecessorId: string;
  type: RelationshipType;
  lag?: number;
  classification?: DependencyClassification;
}

export interface ProjectCalendarConfig {
  hoursPerDay: number;
  workdaysPerWeek: number;
}

export interface ProjectMetadata {
  isSample?: boolean;
  category?: string;
  author?: string;
  version?: string;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
  baselineActivities: Activity[];
  createdAt: string;
  updatedAt: string;
  calendarConfig: ProjectCalendarConfig;
  metadata: ProjectMetadata;
}

export type ActivityCategory =
  | 'Planning'
  | 'Design'
  | 'Engineering'
  | 'Quality'
  | 'Deployment'
  | string;

export interface Activity {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
  description?: string;
  category?: ActivityCategory;
  progress?: number; // 0 to 100%
  isMilestone?: boolean;
  dependencyClassification?: DependencyClassification;
  dependencyRelations?: ActivityDependency[];
  pert?: {
    optimistic: number;
    mostLikely: number;
    pessimistic: number;
  };
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

export interface ValidationError {
  activityId?: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
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
  validationErrors?: ValidationError[];
  isValid: boolean;
}

export interface ActivityChangeDelta {
  activityId: string;
  name: string;
  durationChanged: boolean;
  oldDuration: number;
  newDuration: number;
  durationDelta: number;
  esChanged: boolean;
  oldEs: number;
  newEs: number;
  efChanged: boolean;
  oldEf: number;
  newEf: number;
  lsChanged: boolean;
  oldLs: number;
  newLs: number;
  lfChanged: boolean;
  oldLf: number;
  newLf: number;
  floatChanged: boolean;
  oldFloat: number;
  newFloat: number;
  floatDelta: number;
  criticalStatusChanged: boolean;
  wasCritical: boolean;
  isCritical: boolean;
}

export interface ScheduleComparisonResult {
  projectDurationDelta: number;
  oldProjectDuration: number;
  newProjectDuration: number;
  projectDurationChanged: boolean;
  affectedActivityIds: string[];
  activityDeltas: Record<string, ActivityChangeDelta>;
  criticalPathsChanged: boolean;
  oldCriticalPaths: ProjectPath[];
  newCriticalPaths: ProjectPath[];
  newCriticalActivities: string[];
  lostCriticalActivities: string[];
  explanation: string;
  keyTakeaway: string;
}

export type ScheduleViewMode = 'current' | 'preview' | 'baseline';

export type SimulationType = 'duration' | 'delay' | 'compression' | 'dependency' | 'pert';

export interface SimulationScenario {
  id: string;
  type: SimulationType;
  description: string;
  targetActivityId: string;
  proposedActivities: Activity[];
  schedule: ScheduleCalculationResult;
  comparison: ScheduleComparisonResult;
  isValid: boolean;
  validationErrors: ValidationError[];
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
  category:
    | 'Process'
    | 'Classification'
    | 'Relationships'
    | 'Network'
    | 'CPM'
    | 'Slack'
    | 'Gantt'
    | 'PERT'
    | 'Simulation'
    | 'True/False'
    | 'Critical Path Identification';
  memberTag: string;
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

export interface ChapterInfo {
  number: number;
  id: string;
  title: string;
  shortTitle: string;
  member: string;
  memberId: 'member-1' | 'member-2' | 'member-3' | 'member-4' | 'member-5' | 'all';
  durationMinutes: number;
  learningObjective: string;
  keyTakeaway: string;
}
