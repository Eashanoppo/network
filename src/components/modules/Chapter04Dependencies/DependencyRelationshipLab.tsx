import React, { useState } from 'react';
import {
  RELATIONSHIP_TYPES_DATA,
  DEPENDENCY_CLASSIFICATIONS_DATA,
  CHAPTERS_DATA,
} from '../../../data/educationalContent';
import { RelationshipType, DependencyClassification } from '../../../types/scheduling';
import { useSchedule } from '../../../context/ScheduleContext';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
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
} from 'lucide-react';

export const DependencyRelationshipLab: React.FC = () => {
  const { activities, updateActivityDependencies, resetToBaseline } = useSchedule();
  const [activeTab, setActiveTab] = useState<'pdmLab' | 'registry'>('pdmLab');
  const [selectedRelType, setSelectedRelType] = useState<RelationshipType>('FS');
  const [selectedClassification, setSelectedClassification] =
    useState<DependencyClassification>('Mandatory');
  const [lagDays, setLagDays] = useState<number>(0);
  const [classQuizSelection, setClassQuizSelection] = useState<string | null>(null);

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

  // Real University Management System Activity Dependencies Data
  const REAL_DEPENDENCY_REGISTRY = [
    {
      id: 'A',
      name: 'Requirements Analysis',
      pred: 'None (Root Node)',
      type: '—',
      classification: 'Internal',
      justification: 'Project charter initiates internal student & faculty stakeholder interviews.',
      fastTrackingFeasible: false,
      reason: 'Cannot fast-track requirements without baseline scope definition.',
    },
    {
      id: 'B',
      name: 'System Design',
      pred: 'A (Requirements Analysis)',
      type: 'Finish-to-Start (FS)',
      classification: 'Mandatory',
      justification: 'Hard logic: Engineering architecture cannot be modeled until requirements are frozen.',
      fastTrackingFeasible: false,
      reason: 'Physical/technical impossibility to architect modules without requirements.',
    },
    {
      id: 'C',
      name: 'Database Design',
      pred: 'A (Requirements Analysis)',
      type: 'Finish-to-Start (FS)',
      classification: 'Mandatory',
      justification: 'Hard logic: Normalized relational schemas require entity attributes from requirements.',
      fastTrackingFeasible: false,
      reason: 'Runs concurrently with B in parallel once A finishes.',
    },
    {
      id: 'D',
      name: 'Development',
      pred: 'B (System Design) & C (Database Design)',
      type: 'Finish-to-Start (FS)',
      classification: 'Mandatory',
      justification: 'Hard logic: Coding portal and database queries requires both architecture blueprints.',
      fastTrackingFeasible: false,
      reason: 'Developers require both schema schemas and API contracts to implement software.',
    },
    {
      id: 'E',
      name: 'Testing',
      pred: 'D (Development)',
      type: 'Finish-to-Start (FS)',
      classification: 'Discretionary',
      justification: 'Soft logic / Best Practice: Formal policy dictates staging integration testing before training.',
      fastTrackingFeasible: true,
      reason: 'Prime fast-tracking target! In an emergency, training environments could start testing concurrently (SS) at higher risk of defect rework.',
    },
    {
      id: 'F',
      name: 'User Training',
      pred: 'E (Testing)',
      type: 'Finish-to-Start (FS)',
      classification: 'External',
      justification: 'University registrar academic calendar and faculty availability constrain training dates.',
      fastTrackingFeasible: false,
      reason: 'External stakeholders cannot be rescheduled arbitrarily by the internal software team.',
    },
  ];

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

        {/* Crucial Academic Distinction Banner */}
        <div className="bg-white border border-border rounded-xl p-5 mb-8 flex items-start space-x-3.5 shadow-xs">
          <Info className="w-5 h-5 text-ink-primary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-ink-primary uppercase tracking-wider block text-[11px]">
              Essential Academic Distinction (Kathy Schwalbe Chapter 6)
            </span>
            <p className="text-ink-secondary mt-1 leading-relaxed">
              <strong>Dependency Classifications</strong> (<em>Mandatory, Discretionary, External, Internal</em>) specify <strong>why</strong> a constraint exists. In contrast, <strong>Logical Relationship Types</strong> (<em>FS, SS, FF, SF</em>) define <strong>how</strong> start and finish dates are mathematically chained in the schedule. Never confuse reason with precedence mechanics.
            </p>
          </div>
        </div>

        {/* Primary Section Mode Selector Tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('pdmLab')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'pdmLab'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>1. PDM Relationship Visualizer (Teaching Demo)</span>
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
              <span>2. Project Case Dependency Registry (Actual Tasks)</span>
            </button>
          </div>
        </div>

        {activeTab === 'pdmLab' ? (
          /* Tab 1: Interactive Precedence Relationship Lab */
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
              <div className="inline-flex rounded-lg border border-border p-1 bg-warm">
                {RELATIONSHIP_TYPES_DATA.map(rel => (
                  <button
                    key={rel.type}
                    onClick={() => {
                      setSelectedRelType(rel.type);
                      setLagDays(0);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
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
            <div className="bg-warm rounded-lg p-5 sm:p-6 border border-border mb-6">
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
                <div className="flex items-center space-x-3 bg-white px-3.5 py-2 rounded-lg border border-border shadow-xs">
                  <Sliders className="w-3.5 h-3.5 text-brand" />
                  <label className="text-xs font-semibold text-ink-primary whitespace-nowrap">
                    Lag / Lead:
                  </label>
                  <input
                    type="range"
                    min={-2}
                    max={4}
                    value={lagDays}
                    onChange={e => setLagDays(Number(e.target.value))}
                    className="w-24 accent-brand cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-ink-primary w-12 text-right">
                    {lagDays > 0 ? `+${lagDays}d lag` : lagDays < 0 ? `${lagDays}d lead` : '0d'}
                  </span>
                </div>
              </div>

              {/* Timeline Bar Demonstration */}
              <div className="py-6 overflow-x-auto">
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
                    University Case Scenario Application:
                  </span>
                  <p className="text-ink-secondary leading-relaxed">
                    {currentRel.universityExample}
                  </p>
                  <div className="mt-2 text-xs text-ink-muted italic">
                    Note: In our primary University Management System, all baseline dependencies are modeled as Finish-to-Start (FS).
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Actual University Project Case Dependency Registry */
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 mb-10 shadow-xs">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                University Management System
              </span>
              <h3 className="text-xl font-bold text-ink-primary mt-1">
                Live Project Dependency Registry &amp; Fast-Tracking Analysis
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                Inspect the exact dependency classification and fast-tracking feasibility for all six activities in our case study.
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
                    <th className="py-2.5 px-3">Academic Rationale</th>
                    <th className="py-2.5 px-3 text-center">Fast-Trackable?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs sm:text-sm">
                  {REAL_DEPENDENCY_REGISTRY.map(row => (
                    <tr key={row.id} className="hover:bg-warm transition-colors">
                      <td className="py-3 px-3 font-bold text-ink-primary flex items-center space-x-2">
                        <span className="w-6 h-6 rounded bg-ink-primary text-white inline-flex items-center justify-center font-mono text-xs">
                          {row.id}
                        </span>
                        <span>{row.name}</span>
                      </td>
                      <td className="py-3 px-3 text-ink-secondary font-mono">{row.pred}</td>
                      <td className="py-3 px-3 font-mono font-medium text-ink-primary">{row.type}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            row.classification === 'Mandatory'
                              ? 'bg-critical-light text-critical'
                              : row.classification === 'Discretionary'
                              ? 'bg-warm text-ink-primary border border-border'
                              : row.classification === 'External'
                              ? 'bg-warning-light text-warning'
                              : 'bg-warm text-ink-primary'
                          }`}
                        >
                          {row.classification}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-ink-secondary leading-relaxed">{row.justification}</td>
                      <td className="py-3 px-3 text-center">
                        {row.fastTrackingFeasible ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-success-light text-success font-semibold text-[11px]">
                            <Zap className="w-3 h-3" />
                            <span>Yes (Soft Logic)</span>
                          </span>
                        ) : (
                          <span className="text-ink-muted text-[11px]">No (Hard/Fixed)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 p-4 bg-warm rounded-lg border border-border text-xs text-ink-secondary leading-relaxed">
              <strong className="text-ink-primary">Why Discretionary dependencies matter for schedule recovery:</strong> When a project is delayed, project managers cannot violate mandatory physical dependencies (you cannot build code before designing it). They must evaluate <strong>Discretionary Dependencies</strong> (e.g. Activity E Testing &rarr; Activity F Training) and decide if accepting higher rework risk allows starting them in parallel (Fast-Tracking).
            </div>

            {/* Interactive Topology & Cycle Rejection Tester */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Live Engine Interaction
                  </span>
                  <h4 className="text-sm font-bold text-ink-primary">
                    Test Dependency Modification &amp; Cycle Rejection
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    updateActivityDependencies('A', ['F']);
                  }}
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-critical-light text-critical border border-critical-border hover:bg-critical/10 transition-all flex items-center space-x-1.5 shadow-xs"
                  title="Tests Kahn's algorithm cycle detection"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Test Cycle Rejection (Make A depend on F)</span>
                </button>

                <button
                  onClick={() => {
                    resetToBaseline();
                  }}
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-warm border border-border hover:bg-surface-secondary text-ink-primary transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
                  <span>Reset to Baseline Logic</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The 4 Dependency Classifications */}
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Academic Taxonomy
            </span>
            <h3 className="text-xl font-bold text-ink-primary">
              The 4 Dependency Classifications (Kathy Schwalbe 9th Ed.)
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
              Understanding why an activity depends on another determines how much flexibility a project manager possesses when fast-tracking the schedule.
            </p>
          </div>

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
      </div>
    </section>
  );
};
