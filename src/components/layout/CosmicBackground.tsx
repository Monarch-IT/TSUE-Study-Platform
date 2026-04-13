import React from 'react';
import { motion } from 'framer-motion';
import StarField from '../StarField';

export const CosmicBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. Base Starfield */}
      <StarField />

      {/* 2. Dynamic Nebulas */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          rotate: [0, 25, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[100px] will-change-transform"
        style={{
          background: "var(--nebula-1)",
        }}
      />

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.3, 0.2],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full blur-[120px] will-change-transform"
        style={{
          background: "var(--nebula-2)",
        }}
      />

      {/* 3. Subtle Ambient Light */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 0%, var(--background) 100%)",
        }}
      />
      
      {/* 4. Scanline / HUD Layer */}
      <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none" />
    </div>
  );
};

export default CosmicBackground;
