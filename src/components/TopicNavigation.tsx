import { ChevronUp, ChevronDown, Home, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { topics } from '@/data/topics';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface TopicNavigationProps {
  activeIndex: number;
  onNavigate: (index: number) => void;
  onToggleSound: () => void;
  isMuted: boolean;
}

export default function TopicNavigation({
  activeIndex,
  onNavigate,
  onToggleSound,
  isMuted
}: TopicNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goToTopic = (index: number) => {
    onNavigate(index);
    setIsMenuOpen(false);
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      onNavigate(activeIndex - 1);
    } else if (activeIndex === 0) {
      onNavigate(-1); // Go back to home
    }
  };

  const goNext = () => {
    if (activeIndex < 0) {
      onNavigate(0); // From home, go to first topic
    } else if (activeIndex < topics.length - 1) {
      onNavigate(activeIndex + 1);
    }
  };

  const goHome = () => {
    onNavigate(-1);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation Controls */}
      <div
        className="fixed z-50 pointer-events-auto transition-all duration-500 left-1/2 -translate-x-1/2 bottom-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-10 lg:translate-x-0 flex flex-row lg:flex-col gap-3 lg:gap-4"
      >
        {/* Navigation Wrapper */}
        <div className="flex flex-row lg:flex-col items-center gap-2 lg:gap-4 p-1.5 lg:p-2 rounded-full glass-elite border-white/5">
          {/* Home Button */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={goHome}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 lg:w-5 lg:h-5" />
          </motion.button>

          <div className="h-6 w-px lg:h-px lg:w-8 bg-white/10 mx-auto" />

          {/* Up Button */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            disabled={activeIndex < 0}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all ${activeIndex < 0 ? 'opacity-20 cursor-not-allowed' : 'text-white/80 hover:text-white'
              }`}
          >
            <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" />
          </motion.button>

          {/* Down Button */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            disabled={activeIndex >= topics.length - 1}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all ${activeIndex >= topics.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-white/80 hover:text-white'
              }`}
          >
            <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
          </motion.button>

          <div className="h-6 w-px lg:h-px lg:w-8 bg-white/10 mx-auto" />

          {/* Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all ${isMenuOpen ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/60 hover:text-white'
              }`}
          >
            {isMenuOpen ? <X className="w-4 h-4 lg:w-5 lg:h-5" /> : <Menu className="w-4 h-4 lg:w-5 lg:h-5" />}
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSound}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'text-white/20' : 'text-cyan-400'
              }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 lg:w-5 lg:h-5" /> : <Volume2 className="w-4 h-4 lg:w-5 lg:h-5" />}
          </motion.button>
        </div>
      </div>


      {/* Topic Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md pointer-events-auto"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-24 lg:bottom-auto lg:left-24 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 w-[90vw] max-w-4xl max-h-[70vh] overflow-y-auto py-4 scrollbar-thin rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-2xl p-4 sm:p-6 border border-primary/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gradient">Навигация по темам</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {topics.map((topic, index) => {
                    const Icon = topic.icon;
                    const isActive = index === activeIndex;

                    return (
                      <motion.button
                        key={topic.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => goToTopic(index)}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-300 text-left ${isActive
                          ? 'bg-primary/20 border border-primary/50'
                          : 'bg-card/30 hover:bg-card/50 border border-transparent hover:border-primary/20'
                          }`}
                        style={{
                          boxShadow: isActive ? `0 0 20px ${topic.color}30` : 'none'
                        }}
                      >
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${topic.color}30, ${topic.glowColor}15)`,
                            border: `1px solid ${topic.color}40`
                          }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: topic.color }} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs text-muted-foreground">Тема {index + 1}</span>
                          <p className="text-xs sm:text-sm font-medium truncate" style={{ color: isActive ? topic.color : undefined }}>
                            {topic.title}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Topic Indicator */}
      {activeIndex >= 0 && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border"
            style={{ borderColor: `${topics[activeIndex]?.color}40` }}
          >
            <span
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold"
              style={{
                background: `linear-gradient(135deg, ${topics[activeIndex]?.color}, ${topics[activeIndex]?.glowColor})`
              }}
            >
              {activeIndex + 1}
            </span>
            <span className="text-xs sm:text-sm font-medium">{topics[activeIndex]?.title}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
              из {topics.length}
            </span>
          </motion.div>
        </div>
      )}
    </>
  );
}
