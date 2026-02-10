import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  id?: string;
}

export default function SectionTitle({ title, subtitle, icon: Icon, id }: SectionTitleProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-16 scroll-mt-24"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 mb-6"
        >
          <Icon className="w-8 h-8 text-primary" />
        </motion.div>
      )}
      
      <h2 className="text-3xl md:text-5xl font-bold mb-4">
        <span className="text-gradient">{title}</span>
      </h2>
      
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      
      {/* Decorative line */}
      <div className="flex justify-center mt-6 gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-secondary my-auto" />
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-300" />
      </div>
    </motion.div>
  );
}
