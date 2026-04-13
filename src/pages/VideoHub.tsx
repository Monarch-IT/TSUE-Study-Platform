import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Home, Clock, Menu, X, PlayCircle, Library } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { useNavigate } from 'react-router-dom';
import { videoPlaylists, Playlist, Video } from '@/data/videoPlaylists';

const VideoHub = () => {
  const { playSound } = useSound();
  const navigate = useNavigate();

  const [activePlaylist, setActivePlaylist] = useState<Playlist>(videoPlaylists[0]);
  const [activeVideo, setActiveVideo] = useState<Video>(activePlaylist.videos[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-background to-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/3 mix-blend-screen" />
      </div>

      {/* Header Navigation */}
      <div className="relative z-20 w-full p-4 sm:p-6 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              playSound('click');
              navigate('/');
            }}
            onMouseEnter={() => playSound('hover')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="flex flex-col flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 uppercase tracking-widest truncate">
              Video Hub
            </h1>
            <span className="hidden sm:block text-xs text-white/50 uppercase tracking-[0.2em] font-bold">Официальные Обучающие Материалы</span>
          </div>
        </div>
        
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => {
            playSound('click');
            setIsSidebarOpen(!isSidebarOpen);
          }}
          className="lg:hidden p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors rounded-xl text-white/80"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
        
        {/* Left Side: Video Player */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 glass-monarch rounded-[2rem] border border-[var(--border)] flex flex-col overflow-hidden shadow-2xl relative min-h-0"
        >
          {/* Internal background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent z-0 pointer-events-none" />

          {/* Player Container */}
          <div className="relative z-10 w-full bg-black aspect-video flex-shrink-0 border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=0`} 
              title={activeVideo.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Video Metadata */}
          <div className="relative z-10 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-full border border-red-500/20 flex items-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Youtube className="w-3.5 h-3.5 mr-1.5" />
                Сейчас проигрывается
              </span>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 text-white/70 text-xs font-bold rounded-full border border-white/10 backdrop-blur-md">
                <Clock className="w-3 h-3" />
                {formatDuration(activeVideo.duration)}
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              {activeVideo.title}
            </h2>
            <p className="text-sm font-medium text-white/50 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                <Youtube className="w-4 h-4 text-white/80" />
              </span>
              Автор: <span className="text-white mt-0.5">{activePlaylist.uploader}</span>
            </p>

            {/* Playlist Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {activePlaylist.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-white/70 tracking-wide uppercase hover:border-white/30 transition-colors cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="p-5 bg-background/50 rounded-2xl border border-white/5 text-sm text-white/70 leading-relaxed font-medium shadow-inner">
              Этот урок является частью плейлиста <span className="text-white font-bold">«{activePlaylist.title}»</span>. Используйте панель навигации для переключения между лекциями данного курса.
            </div>
          </div>
        </motion.div>

        {/* Right Side: Playlist Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || isLargeScreen) && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`fixed lg:relative inset-y-0 right-0 w-[320px] sm:w-[380px] lg:w-[400px] z-50 lg:z-10 flex flex-col gap-4 transform transition-transform lg:transform-none bg-background/95 backdrop-blur-2xl lg:bg-transparent lg:backdrop-blur-none border-l lg:border-l-0 border-white/10 p-4 lg:p-0 shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
            >
              <div className="flex items-center justify-between lg:hidden mb-2 px-2">
                <h3 className="font-bold text-white uppercase tracking-widest text-sm">Меню Плейлиста</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Playlist Info Box */}
              <div className="glass-monarch rounded-[2rem] p-6 border border-white/10 shadow-xl flex-shrink-0 relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />
                 
                 <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 backdrop-blur-md shadow-inner">
                     <Library className="w-6 h-6 text-red-500" />
                   </div>
                   <div>
                     <h3 className="font-bold text-white/90 text-[10px] uppercase tracking-[0.2em] mb-1">Смотрим курс</h3>
                     <p className="text-sm text-red-400 font-black">{activePlaylist.videos.length} <span className="text-white/50 font-medium">уроков</span></p>
                   </div>
                 </div>
                 <h4 className="text-base font-bold text-white leading-snug relative z-10 line-clamp-2 pr-4">
                   {activePlaylist.title}
                 </h4>
              </div>

              {/* Videos List */}
              <div className="glass-monarch rounded-[2rem] border border-white/10 flex-1 overflow-hidden flex flex-col bg-black/40 min-h-0">
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center shadow-md">
                  <span className="text-xs font-black text-white/50 uppercase tracking-widest">Содержание уроков</span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                  <div className="flex flex-col gap-1.5">
                    {activePlaylist.videos.map((video, index) => {
                      const isActive = activeVideo.id === video.id;
                      return (
                        <button
                          key={video.id}
                          onClick={() => {
                            playSound('click');
                            setActiveVideo(video);
                            if (!isLargeScreen) setIsSidebarOpen(false);
                          }}
                          onMouseEnter={() => playSound('hover')}
                          className={`w-full text-left flex items-start gap-4 p-3 rounded-2xl transition-all group ${
                            isActive 
                              ? 'bg-red-500/10 border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] text-white' 
                              : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10 text-white/70'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0 w-6 flex justify-center">
                            {isActive ? (
                               <PlayCircle className="w-5 h-5 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            ) : (
                               <span className="text-[10px] font-black text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-1">
                            <p className={`text-sm font-semibold line-clamp-2 leading-snug transition-colors ${isActive ? 'text-white' : 'group-hover:text-white/90'}`}>
                              {video.title}
                            </p>
                            <p className={`text-[11px] font-bold mt-2 tracking-wide uppercase transition-colors ${isActive ? 'text-red-400' : 'text-white/30 group-hover:text-white/50'}`}>
                              {formatDuration(video.duration)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile overlay for sidebar */}
        {isSidebarOpen && !isLargeScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default VideoHub;
