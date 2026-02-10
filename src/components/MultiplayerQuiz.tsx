import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Settings,
    Play,
    Timer,
    ChevronRight,
    Trophy,
    Star,
    ArrowLeft,
    Sparkles,
    Crown,
    QrCode
} from 'lucide-react';
import { multiplayerQuizData, MultiplayerQuestion } from '@/data/multiplayerQuiz';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { database } from '../lib/firebase';
import { ref, set, onValue, update, push, onDisconnect, get } from 'firebase/database';

// --- STARFIELD COMPONENT ---
const Starfield = () => {
    const stars = useRef<any[]>([]);
    if (stars.current.length === 0) {
        stars.current = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() > 0.8 ? 'star-lg' : Math.random() > 0.4 ? 'star-md' : 'star-sm',
            duration: `${2 + Math.random() * 4}s`,
            delay: `${Math.random() * 4}s`
        }));
    }

    return (
        <div className="star-layer">
            <div className="nebula" />
            {stars.current.map(star => (
                <div
                    key={star.id}
                    className={`star ${star.size}`}
                    style={{
                        top: star.top,
                        left: star.left,
                        '--duration': star.duration,
                        '--delay': star.delay
                    } as any}
                />
            ))}
        </div>
    );
};

// --- TYPES ---
type QuizStage = 'entry' | 'lobby' | 'countdown' | 'question' | 'waiting' | 'results';
type Role = 'admin' | 'player';

interface Participant {
    id: string;
    name: string;
    score: number;
    currentIdx: number;
    answers: (number | null)[];
    lastAnsweredCorrectly: boolean | null;
}

