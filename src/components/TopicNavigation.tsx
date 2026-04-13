import { ChevronUp, ChevronDown, Home, Menu, X, Code2, Bell, ClipboardList, Rocket, Youtube } from 'lucide-react';
import { topics } from '@/data/topics';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface TopicNavigationProps {
  activeIndex: number;
  onNavigate: (index: number) => void;
  onToggleSound: () => void;
  isMuted: boolean;
  onOpenNotifications?: () => void;
  onOpenTasks?: () => void;
  hasUnreadNotifications?: boolean;
  onEnterGalaxy?: () => void; // Hub-only: enter Galaxy mode
}

export default function TopicNavigation({
  activeIndex,
  onNavigate,
  onToggleSound,
  isMuted,
  onOpenNotifications,
  onOpenTasks,
  hasUnreadNotifications = false,
  onEnterGalaxy,
}: TopicNavigationProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detect if we're on the Hub (not inside Galaxy)
  const isHub = activeIndex === -1 && !!onEnterGalaxy;

  const goToTopic = (index: number) => {
    if (isHub && onEnterGalaxy) {
      // From Hub: enter the Galaxy mode
      onEnterGalaxy();
    } else {
      onNavigate(index);
    }
    setIsMenuOpen(false);
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      onNavigate(activeIndex - 1);
    } else if (activeIndex === 0) {
      onNavigate(-1);
    }
  };

  const goNext = () => {
    if (activeIndex < 0) {
      onNavigate(0);
    } else if (activeIndex < topics.length - 1) {
      onNavigate(activeIndex + 1);
    }
  };

  const goHome = () => {
    navigate('/');
    // Force page reload to exit Galaxy mode cleanly
    window.location.href = '/';
  };

  return (
    <>
      {/* Main Navigation Controls */}
      <div
        className="fixed z-50 pointer-events-auto transition-all duration-500 left-1/2 -translate-x-1/2 bottom-6 lg:bottom-auto lg:top-[12vh] lg:left-10 lg:translate-x-0 flex flex-row lg:flex-col gap-3 lg:gap-4"
      >
        <div className="flex flex-row lg:flex-col items-center gap-2 lg:gap-4 p-1.5 lg:p-2 rounded-2xl luminous-panel">
          
          {/* Home Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={isHub ? () => {} : goHome}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn ${
              isHub ? 'active' : ''
            }`}
          >
            <Home className="w-4 h-4 lg:w-5 lg:h-5" />
          </motion.button>

          <div className="h-6 w-px lg:h-px lg:w-8 bg-white/10 mx-auto" />

          {isHub ? (
            /* ═══ HUB SIDEBAR: Presentation, Tasks, Notifications, Menu, Sound ═══ */
            <>
              {/* Enter Galaxy Presentation */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnterGalaxy}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-primary hover:text-primary transition-all relative monarch-nav-btn"
                title="Презентация Галактики"
              >
                <Rocket className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </motion.button>

              {/* Tasks */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onOpenTasks}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white/60 hover:text-primary transition-all monarch-nav-btn"
                title="Задания"
              >
                <ClipboardList className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onOpenNotifications}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center relative text-white/60 hover:text-amber-400 transition-all monarch-nav-btn"
                title="Уведомления"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </motion.button>

              <div className="h-6 w-px lg:h-px lg:w-8 bg-white/10 mx-auto" />

              {/* Menu */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn ${
                  isMenuOpen ? 'active' : ''
                }`}
              >
                {isMenuOpen ? <X className="w-4 h-4 lg:w-5 lg:h-5" /> : <Menu className="w-4 h-4 lg:w-5 lg:h-5" />}
              </motion.button>

              {/* Monarch IDE */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/ide')}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn text-purple-400`}
                title="Monarch IDE"
              >
                <Code2 className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
              
              {/* Video Hub */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/videohub')}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn text-red-400`}
                title="Видео Хаб"
              >
                <Youtube className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
            </>
          ) : (
            /* ═══ GALAXY SIDEBAR: Full scroll controls ═══ */
            <>
              {/* Up */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goPrev}
                disabled={activeIndex < 0}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn ${
                  activeIndex < 0 ? 'opacity-20 cursor-not-allowed' : 'text-white/80 hover:text-white'
                }`}
              >
                <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" />
              </motion.button>

              {/* Down */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goNext}
                disabled={activeIndex >= topics.length - 1}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn ${
                  activeIndex >= topics.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-white/80 hover:text-white'
                }`}
              >
                <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
              </motion.button>

              <div className="h-6 w-px lg:h-px lg:w-8 bg-white/10 mx-auto" />

              {/* Tasks */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onOpenTasks}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white/60 hover:text-primary transition-all monarch-nav-btn"
                title="Задания"
              >
                <ClipboardList className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onOpenNotifications}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center relative text-white/60 hover:text-amber-400 transition-all monarch-nav-btn"
                title="Уведомления"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </motion.button>

              <div className="h-6 w-px lg:h-px lg:w-8 bg-white/10 mx-auto" />

              {/* Menu */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn ${
                  isMenuOpen ? 'active' : ''
                }`}
              >
                {isMenuOpen ? <X className="w-4 h-4 lg:w-5 lg:h-5" /> : <Menu className="w-4 h-4 lg:w-5 lg:h-5" />}
              </motion.button>

              {/* Monarch IDE */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/ide')}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn text-purple-400`}
                title="Monarch IDE"
              >
                <Code2 className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
              
              {/* Video Hub */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/videohub')}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all monarch-nav-btn text-red-400`}
                title="Видео Хаб"
              >
                <Youtube className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Topic Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 pointer-events-auto"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-4 bottom-20 lg:bottom-auto lg:left-[5.5rem] lg:top-[12vh] lg:translate-y-0 w-[90vw] max-w-3xl max-h-[75vh] overflow-y-auto py-4 scrollbar-thin rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-2xl p-4 sm:p-6 border border-primary/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gradient">Навигация по темам</h3>

                {/* Galaxy Entry button for Hub context */}
                {isHub && (
                  <button
                    onClick={() => { setIsMenuOpen(false); onEnterGalaxy?.(); }}
                    className="w-full mb-4 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Rocket className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white">Войти в Галактику-Презентацию</span>
                  </button>
                )}

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

      {/* Current Topic Indicator (Galaxy only) */}
      {!isHub && activeIndex >= 0 && (
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
              из {topics?.length || 0}
            </span>
          </motion.div>
        </div>
      )}
    </>
  );
}
