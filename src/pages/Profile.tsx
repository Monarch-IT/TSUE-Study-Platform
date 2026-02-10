import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
    User,
    Settings,
    LogOut,
    ChevronLeft,
    Trophy,
    Star,
    Clock,
    Briefcase,
    GraduationCap,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { metadata, user, loading, signOut } = useAuth();
    const navigate = useNavigate();

    if (loading) return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#020205] text-white selection:bg-primary/30">
            {/* Navbar */}
            <nav className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Назад к обучению</span>
                    </button>

                    <button
                        onClick={() => { signOut(); navigate('/'); }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Выйти</span>
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Avatar & Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-elite-primary p-10 rounded-[3.5rem] border-primary/20 text-center relative overflow-hidden group shadow-2xl">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-32 h-32 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/30 relative">
                                <User className="w-16 h-16 text-primary" />
                                <div className="absolute inset-0 rounded-3xl animate-pulse-glow bg-primary/10" />
                            </div>

                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
                                {metadata?.fullName || user?.displayName || 'Студент TSP'}
                            </h2>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                                <ShieldCheck className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    {metadata?.role === 'teacher' ? 'Преподаватель' : 'Студент // АТ-31'}
                                </span>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/30 uppercase font-bold tracking-widest text-[10px]">TSP ID</span>
                                    <span className="font-mono text-primary font-bold">{metadata?.id}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/30 uppercase font-bold tracking-widest text-[10px]">Группа</span>
                                    <span className="font-bold text-white/80">{metadata?.group}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/30 uppercase font-bold tracking-widest text-[10px]">Курс</span>
                                    <span className="font-bold text-white/80">{metadata?.course} Курс</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
                            <Settings className="w-5 h-5 text-white/40 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white">Настройки профиля</span>
                        </button>
                    </div>

                    {/* Right Column: Experience & Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard icon={Trophy} label="Очки" value="1,250" color="text-yellow-500" />
                            <StatCard icon={Star} label="Квизы" value="12" color="text-primary" />
                            <StatCard icon={Clock} label="Часы" value="48ч" color="text-blue-400" />
                        </div>

                        <div className="glass-elite p-10 rounded-[3.5rem] border-white/5 shadow-2xl">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span>Академический Рост</span>
                                    <span className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">Personal Achievements</span>
                                </div>
                            </h3>

                            <div className="space-y-8">
                                <ProgressItem label="Основы Python" progress={90} color="primary" />
                                <ProgressItem label="Логика и Алгоритмы" progress={65} color="emerald" />
                                <ProgressItem label="Работа с Данными" progress={30} color="orange" />
                            </div>

                            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                    <GraduationCap className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest mb-1 text-blue-400">Путь к Бакалавру</h4>
                                    <p className="text-sm text-white/40">Вы завершили 45% учебного плана этого семестра.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="glass-elite p-6 rounded-3xl border-white/5 flex flex-col items-center text-center">
            <Icon className={`w-8 h-8 ${color} mb-3`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</span>
            <span className="text-2xl font-black">{value}</span>
        </div>
    );
}

function ProgressItem({ label, progress }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-white/60">{label}</span>
                <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                />
            </div>
        </div>
    );
}
