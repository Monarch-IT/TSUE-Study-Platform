import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface AchievementOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xp: number;
  } | null;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-purple-700',
  legendary: 'from-amber-400 to-orange-600',
};

export const AchievementOverlay: React.FC<AchievementOverlayProps> = ({ isOpen, onClose, achievement }) => {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative max-w-md w-full p-8 rounded-3xl overflow-hidden glass-monarch text-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${rarityColors[achievement.rarity]} opacity-10`} />
            
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="relative inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                {achievement.icon}
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 bg-primary p-2 rounded-full shadow-lg"
              >
                <Trophy className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {achievement.title}
            </h2>
            <p className="text-white/60 mb-6 text-sm leading-relaxed">
              {achievement.description}
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">+{achievement.xp} XP</span>
              </div>
              <div className={`px-4 py-2 rounded-full border bg-opacity-10 font-bold text-[10px] uppercase tracking-widest
                ${achievement.rarity === 'legendary' ? 'border-amber-500 text-amber-500 bg-amber-500' : 'border-white/20 text-white/50 bg-white'}
              `}>
                {achievement.rarity}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Продолжить Путь
            </button>
          </motion.div>

          {/* Particle Effects (Simplified) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(20)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ 
                   x: "50%", 
                   y: "50%", 
                   scale: 0, 
                   opacity: 1 
                 }}
                 animate={{ 
                   x: `${Math.random() * 100}%`, 
                   y: `${Math.random() * 100}%`, 
                   scale: Math.random() * 2,
                   opacity: 0 
                 }}
                 transition={{ duration: 2, delay: i * 0.05 }}
                 className="absolute w-2 h-2 rounded-full bg-primary/40"
               />
             ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
