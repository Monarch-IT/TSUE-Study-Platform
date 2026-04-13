import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Cloud, Sparkles } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

type Theme = 'dawn' | 'twilight' | 'midnight';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>('twilight');
  const [isOpen, setIsOpen] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dawn', 'twilight', 'midnight');
    root.classList.add(theme);
    
    localStorage.setItem('voyage-theme', theme);
  }, [theme]);

  const themes: { id: Theme; label: string; icon: any; color: string }[] = [
    { id: 'dawn', label: 'Рассвет', icon: Sun, color: 'text-orange-400' },
    { id: 'twilight', label: 'Сумерки', icon: Sparkles, color: 'text-purple-400' },
    { id: 'midnight', label: 'Полночь', icon: Moon, color: 'text-blue-400' },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
            playSound('click');
            setIsOpen(!isOpen);
        }}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Cloud className="w-5 h-5 text-white/50" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-12 right-0 z-50 p-2 rounded-2xl bg-[#0a0a1a] border border-white/10 shadow-2xl min-w-[140px] backdrop-blur-2xl"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                  playSound('success');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  theme === t.id ? 'bg-primary/20 text-white' : 'hover:bg-white/5 text-white/40'
                }`}
              >
                <t.icon className={`w-4 h-4 ${t.color}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{t.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
