import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Youtube } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

const VideoLessonsHub = () => {
  const { playSound } = useSound();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-monarch rounded-[2rem] border border-[var(--border)] overflow-hidden relative group"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent z-0 group-hover:from-red-500/10 transition-colors duration-500" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Видео Хаб</h2>
              <p className="text-xs font-bold text-foreground/50 tracking-wider uppercase">Официальные Уроки</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Playlist</span>
          </div>
        </div>

        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-lg relative bg-black/50 group/video">
          {/* YouTube Embed */}
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/videoseries?list=PLDyJYA6aTY1lPWXBPk0gw6gR8fEtPDGKa" 
            title="Monarch Video Lessons" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            className="relative z-10"
          ></iframe>
          
          {/* Custom Overlay while loading or to enhance feel, though iframe takes over */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20 flex items-end p-4 opacity-0 group-hover/video:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-red-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Смотреть курс</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <p className="text-sm text-foreground/70 font-medium">
            Изучайте новые технологии, алгоритмы и архитектуру через нашу кураторскую подборку обучающих видео.
          </p>
          <button 
            onMouseEnter={() => playSound('hover')}
            onClick={() => {
                playSound('click');
                window.open('https://www.youtube.com/playlist?list=PLDyJYA6aTY1lPWXBPk0gw6gR8fEtPDGKa', '_blank');
            }}
            className="mt-2 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors self-start flex items-center gap-1"
          >
            Открыть на YouTube <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoLessonsHub;
