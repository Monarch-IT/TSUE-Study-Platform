import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { playSound } = useSound();

  const toggleVisibility = () => {
    const scrolled = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrolled > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    
    if (height > 0) {
      setProgress((scrolled / height) * 100);
    }
  };

  const scrollToTop = () => {
    playSound('click');
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          onMouseEnter={() => playSound('hover')}
          className="fixed bottom-8 right-8 z-[100] p-3 rounded-full bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 backdrop-blur-xl shadow-2xl shadow-primary/20 group"
          aria-label="Scroll to top"
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="22"
              className="fill-none stroke-white/5 stroke-[2]"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="22"
              className="fill-none stroke-primary stroke-[3]"
              strokeDasharray="138"
              initial={{ strokeDashoffset: 138 }}
              animate={{ strokeDashoffset: 138 - (138 * progress) / 100 }}
              transition={{ duration: 0.1 }}
            />
          </svg>
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
