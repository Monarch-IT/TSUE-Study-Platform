import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXP } from '@/hooks/useXP';
import { getLevelInfo, getEloRank } from '@/lib/xpCalculator';
import {
    User, LogOut, ChevronLeft, Trophy, Star,
    Clock, Briefcase, GraduationCap, ShieldCheck, Camera,
    Save, X, Loader2, Zap, Swords, Flame, Code2,
    Target, Crown, Award, TrendingUp, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { isValidUUID } from '@/lib/uuidGuard';

export default function Profile() {
    const { metadata, user, loading, signOut, updateMetadata } = useAuth();
    const navigate = useNavigate();
    const xpData = useXP(isValidUUID(user?.id) ? user?.id : undefined);

    const [stats, setStats] = useState({ solved: 0, totalScore: 0, hours: 0 });
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
        if (!user || !isValidUUID(user.id)) return;
        try {
            const { data, error } = await supabase
                .from('submissions')
                .select('task_id, review_score, status')
                .eq('uuid', user.id);

            if (error) throw error;

            const solvedTasks = data?.filter(s => s.status === 'passed' || s.review_score > 0) || [];
            const uniqueSolved = new Set(solvedTasks.map(s => s.task_id)).size;
            const totalScore = data?.reduce((acc, curr) => acc + (curr.review_score || 0), 0) || 0;
            const estimatedHours = Math.round(uniqueSolved * 0.5);

            setStats({ solved: uniqueSolved, totalScore, hours: estimatedHours });

            const categoryCounts = { fundamentals: new Set<string>(), logic: new Set<string>(), data: new Set<string>() };
            solvedTasks.forEach(task => {
                const tid = task.task_id.toLowerCase();
                if (tid.includes('intro') || tid.includes('structure') || tid.includes('conditions')) categoryCounts.fundamentals.add(tid);
                else if (tid.includes('loops') || tid.includes('functions') || tid.includes('lists')) categoryCounts.logic.add(tid);
                else if (tid.includes('dicts') || tid.includes('files') || tid.includes('modules')) categoryCounts.data.add(tid);
            });

            const totalPerCategory = 45;
            const newProgress = {
                fundamentals: Math.min(100, Math.round((categoryCounts.fundamentals.size / totalPerCategory) * 100)),
                logic: Math.min(100, Math.round((categoryCounts.logic.size / totalPerCategory) * 100)),
                data: Math.min(100, Math.round((categoryCounts.data.size / totalPerCategory) * 100)),
                totalCompletion: 0
            };
            newProgress.totalCompletion = Math.round((newProgress.fundamentals + newProgress.logic + newProgress.data) / 3);
            setProgress(newProgress);
        } catch (err) {
            console.error("Fetch stats error:", err);
        }
    };

    const handleSave = async () => {
        if (!user || !isValidUUID(user.id)) {
            toast.error("Невозможно сохранить профиль для локального администратора");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    fullName: editData.fullName,
                    age: editData.age,
                    bio: editData.bio,
                    avatar_url: editData.avatar_url
                })
                .eq('uuid', user.id);

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
        if (!file.type.startsWith('image/')) { toast.error("Выберите изображение"); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error("Макс. размер 2MB"); return; }

        setSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { cacheControl: '3600', upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setEditData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success("Аватар загружен!");
        } catch (error: any) {
            toast.error('Ошибка: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) { navigate('/'); return null; }

    const levelInfo = xpData.levelInfo;
    const eloRank = getEloRank(xpData.userStats.battle_elo);
    const unlockedCount = xpData.unlockedSlugs.size;
    const totalAchievements = xpData.achievements.length || 20;

    return (
        <div className="min-h-screen bg-[#050508] text-white selection:bg-primary/30">
            {/* Navbar */}
            <nav className="p-4 sm:p-6 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Назад</span>
                    </button>
                    <button onClick={() => { signOut(); navigate('/'); }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20">
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Выйти</span>
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
                {/* ═══ HERO BANNER with Level ═══ */}
                <div className="relative rounded-3xl overflow-hidden mb-6 border border-white/[0.08]"
                    style={{ background: `linear-gradient(135deg, ${levelInfo.rankColor}15, #050508 60%, ${levelInfo.rankColor}08)` }}>
                    <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20"
                        style={{ background: levelInfo.rankColor }} />
                    <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-28 h-28 rounded-2xl flex items-center justify-center border-2 relative overflow-hidden"
                                style={{ borderColor: `${levelInfo.rankColor}40`, background: `${levelInfo.rankColor}10` }}>
                                {(isEditing ? editData.avatar_url : metadata?.avatar_url) ? (
                                    <img src={isEditing ? editData.avatar_url : metadata?.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-14 h-14" style={{ color: levelInfo.rankColor }} />
                                )}
                            </div>
                            {isEditing && (
                                <button onClick={() => document.getElementById('avatar-input')?.click()}
                                    disabled={saving}
                                    className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl border-4 border-[#050508] text-white hover:scale-110 transition-transform">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    <input id="avatar-input" type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                </button>
                            )}
                            {/* Level badge */}
                            <div className="absolute -top-2 -left-2 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2"
                                style={{ background: levelInfo.rankColor, borderColor: '#050508', color: '#050508' }}>
                                {levelInfo.level}
                            </div>
                        </div>

                        {/* User info */}
                        <div className="flex-1 text-center md:text-left">
                            {isEditing ? (
                                <input value={editData.fullName}
                                    onChange={e => setEditData(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full text-xl font-bold mb-2 focus:border-primary/50 outline-none" />
                            ) : (
                                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1">
                                    {metadata?.fullName || 'Студент TSP'}
                                </h1>
                            )}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                                    style={{ background: `${levelInfo.rankColor}15`, color: levelInfo.rankColor, border: `1px solid ${levelInfo.rankColor}30` }}>
                                    <Zap className="w-3 h-3" /> {levelInfo.rank}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" />
                                    {metadata?.role === 'teacher' ? 'Преподаватель' : `${metadata?.role || 'Студент'} // ${metadata?.group || ''}`}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] font-black text-white/40 uppercase tracking-widest">
                                    {metadata?.id}
                                </span>
                            </div>
                            {/* XP Bar */}
                            <div className="max-w-md">
                                <div className="flex justify-between text-[9px] font-bold text-white/30 mb-1">
                                    <span>Уровень {levelInfo.level}</span>
                                    <span>{levelInfo.xpIntoLevel} / {levelInfo.xpNeededForNext} XP</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progressPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ background: `linear-gradient(90deg, ${levelInfo.rankColor}80, ${levelInfo.rankColor})`,
                                            boxShadow: `0 0 15px ${levelInfo.rankGlow}` }} />
                                </div>
                            </div>
                        </div>

                        {/* Edit/Save buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} disabled={saving}
                                        className="px-6 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary/80 transition-all disabled:opacity-50">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
                                    </button>
                                    <button onClick={() => setIsEditing(false)}
                                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                                        <X className="w-4 h-4" /> Отмена
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group">
                                    <Settings className="w-4 h-4 text-white/40 group-hover:rotate-90 transition-transform duration-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Изменить</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ BIO (editable) ═══ */}
                {isEditing && (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 block">Возраст</label>
                                <input value={editData.age}
                                    onChange={e => setEditData(prev => ({ ...prev, age: e.target.value }))}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 block">О себе</label>
                                <textarea value={editData.bio}
                                    onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full text-xs min-h-[60px] outline-none focus:border-primary/50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STATS ROW ═══ */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    <MiniStat icon={Zap} label="Всего XP" value={levelInfo.currentXP.toLocaleString()} color="#fbbf24" />
                    <MiniStat icon={Code2} label="Задач" value={xpData.userStats.tasks_solved.toString()} color="#22c55e" />
                    <MiniStat icon={Swords} label="Побед" value={xpData.userStats.battles_won.toString()} color="#f59e0b" />
                    <MiniStat icon={Flame} label="Стрик" value={`${xpData.userStats.current_streak}д.`} color="#ef4444" />
                    <MiniStat icon={Trophy} label="Рейтинг" value={xpData.userStats.battle_elo.toString()} color="#a855f7" />
                    <MiniStat icon={Award} label="Ачивки" value={`${unlockedCount}/${totalAchievements}`} color="#3b82f6" />
                </div>

                {/* ═══ ACHIEVEMENTS GRID ═══ */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Достижения</h3>
                        <span className="text-[9px] font-bold text-white/20 ml-auto">{unlockedCount}/{totalAchievements}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
                        {(xpData.achievements.length > 0 ? xpData.achievements : defaultAchievements).map(ach => {
                            const unlocked = xpData.unlockedSlugs.has(ach.slug);
                            return (
                                <motion.div key={ach.id} whileHover={{ scale: 1.1 }}
                                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer group transition-all
                                        ${unlocked ? 'border-white/10 bg-white/[0.03]' : 'border-white/[0.04] bg-white/[0.01] opacity-30 grayscale'}`}
                                    title={`${ach.title_ru} — ${ach.description_ru}`}>
                                    <span className="text-xl mb-0.5">{ach.icon}</span>
                                    <span className="text-[7px] font-black text-center text-white/50 leading-tight">{ach.title_ru}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* ═══ ACADEMIC PROGRESS ═══ */}
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tighter">Академический Рост</h3>
                                <span className="text-[8px] font-black tracking-widest text-white/20 uppercase">Прогресс по темам</span>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <ProgressItem label="Основы Python" progress={progress.fundamentals} color="#a855f7" />
                            <ProgressItem label="Логика и Алгоритмы" progress={progress.logic} color="#22c55e" />
                            <ProgressItem label="Работа с Данными" progress={progress.data} color="#f59e0b" />
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/10 flex items-center gap-4">
                            <GraduationCap className="w-8 h-8 text-blue-400 flex-shrink-0" />
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-0.5">Путь к Бакалавру</h4>
                                <p className="text-[10px] text-white/30">{progress.totalCompletion}% учебного плана завершено</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══ RECENT XP HISTORY ═══ */}
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tighter">История XP</h3>
                                <span className="text-[8px] font-black tracking-widest text-white/20 uppercase">Последние действия</span>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {(xpData.recentXP.length > 0 ? xpData.recentXP : defaultXPHistory).map((entry, i) => (
                                <div key={entry.id || i}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <span className="text-sm">{sourceIcons[entry.source] || '⚡'}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-bold text-white/60 block truncate">{entry.description}</span>
                                        <span className="text-[8px] text-white/20">{timeAgo(entry.created_at)}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-amber-400 flex-shrink-0">+{entry.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══ BIO & INFO (non-editing) ═══ */}
                {!isEditing && (metadata?.bio || metadata?.age) && (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
                        <div className="flex gap-8">
                            {metadata?.age && (
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/25 block mb-1">Возраст</span>
                                    <span className="text-sm font-bold text-white/70">{metadata.age}</span>
                                </div>
                            )}
                            {metadata?.bio && (
                                <div className="flex-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/25 block mb-1">О себе</span>
                                    <p className="text-xs text-white/50 italic leading-relaxed">{metadata.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══ Helper Components ═══

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    return (
        <div className="rounded-xl p-3 border border-white/[0.06] flex flex-col items-center text-center"
            style={{ background: `${color}06` }}>
            <Icon className="w-4 h-4 mb-1.5" style={{ color }} />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">{label}</span>
            <span className="text-lg font-black" style={{ color }}>{value}</span>
        </div>
    );
}

function ProgressItem({ label, progress, color }: { label: string; progress: number; color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-white/50">{label}</span>
                <span style={{ color }}>{progress}%</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 10px ${color}40` }} />
            </div>
        </div>
    );
}

// ═══ Constants ═══

const sourceIcons: Record<string, string> = {
    task: '💻', battle: '⚔️', achievement: '🏆', peer_review: '🤝',
    daily_login: '📅', streak_bonus: '🔥', first_blood: '🩸',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ч`;
    return `${Math.floor(hrs / 24)} д`;
}

const defaultAchievements = [
    { id: '1', slug: 'first_blood', title_ru: 'Первая кровь', description_ru: 'Решите первую задачу', icon: '🩸', rarity: 'common' as const, xp_bonus: 50 },
    { id: '2', slug: 'code_warrior', title_ru: 'Кодовый воин', description_ru: '10 задач', icon: '⚔️', rarity: 'common' as const, xp_bonus: 100 },
    { id: '3', slug: 'clean_code', title_ru: 'Чистый код', description_ru: '100/100 первая попытка', icon: '✨', rarity: 'rare' as const, xp_bonus: 150 },
    { id: '4', slug: 'night_coder', title_ru: 'Ночной кодер', description_ru: 'После полуночи', icon: '🌙', rarity: 'rare' as const, xp_bonus: 100 },
    { id: '5', slug: 'streak_3', title_ru: 'В огне', description_ru: 'Стрик 3 дня', icon: '🔥', rarity: 'common' as const, xp_bonus: 75 },
    { id: '6', slug: 'streak_7', title_ru: 'Неудержимый', description_ru: 'Стрик 7 дней', icon: '💪', rarity: 'rare' as const, xp_bonus: 200 },
    { id: '7', slug: 'first_battle', title_ru: 'Новичок арены', description_ru: 'Выиграть баттл', icon: '🏟️', rarity: 'common' as const, xp_bonus: 100 },
    { id: '8', slug: 'centurion', title_ru: 'Центурион', description_ru: '100 задач', icon: '🏛️', rarity: 'epic' as const, xp_bonus: 500 },
    { id: '9', slug: 'streak_30', title_ru: 'Легенда', description_ru: 'Стрик 30 дней', icon: '👑', rarity: 'legendary' as const, xp_bonus: 1000 },
    { id: '10', slug: 'hacker_elite', title_ru: 'Хакер', description_ru: 'CyberSec победа', icon: '🛡️', rarity: 'epic' as const, xp_bonus: 400 },
];

const defaultXPHistory = [
    { id: '1', amount: 50, source: 'task', description: 'Решена задача: Fibonacci', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', amount: 75, source: 'battle', description: 'Победа в Algorithm Arena', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', amount: 10, source: 'daily_login', description: 'Ежедневный вход', created_at: new Date(Date.now() - 86400000).toISOString() },
];
