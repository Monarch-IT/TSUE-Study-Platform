import { Crown } from 'lucide-react';
import { getLevelInfo } from '@/lib/xpCalculator';
import type { LeaderboardEntry } from '@/hooks/useXP';

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  loading: boolean;
}

const medalColors = ['#fbbf24', '#94a3b8', '#cd7f32'];

const LeaderboardMini = ({ entries, currentUserId, loading }: Props) => {
  if (loading) {
    return (
      <div className="h-[200px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    );
  }

  const displayEntries = entries.length > 0 ? entries : Array.from({ length: 5 }, (_, i) => ({
    uuid: `demo-${i}`,
    tsue_id: `TSUE-${String(i + 1).padStart(3, '0')}`,
    full_name: ['Алексей К.', 'Мария С.', 'Дамир А.', 'Нодира Х.', 'Тимур Р.'][i],
    avatar_url: null,
    level: [12, 10, 8, 7, 5][i],
    total_xp: [8500, 5000, 2700, 1900, 850][i],
    tasks_solved: [45, 32, 18, 14, 8][i],
    battles_won: [12, 8, 5, 3, 1][i],
    battle_elo: [1450, 1280, 1100, 1050, 980][i],
    current_streak: [7, 4, 2, 1, 0][i],
    code_gpa: [3.8, 3.5, 3.2, 2.9, 2.5][i],
    group: ['AT-31', 'AT-32', 'AT-33', 'AT-31', 'AT-32'][i],
    xp_rank: i + 1,
  }));

  return (
    <div className="rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--glass-bg)] hover:border-primary/20 transition-all duration-500 monarch-card-premium monarch-border-gradient shadow-xl shadow-primary/5">
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Лидерборд</span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
          {displayEntries.slice(0, 7).map((entry, i) => {
            const info = getLevelInfo(entry.total_xp);
            const isMe = entry.uuid === currentUserId;

            return (
              <div
                key={entry.uuid}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isMe
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-foreground/[0.01] hover:bg-foreground/[0.03] border border-transparent'
                }`}
              >
                {/* Позиция в рейтинге */}
                <span
                  className="text-[11px] font-black w-5 text-center"
                  style={{ color: medalColors[i] || 'rgba(var(--foreground-rgb),0.3)' }}
                >
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                </span>

                {/* Аватар */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                  style={{
                    background: `${info.rankColor}20`,
                    color: info.rankColor,
                    border: `1px solid ${info.rankColor}30`,
                  }}
                >
                  {entry.full_name?.charAt(0) || '?'}
                </div>

                {/* Имя игрока */}
                <div className="flex-1 min-w-0">
                  <span className={`text-[11px] font-bold block truncate ${isMe ? 'text-primary' : 'text-foreground/70'}`}>
                    {entry.full_name}
                  </span>
                  <span className="text-[8px] text-foreground/20 font-medium">Ур. {entry.level}</span>
                </div>

                {/* Опыт */}
                <span className="text-[10px] font-black text-foreground/30">
                  {entry.total_xp.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardMini;
