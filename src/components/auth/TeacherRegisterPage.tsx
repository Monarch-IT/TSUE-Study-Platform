import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap, User, BookOpen, Building2, ArrowRight,
    Loader2, CheckCircle2, Mail, Lock, Chrome
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { generateTSUEId, useAuth } from '@/hooks/useAuth';
import { generateTeacherCode } from '@/lib/teacherService';
import { toast } from 'sonner';

const FACULTIES = [
    'Банковское дело и финансы',
    'Бухгалтерский учёт',
    'Цифровая экономика',
    'Менеджмент',
    'Маркетинг',
    'Мировая экономика',
    'Налоги и налогообложение',
    'Статистика',
    'Экономическая теория',
    'Информационные технологии',
];

export default function TeacherRegisterPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, metadata } = useAuth();
    const inviteCode = searchParams.get('code');

    const [step, setStep] = useState<'auth' | 'profile' | 'done'>('auth');
    const [loading, setLoading] = useState(false);

    // Form
    const [fullName, setFullName] = useState('');
    const [subject, setSubject] = useState('');
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // If user is already logged in, go to profile step
    useEffect(() => {
        if (user && metadata) {
            if (metadata.role === 'teacher') {
                setStep('done');
            }
        } else if (user && !metadata) {
            setStep('profile');
        }
    }, [user, metadata]);

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/register/teacher?code=${inviteCode || 'default'}`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || 'Ошибка авторизации');
            setLoading(false);
        }
    };

    const handleEmailAuth = async () => {
        if (!email || !password) {
            toast.error('Заполните email и пароль');
            return;
        }
        setLoading(true);
        try {
            // Try sign up first
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                // If already exists, try sign in
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
            }
            setStep('profile');
        } catch (err: any) {
            toast.error(err.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const toggleFaculty = (f: string) => {
        setSelectedFaculties(prev =>
            prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
        );
    };

    const handleCompleteProfile = async () => {
        if (!fullName.trim()) { toast.error('Введите ФИО'); return; }
        if (!subject.trim()) { toast.error('Введите предмет'); return; }

        setLoading(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error('Не авторизован');

            const tsueId = await generateTSUEId();
            const teacherCode = generateTeacherCode();

            const { error } = await supabase.from('users').upsert({
                uuid: currentUser.id,
                id: tsueId,
                fullName: fullName.trim(),
                email: currentUser.email || email,
                group: 'ПРЕПОДАВАТЕЛЬ',
                course: 0,
                role: 'teacher',
                provider: currentUser.app_metadata?.provider || 'email',
                createdAt: Date.now(),
                faculty: selectedFaculties.length > 0 ? selectedFaculties : null,
                subject: subject.trim(),
                teacher_code: teacherCode,
            }, { onConflict: 'uuid' });

            if (error) throw error;

            toast.success('Аккаунт преподавателя создан!');
            setStep('done');
            setTimeout(() => navigate('/'), 2000);
        } catch (err: any) {
            toast.error(err.message || 'Ошибка создания профиля');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Регистрация Преподавателя</h1>
                    <p className="text-sm text-white/50">TSUE Study Platform</p>
                </div>

                {/* Step: Auth */}
                {step === 'auth' && (
                    <div className="space-y-4 bg-white/5 rounded-2xl border border-white/10 p-6">
                        <button
                            onClick={handleGoogleAuth}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 hover:border-white/40 text-white font-bold transition-all hover:bg-white/15"
                        >
                            <Chrome className="w-5 h-5" />
                            Войти через Google
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-white/30 uppercase tracking-wider">или</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Пароль"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handleEmailAuth}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                Продолжить
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Profile */}
                {step === 'profile' && (
                    <div className="space-y-4 bg-white/5 rounded-2xl border border-white/10 p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Заполните профиль</h2>

                        {/* Full Name */}
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">Полное имя (ФИО) *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                    placeholder="Иванов Иван Иванович"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">Предмет *</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text" value={subject} onChange={e => setSubject(e.target.value)}
                                    placeholder="Информатика, Python, Базы данных..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Faculty (optional, multi-select) */}
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
                                <Building2 className="w-3 h-3 inline mr-1" />
                                Факультет(ы) <span className="text-white/20">(необязательно)</span>
                            </label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                                {FACULTIES.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => toggleFaculty(f)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedFaculties.includes(f)
                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 border'
                                                : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/30'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCompleteProfile}
                            disabled={loading || !fullName.trim() || !subject.trim()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-all mt-4"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Создать аккаунт
                        </button>
                    </div>
                )}

                {/* Step: Done */}
                {step === 'done' && (
                    <div className="text-center bg-white/5 rounded-2xl border border-emerald-500/20 p-8">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Аккаунт создан!</h2>
                        <p className="text-sm text-white/50 mb-4">Вы были зарегистрированы как преподаватель</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                        >
                            Перейти на платформу
                        </button>
                    </div>
                )}

                <div className="text-center mt-6">
                    <button onClick={() => navigate('/')} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                        ← Вернуться на главную
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
