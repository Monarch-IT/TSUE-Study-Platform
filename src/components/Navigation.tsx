import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Code2, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Введение', href: '#introduction' },
  { label: 'Структура', href: '#structure' },
  { label: 'Условия', href: '#conditions' },
  { label: 'Циклы', href: '#loops' },
  { label: 'Функции', href: '#functions' },
  { label: 'Данные', href: '#data' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'luminous-panel border-none !rounded-none py-3 shadow-2xl' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/40 transition-all" />
            <div className="relative w-full h-full rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] flex items-center justify-center backdrop-blur-md group-hover:border-primary/50 transition-all overflow-hidden transition-colors duration-700">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
               <Code2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs uppercase tracking-[0.3em] text-foreground/40 leading-none mb-1">TSUE</span>
            <span className="font-black text-lg tracking-tighter text-foreground leading-none">Monarch <span className="text-primary italic">Era</span></span>
          </div>
        </a>

        <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-[var(--glass-bg)] border border-[var(--border)] backdrop-blur-md transition-colors duration-700">
          {navItems.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-primary/5 transition-all"
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
        className="lg:hidden overflow-hidden glass"
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              {item.label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}
