import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../../../data/educationalContent';
import { QuizQuestion } from '../../../types/scheduling';
import { SectionHeader } from '../../common/SectionHeader';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Award,
} from 'lucide-react';

export const KnowledgeCheckQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleSelectOption = (optionId: string) => {
    if (selectedAnswers[currentQ.id]) return; // already answered
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
  };

  const calculateScore = () => {
    let score = 0;
    for (const q of QUIZ_QUESTIONS) {
      const selectedId = selectedAnswers[q.id];
      const correctOption = q.options.find(opt => opt.isCorrect);
      if (selectedId && correctOption && selectedId === correctOption.id) {
        score++;
      }
    }
    return score;
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  const userSelectionId = selectedAnswers[currentQ.id];
  const hasAnsweredCurrent = Boolean(userSelectionId);
  const selectedOptionObj = currentQ.options.find(opt => opt.id === userSelectionId);
  const correctOptionObj = currentQ.options.find(opt => opt.isCorrect);
  const isCurrentCorrect = selectedOptionObj?.isCorrect;

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <section id="module-07" className="py-12 scroll-mt-20">
      <SectionHeader
        moduleNumber="Module 06"
        member="Collaborative Team Assessment"
        title="Interactive Knowledge Check &amp; Mastery Challenge"
        subtitle="Consolidate learning from all five team members. Test your understanding of schedule processes, precedence logic, AON network topology, CPM forward/backward calculations, and Gantt charts."
        tagline="Evaluation &amp; Audience Engagement"
      />

      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        {!isCompleted ? (
          <div>
            {/* Quiz Header & Progress Track */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    {currentQ.memberTag}
                  </span>
                  <span className="text-xs text-ink-muted">&bull; Category: {currentQ.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-ink-primary mt-0.5">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </h3>
              </div>

              {/* Progress Bar & Indicators */}
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-canvas h-2 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-brand h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-ink-primary">
                  {currentQuestionIndex + 1}/{totalQuestions}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h4 className="text-base sm:text-lg font-bold text-ink-primary leading-snug">
                {currentQ.question}
              </h4>
              {currentQ.scenario && (
                <p className="mt-2 text-xs text-ink-secondary bg-canvas p-3 rounded-lg border border-border font-mono">
                  {currentQ.scenario}
                </p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map(option => {
                const isSelected = userSelectionId === option.id;
                let optionStyle = 'bg-white hover:bg-canvas border-border text-ink-primary';

                if (hasAnsweredCurrent) {
                  if (option.isCorrect) {
                    optionStyle = 'bg-success-light/80 border-success text-success font-semibold';
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle = 'bg-critical-light/80 border-critical text-critical font-semibold';
                  } else {
                    optionStyle = 'bg-white opacity-50 border-border text-ink-muted';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={hasAnsweredCurrent}
                    className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-start justify-between ${optionStyle}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 uppercase">
                        {option.id}
                      </span>
                      <div>
                        <span className="text-xs leading-relaxed">{option.text}</span>
                        {/* Explanation inline when answered */}
                        {hasAnsweredCurrent && (isSelected || option.isCorrect) && (
                          <p className="mt-1.5 text-[11px] font-normal leading-relaxed opacity-95">
                            {option.explanation}
                          </p>
                        )}
                      </div>
                    </div>

                    {hasAnsweredCurrent && (
                      <div className="shrink-0 ml-2 mt-0.5">
                        {option.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : isSelected ? (
                          <XCircle className="w-4 h-4 text-critical" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Academic Reference & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="text-[11px] text-ink-secondary flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>{currentQ.academicNote}</span>
              </div>

              {hasAnsweredCurrent && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors flex items-center justify-center space-x-1.5 shadow-sm self-end"
                >
                  <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Summary'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Final Results and Summary Screen */
          <div className="text-center py-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto mb-4 border border-brand-border shadow-subtle">
              <Trophy className="w-8 h-8 text-brand" />
            </div>

            <h3 className="text-2xl font-bold text-ink-primary">
              Quiz Completed!
            </h3>
            <p className="text-xs text-ink-secondary mt-1">
              Here is your overall performance across all five schedule management presentation topics.
            </p>

            <div className="my-6 p-6 rounded-2xl bg-canvas border border-border inline-block min-w-[280px]">
              <div className="text-4xl font-extrabold text-brand font-mono">
                {score} / {totalQuestions}
              </div>
              <div className="text-xs font-semibold text-ink-secondary mt-1">
                {percentage}% Score ({percentage >= 80 ? 'Mastery Achieved' : percentage >= 60 ? 'Competent' : 'Review Recommended'})
              </div>
            </div>

            {/* Concise Learning Summary by Member Topic */}
            <div className="text-left bg-canvas p-4 rounded-xl border border-border mb-6 text-xs space-y-2">
              <span className="font-bold text-ink-primary block mb-1">
                5-Member Key Takeaways Recap:
              </span>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-brand shrink-0">Member 1:</span>
                <span className="text-ink-secondary">Schedule Management follows 6 rigorous PMBOK processes from Planning to Control.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-brand shrink-0">Member 2:</span>
                <span className="text-ink-secondary">Dependency classification (Mandatory/Discretionary) is distinct from relationship types (FS/SS/FF/SF).</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-brand shrink-0">Member 3:</span>
                <span className="text-ink-secondary">Activity-on-Node diagrams visually represent project logic and parallel workflow concurrency.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-brand shrink-0">Member 4:</span>
                <span className="text-ink-secondary">The longest path determines project duration; critical activities have zero total float.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-brand shrink-0">Member 5:</span>
                <span className="text-ink-secondary">Gantt charts place activities onto a calendar timeline to monitor overlaps and execution.</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors inline-flex items-center space-x-2 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

