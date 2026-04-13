import { Clock, Zap } from 'lucide-react';
import type { XPLogEntry } from '@/hooks/useXP';

interface Props {
  entries: XPLogEntry[];
  loading: boolean;
}

const sourceIcons: Record<string, string> = {
  task: '💻',
  battle: '⚔️',
  achievement: '🏆',
  peer_review: '🤝',
  daily_login: '📅',
  streak_bonus: '🔥',
  first_blood: '🩸',
};

const sourceLabels: Record<string, string> = {
  task: 'Задача',
  battle: 'Баттл',
  achievement: 'Ачивка',
  peer_review: 'Помощь',
  daily_login: 'Вход',
  streak_bonus: 'Стрик',
  first_blood: 'Первый!',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч`;
  return `${Math.floor(hrs / 24)} д`;
}

const RecentActivityFeed = ({ entries, loading }: Props) => {
  if (loading) {
    return (
      <div className="h-[200px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    );
  }

  const displayEntries = entries.length > 0 ? entries : [
    { id: '1', amount: 50, source: 'task', description: 'Решена задача: Fibonacci', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', amount: 75, source: 'battle', description: 'Победа в Algorithm Arena', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', amount: 10, source: 'daily_login', description: 'Ежедневный вход', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '4', amount: 100, source: 'achievement', description: 'Ачивка: Night Coder', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: '5', amount: 20, source: 'peer_review', description: 'Помощь на форуме', created_at: new Date(Date.now() - 259200000).toISOString() },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--glass-bg)] hover:border-primary/20 transition-all duration-500 monarch-card-premium monarch-border-gradient">
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Активность</span>
        </div>

        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-foreground/[0.01] hover:bg-foreground/[0.03] border border-foreground/[0.04] transition-all"
            >
              <span className="text-sm">{sourceIcons[entry.source] || '⚡'}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-foreground/60 block truncate">
                  {entry.description}
                </span>
                <span className="text-[8px] text-foreground/25 font-medium">{timeAgo(entry.created_at)}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-black text-amber-400">+{entry.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivityFeed;
