import { motion } from 'framer-motion';

export default function CosmicDivider() {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      
      {/* Animated lines */}
      <div className="container mx-auto px-6">
        <div className="relative flex items-center justify-center gap-4">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1"
          />
          
          {/* Central orb */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            whileInView={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, type: "spring" }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary/50 blur-md animate-pulse-glow" />
          </motion.div>
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent flex-1"
          />
        </div>
      </div>
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="absolute w-1 h-1 rounded-full bg-primary/60 animate-twinkle"
          style={{
            left: `${15 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
    </div>
  );
}
