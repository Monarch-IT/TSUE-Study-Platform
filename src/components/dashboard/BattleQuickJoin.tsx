import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Search, Users, Zap, Loader2, Target } from 'lucide-react';
import { getEloRank } from '@/lib/xpCalculator';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';

interface Props {
  eloRank: number;
  loading: boolean;
}

const battleModes = [
  { id: 'algorithm', name: 'Algorithm', icon: '🏟️', color: '#3b82f6', desc: 'Классика' },
  { id: 'cybersec', name: 'CyberSec', icon: '🛡️', color: '#ef4444', desc: 'Хакинг' },
  { id: 'debug', name: 'Debug', icon: '🐛', color: '#22c55e', desc: 'Баг-хант' },
  { id: 'codegolf', name: 'Golf', icon: '⛳', color: '#a855f7', desc: 'Мин. код' },
];

const BattleQuickJoin = ({ eloRank, loading }: Props) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [foundMatch, setFoundMatch] = useState(false);
  const [selectedMode, setSelectedMode] = useState('algorithm');
  const [matchCountdown, setMatchCountdown] = useState(5);
  const { playSound } = useSound();

  const [opponent, setOpponent] = useState<{name: string, rank: string, elo: number} | null>(null);

  useEffect(() => {
    let interval: any;
    if (isSearching && !foundMatch) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
        // Находим противника через 4-8 секунд (имитация матчмейкинга)
        if (searchTime > 4 && Math.random() > 0.6) {
          const names = ['CyberGhost', 'NullPointer', 'PixelWizard', 'DataDoom', 'CodeKing'];
          const chosen = names[Math.floor(Math.random() * names.length)];
          setOpponent({
            name: chosen,
            rank: 'Мастер',
            elo: eloRank + Math.floor(Math.random() * 100) - 50
          });
          setFoundMatch(true);
          playSound('level-up');
          toast.success('Противник найден!', {
            description: `Вы сразитесь с ${chosen}`,
            icon: <Swords className="w-4 h-4 text-red-500" />,
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching, searchTime, foundMatch, eloRank, playSound]);

  useEffect(() => {
    let timer: any;
    if (foundMatch && matchCountdown > 0) {
      timer = setInterval(() => {
        setMatchCountdown(prev => prev - 1);
      }, 1000);
    } else if (foundMatch && matchCountdown === 0) {
      toast("Баттл начинается!", {
        description: "Переходим на арену...",
        icon: <Zap className="w-4 h-4 text-yellow-500" />,
      });
      setTimeout(() => {
        setIsSearching(false);
        setFoundMatch(false);
        setSearchTime(0);
        setMatchCountdown(5);
        setOpponent(null);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [foundMatch, matchCountdown]);

  if (loading) {
    return <div className="h-[240px] rounded-2xl bg-white/[0.03] animate-pulse" />;
  }

  const rank = getEloRank(eloRank);

  return (
    <div className="rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--glass-bg)] transition-all relative h-full monarch-card-premium monarch-border-gradient">
      <div className="relative z-10 p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Battle Arena</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] backdrop-blur-md">
            <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: rank.color }}>{rank.name} • {eloRank}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div key="selection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col flex-1">
              <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
                {battleModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      playSound('click');
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className={`group relative rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all duration-300 ${
                      selectedMode === mode.id 
                        ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]' 
                        : 'border-foreground/[0.05] bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/10'
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{mode.icon}</span>
                    <div className="text-center">
                      <span className="text-[11px] font-black block text-foreground">{mode.name}</span>
                      <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-tighter">{mode.desc}</span>
                    </div>
                    {selectedMode === mode.id && (
                      <motion.div layoutId="active-bg" className="absolute inset-0 rounded-2xl border border-primary/40 shadow-[inset_0_0_15px_rgba(var(--primary),0.1)]" />
                    )}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  setIsSearching(true);
                  playSound('click');
                }} 
                className="group relative overflow-hidden py-4 rounded-2xl monarch-gradient-button font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <span className="relative z-10">Найти Противника</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="searching" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex-1 flex flex-col items-center justify-center py-6">
              {!foundMatch ? (
                <div className="relative w-full flex flex-col items-center justify-center gap-6">
                  {/* Радарная анимация поиска */}
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border border-red-500/20" />
                    <div className="absolute inset-2 rounded-full border border-red-500/10" />
                    <div className="absolute inset-4 rounded-full border border-red-500/5" />
                    
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-l border-red-500/40 rounded-full"
                      style={{ background: 'conic-gradient(from 0deg, rgba(239, 68, 68, 0.2) 0deg, transparent 90deg)' }}
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Search className="w-8 h-8 text-red-500/50 animate-pulse" />
                    </div>

                    {/* Точки-цели на радаре */}
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute top-4 left-8 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                    />
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
                      className="absolute bottom-6 right-10 w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-1">Поиск Игроков...</h3>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase">Время ожидания: {searchTime}с</p>
                  </div>

                  <button 
                    onClick={() => {
                      setIsSearching(false);
                      setSearchTime(0);
                      playSound('click');
                    }}
                    className="mt-2 px-4 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-[9px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="w-full h-full flex flex-col items-center justify-center gap-6"
                >
                  <div className="flex items-center gap-8 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase">Вы</span>
                    </div>

                    <div className="text-2xl font-black text-white/20 italic tracking-tighter">VS</div>

                    <div className="flex flex-col items-center gap-2">
                       <motion.div 
                         initial={{ x: 20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                       >
                        <Target className="w-8 h-8 text-red-500" />
                      </motion.div>
                      <span className="text-[10px] font-black uppercase text-red-400">{opponent?.name}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Баттл начнется через</div>
                    <div className="text-4xl font-black text-foreground tabular-nums">{matchCountdown}</div>
                  </div>

                  <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="h-full bg-red-500"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BattleQuickJoin;
