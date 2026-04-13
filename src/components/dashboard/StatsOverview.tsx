import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Swords, Flame, Trophy, TrendingUp, Zap } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface Props {
  stats: {
    tasks_solved: number;
    battles_won: number;
    battles_played: number;
    battle_elo: number;
    current_streak: number;
    code_gpa: number;
  };
  loading: boolean;
}

const statItems: { key: keyof Props['stats']; label: string; icon: typeof Code2; color: string; suffix?: string; detail: string }[] = [
  { key: 'tasks_solved', label: 'Задач', icon: Code2, color: '#22c55e', detail: '+12% за неделю' },
  { key: 'battles_won', label: 'Побед', icon: Swords, color: '#f59e0b', detail: 'Винрейт 68%' },
  { key: 'current_streak', label: 'Стрик', icon: Flame, color: '#ef4444', suffix: 'д.', detail: 'Рекорд: 14 дней' },
  { key: 'battle_elo', label: 'Рейтинг', icon: Trophy, color: '#a855f7', detail: 'Топ-5% игроков' },
];

const StatsOverview = ({ stats, loading }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { playSound } = useSound();

  if (loading) {
    return (
      <div className="h-[220px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    );
  }

  return (
    <motion.div 
      onMouseEnter={() => {
        setIsExpanded(true);
        playSound('hover');
      }}
      onMouseLeave={() => setIsExpanded(false)}
      className="relative min-h-[220px] luminous-panel dynamic-lift crystal-refraction cursor-default group"
    >
      <div className="p-5 h-full flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Статистика</span>
          </div>
          <TrendingUp className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {statItems.map(({ key, label, icon: Icon, color, suffix, detail }) => (
            <div
              key={key}
              className="relative rounded-2xl p-3 flex flex-col justify-between overflow-hidden group/item"
              style={{ background: `${color}08`, border: `1px solid ${color}15` }}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4" style={{ color: `${color}` }} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/30">{label}</span>
              </div>
              
              <div className="relative">
                <AnimatePresence mode="wait">
                  {!isExpanded ? (
                    <motion.span 
                      key="simple"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xl font-black block" 
                      style={{ color }}
                    >
                      {stats[key].toLocaleString()}{suffix ? <span className="text-xs ml-0.5 font-bold text-foreground/30">{suffix}</span> : ''}
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="detail"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[9px] font-bold leading-tight block h-5"
                      style={{ color: `${color}CC` }}
                    >
                      {detail}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Средний балл по коду */}
        <div className="mt-4 flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-foreground/25 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-2 h-2 text-primary" /> Code GPA
            </span>
            <span className="text-[11px] font-black text-primary">{stats.code_gpa.toFixed(2)} / 4.00</span>
          </div>
          <div className="w-24 h-2 rounded-full bg-foreground/10 overflow-hidden relative shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.code_gpa / 4) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary via-[var(--star-color)] to-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Фоновое свечение при наведении */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
};

export default StatsOverview;
