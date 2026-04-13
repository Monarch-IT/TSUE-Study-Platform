import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXP } from '@/hooks/useXP';
import XPProgressCard from './XPProgressCard';
import StatsOverview from './StatsOverview';
import DailyMissionsCard from './DailyMissionsCard';
import LeaderboardMini from './LeaderboardMini';
import RecentActivityFeed from './RecentActivityFeed';
import BattleQuickJoin from './BattleQuickJoin';
import AchievementsShowcase from './AchievementsShowcase';
import { AchievementOverlay } from './AchievementOverlay';
import { StreakCalendar } from './StreakCalendar';
import VideoLessonsHub from './VideoLessonsHub';
import { useSound } from '@/hooks/useSound';
import { Bot, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const DashboardHub = () => {
  const { user } = useAuth();
  const xpData = useXP(user?.id);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const [showAchievement, setShowAchievement] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const testLegendary = () => {
    playSound('level-up');
    setSelectedAchievement({
      title: "Монарх Эры",
      description: "Вы достигли вершин мастерства в обновлении Monarch Era.",
      icon: "👑",
      rarity: "legendary",
      xp: 1000
    });
    setShowAchievement(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.glass-monarch');
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6"
    >
      {/* Герой-баннер */}
      <motion.div variants={itemVariants} className="relative w-full rounded-[3rem] overflow-hidden glass-monarch border border-[var(--border)] p-10 sm:p-14 mb-10 group shadow-2xl shadow-primary/5 transition-colors duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-[var(--nebula-2)] z-0 group-hover:opacity-80 transition-opacity" />
        
        {/* Анимированные фоновые сферы */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--nebula-1)] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none opacity-40 transition-colors duration-700" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--nebula-2)] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 z-0 pointer-events-none opacity-30 transition-colors duration-700" 
        />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl mb-4">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Monarch Era Official Update</span>
             </div>
            
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-foreground leading-[1] filter drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              {user ? (
                <>Добро пожаловать, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--star-color)] to-primary animate-gradient-x">{user.user_metadata?.full_name || 'Студент'}</span></>
              ) : (
                <><span className="text-foreground">Интеллектуальная</span><br/><span className="text-primary">Образовательная</span> Среда</>
              )}
            </h1>
            
            <p className="max-w-2xl text-foreground/60 text-base sm:text-lg font-medium leading-relaxed">
              {user 
                ? "Ваш путь к мастерству продолжается. Используйте мощь AI, соревнуйтесь в битвах и станьте легендой TSUE." 
                : "Откройте для себя будущее образования. Мы объединили лучшие практики мировых вузов с AI-совершенством."}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              {user ? (
                <>
                  <button 
                    onClick={() => {
                      playSound('click');
                      toast("AI Тьютор активирован", {
                        description: "Я готов помочь вам с любой задачей в Galactic Voyage!",
                        icon: <Bot className="w-4 h-4 text-primary" />,
                      });
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="monarch-gradient-button px-8 py-4 rounded-2xl group border border-white/20"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12 opacity-30" />
                    <Bot className="w-5 h-5 text-white" />
                    <span className="relative z-10">Спросить AI Тьютора</span>
                  </button>
                  <button 
                    onClick={testLegendary}
                    onMouseEnter={() => playSound('hover')}
                    className="monarch-border-gradient px-8 py-4 rounded-2xl bg-[var(--glass-bg)] hover:bg-primary/5 text-foreground font-black text-sm transition-all border border-[var(--border)] backdrop-blur-md"
                  >
                    Мои Достижения
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    playSound('click');
                    document.dispatchEvent(new CustomEvent('open-auth-modal'));
                  }}
                  onMouseEnter={() => playSound('hover')}
                  className="px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 border border-white/10"
                >
                  Начать Путешествие
                </button>
              )}
            </div>
          </div>
          
          {/* Визуальный элемент / Логотип */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="hidden lg:block relative"
          >
            <div className="w-64 h-64 relative group">
              {/* Имитация 3D-кристалла */}
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-full h-full bg-[var(--glass-bg)] border border-[var(--border)] rounded-[3rem] backdrop-blur-md flex items-center justify-center overflow-hidden transition-colors duration-700">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                 <motion.div
                   animate={{ 
                     y: [0, -15, 0],
                     rotate: [0, 5, 0]
                   }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="relative flex items-center justify-center"
                 >
                    <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center p-4">
                       <div className="w-full h-full rounded-full bg-primary shadow-[0_0_40px_rgba(var(--primary),0.6)] flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-white" />
                       </div>
                    </div>
                    {/* Плавающие акценты */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-purple-500/50 rounded-xl blur-lg rotate-12 animate-pulse" />
                    <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-cyan-500/50 rounded-full blur-lg animate-pulse" />
                 </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Основная сетка контента */}
      <div className={`transition-all duration-700 ${!user ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <XPProgressCard 
              levelInfo={xpData.levelInfo} 
              loading={xpData.loading} 
            />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <StatsOverview stats={xpData.userStats} loading={xpData.loading} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <motion.div variants={itemVariants} className="lg:col-span-3 h-full">
            <DailyMissionsCard missions={xpData.dailyMissions} loading={xpData.loading} />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
            <StreakCalendar currentStreak={7} history={[true, true, true, true, true, true, true]} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={itemVariants}>
            <AchievementsShowcase achievements={xpData.achievements} unlockedSlugs={xpData.unlockedSlugs} loading={xpData.loading} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <VideoLessonsHub />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
            <LeaderboardMini entries={xpData.leaderboard} currentUserId={user?.id} loading={xpData.loading} />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
            <RecentActivityFeed entries={xpData.recentXP} loading={xpData.loading} />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
            <BattleQuickJoin eloRank={xpData.userStats.battle_elo} loading={xpData.loading} />
          </motion.div>
        </div>

        {/* Скрытый триггер для тестирования */}
        <div className="fixed bottom-4 right-4 opacity-0 hover:opacity-10 transition-opacity">
          <button onClick={testLegendary} className="p-2 bg-white/10 rounded-full">🏆</button>
        </div>
      </div>

      <AchievementOverlay 
        isOpen={showAchievement} 
        onClose={() => setShowAchievement(false)} 
        achievement={selectedAchievement} 
      />
    </motion.div>
  );
};

export default DashboardHub;
