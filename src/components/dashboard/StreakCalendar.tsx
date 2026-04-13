import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2 } from 'lucide-react';

interface StreakCalendarProps {
  currentStreak: number;
  history: boolean[]; // last 7 days
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ currentStreak, history }) => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const today = new Date().getDay(); // 0 is Sun
  const adjustedToday = today === 0 ? 6 : today - 1; // 0 is Mon

  return (
    <div className="monarch-card-premium monarch-border-gradient rounded-2xl p-5 group overflow-hidden relative border border-[var(--border)] bg-[var(--glass-bg)]">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 blur-[50px] group-hover:bg-orange-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Ударный режим</h4>
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-tighter">Не прерывай серию!</p>
          </div>
        </div>
        <div className="text-center">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600">
            {currentStreak}
          </span>
          <p className="text-[8px] font-black text-foreground/20 uppercase">Дней</p>
        </div>
      </div>

      <div className="flex justify-between items-end h-16 gap-1">
        {days.map((day, i) => {
          const isActive = history[i];
          const isToday = i === adjustedToday;

          return (
            <div key={day} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex-1 flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isActive ? '80%' : '20%' }}
                  className={`w-full rounded-t-lg transition-colors border-x border-t
                    ${isActive ? 'bg-orange-500/20 border-orange-500/30' : 'bg-foreground/5 border-foreground/5'}
                    ${isToday ? 'ring-1 ring-primary/20 ring-offset-2 ring-offset-background' : ''}
                  `}
                />
                {isActive && (
                  <CheckCircle2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-orange-500/50" />
                )}
              </div>
              <span className={`text-[10px] font-bold ${isToday ? 'text-foreground' : 'text-foreground/40'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Бонусная статистика (голографический эффект при наведении) */}
      <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/60 transition-colors">
        <span>Прогноз XP:</span>
        <span className="text-orange-500">+25% бонус</span>
      </div>
    </div>
  );
};
