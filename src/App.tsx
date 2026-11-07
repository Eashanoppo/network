import React from 'react';
import { ScheduleProvider } from './context/ScheduleContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PresenterStageBar } from './components/common/PresenterStageBar';
import { ProjectOverview } from './components/modules/Chapter01Overview/ProjectOverview';
import { ScheduleManagementBasics } from './components/modules/Chapter02ScheduleManagement/ScheduleManagementBasics';
import { ScheduleProcessExplorer } from './components/modules/Chapter03Processes/ScheduleProcessExplorer';
import { DependencyRelationshipLab } from './components/modules/Chapter04Dependencies/DependencyRelationshipLab';
import { NetworkDiagramExplorer } from './components/modules/Chapter05NetworkDiagram/NetworkDiagramExplorer';
import { CpmCalculationStudio } from './components/modules/Chapter06CriticalPath/CpmCalculationStudio';
import { GanttChartStudio } from './components/modules/Chapter07GanttChart/GanttChartStudio';
import { SimulationWorkspace } from './components/modules/Chapter06CriticalPath/SimulationWorkspace';
import { PertEstimator } from './components/modules/Chapter08Pert/PertEstimator';
import { KnowledgeCheckQuiz } from './components/modules/Chapter09Quiz/KnowledgeCheckQuiz';
import { ScheduleFaq } from './components/modules/FaqAndCta/ScheduleFaq';
import { FinalCta } from './components/modules/FaqAndCta/FinalCta';

export const App: React.FC = () => {
  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-canvas text-ink-primary flex flex-col font-sans selection:bg-brand-light selection:text-ink-primary">
        {/* Accessible Keyboard Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink-primary focus:text-white focus:rounded-md focus:shadow-elevated text-xs font-semibold"
        >
          Skip to main content
        </a>

        {/* Minimalist Editorial Navigation Bar */}
        <Header />

        {/* Full-Width Alternating Editorial Bands */}
        <main id="main-content" className="flex-1 w-full">
          {/* Section A & B: Hero & Platform Capabilities (White Band) */}
          <ProjectOverview />

          {/* Section C (Part 1): Project Schedule Management (Warm Neutral Band) */}
          <ScheduleManagementBasics />

          {/* Section C (Part 2): The Six PMBOK Schedule Processes (White Band) */}
          <ScheduleProcessExplorer />

          {/* Section D: Activity Dependencies & Precedence Logic (Warm Neutral Band) */}
          <DependencyRelationshipLab />

          {/* Section E: Network Diagram - Activity-on-Node (White Band) */}
          <NetworkDiagramExplorer />

          {/* Section F: Critical Path Method (CPM) & Slack Studio (Warm Neutral Band) */}
          <CpmCalculationStudio />

          {/* Section G: Gantt Chart Studio & Comparative Synthesis (White Band) */}
          <GanttChartStudio />

          {/* Section H: Real-Time Simulation Workspace (Warm Neutral Band) */}
          <SimulationWorkspace />

          {/* Section I: PERT Three-Point Estimation Studio (White Band) */}
          <PertEstimator />

          {/* Section J: Interactive Knowledge Check & Practical Challenge (Warm Neutral Band) */}
          <KnowledgeCheckQuiz />

          {/* Section K: Minimalist FAQ Accordion (White Band) */}
          <ScheduleFaq />

          {/* Section L: Full-Width Final CTA (Warm Neutral Band) */}
          <FinalCta />
        </main>

        {/* Floating Presenter Stage Bar (Active in Presenter Mode) */}
        <PresenterStageBar />

        {/* Section M: Refined Footer (White Band) */}
        <Footer />
      </div>
    </ScheduleProvider>
  );
};

export default App;
