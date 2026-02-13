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

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [loading, setLoading] = useState(false);
    const { user, needsProfileCompletion } = useAuth();

    // Auto-switch to complete-profile if needed
    React.useEffect(() => {
        if (needsProfileCompletion && mode !== 'complete-profile') {
            setMode('complete-profile');
        }
    }, [needsProfileCompletion]);


    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [group, setGroup] = useState('');
    const [course, setCourse] = useState(1);

    // Moderator fields
    const [modLogin, setModLogin] = useState('');
    const [modPassword, setModPassword] = useState('');

    // Social auth pending profile
    const [pendingUuid, setPendingUuid] = useState<string | null>(null);

    const resetForm = () => {
        setEmail(''); setPassword(''); setFullName('');
        setGroup(''); setCourse(1); setModLogin(''); setModPassword('');
        setPendingUuid(null);
    };

    const saveUserMetadata = async (uuid: string, name: string, userEmail: string, provider: string = 'email') => {
        const tsueId = await generateTSUEId();
        const { error } = await supabase
            .from('users')
            .insert({
                uuid: uuid,
                id: tsueId,
                fullName: name,
                email: userEmail,
                group: group.toUpperCase(),
                course,
                role: 'student',
                provider,
                createdAt: Date.now(),
                scores: {}
            });

        if (error) throw error;

        // Log registration for moderator tracking
        try {
            await supabase.from('registration_logs').insert({
                uuid: uuid,
                full_name: name,
                email: userEmail,
                group: group.toUpperCase(),
                course,
                provider,
                tsue_id: tsueId,
            });
        } catch (logErr) {
            console.warn('Registration log insert failed (table may not exist yet):', logErr);
        }

        return tsueId;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'login') {
                const cleanEmail = email.trim();
                let targetEmail = cleanEmail;

                // If not an email format, try lookup by ID or Name
                if (!cleanEmail.includes('@')) {
                    const lookup = await findUserByLogin(cleanEmail);
                    if (lookup) {
                        targetEmail = lookup.email;
                    } else {
                        throw new Error("Пользователь с таким ID или Именем не найден");
                    }
                }

                const { error } = await supabase.auth.signInWithPassword({
                    email: targetEmail,
                    password: password.trim(),
                });

                if (error) throw error;

                toast.success("Добро пожаловать!");
                resetForm();
                onClose();
            } else if (mode === 'register') {
                if (!fullName.trim()) throw new Error("Введите ваше имя");
                if (!validateGroup(group)) throw new Error("Неверный формат группы (напр. AT-31/25)");

                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                });

                if (error) throw error;
                if (!data.user) throw new Error("Ошибка при создании пользователя");

                const tsueId = await saveUserMetadata(data.user.id, fullName, email);
                toast.success(`Регистрация успешна! Ваш ID: ${tsueId}`);
                resetForm();
                onClose();
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            toast.error(err.message || "Ошибка аутентификации");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider: 'google') => {

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            // Note: Profile completion check happens in useAuth hook after redirect
        } catch (err: any) {
            toast.error(err.message || "Ошибка входа");
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        try {
            if (!fullName.trim()) throw new Error("Введите ваше имя");
            if (!validateGroup(group)) throw new Error("Неверный формат группы (напр. AT-31/25)");

            const tsueId = await saveUserMetadata(user.id, fullName, user.email || '', 'social');
            toast.success(`Профиль создан! Ваш ID: ${tsueId}`);
            resetForm();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Ошибка");
        } finally {
            setLoading(false);
        }
    };

    const handleModeratorLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanModLogin = modLogin.trim();
            const cleanModPass = modPassword.trim();

            if (!isModeratorLogin(cleanModLogin, cleanModPass)) {
                throw new Error("Неверные учетные данные модератора");
            }

            // Use local admin session (no Supabase Auth needed)
            setAdminSession();

            toast.success("Модератор авторизован", { description: "Добро пожаловать, Monarch" });
            resetForm();
            onClose();

            // Force page reload to pick up admin session
            setTimeout(() => window.location.reload(), 500);
        } catch (err: any) {
            console.error("Moderator Login Error:", err);
            toast.error("Ошибка входа модератора", { description: err.message || "Неизвестная ошибка" });
        } finally {
            setLoading(false);
        }
    };


    const renderTitle = () => {
        switch (mode) {
            case 'login': return 'Вход в Систему';
            case 'register': return 'Создать Аккаунт';
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

                        {/* ===== MODERATOR MODE ===== */}
                        {mode === 'moderator' && (
                            <form onSubmit={handleModeratorLogin} className="space-y-4">
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

                        {/* ===== COMPLETE PROFILE (after social auth) ===== */}
                        {mode === 'complete-profile' && (
                            <form onSubmit={handleCompleteProfile} className="space-y-4">
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

                        {/* ===== LOGIN / REGISTER MODE ===== */}
                        {(mode === 'login' || mode === 'register') && (
                            <>
                                <form onSubmit={handleEmailAuth} className="space-y-3">
                                    {mode === 'register' && (
                                        <>
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
                                        </>
                                    )}

                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input
                                            type="text"
                                            placeholder={mode === 'login' ? "ID, Имя или Email" : "Email"}
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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <span>{mode === 'login' ? 'Авторизация' : 'Регистрация'}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
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

                                {/* Secret moderator access - small subtle link */}
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
