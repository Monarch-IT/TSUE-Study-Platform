import { useRef, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { topics } from '@/data/topics';
import { programmingTasks } from '@/data/tasks';
import GalaxyParticles from './3d/GalaxyParticles';
import StarFieldBackground from './3d/StarFieldBackground';
import TopicScene from './3d/TopicScene';
import TopicNavigation from './TopicNavigation';
import TopicDetailModal from './TopicDetailModal';
import CinematicPostProcessing from './3d/CinematicPostProcessing';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ChevronDown, Code2, BookOpen, Sparkles, User, Database, Shield, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { openGlobalAuthModal } from './auth/GlobalAuthEnforcer';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentAssignmentsPanel from './student/StudentAssignmentsPanel';
import NotificationPanel from './student/NotificationPanel';
import MonarchAIAgent from './ai/MonarchAIAgent';
import ProgrammingLab from './ProgrammingLab';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 2D Interface Component (Standard React)
function Interface({
  activeIndex,
  targetScroll,
  currentScroll,
  handleOpenDetail,
  handleNavigate,
  toggleMute,
  isMuted,
  uiScale,
  onOpenAuth,
  onOpenTask,
  onOpenAdmin,
  onOpenTeacher
}: {
  activeIndex: number;
  targetScroll: React.MutableRefObject<number>;
  currentScroll: React.MutableRefObject<number>;
  handleOpenDetail: (id: string) => void;
  handleNavigate: (index: number) => void;
  toggleMute: () => void;
  isMuted: boolean;
  uiScale: number;
  onOpenAuth: () => void;
  onOpenTask: (id: string) => void;
  onOpenAdmin: () => void;
  onOpenTeacher: () => void;
  onOpenAssignments: () => void;
  onOpenNotifications: () => void;
  hasUnread: boolean;
}) {
  const { user, metadata, isModerator, isTeacher } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{ transform: uiScale < 1 ? `scale(${uiScale})` : 'none', transformOrigin: 'center center' }}
    >
      <HeroOverlay scrollRef={currentScroll} />
      <ProgressIndicator activeIndex={activeIndex} progressRef={currentScroll} />
      <TopicOverlay
        activeIndex={activeIndex}
        onOpenDetail={handleOpenDetail}
        onOpenAuth={onOpenAuth}
        onOpenTask={onOpenTask}
        user={user}
        toast={toast}
      />
      <TopicNavigation
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
        onToggleSound={toggleMute}
        isMuted={isMuted}
        onOpenNotifications={onOpenNotifications}
        onOpenTasks={onOpenAssignments}
        hasUnreadNotifications={hasUnread}
      />

      {/* Logo & Credits Overlay */}
      <div
        className="fixed top-0 left-0 right-0 p-4 sm:p-8 transition-all duration-300 pointer-events-none"
        style={{ background: activeIndex >= 0 ? 'linear-gradient(180deg, rgba(2,2,5,0.9), transparent)' : 'transparent' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer" onClick={() => handleNavigate(-1)}>
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              <img src="/tsue-logo.png" alt="TSUE Logo" className="w-full h-full object-contain relative z-10" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-colors" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase text-white/80">TSUE STUDY</span>
              <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60">PLATFORM</span>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Создано студентами:</span>
              <span className="text-[10px] font-medium text-muted-foreground/50">G'ulomov M. & Sabirov M.</span>
              <span className="text-[10px] font-medium text-muted-foreground/30">(AT-31/25)</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {isModerator && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 hover:border-amber-400/40 transition-all pointer-events-auto"
                    title="Панель Модератора"
                  >
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="hidden sm:inline text-[10px] font-black text-amber-400 uppercase tracking-wider">Панель</span>
                  </button>
                )}
                {isTeacher && (
                  <button
                    onClick={onOpenTeacher}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all pointer-events-auto"
                    title="Панель Преподавателя"
                  >
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <span className="hidden sm:inline text-[10px] font-black text-emerald-400 uppercase tracking-wider">Преподаватель</span>
                  </button>
                )}
                {user && !isModerator && !isTeacher && (
                  <button
                    onClick={onOpenAssignments}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all pointer-events-auto"
                    title="Мои задания"
                  >
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="hidden sm:inline text-[10px] font-black text-primary uppercase tracking-wider">Задания</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 px-6 py-2.5 rounded-2xl glass-elite-primary border-primary/30 hover:border-primary/60 transition-all pointer-events-auto group"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{metadata?.fullName || 'Профиль'}</span>
                    <span className="text-[8px] font-black text-primary tracking-[0.2em] mt-0.5">{metadata?.id}</span>
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest transition-all pointer-events-auto shadow-lg shadow-primary/20"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroOverlay({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      const fadeOut = 1 - (scrollRef.current / 0.1);
      const newOpacity = Math.max(0, Math.min(1, fadeOut));
      setOpacity(newOpacity);
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-[8vh]" style={{ opacity }}>
      <div className="text-center w-[95vw] sm:w-[90vw] max-w-[800px] px-4 select-none pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-4 lg:mb-12"
        />

        <h1 className="text-4xl lg:text-8xl md:text-[8rem] font-black mb-4 lg:mb-8 leading-tight tracking-tighter">
          TSUE STUDY <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary/40">PLATFORM</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-sm lg:text-2xl text-muted-foreground font-light tracking-[0.2em] mb-6 lg:mb-10 max-w-2xl mx-auto uppercase leading-relaxed"
        >
          Полный академический курс в 15 модулях. <br />
          От основ синтаксиса до баз данных SQLite.
        </motion.p>

        <div className="flex flex-col items-center gap-4 lg:gap-8">
          <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
            {/* Team Quiz Button Removed from Hero per user request */}
            <div className="hidden sm:flex h-12 lg:h-16 w-px bg-gradient-to-b from-primary/50 to-transparent mx-4" />
          </div>

          <div className="flex flex-col items-center gap-2 lg:gap-4">
            <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.6em] uppercase text-primary/60 animate-pulse">Пролистайте для обучения</span>
            <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 text-primary animate-bounce opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CameraController({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const lastScroll = useRef(0);

  useFrame((state) => {
    const scrollProgress = scrollRef.current || 0;
    const scrollDelta = Math.abs(scrollProgress - lastScroll.current) || 0;
    lastScroll.current = scrollProgress;

    // Dynamic FOV based on scroll speed - cinematic effect
    const targetFov = Math.min(Math.max(60 + (scrollDelta * 150), 45), 120);
    const safeFov = isNaN(targetFov) ? 60 : targetFov;
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((camera as THREE.PerspectiveCamera).fov || 60, safeFov, 0.1);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    const totalTopics = topics.length;

    // Emergence Phase: 0 to 0.1 scroll - Zoom into Galaxy
    if (scrollProgress < 0.1) {
      const zoomProgress = Math.max(0, scrollProgress / 0.1);
      camera.position.x = THREE.MathUtils.lerp(0, 5, zoomProgress);
      camera.position.y = THREE.MathUtils.lerp(5, 5, zoomProgress);
      camera.position.z = THREE.MathUtils.lerp(80, 25, zoomProgress); // Start really far
      camera.lookAt(0, 0, 0);
      return;
    }

    // Curriculum Phase: 0.1 to 1.0
    const adjustedScroll = (scrollProgress - 0.1) / 0.9;
    const pathProgress = adjustedScroll * totalTopics;
    const currentTopicIndex = Math.min(Math.floor(pathProgress), totalTopics - 1);
    const nextTopicIndex = Math.min(currentTopicIndex + 1, totalTopics - 1);
    const lerpFactor = pathProgress - currentTopicIndex;

    const currentPos = topics[currentTopicIndex].position;
    const nextPos = topics[nextTopicIndex].position;

    // Smooth camera path following topics
    const targetX = THREE.MathUtils.lerp(currentPos[0], nextPos[0], lerpFactor) + 8;
    const targetY = THREE.MathUtils.lerp(currentPos[1], nextPos[1], lerpFactor) + 4;
    const targetZ = THREE.MathUtils.lerp(currentPos[2], nextPos[2], lerpFactor) + 12;

    // Cinematic smoothing
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    const lookAtX = THREE.MathUtils.lerp(currentPos[0], nextPos[0], lerpFactor);
    const lookAtY = THREE.MathUtils.lerp(currentPos[1], nextPos[1], lerpFactor);
    const lookAtZ = THREE.MathUtils.lerp(currentPos[2], nextPos[2], lerpFactor);

    const tempTarget = new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
    camera.lookAt(tempTarget);

    // Subtle atmospheric shake
    if (scrollDelta > 0.005) {
      camera.position.x += (Math.random() - 0.5) * scrollDelta * 1.5;
      camera.position.y += (Math.random() - 0.5) * scrollDelta * 1.5;
    }
  });

  return null;
}

function TopicContent({ activeIndex, scrollRef }: { activeIndex: number, scrollRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Fade in topics only after entering the galaxy (scroll > 10%)
    const opacity = THREE.MathUtils.smoothstep(scrollRef.current, 0.1, 0.15);
    groupRef.current.visible = opacity > 0;

    // We could apply global opacity to materials here, but visibility is faster for performance
    if (groupRef.current.visible) {
      groupRef.current.scale.setScalar(opacity);
    }
  });

  return (
    <group ref={groupRef}>
      {topics.map((topic, index) => {
        // Only render nearby topics to improve performance and realism (focus)
        const isVisible = Math.abs(index - activeIndex) <= 1;
        if (!isVisible) return null;

        const isActive = index === activeIndex;
        return (
          <group key={topic.id} position={topic.position}>
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
              <TopicScene topic={topic} isActive={isActive} opacity={1} />
            </Float>
          </group>
        );
      })}
    </group>
  );
}

function TopicOverlay({
  activeIndex,
  onOpenDetail,
  onOpenAuth,
  onOpenTask,
  user,
  toast
}: {
  activeIndex: number;
  onOpenDetail: (id: string) => void;
  onOpenAuth: () => void;
  onOpenTask: (id: string) => void;
  user: any;
  toast: any;
}) {
  if (activeIndex < 0) return null;
  const topic = topics[activeIndex];
  const Icon = topic.icon;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center lg:justify-start p-4 lg:p-10 lg:pl-48">
      <AnimatePresence mode="wait">
        <motion.div
          key={topic.id}
          initial={{ opacity: 0, x: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 0, y: 50, scale: 1.1 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[500px] pointer-events-auto"
        >
          <div
            className="rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-14 glass-elite relative overflow-hidden group border-white/10 shadow-2xl text-center lg:text-left"
            style={{
              background: `linear-gradient(135deg, rgba(2, 2, 5, 0.95), rgba(2, 2, 5, 0.7))`,
              boxShadow: `0 0 120px ${topic.color}20, inset 0 0 0 1px ${topic.color}20`,
              borderColor: `${topic.color}30`
            }}
          >
            {/* Background Number */}
            <div className="absolute -right-6 -bottom-10 text-[12rem] font-black text-white/5 select-none pointer-events-none italic hidden lg:block">
              {activeIndex + 1}
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6 mb-6 lg:mb-10">
              <div
                className="w-14 h-14 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl relative group-hover:scale-110 transition-transform duration-500"
                style={{
                  background: `linear-gradient(135deg, ${topic.color}40, ${topic.glowColor}20)`,
                  border: `1px solid ${topic.color}50`
                }}
              >
                <Icon className="w-8 h-8 lg:w-12 lg:h-12" style={{ color: topic.color }} />
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl animate-pulse-glow" style={{ backgroundColor: topic.color, opacity: 0.1 }} />
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <h2
                  className="text-2xl lg:text-5xl font-black mb-1 lg:mb-2 uppercase tracking-tighter text-elite leading-none"
                  style={{ filter: `drop-shadow(0 0 20px ${topic.color}60)` }}
                >
                  {topic.title}
                </h2>
                <div className="h-1 w-16 lg:w-24 bg-gradient-to-r from-primary to-transparent rounded-full mb-2 lg:mb-3" />
                <p className="text-white/60 text-xs lg:text-base font-medium leading-relaxed italic max-w-[300px]">
                  {topic.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-4 relative z-10 mt-auto">
              <button
                onClick={() => onOpenDetail(topic.id)}
                className="w-full relative group/btn overflow-hidden px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-[2rem] text-xs sm:text-base font-black uppercase tracking-[0.1em] transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${topic.color}90, ${topic.glowColor}50)`, border: `1px solid ${topic.color}70` }}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Презентация: {topic.title}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (user) {
                      window.location.href = `/multiplayer-quiz?topic=${topic.id}`;
                    } else {
                      onOpenAuth();
                      toast.info("Пожалуйста, войдите в систему для доступа к тестам");
                    }
                  }}
                  className="relative group/btn overflow-hidden px-4 py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] transition-all bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Тесты</span>
                </button>
                <button
                  onClick={() => {
                    if (user) {
                      const task = programmingTasks.find(t => t.topicId === topic.id);
                      if (task) {
                        onOpenTask(task.id);
                      } else {
                        toast.info("Задачи для этой темы находятся в разработке");
                      }
                    } else {
                      onOpenAuth();
                      toast.info("Задачи доступны только зарегистрированным пользователям");
                    }
                  }}
                  className={`relative group/btn overflow-hidden px-4 py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 ${user ? 'bg-white/10 border border-white/20 text-white cursor-pointer hover:bg-white/20' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}`}
                >
                  <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Задачи</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Scene({ scrollRef, activeIndex, isMobile }: { scrollRef: React.MutableRefObject<number>, activeIndex: number, isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
      <GalaxyParticles scrollRef={scrollRef} />
      <CameraController scrollRef={scrollRef} />
      <TopicContent activeIndex={activeIndex} scrollRef={scrollRef} />
    </>
  );
}

function ProgressIndicator({ activeIndex, progressRef }: { activeIndex: number, progressRef: React.MutableRefObject<number> }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      if (barRef.current) {
        const p = progressRef.current < 0.05 ? 0 : (progressRef.current - 0.05) / 0.95;
        barRef.current.style.height = `${p * 100}%`;
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (activeIndex < -0.5 && progressRef.current < 0.05) return null;

  return (
    <div className="fixed right-4 sm:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      <div className="w-[2px] h-32 bg-white/10 relative rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="absolute top-0 left-0 w-full bg-primary"
        />
      </div>

      {topics.map((topic, index) => (
        <div key={topic.id} className="group relative flex items-center justify-center">
          <AnimatePresence>
            {index === activeIndex && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-8 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.3em] text-white/40"
              >
                {topic.title}
              </motion.span>
            )}
          </AnimatePresence>

          <div
            className={`w-2 h-2 rounded-full transition-all duration-700 ${index === activeIndex ? 'scale-[2.5] bg-white' : index < activeIndex ? 'bg-primary' : 'bg-white/20'}`}
            style={{
              boxShadow: index === activeIndex ? `0 0 30px ${topic.color}, 0 0 10px #fff` : 'none',
              backgroundColor: index === activeIndex ? '#fff' : index < activeIndex ? topic.color : 'rgba(255,255,255,0.2)'
            }}
          />
        </div>
      ))}
    </div>
  );
}



export default function ScrollingGalaxy() {
  const { user } = useAuth();
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [uiScale, setUiScale] = useState(1);

  const { playTransitionSound, toggleMute, isMuted } = useSoundEffects();
  const lastActiveIndex = useRef(-1);


  useEffect(() => {
    const checkScale = () => {
      const isMob = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobile(isMob);

      // Calculate scale factor for PC if window height is small
      if (!isMob) {
        const h = window.innerHeight;
        if (h < 1000) {
          setUiScale(Math.min(1, Math.max(0.8, h / 950)));
        } else {
          setUiScale(1);
        }
      } else {
        setUiScale(1); // Mobile has its own responsive logic
      }
    };
    checkScale();
    window.addEventListener('resize', checkScale);
    return () => window.removeEventListener('resize', checkScale);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (selectedTopicId || activeTaskId) return;
      targetScroll.current = Math.max(0, Math.min(1, targetScroll.current + e.deltaY * 0.0005));
    };

    let touchStart = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStart = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      if (selectedTopicId || activeTaskId) return;
      const touchEnd = e.touches[0].clientY;
      const delta = touchStart - touchEnd;
      targetScroll.current = Math.max(0, Math.min(1, targetScroll.current + delta * 0.001));
      touchStart = touchEnd;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [selectedTopicId, activeTaskId]);

  useEffect(() => {
    if (activeIndex !== lastActiveIndex.current && activeIndex >= 0) {
      // playTransitionSound(); // Sound removed per user request
      lastActiveIndex.current = activeIndex;
    }
  }, [activeIndex, playTransitionSound]);

  const handleNavigate = useCallback((index: number) => {
    playTransitionSound();
    if (index < 0) {
      targetScroll.current = 0;
    } else {
      targetScroll.current = 0.05 + (index / topics.length) * 0.95 + (0.95 / topics.length / 2);
    }
  }, [playTransitionSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keyboard events from input fields (AI chat, auth forms, etc.)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      if (selectedTopicId || activeTaskId) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, topics.length - 1);
        handleNavigate(nextIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = Math.max(-1, activeIndex - 1);
        handleNavigate(prevIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, selectedTopicId, activeTaskId, handleNavigate]);

  const handleOpenDetail = useCallback((id: string) => { setSelectedTopicId(id); }, []);
  const handleModalNavigate = useCallback((index: number) => { setSelectedTopicId(topics[index]?.id || null); }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020205]">
      <Canvas
        camera={{ position: [0, 5, 25], fov: isMobile ? 75 : 60 }}
        gl={{
          antialias: !isMobile,
          stencil: false,
          depth: true,
          powerPreference: "high-performance"
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 25, 120]} />
        <StarFieldBackground count={isMobile ? 3000 : 8000} />
        <Suspense fallback={<Html center className="pointer-events-none select-none">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-white text-xs font-black animate-pulse uppercase tracking-[0.5em]">Инициализация...</div>
          </div>
        </Html>}>
          <Scene scrollRef={currentScroll} activeIndex={activeIndex} isMobile={isMobile} />
          <ScrollUpdater target={targetScroll} current={currentScroll} onIndexUpdate={setActiveIndex} />
        </Suspense>
        {/* Post-processing removed - causing WebGL context loss */}
      </Canvas>

      <Interface
        activeIndex={activeIndex}
        targetScroll={targetScroll}
        currentScroll={currentScroll}
        handleOpenDetail={handleOpenDetail}
        handleNavigate={handleNavigate}
        toggleMute={toggleMute}
        isMuted={isMuted}
        uiScale={uiScale}
        onOpenAuth={openGlobalAuthModal}
        onOpenTask={setActiveTaskId}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTeacher={() => setIsTeacherOpen(true)}
        onOpenAssignments={() => setIsAssignmentsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        hasUnread={unreadCount > 0}
      />

      <AnimatePresence>
        {activeTaskId && (
          <ProgrammingLab
            taskId={activeTaskId}
            onClose={() => setActiveTaskId(null)}
          />
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

      <MonarchAIAgent
        activeTopicId={topics[activeIndex]?.id}
        activeTaskId={activeTaskId || undefined}
      />

      <AnimatePresence>
        {selectedTopicId && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            style={{ transform: uiScale < 1 ? `scale(${uiScale})` : 'none' }}
          >
            <div className="pointer-events-auto w-full h-full flex items-center justify-center p-4">
              <TopicDetailModal
                topicId={selectedTopicId}
                onClose={() => setSelectedTopicId(null)}
                onNavigate={handleModalNavigate}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScrollUpdater({ target, current, onIndexUpdate }: { target: React.MutableRefObject<number>, current: React.MutableRefObject<number>, onIndexUpdate: (idx: number) => void }) {
  const lastIdx = useRef(-1);
  useFrame(() => {
    current.current = THREE.MathUtils.lerp(current.current, target.current, 0.05);

    // Update index only on change to avoid re-renders
    const newIdx = current.current < 0.05 ? -1 : Math.min(Math.floor(((current.current - 0.05) / 0.95) * topics.length), topics.length - 1);
    if (newIdx !== lastIdx.current) {
      onIndexUpdate(newIdx);
      lastIdx.current = newIdx;
    }
  });
  return null;
}
