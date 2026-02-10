import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Mail,
    Lock,
    User,
    Users,
    GraduationCap,
    ArrowRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { validateGroup, generateTSUEId } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [group, setGroup] = useState('');
    const [course, setCourse] = useState(1);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Добро пожаловать обратно!");
                onClose();
            } else {
                // Validation
                if (!fullName.trim()) throw new Error("Введите реальное имя");
                if (!validateGroup(group)) throw new Error("Неверный формат группы (напр. AT-31/35)");

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const { user } = userCredential;
                const tsueId = await generateTSUEId();

                // Save metadata
                await set(ref(database, `users/${user.uid}`), {
                    id: tsueId,
                    fullName,
                    group: group.toUpperCase(),
                    course,
                    role: 'student',
                    createdAt: Date.now()
                });

                toast.success(`Регистрация успешна! Ваш ID: ${tsueId}`);
                onClose();
            }
        } catch (err: any) {
            toast.error(err.message || "Ошибка аутентификации");
        } finally {
            setLoading(false);
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
                        className="relative w-full max-w-md glass-elite p-10 rounded-[3rem] border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-primary/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-xl shadow-primary/10">
                                <Sparkles className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-white font-elite leading-none">
                                {isLogin ? 'Вход в Систему' : 'Создать Аккаунт'}
                            </h2>
                            <p className="text-white/30 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mt-3">
                                TSUE Study Platform // 2026
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            {!isLogin && (
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                            <input
                                                type="text"
                                                placeholder="Группа (AT-31/35)"
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
                                    type="email"
                                    placeholder="Email"
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
                                className="w-full py-5 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        <span>{isLogin ? 'Авторизация' : 'Регистрация'}</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="w-full mt-6 text-sm text-white/40 hover:text-white transition-colors"
                        >
                            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
