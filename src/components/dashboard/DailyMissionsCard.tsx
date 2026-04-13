import { Target, CheckCircle2, Circle } from 'lucide-react';
import type { DailyMission } from '@/hooks/useXP';
import { useSound } from '@/hooks/useSound';
import { motion } from 'framer-motion';

interface Props {
  missions: DailyMission[];
  loading: boolean;
}

const missionIcons: Record<string, string> = {
  solve_task: '💻',
  win_battle: '⚔️',
  help_peer: '🤝',
  streak: '🔥',
  review_code: '🔍',
  explore_topic: '📚',
};

const DailyMissionsCard = ({ missions, loading }: Props) => {
  const { playSound } = useSound();

  if (loading) {
    return (
      <div className="h-[220px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    );
  }

  const displayMissions = missions.length > 0 ? missions : [
    { id: '1', mission_type: 'solve_task', title_ru: 'Решить 2 задачи', description_ru: 'Решите любые 2 задачи', target_count: 2, current_count: 0, xp_reward: 50, is_completed: false },
    { id: '2', mission_type: 'streak', title_ru: 'Войти в систему', description_ru: 'Продолжить серию входов', target_count: 1, current_count: 1, xp_reward: 10, is_completed: true },
    { id: '3', mission_type: 'explore_topic', title_ru: 'Изучить новую тему', description_ru: 'Откройте новую тему', target_count: 1, current_count: 0, xp_reward: 30, is_completed: false },
  ];

  const completed = displayMissions.filter(m => m.is_completed).length;

  return (
    <div className="min-h-[220px] luminous-panel dynamic-lift crystal-refraction group">
      <div className="p-5 h-full flex flex-col relative z-10">
        {/* Заголовок карточки */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Ежедневные</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {completed}/{displayMissions.length}
          </span>
        </div>

        {/* Список миссий */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {displayMissions.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => playSound('hover')}
              onClick={() => {
                if (m.is_completed) playSound('success');
                else playSound('click');
              }}
               className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                m.is_completed
                  ? 'bg-emerald-500/[0.06] border border-emerald-500/10'
                  : 'bg-foreground/[0.02] border border-foreground/[0.04] hover:border-foreground/[0.08]'
              }`}
            >
              <span className="text-base">{missionIcons[m.mission_type] || '🎯'}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-[11px] font-bold block truncate ${m.is_completed ? 'text-emerald-500 line-through' : 'text-foreground/70'}`}>
                  {m.title_ru}
                </span>
                <span className="text-[9px] text-foreground/25 font-medium">
                  {m.current_count}/{m.target_count} · +{m.xp_reward} XP
                </span>
              </div>
              {m.is_completed 
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 
                : <Circle className="w-4 h-4 text-foreground/15 flex-shrink-0" />
              }
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyMissionsCard;
