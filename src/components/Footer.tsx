import { motion } from 'framer-motion';
import { Code2, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 py-16 px-6 border-t border-border/30">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gradient">Python Galaxy</span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground max-w-md mb-8">
            Погрузитесь в бесконечную галактику программирования и откройте для себя всю мощь языка Python
          </p>

          {/* Decorative stars */}
          <div className="flex gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-twinkle"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Создано с</span>
            <Heart className="w-4 h-4 text-accent fill-accent animate-pulse" />
            <span>для изучения Python</span>
          </div>

          <p className="text-xs text-muted-foreground/50 mt-4">
            © 2024 Python Galaxy. Все права защищены.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
