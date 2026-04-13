import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { openGlobalAuthModal } from '@/components/auth/GlobalAuthEnforcer';
import { Suspense, lazy, useState } from 'react';
import TopicNavigation from '@/components/TopicNavigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import StudentAssignmentsPanel from '@/components/student/StudentAssignmentsPanel';
import NotificationPanel from '@/components/student/NotificationPanel';
import MonarchAIAgent from '@/components/ai/MonarchAIAgent';
import ProgrammingLab from '@/components/ProgrammingLab';
import ScrollingGalaxy from '@/components/ScrollingGalaxy';
import DashboardHub from '@/components/dashboard/DashboardHub';
import { ThemeSwitcher } from '@/components/dashboard/ThemeSwitcher';
import CosmicBackground from '@/components/layout/CosmicBackground';
import AISelectionAssistant from '@/components/ai/AISelectionAssistant';

const DynamicLogo3D = lazy(() => import('@/components/3d/DynamicLogo3D'));

const Index = () => {
  const navigate = useNavigate();
  const { user, metadata, isModerator, isTeacher } = useAuth();

  // Panels state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Galaxy mode toggle
  const [showGalaxy, setShowGalaxy] = useState(false);

  // When Galaxy is active, render it full-screen
  if (showGalaxy) {
    return <ScrollingGalaxy />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden flex flex-col font-sans bg-background"
    >
      <CosmicBackground />
      {/* ═══ 3D DYNAMIC LOGO BACKGROUND ═══ */}
      {/* <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <img src="/tsue-logo.png" alt="TSUE" className="w-48 h-48 object-contain opacity-30 animate-pulse" />
          </div>
        }>
          <DynamicLogo3D />
        </Suspense>
      </div> */}

      {/* ═══ GRADIENT OVERLAYS ═══ */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/50 via-transparent to-[#030014] pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#030014] to-transparent pointer-events-none z-10" /> */}

      {/* ═══ SIDEBAR NAVIGATION ═══ */}
      <TopicNavigation
        activeIndex={-1}
        onNavigate={(index) => {
          // When a topic is clicked from the Hub menu, enter Galaxy mode
          setShowGalaxy(true);
        }}
        onToggleSound={() => setIsMuted(!isMuted)}
        isMuted={isMuted}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenTasks={() => setIsAssignmentsOpen(true)}
        hasUnreadNotifications={unreadCount > 0}
        onEnterGalaxy={() => setShowGalaxy(true)}
      />

      {/* ═══ TOP BAR ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6"
        style={{ background: 'linear-gradient(180deg, rgba(2,2,5,0.9), transparent)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 ml-0 lg:ml-20">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 relative">
              <img src="/tsue-logo.png" alt="" className="w-full h-full object-contain relative z-10" />
              <div className="absolute inset-0 bg-primary/20 blur-xl" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[11px] font-black text-white/90 uppercase tracking-widest leading-none">TSUE Study</span>
              <span className="text-[9px] font-bold text-primary/60 tracking-[0.3em]">PLATFORM</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right mr-2 leading-tight">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Создано студентами:</span>
              <span className="text-[9px] font-bold text-white/40 mt-0.5">G'ulomov M. & Sabirov M.</span>
              <span className="text-[8px] font-bold text-white/20">(AT-31/25)</span>
            </div>

            {(isModerator || isTeacher) && (
              <button
                onClick={() => isModerator ? setIsAdminOpen(true) : setIsTeacherOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Панель</span>
              </button>
            )}

            <ThemeSwitcher />

            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight leading-none">{metadata?.fullName || 'Профиль'}</span>
                  <span className="text-[8px] font-bold text-primary/60 tracking-widest mt-0.5">{metadata?.id}</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => openGlobalAuthModal()}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══ TITLE OVERLAY ═══ */}
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-30 flex flex-col items-center gap-4 px-6 text-center mt-[38vh] sm:mt-[42vh]"
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[1.1]">
          <span className="text-gradient">Интеллектуальная</span><br />
          Образовательная Среда
        </h1>
        <p className="max-w-lg mx-auto text-white/40 text-xs sm:text-sm font-medium leading-relaxed">
          Платформа TSUE объединяет AI-инструменты,
          Python-практику и передовые технологии для вашего академического успеха.
        </p>
      </motion.div> */}

      {/* ═══ DASHBOARD HUB ═══ */}
      <div className="relative z-30 w-full">
        <DashboardHub />
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/15">Powered by</span>
        <span className="text-[10px] font-elite text-white/25 tracking-widest">Monarch Team & TSUE</span>
      </div>

      {/* ═══ ALL PANELS ═══ */}
      <AnimatePresence>
        {activeTaskId && (
          <ProgrammingLab taskId={activeTaskId} onClose={() => setActiveTaskId(null)} />
        )}
      </AnimatePresence>

      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      <AnimatePresence>
        {isTeacherOpen && <TeacherDashboard onClose={() => setIsTeacherOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isAssignmentsOpen && (
          <StudentAssignmentsPanel
            onClose={() => setIsAssignmentsOpen(false)}
            onOpenTask={(id) => { setIsAssignmentsOpen(false); setActiveTaskId(id); }}
          />
        )}
      </AnimatePresence>

      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        userUuid={user?.id || ''}
        onUnreadChange={setUnreadCount}
      />

      <MonarchAIAgent />
    </div>
  );
};

export default Index;