// --- MAIN COMPONENT ---
export default function MultiplayerQuiz() {
    const [stage, setStage] = useState<QuizStage>('entry');
    const [role, setRole] = useState<Role>('player');
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [timePerQuestion, setTimePerQuestion] = useState(30);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timer, setTimer] = useState(30);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [myScore, setMyScore] = useState(0);
    const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null);
    const [myId] = useState(() => 'user_' + Math.random().toString(36).substring(2, 9));

    const [isConnected, setIsConnected] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Heartbeat Test
    useEffect(() => {
        set(ref(database, 'connection_test_last_boot'), Date.now());
    }, []);

    // --- FIREBASE SYNC ---
    useEffect(() => {
        if (!roomCode) return;

        const roomRef = ref(database, `rooms/${roomCode}`);

        // Listen for Realtime Updates
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Sync standard values
                setCurrentIdx(data.currentIdx);
                setTimer(data.timer);
                if (data.timePerQuestion) setTimePerQuestion(data.timePerQuestion);

                if (data.participants) {
                    const list = Object.values(data.participants) as Participant[];
                    setParticipants(list);

                    const me = list.find(p => p.id === myId);
                    if (me) {
                        setMyScore(me.score);
                        setStage(data.stage);
                    }
                }
            } else {
                // Optimization: only revert to entry if we were actually IN the room
                setStage(prev => {
                    if (prev !== 'entry') {
                        toast.error("Комната закрыта");
                        return 'entry';
                    }
                    return prev;
                });
            }
        });

        return () => {
            unsubscribe();
            // unsubConn(); // This was causing an error because unsubConn was not in scope here.
            // It's now handled by the separate useEffect for connection status.
        };
    }, [roomCode]);

    // Dedicated Effect for Selection Reset
    // This is the CRITICAL fix for the auto-answer bug
    useEffect(() => {
        // Reset selection whenever we enter a new question or move to a new stage
        if (stage === 'question') {
            setSelectedOption(null);
        }
    }, [currentIdx, stage]);

    // Connection check moved here for cleanliness
    useEffect(() => {
        const connectedRef = ref(database, ".info/connected");
        const unsubConn = onValue(connectedRef, (snap) => {
            setIsConnected(!!snap.val());
        });
        return () => unsubConn();
    }, []);

    // --- ADMIN LOGIC ---
    const handleCreateRoom = async () => {
        if (!playerName) return toast.error("Введите имя админа");
        setIsLoading(true);
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();

        const roomData = {
            code,
            stage: 'lobby',
            currentIdx: 0,
            timer: 30,
            timePerQuestion: 30,
            status: 'active',
            createdAt: Date.now()
        };

        const adminData: Participant = {
            id: myId,
            name: playerName,
            score: 0,
            currentIdx: 0,
            answers: [],
            lastAnsweredCorrectly: null
        };

        try {
            // Reset local player states before joining/creating
            setCurrentIdx(0);
            setMyScore(0);
            setSelectedOption(null);

            await set(ref(database, `rooms/${code}`), roomData);
            await set(ref(database, `rooms/${code}/participants/${myId}`), adminData);

            setRoomCode(code);
            setRole('admin');
            setStage('lobby');
            toast.success("Комната создана!");
        } catch (e: any) {
            console.error(e);
            toast.error("Ошибка записи DB: " + (e.message || "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    // Admin Timer Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (role === 'admin' && stage === 'question' && timer > 0) {
            interval = setInterval(() => {
                // Sync to DB every second
                // logic: we need to trust our local timer state for the decrement source
                // OR better, we use a ref to track time for the admin to avoid dependency stale closures
                setTimer(prev => {
                    const newVal = prev - 1;
                    update(ref(database, `rooms/${roomCode}`), { timer: newVal });
                    // We DO NOT return newVal to update local state immediately
                    // We wait for the firebase generic listener to do it
                    return prev;
                });
            }, 1000);
        } else if (role === 'admin' && timer === 0 && stage === 'question') {
            handleTimerEnd();
        }
        return () => clearInterval(interval);
    }, [role, stage, timer, roomCode]);

    const handleTimerEnd = async () => {
        await update(ref(database, `rooms/${roomCode}`), { stage: 'waiting' });

        setTimeout(async () => {
            if (currentIdx < multiplayerQuizData.length - 1) {
                const nextIdx = currentIdx + 1;
                await update(ref(database, `rooms/${roomCode}`), {
                    stage: 'question',
                    currentIdx: nextIdx,
                    timer: timePerQuestion
                });
            } else {
                await update(ref(database, `rooms/${roomCode}`), { stage: 'results' });
            }
        }, 3000);
    };

    const startQuiz = async () => {
        if (role !== 'admin') return;

        await update(ref(database, `rooms/${roomCode}`), { stage: 'countdown' });

        setTimeout(async () => {
            await update(ref(database, `rooms/${roomCode}`), {
                stage: 'question',
                timer: timePerQuestion,
                currentIdx: 0
            });
        }, 3000);
    };

    const updateRoomTime = async (t: number) => {
        setTimePerQuestion(t);
        await update(ref(database, `rooms/${roomCode}`), { timePerQuestion: t });
    };


    // --- PLAYER LOGIC ---
    const handleJoinRoom = async (overrideCode?: string) => {
        const activeCode = (overrideCode || roomCode).trim().toUpperCase();
        if (!playerName || !activeCode) return toast.error("Введите имя и код");
        setIsLoading(true);

        try {
            const roomRef = ref(database, `rooms/${activeCode}`);
            const snap = await get(roomRef);

            if (!snap.exists()) {
                setIsLoading(false);
                return toast.error("Комната не найдена");
            }

            // Add player
            const playerData: Participant = {
                id: myId,
                name: playerName,
                score: 0,
                currentIdx: 0,
                answers: [],
                lastAnsweredCorrectly: null
            };

            // Reset local player states
            setCurrentIdx(0);
            setMyScore(0);
            setSelectedOption(null);

            await set(ref(database, `rooms/${activeCode}/participants/${myId}`), playerData);
            // Remove player on disconnect
            onDisconnect(ref(database, `rooms/${activeCode}/participants/${myId}`)).remove();

            setRoomCode(activeCode);
            setRole('player');
            toast.success("Подключено!");
        } catch (e: any) {
            console.error(e);
            toast.error("Ошибка подключения: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleOptionSelect = async (idx: number) => {
        if (selectedOption !== null || stage !== 'question') return;
        setSelectedOption(idx);

        const isCorrect = idx === multiplayerQuizData[currentIdx].correctAnswer;
        const newScore = isCorrect ? myScore + 10 : myScore;
        setMyScore(newScore);

        // Find me in local state to get current answers
        const me = participants.find(p => p.id === myId);
        const currentAnswers = me?.answers ? [...me.answers] : [];
        currentAnswers[currentIdx] = idx;

        await update(ref(database, `rooms/${roomCode}/participants/${myId}`), {
            score: newScore,
            answers: currentAnswers,
            lastAnsweredCorrectly: isCorrect,
            currentIdx: currentIdx // Track progress
        });
    };

    // Auto-join from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) setRoomCode(code);
    }, []);


    // --- UI RENDERERS (UNCHANGED) ---

    return (
        <div className="min-h-screen bg-[#05010d] text-white font-sans selection:bg-primary/30 overflow-x-hidden relative">
            <Starfield />

            <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Выход
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Status Indicator */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isConnected ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                            'bg-red-500/10 border-red-500/50 text-red-500'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-2" />

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Room</span>
                            <span className="text-xs font-black text-primary uppercase">{roomCode || '---'}</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {stage === 'entry' && <EntryView key="entry" onJoin={handleJoinRoom} onCreate={handleCreateRoom} name={playerName} setName={setPlayerName} code={roomCode} setCode={setRoomCode} isLoading={isLoading} />}
                    {stage === 'lobby' && <LobbyView key="lobby" role={role} code={roomCode} participants={participants} onStart={startQuiz} time={timePerQuestion} setTime={updateRoomTime} />}
                    {stage === 'countdown' && <CountdownView key="countdown" />}
                    {stage === 'question' && (
                        <QuestionView
                            key="question"
                            question={multiplayerQuizData[currentIdx]}
                            timer={timer}
                            totalTime={timePerQuestion}
                            selected={selectedOption}
                            onSelect={handleOptionSelect}
                            currentIndex={currentIdx}
                            totalQuestions={multiplayerQuizData.length}
                        />
                    )}
                    {stage === 'waiting' && (() => {
                        const correctAns = multiplayerQuizData[currentIdx].correctAnswer;
                        const me = participants.find(p => p.id === myId);
                        const serverAnswer = me?.answers?.[currentIdx];
                        // Robust check: Correct if local selection matches OR server record matches
                        const isCorrect = (selectedOption === correctAns) || (serverAnswer === correctAns);

                        return <WaitingView key="waiting" isCorrect={isCorrect} />;
                    })()}
                    {stage === 'results' && <ResultsView key="results" score={myScore} participants={participants} />}
                </AnimatePresence>

                {/* DEBUG OVERLAY - Hidden by default, click room code area to toggle or it shows on error */}
                <div className="mt-auto pt-8 flex justify-center opacity-10 hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 p-2 rounded text-[8px] font-mono text-white/50 space-y-1 max-w-xs overflow-hidden">
                        <div>DB: {database.app.options.databaseURL}</div>
                        <div>ID: {myId}</div>
                    </div>
                </div>

                {role === 'admin' && (stage === 'question' || stage === 'lobby') && (
                    <AdminMonitorOverlay
                        participants={participants}
                        currentQuestionIdx={currentIdx}
                        viewingPlayerId={viewingPlayerId}
                        setViewingPlayerId={setViewingPlayerId}
                    />
                )}
            </div>
        </div>
    );
}

