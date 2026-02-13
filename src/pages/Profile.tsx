import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
    User, Settings, LogOut, ChevronLeft, Trophy, Star,
    Clock, Briefcase, GraduationCap, ShieldCheck, Camera,
    Save, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Profile() {
    const { metadata, user, loading, signOut, updateMetadata } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ solved: 0, totalScore: 0, hours: 48 });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullName: '',
        age: '',
        bio: '',
        avatar_url: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchStats();
            setEditData({
                fullName: metadata?.fullName || '',
                age: metadata?.age || '',
                bio: metadata?.bio || '',
                avatar_url: metadata?.avatar_url || ''
            });
        }
    }, [user, metadata]);

    const [progress, setProgress] = useState({
        fundamentals: 0,
        logic: 0,
        data: 0,
        totalCompletion: 0
    });

    const fetchStats = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('submissions')
                .select('task_id, review_score, status')
                .eq('uuid', user.id);

            if (error) throw error;

            // Calculate basic stats
            const solvedTasks = data?.filter(s => s.status === 'passed' || s.review_score > 0) || [];
            const uniqueSolved = new Set(solvedTasks.map(s => s.task_id)).size;
            const totalScore = data?.reduce((acc, curr) => acc + (curr.review_score || 0), 0) || 0;
            const estimatedHours = Math.round(uniqueSolved * 0.5); // 30 mins per task

            setStats({ solved: uniqueSolved, totalScore, hours: estimatedHours });

            // Calculate Category Progress
            // Categories mapping based on topic prefixes or IDs
            // Intro/Structure/Conditions -> Fundamentals
            // Loops/Functions/Lists -> Logic
            // Dicts/Files/Modules -> Data

            const categoryCounts = {
                fundamentals: new Set(),
                logic: new Set(),
                data: new Set()
            };

            solvedTasks.forEach(task => {
                const tid = task.task_id.toLowerCase();
                if (tid.includes('intro') || tid.includes('structure') || tid.includes('conditions')) {
                    categoryCounts.fundamentals.add(tid);
                } else if (tid.includes('loops') || tid.includes('functions') || tid.includes('lists')) {
                    categoryCounts.logic.add(tid);
                } else if (tid.includes('dicts') || tid.includes('files') || tid.includes('modules')) {
                    categoryCounts.data.add(tid);
                }
            });

            // Estimated total tasks per category (based on 15 tasks * 3-4 topics)
            // Fundamentals: ~45 tasks
            // Logic: ~45 tasks
            // Data: ~45 tasks
            const totalPerCategory = 45;

            const newProgress = {
                fundamentals: Math.min(100, Math.round((categoryCounts.fundamentals.size / totalPerCategory) * 100)),
                logic: Math.min(100, Math.round((categoryCounts.logic.size / totalPerCategory) * 100)),
                data: Math.min(100, Math.round((categoryCounts.data.size / totalPerCategory) * 100)),
                totalCompletion: 0
            };

            // Calculate total degree completion (simple average for now)
            newProgress.totalCompletion = Math.round(
                (newProgress.fundamentals + newProgress.logic + newProgress.data) / 3
            );

            setProgress(newProgress);

        } catch (err) {
            console.error("Fetch stats error:", err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: editData.fullName,
                    age: editData.age,
                    bio: editData.bio,
                    avatar_url: editData.avatar_url
                })
                .eq('uuid', user?.id);

            if (error) throw error;

            if (updateMetadata) await updateMetadata();
            setIsEditing(false);
            toast.success("Профиль обновлен!");
        } catch (err: any) {
            toast.error("Ошибка сохранения: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Пожалуйста, выберите изображение");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Размер файла не должен превышать 2MB");
            return;
        }

        setSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setEditData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success("Аватар загружен successfully!");
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Ошибка загрузки аватара: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

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
                        <div className="glass-lite-primary p-10 rounded-[3.5rem] border-primary/20 text-center relative overflow-hidden group shadow-2xl">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="w-32 h-32 bg-primary/20 rounded-3xl flex items-center justify-center border-2 border-primary/30 relative overflow-hidden">
                                    {metadata?.avatar_url ? (
                                        <img src={metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-primary" />
                                    )}
                                    <div className="absolute inset-0 rounded-3xl animate-pulse-glow bg-primary/10" />
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => document.getElementById('avatar-input')?.click()}
                                        disabled={saving}
                                        className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl border-4 border-[#020205] text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                        <input id="avatar-input" type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <input
                                    value={editData.fullName}
                                    onChange={e => setEditData(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full text-center font-bold mb-4 focus:border-primary/50 outline-none"
                                    placeholder="Ваше имя"
                                />
                            ) : (
                                <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
                                    {metadata?.fullName || 'Студент TSP'}
                                </h2>
                            )}

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                                <ShieldCheck className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    {metadata?.role === 'teacher' ? 'Преподаватель' : `Студент // ${metadata?.group || 'АТ-31'}`}
                                </span>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-white/10 text-left">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/30 uppercase font-bold tracking-widest text-[10px]">Возраст</span>
                                    {isEditing ? (
                                        <input
                                            value={editData.age}
                                            onChange={e => setEditData(prev => ({ ...prev, age: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 w-16 text-right outline-none"
                                        />
                                    ) : (
                                        <span className="font-bold text-white/80">{metadata?.age || '--'}</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-white/30 uppercase font-bold tracking-widest text-[10px]">О себе</span>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.bio}
                                            onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full text-xs min-h-[80px] outline-none"
                                        />
                                    ) : (
                                        <p className="text-xs text-white/60 leading-relaxed italic">
                                            {metadata?.bio || 'Информация не указана...'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="p-5 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-primary/80 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Сохранить
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-5 rounded-[2rem] bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                    Отмена
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                            >
                                <Settings className="w-5 h-5 text-white/40 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white">Изменить профиль</span>
                            </button>
                        )}
                    </div>

                    {/* Right Column: Experience & Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard icon={Trophy} label="Очки (Score)" value={stats.totalScore.toLocaleString()} color="text-yellow-500" />
                            <StatCard icon={Star} label="Заданий" value={stats.solved.toString()} color="text-primary" />
                            <StatCard icon={Clock} label="Часы" value={stats.hours + "ч"} color="text-blue-400" />
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
                                <ProgressItem label="Основы Python" progress={progress.fundamentals} color="primary" />
                                <ProgressItem label="Логика и Алгоритмы" progress={progress.logic} color="emerald" />
                                <ProgressItem label="Работа с Данными" progress={progress.data} color="orange" />
                            </div>

                            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                    <GraduationCap className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest mb-1 text-blue-400">Путь к Бакалавру</h4>
                                    <p className="text-sm text-white/40">Вы завершили {progress.totalCompletion}% учебного плана этого семестра.</p>
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
