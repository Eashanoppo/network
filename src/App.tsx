import React from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProjectOverview } from './components/modules/Module00Intro/ProjectOverview';
import { ScheduleProcessExplorer } from './components/modules/Module01Process/ScheduleProcessExplorer';
import { DependencyRelationshipLab } from './components/modules/Module02Dependencies/DependencyRelationshipLab';
import { NetworkDiagramExplorer } from './components/modules/Module03NetworkDiagram/NetworkDiagramExplorer';
import { CpmCalculationStudio } from './components/modules/Module04CriticalPath/CpmCalculationStudio';
import { GanttChartStudio } from './components/modules/Module05GanttChart/GanttChartStudio';
import { PertEstimator } from './components/modules/Module06Pert/PertEstimator';
import { KnowledgeCheckQuiz } from './components/modules/Module07Quiz/KnowledgeCheckQuiz';

export const App: React.FC = () => {
  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-canvas text-ink-primary flex flex-col font-sans selection:bg-brand-light selection:text-brand">
        {/* Sticky Header with Navigation, Progress, and Live Status */}
        <Header />

        {/* Continuous Educational Scroll Experience */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section 0: Project Context & Shared Scenario Overview */}
          <ProjectOverview />

          {/* Module 01 — Member 1: Schedule Management & 6 Processes */}
          <ScheduleProcessExplorer />

          {/* Module 02 — Member 2: Activity Dependencies & Relationships */}
          <DependencyRelationshipLab />

          {/* Module 03 — Member 3: Network Diagram (AON) */}
          <NetworkDiagramExplorer />

          {/* Module 04 — Member 4: Critical Path Method (CPM) & Calculation Studio */}
          <CpmCalculationStudio />

          {/* Module 05 — Member 5: Gantt Chart Studio & Comparative Analysis */}
          <GanttChartStudio />

          {/* Module 06 — Supporting Academic Topic: PERT Estimator */}
          <PertEstimator />

          {/* Module 07 — Interactive Knowledge Check Quiz */}
          <KnowledgeCheckQuiz />
        </main>

        {/* Academic References & Footer */}
        <Footer />
      </div>
    </ScheduleProvider>
  );
};

export default App;

