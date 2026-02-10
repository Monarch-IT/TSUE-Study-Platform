import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TopicCardProps {
  title: string;
  subtopics: string[];
  icon: LucideIcon;
  index: number;
  gradient: string;
}

export default function TopicCard({ title, subtopics, icon: Icon, index, gradient }: TopicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="card-cosmic group relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
        style={{ mixBlendMode: 'overlay' }}
      />
      
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon */}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary/50 transition-colors">
          <Icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-gradient transition-all duration-300">
        {title}
      </h3>

      {/* Subtopics */}
      <ul className="space-y-2">
        {subtopics.map((subtopic, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx + 0.3 }}
            viewport={{ once: true }}
            className="flex items-start gap-2 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
            <span>{subtopic}</span>
          </motion.li>
        ))}
      </ul>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
