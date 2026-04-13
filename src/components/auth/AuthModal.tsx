import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Mail, Lock, User, Users, GraduationCap, ArrowRight,
    Loader2, Sparkles, Shield, Chrome

} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateGroup, generateTSUEId, isModeratorLogin, findUserByLogin, setAdminSession, useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'moderator' | 'complete-profile';

export const TSUE_FACULTIES = [
    "Иқтисодиёт факультети",
    "Рақамли иқтисодиёт факультети",
    "Бизнес бошқаруви факультети",
    "Халқаро туризм факультети",
    "Менежмент факультети",
    "Молия ва молия технологиялари",
    "Банк иши",
    "Солиқлар ва бюджет ҳисоби",
    "Бухгалтерия ҳисоби ва аудит",
    "Иқтисодиётда ахборот тизимлари"
];

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [loading, setLoading] = useState(false);
    const { user, needsProfileCompletion } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // Если пользователь вошел через Google, нужно дать ему дозаполнить профиль
    React.useEffect(() => {
        if (needsProfileCompletion && mode !== 'complete-profile') {
            setMode('complete-profile');
        }
    }, [needsProfileCompletion]);


    // Храним данные формы
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [group, setGroup] = useState('');
    const [course, setCourse] = useState(1);
    const [faculty, setFaculty] = useState(TSUE_FACULTIES[0]);
    const [registerStep, setRegisterStep] = useState(1);

    // Role check
    const [isTeacherRegistration, setIsTeacherRegistration] = useState(false);

    // Отдельно храним учетные данные модератора, чтобы они не пересекались со студентами
    const [modLogin, setModLogin] = useState('');
    const [modPassword, setModPassword] = useState('');

    // Сюда сохраняем UUID после входа через Google, чтобы привязать к нему профиль
    const [pendingUuid, setPendingUuid] = useState<string | null>(null);

    const getErrorGuidance = (errorMsg: string) => {
        const msg = errorMsg.toLowerCase();
        if (msg.includes('already registered')) return '[ERR_AUTH_001] Этот Email уже занят. Попробуйте войти или восстановить пароль.';
        if (msg.includes('password should be at least 6 characters')) return '[ERR_AUTH_002] Пароль слишком короткий. Используйте минимум 6 символов.';
        if (msg.includes('invalid email')) return '[ERR_AUTH_003] Некорректный формат Email. Проверьте опечатки.';
        if (msg.includes('database error') || msg.includes('db_error') || msg.includes('unexpected failure')) return '[ERR_DB_001] Внутренняя ошибка базы данных. Обратитесь к разработчику (Admin).';
        if (msg.includes('user not found')) return '[ERR_AUTH_004] Пользователь не найден. Проверьте правильность Email.';
        if (msg.includes('invalid login credentials')) return '[ERR_AUTH_005] Неверный email или пароль.';
        if (msg.includes('ошибка при создании пользователя')) return '[ERR_DB_002] Ошибка при создании профиля в базе данных.';
        if (msg.includes('этот email уже зарегистрирован')) return '[ERR_AUTH_006] Этот email уже зарегистрирован. Пожалуйста, войдите в систему.';
        return `[ERR_SYS_999] Неизвестная ошибка: ${errorMsg}`;
    };

    const resetForm = () => {
        setEmail(''); setPassword(''); setFullName('');
        setGroup(''); setCourse(1); setModLogin(''); setModPassword('');
        setPendingUuid(null); setRegisterStep(1); setError(null);
    };

    const saveUserMetadata = async (uuid: string, name: string, userEmail: string, provider: string = 'email') => {
        const tsueId = await generateTSUEId();
        const finalRole = isTeacherRegistration ? 'teacher' : 'student';
        
        const { error } = await supabase
            .from('users')
            .upsert({
                uuid: uuid,
                id: tsueId,
                fullName: name,
                email: userEmail,
                group: isTeacherRegistration ? 'N/A' : group.toUpperCase(),
                course: isTeacherRegistration ? 1 : course,
                role: finalRole,
                faculty: isTeacherRegistration ? faculty : null,
                provider,
                createdAt: Date.now(),
                scores: {}
            }, { onConflict: 'uuid' });

        if (error) throw error;

        // Log registration for moderator tracking
        try {
            // Detailed registration log
            await supabase.from('registration_logs').insert({
                uuid: uuid,
                full_name: name,
                email: userEmail,
                group: isTeacherRegistration ? 'TEACHER' : group.toUpperCase(),
                course,
                provider,
                tsue_id: tsueId,
            });

            // Activity log for real-time dashboard update
            await supabase.from('activity_logs').insert({
                student_uuid: uuid,
                action: 'registration',
                details: {
                    fullName: name,
                    group: isTeacherRegistration ? faculty : group.toUpperCase(),
                    role: finalRole,
                    course,
                    tsueId
                },
            });
        } catch (logErr) {
            console.warn('Logging failed:', logErr);
        }

        return tsueId;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // сбрасываем прошлые ошибки
        try {
            if (mode === 'login') {
                const cleanEmail = email.trim();
                let targetEmail = cleanEmail;

                // Поддержка входа через Имя или ID (без @)
                if (!cleanEmail.includes('@')) {
                    const lookup = await findUserByLogin(cleanEmail);
                    if (lookup) {
                        targetEmail = lookup.email;
                    } else {
                        throw new Error("Пользователь с таким ID или Именем не найден. Проверьте правильность ввода.");
                    }
                }

                const { error } = await supabase.auth.signInWithPassword({
                    email: targetEmail,
                    password: password.trim(),
                });

                if (error) {
                    throw new Error(getErrorGuidance(error.message));
                }

                // Фиксируем успешный вход в логах
                const { data: { user: authedUser } } = await supabase.auth.getUser();
                if (authedUser) {
                    await supabase.from('activity_logs').insert({
                        student_uuid: authedUser.id,
                        action: 'login',
                        details: { method: 'password' },
                    }).then();
                }

                toast.success("Добро пожаловать!");
                resetForm();
                onClose();
            } else if (mode === 'register') {
                if (registerStep < 3) {
                    setRegisterStep(registerStep + 1 as any);
                    setLoading(false);
                    return;
                }

                if (!fullName.trim()) throw new Error("Введите полное имя (ФИО)");
                if (!isTeacherRegistration && !validateGroup(group)) {
                    throw new Error("Неверный формат группы. Пример: AT-31/25 (буквы, тире, цифры, дробь)");
                }

                const { data, error } = await supabase.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password: password.trim(),
                    options: {
                        data: {
                            full_name: fullName.trim(),
                            group: isTeacherRegistration ? 'N/A' : group.trim().toUpperCase(),
                            course: isTeacherRegistration ? 1 : course,
                            role: isTeacherRegistration ? 'teacher' : 'student',
                            faculty: isTeacherRegistration ? faculty : null
                        }
                    }
                });

                if (error) {
                    setError(getErrorGuidance(error.message));
                    return;
                }
                
                if (!data.user) throw new Error("Ошибка при создании пользователя");
                
                // Supabase не возвращает сессию, если включено подтверждение по почте ИЛИ email уже занят.
                // В нашем случае это значит, что аккаунт уже есть.
                if (!data.session) {
                    setError(getErrorGuidance("Этот email уже зарегистрирован. Пожалуйста, войдите в систему."));
                    return;
                }

                toast.success(`Регистрация успешна! Добро пожаловать, ${fullName}!`);
                resetForm();
                onClose();
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(getErrorGuidance(err.message || "Произошла ошибка. Проверьте соединение с интернетом."));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider: 'google') => {

        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            // После редиректа профиль будет проверен автоматически хуком useAuth
        } catch (err: any) {
            setError(getErrorGuidance(err.message || "Ошибка входа"));
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            if (!fullName.trim()) throw new Error("Введите ваше имя");
            if (!validateGroup(group)) throw new Error("Неверный формат группы (напр. AT-31/25)");

            const tsueId = await saveUserMetadata(user.id, fullName, user.email || '', 'social');
            toast.success(`Профиль создан! Ваш ID: ${tsueId}`);
            resetForm();
            onClose();
        } catch (err: any) {
            setError(getErrorGuidance(err.message || "Ошибка"));
        } finally {
            setLoading(false);
        }
    };

    const handleModeratorLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const cleanModLogin = modLogin.trim();
            const cleanModPass = modPassword.trim();

            if (!isModeratorLogin(cleanModLogin, cleanModPass)) {
                throw new Error("Неверные учетные данные модератора");
            }

            // Мы не используем Supabase Auth для админа, а просто сохраняем сессию
            setAdminSession();

            toast.success("Модератор авторизован", { description: "Добро пожаловать, Monarch" });
            resetForm();
            onClose();

            // Перезагружаем страницу, чтобы применились права админа
            setTimeout(() => window.location.reload(), 500);
        } catch (err: any) {
            console.error("Moderator Login Error:", err);
            setError(getErrorGuidance(err.message || "Неизвестная ошибка"));
        } finally {
            setLoading(false);
        }
    };


    const renderTitle = () => {
        switch (mode) {
            case 'login': return isTeacherRegistration ? 'Вход Преподавателя' : 'Вход в Систему';
            case 'register': return isTeacherRegistration ? 'Регистрация Преподавателя' : 'Создать Аккаунт';
            case 'moderator': return 'Вход Модератора';
            case 'complete-profile': return 'Завершите Профиль';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md glass-elite p-8 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                        {!needsProfileCompletion && (
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/20 rounded-[1.2rem] flex items-center justify-center mx-auto mb-5 border border-primary/30 shadow-xl shadow-primary/10">
                                {mode === 'moderator' ? (
                                    <Shield className="w-8 h-8 text-primary" />
                                ) : (
                                    <Sparkles className="w-8 h-8 text-primary" />
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white leading-none">
                                {renderTitle()}
                            </h2>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                                TSUE Study Platform
                            </p>
                        </div>

                        {/* ======================= МОДЕРАТОР ======================= */}
                        {mode === 'moderator' && (
                            <form onSubmit={handleModeratorLogin} className="space-y-4">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 flex items-start gap-3"
                                    >
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <span className="text-red-500 text-sm font-bold">!</span>
                                        </div>
                                        <div>
                                            <p className="text-red-400 text-xs font-bold uppercase tracking-tight mb-1">Ошибка входа</p>
                                            <p className="text-white/70 text-xs leading-relaxed">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
                                    <input
                                        type="text"
                                        placeholder="Логин модератора"
                                        value={modLogin}
                                        onChange={(e) => setModLogin(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-amber-400/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
                                    <input
                                        type="password"
                                        placeholder="Пароль"
                                        value={modPassword}
                                        onChange={(e) => setModPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-amber-400/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <><Shield className="w-4 h-4" /><span>Войти как Модератор</span></>
                                    )}
                                </button>
                                <button type="button" onClick={() => setMode('login')}
                                    className="w-full text-sm text-white/30 hover:text-white/60 transition-colors mt-2">
                                    ← Обычный вход
                                </button>
                            </form>
                        )}

                        {/* ============= ЗАВЕРШЕНИЕ ПРОФИЛЯ GMAIL ============ */}
                        {mode === 'complete-profile' && (
                            <form onSubmit={handleCompleteProfile} className="space-y-4">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 flex items-start gap-3"
                                    >
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <span className="text-red-500 text-sm font-bold">!</span>
                                        </div>
                                        <div>
                                            <p className="text-red-400 text-xs font-bold uppercase tracking-tight mb-1">Ошибка</p>
                                            <p className="text-white/70 text-xs leading-relaxed">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                                <p className="text-white/50 text-sm text-center mb-4">
                                    Заполните информацию о себе для завершения регистрации
                                </p>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="Полное Имя (напр. Иван Иванов)"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input
                                            type="text"
                                            placeholder="Группа (AT-31/25)"
                                            value={group}
                                            onChange={(e) => setGroup(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <select
                                            value={course}
                                            onChange={(e) => setCourse(Number(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(c => (
                                                <option key={c} value={c} className="bg-slate-900">{c} Курс</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <><span>Завершить Регистрацию</span><ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* =============== ВХОД И РЕГИСТРАЦИЯ =============== */}
                        {(mode === 'login' || mode === 'register') && (
                            <>
                                <form onSubmit={handleEmailAuth} className="space-y-3">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 flex items-start gap-3"
                                        >
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <span className="text-red-500 text-sm font-bold">!</span>
                                            </div>
                                            <div>
                                                <p className="text-red-400 text-xs font-bold uppercase tracking-tight mb-1">Ошибка</p>
                                                <p className="text-white/70 text-xs leading-relaxed">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {mode === 'register' ? (
                                        <AnimatePresence mode="wait">
                                            {/* ===== ВЫБОР РОЛИ ===== */}
                                            {registerStep === 1 && (
                                                <motion.div
                                                    key="step1"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-4"
                                                >
                                                    <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest text-center mb-2">Шаг 1: Кто вы?</p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsTeacherRegistration(false); setRegisterStep(2); }}
                                                            className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${!isTeacherRegistration ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                        >
                                                            <div className="p-3 bg-primary/20 rounded-xl">
                                                                <GraduationCap className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-white font-black uppercase text-xs">Я Студент</h4>
                                                                <p className="text-white/40 text-[10px] mt-1">Доступ к курсам, тестам и битвам.</p>
                                                            </div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsTeacherRegistration(true); setRegisterStep(2); }}
                                                            className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${isTeacherRegistration ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                        >
                                                            <div className="p-3 bg-amber-500/20 rounded-xl">
                                                                <Users className="w-6 h-6 text-amber-500" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-white font-black uppercase text-xs">Я Преподаватель</h4>
                                                                <p className="text-white/40 text-[10px] mt-1">Управление группами и мониторинг успеха.</p>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* ===== EMAIL И ПАРОЛЬ ===== */}
                                            {registerStep === 2 && (
                                                <motion.div
                                                    key="step2"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-3"
                                                >
                                                    <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest text-center">Шаг 2: Аккаунт</p>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="email"
                                                            placeholder="Ваш Email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="password"
                                                            placeholder="Пароль (мин. 6 символов)"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                            minLength={6}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => setRegisterStep(1)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-bold text-[10px] uppercase">Назад</button>
                                                        <button type="submit" className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">Далее <ArrowRight className="w-3 h-3" /></button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* ===== ИНФОРМАЦИЯ О СТУДЕНТЕ/ПРЕПОДАВАТЕЛЕ ===== */}
                                            {registerStep === 3 && (
                                                <motion.div
                                                    key="step3"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-3"
                                                >
                                                    <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest text-center">Шаг 3: Данные</p>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                        <input
                                                            type="text"
                                                            placeholder="ФИО (напр. Иван Иванов)"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            required
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                                        />
                                                    </div>
                                                    
                                                    {isTeacherRegistration ? (
                                                        <div className="relative">
                                                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                            <select
                                                                value={faculty}
                                                                onChange={(e) => setFaculty(e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all appearance-none text-[11px] font-bold"
                                                            >
                                                                {TSUE_FACULTIES.map(fac => (
                                                                    <option key={fac} value={fac} className="bg-slate-900">{fac}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="relative">
                                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Группа"
                                                                    value={group}
                                                                    onChange={(e) => setGroup(e.target.value)}
                                                                    required
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all text-sm font-bold"
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                                <select
                                                                    value={course}
                                                                    onChange={(e) => setCourse(Number(e.target.value))}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all appearance-none text-xs font-bold"
                                                                >
                                                                    {[1, 2, 3, 4, 5, 6].map(c => (
                                                                        <option key={c} value={c} className="bg-slate-900">{c} Курс</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => setRegisterStep(2)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 font-bold text-[10px] uppercase">Назад</button>
                                                        <button type="submit" disabled={loading} className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20">
                                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Завершить <Sparkles className="w-3 h-3" /></>}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                <input
                                                    type="text"
                                                    placeholder="ID, Имя или Email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                                                />
                                            </div>

                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                                <input
                                                    type="password"
                                                    placeholder="Пароль"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        <span>Авторизация</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </form>

                                {/* Social Auth Divider */}
                                <div className="flex items-center gap-3 my-5">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-white/20 text-[10px] uppercase tracking-widest font-bold">или</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>

                                {/* Social Auth Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSocialAuth('google')}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        <Chrome className="w-4 h-4" />
                                        <span>Продолжить с Google</span>
                                    </button>
                                </div>


                                {/* Mode Switcher */}
                                <button
                                    onClick={() => { resetForm(); setMode(mode === 'login' ? 'register' : 'login'); }}
                                    className="w-full mt-5 text-sm text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                                </button>

                                {/* Потайная ссылка для модераторов */}
                                {mode === 'login' && (
                                    <button
                                        onClick={() => { resetForm(); setMode('moderator'); }}
                                        className="w-full mt-2 text-[10px] text-white/10 hover:text-white/30 transition-colors"
                                    >
                                        Модерация
                                    </button>
                                )}
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
