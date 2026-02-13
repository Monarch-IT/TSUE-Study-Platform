import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Shield, Users, GraduationCap, Award, Search,
    ChevronDown, ChevronUp, Edit3, Save, Trash2, Eye,
    BarChart3, UserCheck, Clock, Star, MessageSquareCode,
    Bell, CheckCircle2, History, Filter, Undo2, Brain, BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TSPUserMetadata } from '@/hooks/useAuth';
import { toast } from 'sonner';
import AdminAssignmentManager from './AdminAssignmentManager';

interface RegistrationLog {
    id: number;
    full_name: string;
    email: string;
    group: string;
    course: number;
    provider: string;
    tsue_id: string;
    registered_at: string;
}

interface TeacherLog {
    id: number;
    teacher_name: string;
    action: string;
    target_type: string;
    target_name: string;
    details: any;
    created_at: string;
}

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserRecord extends TSPUserMetadata {
    uid: string;
}

interface SubmissionRecord {
    taskId: string;
    userId: string;
    studentName: string;
    score: number;
    feedback: string;
    code: string;
    submittedAt: number;
    status: 'submitted' | 'reviewed';
    metrics?: any;
}

interface NotificationRecord {
    id: string;
    type: 'appeal' | 'override' | 'alert';
    message: string;
    timestamp: number;
    read: boolean;
    from: string;
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [registrationLogs, setRegistrationLogs] = useState<RegistrationLog[]>([]);
    const [teacherLogs, setTeacherLogs] = useState<TeacherLog[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'submissions' | 'notifications' | 'reg-logs' | 'sub-logs' | 'teacher-logs' | 'assignments'>('users');
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
    const [editingScore, setEditingScore] = useState<{ uid: string; topic: string } | null>(null);
    const [newScoreValue, setNewScoreValue] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'group' | 'date'>('date');
    const [moderatorUuid, setModeratorUuid] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            // Fetch Users
            const { data: userData } = await supabase.from('users').select('*');
            if (userData) setUsers(userData.map((u: any) => ({ uid: u.uuid, ...u })));

            // Fetch Submissions
            const { data: subData } = await supabase.from('submissions').select('*');
            if (subData) {
                setSubmissions(subData.map((s: any) => ({
                    taskId: s.task_id,
                    userId: s.uuid,
                    studentName: s.student_name,
                    score: s.review_score,
                    feedback: s.review_feedback,
                    code: s.code,
                    submittedAt: s.submitted_at,
                    status: s.status,
                    metrics: s.review_metrics
                })));
            }

            // Fetch Registration Logs
            try {
                const { data: regData } = await supabase.from('registration_logs').select('*').order('registered_at', { ascending: false });
                if (regData) setRegistrationLogs(regData);
            } catch { /* table may not exist yet */ }

            // Fetch Teacher Logs
            try {
                const { data: teachData } = await supabase.from('teacher_logs').select('*').order('created_at', { ascending: false });
                if (teachData) setTeacherLogs(teachData);
            } catch { /* table may not exist yet */ }

            // Fetch moderator uuid
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) setModeratorUuid(authUser.id);
            } catch { /* ignore */ }
        };

        fetchData();

        // Subscriptions
        const userSub = supabase.channel('users-all').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchData()).subscribe();
        const subSub = supabase.channel('submissions-all').on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => fetchData()).subscribe();

        return () => {
            userSub.unsubscribe();
            subSub.unsubscribe();
        };
    }, [isOpen]);

    const groups = [...new Set(users.map(u => u.group).filter(Boolean))].sort();

    const filteredUsers = users
        .filter(u => {
            if (filterRole !== 'all' && u.role !== filterRole) return false;
            if (filterGroup !== 'all' && u.group !== filterGroup) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    u.fullName?.toLowerCase().includes(q) ||
                    u.id?.toLowerCase().includes(q) ||
                    u.group?.toLowerCase().includes(q)
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '');
            if (sortBy === 'group') return (a.group || '').localeCompare(b.group || '');
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        moderators: users.filter(u => u.role === 'moderator').length,
    };

    const handleRoleChange = async (uid: string, newRole: string) => {
        try {
            const { error } = await supabase.from('users').update({ role: newRole }).eq('uuid', uid);
            if (error) throw error;
            toast.success("Роль обновлена");
        } catch {
            toast.error("Ошибка обновления роли");
        }
    };

    const handleScoreSave = async (uid: string, topic: string) => {
        const val = parseInt(newScoreValue);
        if (isNaN(val) || val < 0) {
            toast.error("Введите корректный балл");
            return;
        }
        try {
            const user = users.find(u => u.uid === uid);
            if (!user) return;
            const newScores = { ...(user.scores || {}), [topic]: val };
            const { error } = await supabase.from('users').update({ scores: newScores }).eq('uuid', uid);
            if (error) throw error;
            toast.success("Балл обновлён");
            setEditingScore(null);
            setNewScoreValue('');
        } catch {
            toast.error("Ошибка");
        }
    };

    const handleDeleteUser = async (uid: string, name: string) => {
        if (!confirm(`Удалить пользователя ${name}? Это действие нельзя отменить.`)) return;
        try {
            const { error } = await supabase.from('users').delete().eq('uuid', uid);
            if (error) throw error;
            toast.success("Пользователь удалён из базы");
        } catch {
            toast.error("Ошибка удаления");
        }
    };

    const handleManualGrade = async (uid: string, taskId: string, oldScore: number) => {
        const newVal = prompt(`Изменение оценки для ${taskId}. Текущая: ${oldScore}. Введите новую:`, String(oldScore));
        if (newVal === null) return;
        const score = parseInt(newVal);
        if (isNaN(score) || score < 0 || score > 100) {
            toast.error("Неверный формат оценки");
            return;
        }

        try {
            const { error } = await supabase.from('submissions').update({
                review_score: score,
                status: 'reviewed'
            }).match({ task_id: taskId, uuid: uid });
            if (error) throw error;
            toast.success("Оценка обновлена.");
        } catch {
            toast.error("Ошибка при обновлении");
        }
    };

    const topicLabels: Record<string, string> = {
        intro: 'Введение', structure: 'Структура', conditions: 'Условия',
        loops: 'Циклы', functions: 'Функции', files: 'Файлы',
        strings: 'Строки', lists: 'Списки', tuples: 'Кортежи',
        dicts: 'Словари', sets: 'Множества', modules: 'Модули',
        exceptions: 'Исключения', gui: 'GUI', database: 'Базы данных',
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] bg-background/95 backdrop-blur-2xl overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-amber-400/20 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-400/30">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tight text-white">Панель Модератора</h1>
                                <p className="text-xs text-amber-400/60 font-bold uppercase tracking-widest">TSUE Monarch</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
                            {[
                                { id: 'users', label: 'Пользователи', icon: Users },
                                { id: 'submissions', label: 'Работы', icon: MessageSquareCode },
                                { id: 'assignments', label: 'Задания', icon: BookOpen },
                                { id: 'reg-logs', label: 'Логи рег.', icon: History },
                                { id: 'sub-logs', label: 'Логи работ', icon: BarChart3 },
                                { id: 'teacher-logs', label: 'Логи уч.', icon: GraduationCap },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id
                                        ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20'
                                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Всего', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
                            { label: 'Студенты', value: stats.students, icon: GraduationCap, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
                            { label: 'Учителя', value: stats.teachers, icon: UserCheck, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
                            { label: 'Модераторы', value: stats.moderators, icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className={`${bg} border rounded-2xl p-4 flex items-center gap-3`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                                <div>
                                    <p className="text-2xl font-black text-white">{value}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Поиск по имени, ID, группе..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm appearance-none focus:outline-none"
                        >
                            <option value="all" className="bg-slate-900">Все роли</option>
                            <option value="student" className="bg-slate-900">Студенты</option>
                            <option value="teacher" className="bg-slate-900">Учителя</option>
                            <option value="moderator" className="bg-slate-900">Модераторы</option>
                        </select>
                        <button onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')} className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs font-black uppercase tracking-widest">
                            Сортировка: {sortBy === 'date' ? 'По дате' : 'По имени'}
                        </button>
                    </div>

                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user.uid} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={() => setExpandedUser(expandedUser === user.uid ? null : user.uid)}>
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                                            {user.fullName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold">{user.fullName}</p>
                                            <p className="text-xs text-white/30">{user.id} · {user.group}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-white/60 font-black uppercase">{user.role}</span>
                                    </div>
                                    {expandedUser === user.uid && (
                                        <div className="p-5 border-t border-white/5 bg-black/20 space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <p className="text-[10px] text-white/30 uppercase mb-1">Email</p>
                                                    <p className="text-xs text-white truncate">{user.email}</p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <p className="text-[10px] text-white/30 uppercase mb-1">Курс</p>
                                                    <p className="text-xs text-white">{user.course}</p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <p className="text-[10px] text-white/30 uppercase mb-1">Роль</p>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                        className="bg-transparent text-xs text-white font-black uppercase outline-none"
                                                    >
                                                        <option value="student" className="bg-slate-900">Student</option>
                                                        <option value="teacher" className="bg-slate-900">Teacher</option>
                                                        <option value="moderator" className="bg-slate-900">Moderator</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteUser(user.uid, user.fullName)} className="text-[10px] text-red-400 font-black uppercase hover:underline">
                                                Удалить пользователя
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'submissions' && (
                        <div className="space-y-4">
                            {submissions.map((sub) => (
                                <div key={`${sub.taskId}-${sub.userId}`} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-white">{sub.studentName}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{sub.taskId} · {new Date(sub.submittedAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">{sub.score}</p>
                                            <button onClick={() => handleManualGrade(sub.userId, sub.taskId, sub.score)} className="text-[8px] text-amber-400 uppercase font-black">Редактировать</button>
                                        </div>
                                    </div>
                                    <pre className="p-4 bg-black/40 rounded-xl text-[10px] text-blue-300 font-mono overflow-auto max-h-40">{sub.code}</pre>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Registration Logs Tab */}
                    {activeTab === 'reg-logs' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Логи Регистрации</h3>
                            {registrationLogs.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Нет логов регистрации. Убедитесь что таблица registration_logs создана в Supabase.</p>
                            ) : registrationLogs.map((log) => (
                                <div key={log.id} className="bg-white/[0.03] border border-green-400/10 rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-green-400/10 flex items-center justify-center border border-green-400/20">
                                                <UserCheck className="w-4 h-4 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{log.full_name}</p>
                                                <p className="text-[10px] text-white/30">{log.email} · {log.group} · Курс {log.course}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] px-2 py-1 rounded-full bg-green-400/10 text-green-400 font-bold uppercase">{log.provider}</span>
                                            <p className="text-[10px] text-white/20 mt-1">{new Date(log.registered_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/20 mt-2">ID: {log.tsue_id}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submission Logs Tab (enhanced detail) */}
                    {activeTab === 'sub-logs' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Логи Выполнения Самостоятельных Работ</h3>
                            {submissions.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Нет работ.</p>
                            ) : submissions.map((sub) => (
                                <div key={`log-${sub.taskId}-${sub.userId}`} className="bg-white/[0.03] border border-purple-400/10 rounded-2xl overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpandedSubmission(expandedSubmission === `${sub.taskId}-${sub.userId}` ? null : `${sub.taskId}-${sub.userId}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${sub.score >= 80 ? 'bg-green-400/10 border-green-400/20' : sub.score >= 50 ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20'}`}>
                                                <Star className={`w-4 h-4 ${sub.score >= 80 ? 'text-green-400' : sub.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{sub.studentName || 'Неизвестный'}</p>
                                                <p className="text-[10px] text-white/30">Задача: {sub.taskId} · Оценка: {sub.score}/100</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ${sub.status === 'reviewed' ? 'bg-blue-400/10 text-blue-400' : 'bg-orange-400/10 text-orange-400'}`}>{sub.status}</span>
                                            <p className="text-[10px] text-white/20 mt-1">{new Date(sub.submittedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {expandedSubmission === `${sub.taskId}-${sub.userId}` && (
                                        <div className="px-5 pb-4 border-t border-white/5 bg-black/20 space-y-3">
                                            {sub.feedback && (
                                                <div className="mt-3">
                                                    <p className="text-[10px] text-white/30 uppercase mb-1">Отзыв AI</p>
                                                    <p className="text-xs text-white/60">{sub.feedback}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] text-white/30 uppercase mb-1">Код студента</p>
                                                <pre className="p-3 bg-black/50 rounded-xl text-[10px] text-blue-300 font-mono overflow-auto max-h-52">{sub.code}</pre>
                                            </div>
                                            <button onClick={() => handleManualGrade(sub.userId, sub.taskId, sub.score)} className="text-[10px] text-amber-400 font-black uppercase hover:underline">Изменить оценку вручную</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Teacher Logs Tab */}
                    {activeTab === 'teacher-logs' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Логи Учителей</h3>
                            {teacherLogs.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Нет логов учителей. Таблица teacher_logs пуста или не создана.</p>
                            ) : teacherLogs.map((log) => (
                                <div key={log.id} className="bg-white/[0.03] border border-cyan-400/10 rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                                                <GraduationCap className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{log.teacher_name}</p>
                                                <p className="text-[10px] text-white/30">
                                                    {log.action === 'upload' ? '📤 Загружен файл' : log.action === 'grade' ? '📝 Оценка' : log.action === 'delete' ? '🗑️ Удалено' : '📋 Действие'}: {log.target_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] px-2 py-1 rounded-full bg-cyan-400/10 text-cyan-400 font-bold uppercase">{log.target_type}</span>
                                            <p className="text-[10px] text-white/20 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Assignments Tab (Moderator Assignment Manager) */}
                    {activeTab === 'assignments' && moderatorUuid && (
                        <div>
                            <AdminAssignmentManager userUuid={moderatorUuid} accentColor="amber" />
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
