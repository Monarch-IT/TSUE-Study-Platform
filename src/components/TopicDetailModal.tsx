import { X, ChevronLeft, ChevronRight, Code, BookOpen, Play, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { topics } from '@/data/topics';
import { topicContent } from '@/data/topicContent';
import { useState, useEffect } from 'react';
import { ModuleAnimations } from './ModuleAnimations';

interface TopicDetailModalProps {
  topicId: string | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function TopicDetailModal({ topicId, onClose, onNavigate }: TopicDetailModalProps) {
  const [activeSlide, setActiveSlide] = useState(0); // 0 to numSections + numQuiz - 1
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState<Record<string, boolean>>({});

  const content = topicContent.find(t => t.id === topicId);
  const topic = topics.find(t => t.id === topicId);
  const topicIndex = topics.findIndex(t => t.id === topicId);

  if (!content || !topic) return null;

  const totalSections = content.sections.length;
  const totalQuizQuestions = content.quiz?.length || 0;
  const totalSlides = totalSections + totalQuizQuestions;

  const Icon = topic.icon;

  const resetQuizState = () => {
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setHasSubmitted(false);
  };

  const handleNextSlide = () => {
    if (activeSlide < totalSlides - 1) {
      setActiveSlide(prev => prev + 1);
      resetQuizState();
    } else {
      goToNextTopic();
    }
  };

  const handlePrevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(prev => prev - 1);
      resetQuizState();
    } else {
      goToPrevTopic();
    }
  };

  const handleOptionSelect = (index: number) => {
    if (hasSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !content.quiz) return;
    const currentQuiz = content.quiz[currentQuizIndex];
    const isCorrect = selectedOption === currentQuiz.correctAnswer;
    setIsAnswerCorrect(isCorrect);
    setHasSubmitted(true);

    if (isCorrect) {
      const quizKey = `${topicId}_${currentQuizIndex}`;
      if (!pointsEarned[quizKey]) {
        setTotalScore(prev => prev + currentQuiz.points);
        setPointsEarned(prev => ({ ...prev, [quizKey]: true }));
      }
    }
  };

  const goToPrevTopic = () => {
    if (topicIndex > 0) {
      onNavigate(topicIndex - 1);
      setActiveSlide(0);
      setCurrentQuizIndex(0);
      resetQuizState();
    }
  };

  const goToNextTopic = () => {
    if (topicIndex < topics.length - 1) {
      onNavigate(topicIndex + 1);
      setActiveSlide(0);
      setCurrentQuizIndex(0);
      resetQuizState();
    }
  };

  useEffect(() => {
    // Determine if current slide is a quiz or section
    if (activeSlide >= totalSections) {
      setShowQuiz(true);
      setCurrentQuizIndex(activeSlide - totalSections);
    } else {
      setShowQuiz(false);
    }
  }, [activeSlide, totalSections]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-[95vw] h-[95vh] max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl glass-elite border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="p-3 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center relative shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${topic.color}20, ${topic.glowColor}10)`,
                  border: `1px solid ${topic.color}30`
                }}
              >
                <Icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: topic.color }} />
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl animate-pulse-glow" style={{ backgroundColor: topic.color, opacity: 0.05 }} />
              </div>
              <div className="max-w-[180px] sm:max-w-none">
                <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-white/30 mb-0.5 sm:mb-1 block">
                  Module {topicIndex + 1} • Slide {activeSlide + 1} / {totalSlides}
                </span>
                <h2
                  className="text-base sm:text-2xl font-black uppercase tracking-tighter text-white truncate sm:whitespace-normal"
                >
                  {content.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Score Indicator - only during quiz */}
              {showQuiz && (
                <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-white/40 leading-none">Points</span>
                    <span className="text-base font-black text-white tabular-nums">{totalScore}</span>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all border border-white/5"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>


          {/* Content */}
          <div className="flex flex-col h-[calc(95vh-100px)] overflow-y-auto">
            <div className="flex-1 p-2 sm:p-4">
              <AnimatePresence mode="wait">
                {!showQuiz ? (
                  <motion.div
                    key={`slide-${activeSlide}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
                  >
                    {/* Module Animation Container */}
                    {content.sections[activeSlide]?.animationType && (
                      <ModuleAnimations
                        type={content.sections[activeSlide].animationType}
                        color={topic.color}
                      />
                    )}

                    <div className="space-y-3 sm:space-y-4">
                      <h3
                        className="text-xl sm:text-3xl font-black mb-2 sm:mb-4 text-white uppercase tracking-tight leading-tight"
                        style={{ filter: `drop-shadow(0 0 15px ${topic.color}25)` }}
                      >
                        {content.sections[activeSlide]?.title}
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
                          {content.sections[activeSlide]?.content}
                        </p>
                      </div>
                    </div>

                    {content.sections[activeSlide]?.codeExample && (
                      <div
                        className="rounded-xl sm:rounded-2xl overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(10, 10, 30, 0.8))',
                          border: `1px solid ${topic.color}30`
                        }}
                      >
                        <div
                          className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between"
                          style={{
                            background: `linear-gradient(90deg, ${topic.color}20, transparent)`,
                            borderBottom: `1px solid ${topic.color}20`
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4" style={{ color: topic.color }} />
                            <span className="text-[10px] sm:text-xs font-medium">
                              {content.sections[activeSlide].codeExample.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                          </div>
                        </div>
                        <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
                          <code className="text-foreground/90 font-mono whitespace-pre">
                            {content.sections[activeSlide]?.codeExample?.code || "# Инициализация квантового кода..."}
                          </code>
                        </pre>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`quiz-${currentQuizIndex}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="h-full flex flex-col"
                  >
                    <div className="max-w-3xl mx-auto w-full space-y-8 py-4">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-elite mb-6 border-yellow-500/20 shadow-xl mx-auto">
                          <Play className="w-4 h-4 text-yellow-500 animate-pulse" />
                          <span className="text-xs font-bold tracking-[0.4em] uppercase text-yellow-500">Проверка Знаний: Вопрос {currentQuizIndex + 1}</span>
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tight">
                          {content.quiz?.[currentQuizIndex]?.question || "Проверка знаний"}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                          <span>Выберите верный вариант</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-yellow-500">{content.quiz?.[currentQuizIndex]?.points} очков</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:gap-4">
                        {content.quiz?.[currentQuizIndex]?.options.map((option, index) => {
                          const isSelected = selectedOption === index;
                          const isCorrect = content.quiz?.[currentQuizIndex].correctAnswer === index;
                          const isWrongSelection = hasSubmitted && isSelected && !isCorrect;

                          let buttonStyles = "bg-white/5 border-white/5 hover:border-white/20 text-white/70";
                          if (hasSubmitted) {
                            if (isCorrect) {
                              buttonStyles = "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                            } else if (isWrongSelection) {
                              buttonStyles = "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
                            } else {
                              buttonStyles = "bg-white/[0.02] border-white/5 opacity-40 grayscale-[0.5]";
                            }
                          } else if (isSelected) {
                            buttonStyles = "bg-primary/20 border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] text-white scale-[1.02]";
                          }

                          return (
                            <motion.button
                              key={index}
                              whileHover={hasSubmitted ? {} : { x: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}
                              whileTap={hasSubmitted ? {} : { scale: 0.98 }}
                              onClick={() => handleOptionSelect(index)}
                              className={`p-4 sm:p-6 rounded-2xl text-left transition-all border-2 flex items-center justify-between group relative overflow-hidden ${buttonStyles}`}
                            >
                              <div className="flex items-center gap-4 relative z-10">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${isSelected ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 text-white/40'
                                  }`}>
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-sm sm:text-xl font-bold">{option}</span>
                              </div>

                              <div className="relative z-10">
                                {hasSubmitted && isCorrect && <div className="text-green-500 font-black text-2xl">✓</div>}
                                {hasSubmitted && isWrongSelection && <div className="text-red-500 font-black text-2xl">✕</div>}
                                {!hasSubmitted && (
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary' : 'border-white/10 group-hover:border-white/30'}`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />}
                                  </div>
                                )}
                              </div>

                              {/* Decorative background pulse for selected/correct */}
                              {(isSelected || (hasSubmitted && isCorrect)) && (
                                <div className={`absolute inset-0 opacity-10 animate-pulse ${isCorrect ? 'bg-green-500' : 'bg-primary'}`} />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {hasSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-3xl border ${isAnswerCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                              }`}
                          >
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl ${isAnswerCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                                }`}>
                                {isAnswerCorrect ? '✅' : '❌'}
                              </div>
                              <div>
                                <h4 className={`font-black uppercase tracking-wider mb-1 ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                  {isAnswerCorrect ? 'Квантовая точность!' : 'Ошибка в расчетах...'}
                                </h4>
                                <p className="text-white/70 leading-relaxed italic text-sm font-medium">
                                  {content.quiz?.[currentQuizIndex]?.explanation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Presentation Controls */}
            <div className="p-3 sm:p-5 border-t border-white/5 bg-black/40 backdrop-blur-md">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
                <button
                  onClick={handlePrevSlide}
                  className="group flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-transform" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Назад</span>
                </button>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-end mb-0.5">
                    <span className="text-[8px] sm:text-[10px] font-black text-white/20 uppercase tracking-[0.15em]">Прогресс лекции</span>
                    <span className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[0.15em]">{Math.round(((activeSlide + 1) / totalSlides) * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${((activeSlide + 1) / totalSlides) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {!showQuiz || hasSubmitted ? (
                  <button
                    onClick={handleNextSlide}
                    className="group flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-primary hover:bg-primary/80 transition-all border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  >
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
                      {activeSlide === totalSlides - 1 ? 'Завершить' : 'Вперед'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedOption === null}
                    className={`flex items-center gap-2 px-5 sm:px-10 py-2 sm:py-3 rounded-xl font-bold uppercase tracking-widest transition-all border-2 ${selectedOption === null
                      ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      }`}
                  >
                    <Star className={`w-4 h-4 ${selectedOption === null ? 'text-white/10' : 'text-black animate-spin-slow'}`} />
                    <span className="text-xs sm:text-sm">Проверить</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

