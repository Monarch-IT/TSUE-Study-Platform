import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import type { LevelInfo } from '@/lib/xpCalculator';

interface Props {
  levelInfo: LevelInfo;
  loading: boolean;
}

const XPProgressCard = ({ levelInfo, loading }: Props) => {
  if (loading) {
    return (
      <div className="h-[220px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    );
  }

  return (
    <div className="relative min-h-[220px] luminous-panel dynamic-lift crystal-refraction group">
      {/* Градиентный фон карточки */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${levelInfo.rankColor}10, transparent 60%, ${levelInfo.rankColor}08)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />

      {/* Свечение ранга */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
        style={{ background: levelInfo.rankColor }}
      />

      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Верхняя строка: Уровень и иконка */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Уровень</span>
            </div>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={levelInfo.level}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black tracking-tighter"
                style={{ color: levelInfo.rankColor }}
              >
                {levelInfo.level}
              </motion.span>
              <span className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{levelInfo.rank}</span>
            </div>
          </div>

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{
              background: `${levelInfo.rankColor}15`,
              borderColor: `${levelInfo.rankColor}30`,
            }}
          >
            <Zap className="w-5 h-5" style={{ color: levelInfo.rankColor }} />
          </div>
        </div>

        {/* Прогресс-бар опыта */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Прогресс</span>
            <span className="text-[11px] font-black text-foreground/50">
              {levelInfo.xpIntoLevel.toLocaleString()} / {levelInfo.xpNeededForNext.toLocaleString()} XP
            </span>
          </div>

          <div className="relative h-3 rounded-full overflow-hidden bg-foreground/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${levelInfo.rankColor}80, ${levelInfo.rankColor})`,
                boxShadow: `0 0 20px ${levelInfo.rankGlow}`,
              }}
            />
            {/* Эффект блеска на прогресс-баре */}
            <motion.div
              animate={{ x: [-200, 400] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>

        {/* Общий опыт */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-foreground/20" />
          <span className="text-[10px] font-bold text-foreground/30">
            Всего: <span className="text-foreground/50">{levelInfo.currentXP.toLocaleString()} XP</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default XPProgressCard;