// --- ADMIN MONITORING COMPONENTS (Same as before) ---

function AdminMonitorOverlay({ participants, currentQuestionIdx, viewingPlayerId, setViewingPlayerId }: any) {
    const players = participants || [];
    const viewingPlayer = players.find((p: any) => p.id === viewingPlayerId);

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-4 max-w-[90vw]">
            <AnimatePresence>
                {viewingPlayerId && viewingPlayer && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-elite p-6 rounded-3xl border-white/10 w-80 shadow-2xl mb-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs font-black uppercase tracking-widest">{viewingPlayer.name}</span>
                            </div>
                            <button onClick={() => setViewingPlayerId(null)} className="text-white/40 hover:text-white">×</button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-white/30 tracking-widest uppercase">Прогресс</span>
                                <span className="text-xl font-black">{viewingPlayer.currentIdx} / 30</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: `${(viewingPlayer.currentIdx / 30) * 100}%` }} />
                            </div>
                            <div className="grid grid-cols-6 gap-1">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full ${!viewingPlayer.answers || viewingPlayer.answers[i] === undefined || viewingPlayer.answers[i] === null ? 'bg-white/5' :
                                            viewingPlayer.answers[i] === multiplayerQuizData[i]?.correctAnswer ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <span className="text-[10px] text-white/30 tracking-widest uppercase block mb-1">Последний ответ</span>
                                <div className={`text-xs font-bold ${viewingPlayer.lastAnsweredCorrectly ? 'text-green-500' : viewingPlayer.lastAnsweredCorrectly === false ? 'text-red-500' : 'text-white/40'}`}>
                                    {viewingPlayer.lastAnsweredCorrectly ? "Верно" : viewingPlayer.lastAnsweredCorrectly === false ? "Ошибка" : "Ожидание..."}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-elite p-4 sm:p-6 rounded-[2rem] border-white/10 w-full sm:w-80 lg:w-96 max-h-[50vh] sm:max-h-[60vh] overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Monitoring</h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {players.filter((p: any) => p.name !== 'admin').map((p: any) => (
                        <div
                            key={p.id}
                            onClick={() => setViewingPlayerId(p.id)}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/30 cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${p.currentIdx >= currentQuestionIdx ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold truncate w-32">{p.name}</span>
                                    <span className="text-[8px] text-white/30 uppercase font-black">Вопрос {p.currentIdx + 1}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xs font-black text-yellow-500">{p.score}</div>
                                    <div className="text-[8px] text-white/30 uppercase font-black">Score</div>
                                </div>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.lastAnsweredCorrectly === null ? 'bg-white/5' : p.lastAnsweredCorrectly ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {p.lastAnsweredCorrectly === null ? '?' : p.lastAnsweredCorrectly ? '✓' : '×'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

// --- SUB-COMPONENTS (Original) ---

function EntryView({ onJoin, onCreate, name, setName, code, setCode, isLoading }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full"
        >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-center mb-4 uppercase tracking-tighter leading-none">
                GALACTIC <br /> <span className="text-primary italic">SESSIONS</span>
            </h1>
            <p className="text-white/40 text-center mb-8 sm:mb-10 text-[10px] sm:text-base uppercase tracking-widest font-bold px-4">
                Элитный квест для студентов ТГЭУ
            </p>

            <div className="w-full space-y-4 glass-elite p-8 rounded-[2rem] border-white/5 shadow-2xl">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Ваш Позывной</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Никнейм..."
                        disabled={isLoading}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:border-yellow-500/50 focus:outline-none transition-all disabled:opacity-50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                        onClick={onCreate}
                        disabled={isLoading}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Crown className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">Создать</span>
                    </button>

                    <div className="space-y-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="КОД..."
                            disabled={isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl font-black placeholder:text-[10px] placeholder:font-black focus:border-blue-500/50 focus:outline-none transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={() => onJoin()}
                            disabled={isLoading}
                            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "..." : "Войти"}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function LobbyView({ role, code, participants, onStart, time, setTime }: any) {
    const [zoomQR, setZoomQR] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
        >
            {/* QR Zoom Modal */}
            <AnimatePresence>
                {zoomQR && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomQR(false)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                            className="bg-white p-6 rounded-3xl shadow-[0_0_100px_rgba(168,85,247,0.5)]"
                        >
                            <QRCodeSVG
                                value={`${window.location.origin}${window.location.pathname}?code=${code}`}
                                size={window.innerWidth < 640 ? 300 : 500}
                                level="H"
                            />
                            <p className="text-black font-black text-center mt-4 uppercase tracking-widest">Нажми чтобы закрыть</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Room Info */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <div className="glass-elite p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                            <div className="flex-1">
                                <span className="text-xs font-black text-primary uppercase tracking-widest mb-2 block">Код Комнаты</span>
                                <div className="text-6xl sm:text-9xl font-black tracking-tighter text-white mb-2 leading-none">
                                    {code}
                                </div>
                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Отправьте этот код или покажите QR</p>
                            </div>

                            <div
                                onClick={() => setZoomQR(true)}
                                className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] cursor-zoom-in hover:scale-105 transition-transform"
                            >
                                <QRCodeSVG
                                    value={`${window.location.origin}${window.location.pathname}?code=${code}`}
                                    size={120}
                                />
                                <div className="text-black text-[8px] font-black text-center mt-1 uppercase">Zoom</div>
                            </div>
                        </div>

                        {role === 'admin' && (
                            <div className="space-y-6 pt-8 mt-8 border-t border-white/10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Settings className="w-5 h-5 text-white/40" />
                                        <span className="text-sm font-bold uppercase tracking-widest text-white/60">Время на вопрос</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {[15, 20, 30, 45].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTime(t)}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-xs sm:text-sm font-black transition-all ${time === t ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={onStart}
                                    className="w-full py-5 sm:py-6 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                                >
                                    <Play className="w-5 h-5 fill-white" />
                                    Запустить Квиз
                                </button>
                            </div>
                        )}

                        {role === 'player' && (
                            <div className="py-8 border-t border-white/10 flex flex-col items-center gap-4 text-center">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 animate-pulse">
                                    Готовность к гиперпрыжку...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Participants Side Bar */}
                <div className="glass-elite p-8 rounded-[2.5rem] border-white/5 flex flex-col h-[60vh] lg:h-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-sm font-black uppercase tracking-widest">Экипаж</span>
                        </div>
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black">{participants.length} / 80</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {participants.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <span className="text-sm font-bold">{p.name}</span>
                                {p.name === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CountdownView() {
    const [count, setCount] = useState(3);
    useEffect(() => {
        const i = setInterval(() => setCount(prev => (prev > 1 ? prev - 1 : prev)), 1000);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
        >
            <span className="text-[12rem] sm:text-[20rem] font-black text-primary leading-none drop-shadow-[0_0_100px_rgba(168,85,247,0.5)]">
                {count}
            </span>
            <span className="text-xl sm:text-2xl font-black uppercase tracking-[0.5em] sm:tracking-[1em] text-white/20 mt-4 sm:mt-8">Готовность</span>
        </motion.div>
    );
}

function QuestionView({ question, timer, totalTime, selected, onSelect, currentIndex, totalQuestions }: any) {
    const progress = (timer / totalTime) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
        >
            {/* Timer Bar */}
            <div className="mb-8 sm:mb-12">
                <div className="flex justify-between items-end mb-4 px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Вопрос {currentIndex + 1} / {totalQuestions}</span>
                        <span className="text-xs font-black text-primary uppercase tracking-widest">{question.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Время</span>
                            <span className={`text-3xl sm:text-4xl font-black tabular-nums transition-colors ${timer < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {timer}с
                            </span>
                        </div>
                        <Timer className={`w-6 h-6 sm:w-8 sm:h-8 ${timer < 5 ? 'text-red-500' : 'text-white/20'}`} />
                    </div>
                </div>
                <div className="h-1.5 sm:h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${timer < 5 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_20px_rgba(168,85,247,0.3)]'}`}
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    />
                </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black mb-12 text-center uppercase tracking-tight leading-tight">
                {question.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((option: string, i: number) => (
                    <button
                        key={i}
                        disabled={selected !== null}
                        onClick={() => onSelect(i)}
                        className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-left font-black transition-all border-2 relative overflow-hidden group ${selected === i
                            ? 'bg-primary border-primary text-white translate-y-[-4px] shadow-2xl shadow-primary/40'
                            : selected !== null
                                ? 'bg-white/5 border-white/5 text-white/20'
                                : 'bg-white/5 border-white/10 text-white/60 hover:border-primary/50 hover:bg-white/10 hover:translate-y-[-4px]'
                            }`}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${selected === i ? 'bg-black text-white' : 'bg-white/10'}`}>
                                {String.fromCharCode(65 + i)}
                            </div>
                            <span className="text-sm sm:text-xl">{option}</span>
                        </div>
                        {selected === i && (
                            <motion.div
                                layoutId="active-bg"
                                className="absolute inset-0 bg-primary/20 -z-10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

function WaitingView({ isCorrect }: { isCorrect: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
        >
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl ${isCorrect ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} border backdrop-blur-xl`}>
                {isCorrect ? <Star className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 fill-green-500" /> : <div className="text-3xl sm:text-4xl font-black text-red-500">X</div>}
            </div>
            <h2 className="text-4xl font-black uppercase tracking-widest mb-4">
                {isCorrect ? "Отлично!" : "Не совсем так..."}
            </h2>
            <p className="text-white/40 font-bold uppercase tracking-widest animate-pulse">
                Ждём остальных участников галактики...
            </p>
        </motion.div>
    );
}

function ResultsView({ score, participants }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
        >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(168,85,247,0.4)]">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-2 uppercase italic tracking-tighter text-center">Гиперпрыжок <br className="sm:hidden" /> завершен!</h1>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 sm:mb-12">Финальные Результаты</span>

            <div className="w-full glass-elite p-8 rounded-[2.5rem] border-white/10 space-y-6">
                <div className="flex items-center justify-between p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ваш результат</span>
                        <span className="text-3xl sm:text-4xl font-black text-primary">{score} <span className="text-xs uppercase tracking-widest">очков</span></span>
                    </div>
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 text-primary fill-primary" />
                </div>

                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                    Вернуться на главную
                </button>
            </div>
        </motion.div>
    );
}
