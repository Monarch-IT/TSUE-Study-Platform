import { motion } from 'framer-motion';
import { ChevronDown, Code2, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="section-cosmic relative z-10 overflow-hidden">
      {/* Nebula glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--nebula-1)] rounded-full blur-[150px] animate-pulse-glow transition-colors duration-700" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--nebula-2)] rounded-full blur-[120px] animate-pulse-glow delay-1000 transition-colors duration-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] animate-pulse-glow delay-500 transition-colors duration-700" />

      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-foreground/[0.03] rounded-full animate-rotate-slow opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-foreground/[0.03] rounded-full animate-rotate-slow opacity-10" style={{ animationDirection: 'reverse', animationDuration: '100s' }} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container mx-auto text-center relative z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 monarch-border-gradient"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground/60">TSUE Study Platform</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tighter"
        >
          <span className="text-foreground">MONARCH</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary via-[var(--star-color)] to-primary animate-gradient-x glow-text uppercase">Sovereign</span>
        </motion.h1>

        {/* Python Logo / Central Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 1, type: "spring" }}
          className="flex justify-center my-12"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-40 h-40 bg-[var(--glass-bg)] backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-[var(--border)] shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden transition-colors duration-700">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
               <Code2 className="w-20 h-20 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border border-primary/20 rounded-[2.5rem] m-2 pointer-events-none"
               />
            </div>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xl md:text-2xl text-foreground/60 max-w-3xl mx-auto mb-12"
        >
          Погрузитесь в космос программирования и откройте
          <span className="text-primary"> бесконечные возможности </span>
          одного из самых мощных языков в мире
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <a
            href="#introduction"
            className="monarch-gradient-button inline-flex items-center gap-3 px-10 py-5 rounded-2xl group text-lg font-black"
          >
            <span>Начать путешествие</span>
            <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </motion.div>
      </motion.div>
    </section>
  );
}
