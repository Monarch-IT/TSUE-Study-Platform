import { motion } from 'framer-motion';
import type { Achievement } from '@/hooks/useXP';

interface Props {
  achievements: Achievement[];
  unlockedSlugs: Set<string>;
  loading: boolean;
}

const rarityBorders: Record<string, string> = {
  common: 'border-foreground/10',
  rare: 'border-blue-500/40',
  epic: 'border-purple-500/40',
  legendary: 'border-amber-500/40',
};

const rarityGlows: Record<string, string> = {
  common: 'transparent',
  rare: 'rgba(59,130,246,0.15)',
  epic: 'rgba(168,85,247,0.15)',
  legendary: 'rgba(251,191,36,0.2)',
};

const AchievementsShowcase = ({ achievements, unlockedSlugs, loading }: Props) => {
  if (loading) {
    return (
      <div className="h-[140px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    );
  }

  const displayAchievements = achievements.length > 0 ? achievements : [
    { id: '1', slug: 'first_blood', title_ru: 'Первая кровь', description_ru: 'Решите первую задачу', icon: '🩸', rarity: 'common' as const, xp_bonus: 50, category: 'coding' },
    { id: '2', slug: 'clean_code', title_ru: 'Чистый код', description_ru: '100/100 с первой попытки', icon: '✨', rarity: 'rare' as const, xp_bonus: 150, category: 'coding' },
    { id: '3', slug: 'night_coder', title_ru: 'Ночной кодер', description_ru: 'Задача после полуночи', icon: '🌙', rarity: 'rare' as const, xp_bonus: 100, category: 'special' },
    { id: '4', slug: 'streak_7', title_ru: 'Неудержимый', description_ru: 'Стрик 7 дней', icon: '💪', rarity: 'rare' as const, xp_bonus: 200, category: 'streak' },
    { id: '5', slug: 'first_battle', title_ru: 'Новичок арены', description_ru: 'Выиграть 1-й баттл', icon: '🏟️', rarity: 'common' as const, xp_bonus: 100, category: 'battle' },
    { id: '6', slug: 'centurion', title_ru: 'Центурион', description_ru: '100 задач', icon: '🏛️', rarity: 'epic' as const, xp_bonus: 500, category: 'coding' },
    { id: '7', slug: 'streak_30', title_ru: 'Легендарный стрик', description_ru: '30 дней подряд', icon: '👑', rarity: 'legendary' as const, xp_bonus: 1000, category: 'streak' },
    { id: '8', slug: 'hacker_elite', title_ru: 'Элитный хакер', description_ru: 'CyberSec победа', icon: '🛡️', rarity: 'epic' as const, xp_bonus: 400, category: 'battle' },
    { id: '9', slug: 'polyglot', title_ru: 'Полиглот', description_ru: 'Задачи на 3 языках', icon: '🌍', rarity: 'rare' as const, xp_bonus: 200, category: 'coding' },
    { id: '10', slug: 'speed_demon', title_ru: 'Скоростной демон', description_ru: 'Hard < 5 мин', icon: '⚡', rarity: 'epic' as const, xp_bonus: 200, category: 'coding' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--glass-bg)] hover:border-primary/20 transition-all duration-500 monarch-card-premium monarch-border-gradient">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🏆</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Достижения</span>
          <span className="text-[9px] font-bold text-foreground/20 ml-auto">
            {unlockedSlugs.size}/{displayAchievements.length} открыто
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {displayAchievements.map((ach) => {
            const unlocked = unlockedSlugs.has(ach.slug);
            return (
              <motion.div
                key={ach.id}
                whileHover={{ scale: 1.05 }}
                className={`flex-shrink-0 w-[90px] h-[90px] rounded-xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 cursor-pointer group
                  ${unlocked ? rarityBorders[ach.rarity] : 'border-foreground/[0.04]'}
                  ${unlocked ? '' : 'opacity-40 grayscale'}
                `}
                style={{
                  background: unlocked ? rarityGlows[ach.rarity] : 'rgba(var(--foreground-rgb), 0.01)',
                }}
              >
                <span className="text-2xl">{ach.icon}</span>
                <span className={`text-[8px] font-black text-center leading-tight px-1
                  ${unlocked ? 'text-foreground/70' : 'text-foreground/30'}
                `}>
                  {ach.title_ru}
                </span>
                <span className="text-[7px] font-bold text-foreground/20">+{ach.xp_bonus} XP</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsShowcase;
