import React, { useState } from 'react';
import { QUIZ_QUESTIONS, CHAPTERS_DATA } from '../../../data/educationalContent';
import { QuizQuestion } from '../../../types/scheduling';
import { ChapterHeader } from '../../common/ChapterHeader';
import { PracticalProjectChallenge } from './PracticalProjectChallenge';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const KnowledgeCheckQuiz: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'challenge'>('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showIncorrectReview, setShowIncorrectReview] = useState<boolean>(false);

  const chapter9 = CHAPTERS_DATA[8];
  const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleSelectOption = (optionId: string) => {
    if (selectedAnswers[currentQ.id]) return;
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

  const getIncorrectQuestions = () => {
    return QUIZ_QUESTIONS.filter(q => {
      const selectedId = selectedAnswers[q.id];
      const correctOption = q.options.find(opt => opt.isCorrect);
      return !selectedId || selectedId !== correctOption?.id;
    });
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
    setShowIncorrectReview(false);
  };

  const userSelectionId = selectedAnswers[currentQ.id];
  const hasAnsweredCurrent = Boolean(userSelectionId);
  const selectedOptionObj = currentQ.options.find(opt => opt.id === userSelectionId);
  const correctOptionObj = currentQ.options.find(opt => opt.isCorrect);

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);
  const incorrectQuestions = getIncorrectQuestions();

  return (
    <section id="chapter-09" className="w-full bg-warm py-16 lg:py-20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChapterHeader
          chapter={chapter9}
          tagline="Collaborative Team Assessment &amp; Final Review"
        />

        {/* Top Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-border pb-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-2 min-h-[44px] sm:min-h-0 ${
                activeTab === 'quiz'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>1. Final Knowledge Check Quiz ({totalQuestions} Questions)</span>
            </button>

            <button
              onClick={() => setActiveTab('challenge')}
              className={`px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-2 min-h-[44px] sm:min-h-0 ${
                activeTab === 'challenge'
                  ? 'bg-ink-primary text-white shadow-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary border border-border'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Practical Project Challenge (7-Stage Scenario)</span>
            </button>
          </div>
        </div>

      {activeTab === 'challenge' ? (
        <PracticalProjectChallenge />
      ) : (
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
          {!isCompleted ? (
            <div>
              {/* Quiz Progress & Question Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-primary bg-warm px-2 py-0.5 rounded border border-border">
                      {currentQ.memberTag}
                    </span>
                    <span className="text-xs text-ink-muted">&bull; Category: {currentQ.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-ink-primary mt-1">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </h3>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center space-x-3">
                  <div className="w-28 bg-warm h-1.5 rounded-full overflow-hidden border border-border">
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
                  <p className="mt-2 text-xs sm:text-sm text-ink-secondary bg-warm p-3.5 rounded-lg border border-border font-mono">
                    {currentQ.scenario}
                  </p>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5 mb-6">
                {currentQ.options.map(option => {
                  const isSelected = userSelectionId === option.id;
                  let optionStyle = 'bg-white hover:bg-warm border-border text-ink-primary';

                  if (hasAnsweredCurrent) {
                    if (option.isCorrect) {
                      optionStyle = 'bg-success-light border-success text-success font-semibold';
                    } else if (isSelected && !option.isCorrect) {
                      optionStyle = 'bg-critical-light border-critical text-critical font-semibold';
                    } else {
                      optionStyle = 'bg-white opacity-40 border-border text-ink-muted';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={hasAnsweredCurrent}
                      className={`w-full p-3.5 rounded-lg border text-left text-xs sm:text-sm transition-all flex items-start justify-between shadow-xs ${optionStyle}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="w-5 h-5 rounded border border-current flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 uppercase">
                          {option.id}
                        </span>
                        <div>
                          <span className="text-xs sm:text-sm leading-relaxed">{option.text}</span>
                          {hasAnsweredCurrent && (isSelected || option.isCorrect) && (
                            <p className="mt-2 text-xs font-normal leading-relaxed opacity-95">
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
                <div className="text-xs text-ink-secondary flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-ink-primary shrink-0" />
                  <span>{currentQ.academicNote}</span>
                </div>

                {hasAnsweredCurrent && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 rounded-md text-xs font-semibold bg-ink-primary text-white hover:bg-ink-primary/90 transition-all flex items-center justify-center space-x-1.5 shadow-xs self-end"
                  >
                    <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Final Summary'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Final Results and Summary Screen */
            <div className="text-center py-8 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-warm text-ink-primary flex items-center justify-center mx-auto mb-3 border border-border">
                <Trophy className="w-6 h-6 text-brand" />
              </div>

              <h3 className="text-2xl font-bold text-ink-primary">
                Quiz Completed!
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                Performance breakdown across all schedule management domains.
              </p>

              <div className="my-6 p-6 rounded-xl bg-warm border border-border inline-block min-w-[240px]">
                <div className="text-3xl font-bold text-ink-primary font-mono">
                  {score} / {totalQuestions}
                </div>
                <div className="text-xs font-semibold text-ink-secondary mt-1">
                  {percentage}% Score &bull; {percentage >= 80 ? 'Mastery Achieved' : percentage >= 60 ? 'Competent' : 'Review Recommended'}
                </div>
              </div>

              {/* Incorrect Answers Review Toggle */}
              {incorrectQuestions.length > 0 ? (
                <div className="mb-6">
                  <button
                    onClick={() => setShowIncorrectReview(!showIncorrectReview)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-critical-light text-critical border border-critical-border hover:bg-critical/10 transition-all inline-flex items-center space-x-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {showIncorrectReview ? 'Hide' : 'Review'} {incorrectQuestions.length} Incorrect Answer{incorrectQuestions.length > 1 ? 's' : ''}
                    </span>
                  </button>

                  {showIncorrectReview && (
                    <div className="mt-4 text-left space-y-3">
                      {incorrectQuestions.map(q => {
                        const selectedId = selectedAnswers[q.id];
                        const selectedOpt = q.options.find(o => o.id === selectedId);
                        const correctOpt = q.options.find(o => o.isCorrect);

                        return (
                          <div key={q.id} className="p-4 rounded-lg bg-warm border border-border text-xs">
                            <span className="font-bold text-ink-primary block mb-1">
                              Question {q.id}: {q.question}
                            </span>
                            <div className="mt-2 space-y-1 font-mono text-[11px]">
                              <div className="text-critical flex items-center space-x-1.5">
                                <XCircle className="w-3 h-3 shrink-0" />
                                <span>Your answer: {selectedOpt ? `(${selectedOpt.id.toUpperCase()}) ${selectedOpt.text}` : 'Unanswered'}</span>
                              </div>
                              <div className="text-success flex items-center space-x-1.5">
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span>Correct answer: ({correctOpt?.id.toUpperCase()}) {correctOpt?.text}</span>
                              </div>
                            </div>
                            <p className="mt-2 text-ink-secondary leading-relaxed font-sans text-xs">
                              {correctOpt?.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 p-3 rounded-lg bg-success-light border border-success-border text-success text-xs font-semibold inline-flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Flawless 100%! All theoretical and computational concepts mastered.</span>
                </div>
              )}

              <div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-warm hover:bg-surface-secondary border border-border text-ink-primary transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
                  <span>Retake Full Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </section>
);
};
