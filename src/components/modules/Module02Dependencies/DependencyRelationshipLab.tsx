import React, { useState } from 'react';
import {
  RELATIONSHIP_TYPES_DATA,
  DEPENDENCY_CLASSIFICATIONS_DATA,
} from '../../../data/educationalContent';
import { RelationshipType, DependencyClassification } from '../../../types/scheduling';
import { SectionHeader } from '../../common/SectionHeader';
import { PresenterNotes } from '../../common/PresenterNotes';
import {
  GitBranch,
  ArrowRight,
  Info,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const DependencyRelationshipLab: React.FC = () => {
  const [selectedRelType, setSelectedRelType] = useState<RelationshipType>('FS');
  const [selectedClassification, setSelectedClassification] =
    useState<DependencyClassification>('Mandatory');
  const [lagDays, setLagDays] = useState<number>(0);
  const [classQuizSelection, setClassQuizSelection] = useState<string | null>(null);

  const currentRel =
    RELATIONSHIP_TYPES_DATA.find(r => r.type === selectedRelType) || RELATIONSHIP_TYPES_DATA[0];

  // Visual bar positions based on relationship and lag
  // Base Activity A: starts day 1, duration 4 (days 1 to 4)
  const durationA = 4;
  const durationB = 3;

  let startB = 1;
  let finishB = 1;

  if (selectedRelType === 'FS') {
    // B starts when A finishes + 1 (workday inclusive) + lag
    startB = durationA + 1 + lagDays;
    finishB = startB + durationB - 1;
  } else if (selectedRelType === 'SS') {
    // B starts when A starts + lag
    startB = 1 + lagDays;
    finishB = startB + durationB - 1;
  } else if (selectedRelType === 'FF') {
    // B finishes when A finishes + lag
    finishB = durationA + lagDays;
    startB = finishB - durationB + 1;
  } else if (selectedRelType === 'SF') {
    // B finishes when A starts + lag
    finishB = 1 + lagDays;
    startB = finishB - durationB + 1;
  }

  // Ensure minimum display bounds
  const minDay = Math.min(1, startB);
  const maxDay = Math.max(durationA, finishB, 8);
  const totalDays = maxDay - minDay + 1;

  return (
    <section id="module-02" className="py-12 border-b border-border scroll-mt-20">
      <SectionHeader
        moduleNumber="Module 02"
        member="Member 2"
        title="Activity Dependencies &amp; Relationship Logic"
        subtitle="Dependencies define the sequential contracts of a project. Discover how logical relationship types dictate task timing, and why academic literature strictly distinguishes dependency classifications from relationship types."
        tagline="Precedence Logic &amp; Constraints"
      />

      <PresenterNotes
        member="Member 2 (Speaker 2)"
        timeAllocation="3–4 minutes"
        keyTakeaway="Dependencies are the mathematical DNA of project schedules. FS is ubiquitous, but SS, FF, and SF solve distinct synchronization challenges."
        talkingPoints={[
          'Define Predecessor (prerequisite activity) and Successor (dependent activity).',
          'Clarify the academic distinction: Dependency Classification (why a constraint exists) vs Relationship Type (how it connects in time).',
          'Demonstrate FS, SS, FF, and SF in the interactive visualizer; note that the first letter is the predecessor event and second is successor.',
          'Walk through the 4 classifications: Mandatory (hard logic), Discretionary (soft logic), External, Internal.',
        ]}
        audiencePrompt="Why would a project manager deliberately choose a Discretionary dependency if it might lengthen the schedule?"
      />

      {/* Part 1: Crucial Distinction Clarifier Banner */}
      <div className="bg-brand-light/40 border border-brand-border rounded-xl p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-ink-primary uppercase tracking-wide">
              Essential Academic Distinction (Kathy Schwalbe Chapter 6)
            </span>
            <p className="text-ink-secondary mt-0.5 leading-relaxed">
              <strong>Dependency Classifications</strong> (Mandatory, Discretionary, External, Internal) explain <em>why</em> a dependency exists. In contrast, <strong>Logical Relationship Types</strong> (FS, SS, FF, SF) define <em>how</em> the schedule dates are mathematically connected. Never conflate the two concepts!
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Interactive Dependency Relationship Lab */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Interactive Component
            </span>
            <h3 className="text-lg font-bold text-ink-primary">
              Precedence Diagramming Method (PDM) Relationship Lab
            </h3>
            <p className="text-xs text-ink-secondary">
              Select a relationship type and adjust the lag slider to observe how the connection anchors and timing change dynamically.
            </p>
          </div>

          {/* Relationship Buttons */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-canvas">
            {RELATIONSHIP_TYPES_DATA.map(rel => (
              <button
                key={rel.type}
                onClick={() => {
                  setSelectedRelType(rel.type);
                  setLagDays(0);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  selectedRelType === rel.type
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {rel.type}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Lab Workspace */}
        <div className="bg-canvas rounded-xl p-5 border border-border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand text-white font-mono">
                  {currentRel.type}
                </span>
                <span className="text-sm font-bold text-ink-primary">
                  {currentRel.name}
                </span>
                <span className="text-[11px] text-ink-muted">
                  ({currentRel.commonality})
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1 font-mono">
                {currentRel.formulaDescription}
              </p>
            </div>

            {/* Interactive Lag Slider */}
            <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded-lg border border-border">
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
                {lagDays > 0 ? `+${lagDays}d` : lagDays < 0 ? `${lagDays}d` : '0d'}
              </span>
            </div>
          </div>

          {/* SVG Visual Precedence Bar Demonstration */}
          <div className="py-6 overflow-x-auto">
            <div className="min-w-[550px] relative">
              {/* Day ruler */}
              <div className="flex border-b border-border/80 pb-2 mb-4 text-[11px] font-mono text-ink-muted">
                <div className="w-32 shrink-0 font-sans font-semibold text-ink-primary">Activity</div>
                <div className="flex-1 grid grid-cols-10 gap-1 text-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="border-l border-border/40 pl-1">
                      Day {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity A (Predecessor) */}
              <div className="flex items-center mb-6">
                <div className="w-32 shrink-0 text-xs">
                  <div className="font-bold text-ink-primary">Task A (Pred)</div>
                  <div className="text-[10px] text-ink-muted">Duration: 4d</div>
                </div>
                <div className="flex-1 relative h-12 flex items-center">
                  {/* Grid background lines */}
                  <div className="absolute inset-0 grid grid-cols-10 gap-1 opacity-20 pointer-events-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-l border-ink-muted h-full" />
                    ))}
                  </div>

                  {/* Task Bar A */}
                  <div
                    className="h-9 rounded-md bg-brand text-white flex items-center justify-between px-3 text-xs font-semibold shadow-sm relative z-10"
                    style={{
                      width: '40%', // 4 out of 10 days
                      marginLeft: '0%',
                    }}
                  >
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-white/70" title="Start Point" />
                      <span>Start: Day 1</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>Finish: Day 4</span>
                      <span className="w-2 h-2 rounded-full bg-white/70" title="Finish Point" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Dependency Connector Indicator */}
              <div className="relative h-6 my-1">
                <div className="absolute left-32 right-0 flex items-center justify-center">
                  <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-white border border-border shadow-xs text-[11px] font-mono font-medium text-brand">
                    <span>Anchor: [{currentRel.predecessorEvent} of A]</span>
                    <ArrowRight className="w-3 h-3 text-brand" />
                    <span>[{currentRel.successorEvent} of B]</span>
                    {lagDays !== 0 && (
                      <span className="text-warning font-bold">
                        ({lagDays > 0 ? `+${lagDays}d lag` : `${lagDays}d lead`})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity B (Successor) */}
              <div className="flex items-center mt-2">
                <div className="w-32 shrink-0 text-xs">
                  <div className="font-bold text-ink-primary">Task B (Succ)</div>
                  <div className="text-[10px] text-ink-muted">Duration: 3d</div>
                </div>
                <div className="flex-1 relative h-12 flex items-center">
                  {/* Grid background lines */}
                  <div className="absolute inset-0 grid grid-cols-10 gap-1 opacity-20 pointer-events-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-l border-ink-muted h-full" />
                    ))}
                  </div>

                  {/* Task Bar B */}
                  <div
                    className="h-9 rounded-md bg-success text-white flex items-center justify-between px-3 text-xs font-semibold shadow-sm transition-all duration-300 relative z-10"
                    style={{
                      width: '30%', // 3 days
                      marginLeft: `${Math.max(0, (startB - 1) * 10)}%`,
                    }}
                  >
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-white/70" title="Start Point" />
                      <span>Start: Day {startB}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>Finish: Day {finishB}</span>
                      <span className="w-2 h-2 rounded-full bg-white/70" title="Finish Point" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plain language explanation card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-border/80 text-xs">
            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="font-bold text-ink-primary block mb-1">
                Logical Rule Explained:
              </span>
              <p className="text-ink-secondary leading-relaxed">{currentRel.rule}</p>
              <p className="text-brand font-semibold mt-1">
                {currentRel.practicalExample}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-border">
              <span className="font-bold text-ink-primary block mb-1">
                University Case Study Application:
              </span>
              <p className="text-ink-secondary leading-relaxed">
                {currentRel.universityExample}
              </p>
              <div className="mt-2 text-[11px] text-ink-muted italic">
                Note: In our primary schedule, all baseline dependencies are modeled as Finish-to-Start (FS).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 3: The 4 Dependency Classifications */}
      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">
            Academic Classification Framework
          </span>
          <h3 className="text-lg font-bold text-ink-primary">
            The 4 Dependency Classifications (Kathy Schwalbe 9th Ed.)
          </h3>
          <p className="text-xs text-ink-secondary">
            Understanding why an activity depends on another determines how much flexibility a project manager possesses when crashing or fast-tracking the schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {DEPENDENCY_CLASSIFICATIONS_DATA.map(item => {
            const isSelected = selectedClassification === item.type;
            return (
              <div
                key={item.type}
                onClick={() => setSelectedClassification(item.type)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand ring-2 ring-brand/20 bg-brand-light/30 shadow-subtle'
                    : 'border-border bg-canvas hover:border-brand-border'
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
                        ? 'bg-brand-light text-brand'
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
                <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] text-ink-primary">
                  <strong className="text-ink-secondary">Real-world:</strong> {item.projectExample}
                </div>
              </div>
            );
          })}
        </div>

        {/* Audience Classification Mini-Check */}
        <div className="bg-canvas rounded-lg p-4 border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="w-4 h-4 text-brand" />
            <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
              Audience Interactive Quiz: Classify the Dependency
            </span>
          </div>
          <p className="text-xs text-ink-secondary mb-3">
            &ldquo;The University Registrar requires that student data cannot be migrated to the new cloud database until the state data compliance inspector signs off on the encryption protocol.&rdquo; Which classification is this?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'ext', label: 'External Dependency', correct: true, note: 'Correct! The state inspector is an external entity outside the project team\'s direct control.' },
              { id: 'man', label: 'Mandatory Internal', correct: false, note: 'Incorrect. While legally required, the constraint originates outside project jurisdiction.' },
              { id: 'disc', label: 'Discretionary Dependency', correct: false, note: 'Incorrect. Regulatory compliance is not optional preferential best practice.' },
              { id: 'sf', label: 'Start-to-Finish Relationship', correct: false, note: 'Incorrect. That is a relationship type, not a dependency classification!' },
            ].map(choice => (
              <button
                key={choice.id}
                onClick={() => setClassQuizSelection(choice.id)}
                className={`p-2.5 rounded-md border text-xs font-medium text-left transition-all ${
                  classQuizSelection === choice.id
                    ? choice.correct
                      ? 'bg-success-light border-success text-success font-bold'
                      : 'bg-critical-light border-critical text-critical font-bold'
                    : 'bg-white hover:bg-white/90 border-border text-ink-primary'
                }`}
              >
                <div>{choice.label}</div>
                {classQuizSelection === choice.id && (
                  <p className="text-[10px] mt-1 font-normal opacity-90 leading-tight">
                    {choice.note}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

