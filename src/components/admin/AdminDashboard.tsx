import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Shield, Users, GraduationCap, Award, Search,
    ChevronDown, ChevronUp, Edit3, Save, Trash2, Eye,
    BarChart3, UserCheck, Clock, Star, MessageSquareCode,
    Bell, CheckCircle2, History, Filter, Undo2, Brain, BookOpen, ShieldAlert
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

interface ActivityLogRecord {
    id: string;
    user_uuid: string;
    action: string;
    details: any;
    created_at: string;
}

interface ProctorLogRecord {
    id: string;
    uuid: string;
    type: string;
    task_id: string;
    timestamp: number;
    count: number;
    created_at: string;
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
    const [registrationLogs, setRegistrationLogs] = useState<RegistrationLog[]>([]);
    const [teacherLogs, setTeacherLogs] = useState<TeacherLog[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLogRecord[]>([]);
    const [proctorLogs, setProctorLogs] = useState<ProctorLogRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'submissions' | 'assignments' | 'reg-logs' | 'activity-logs' | 'proctor-logs' | 'teacher-logs'>('users');
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'group' | 'date'>('date');
    const [moderatorUuid, setModeratorUuid] = useState<string | null>(null);

    const fetchData = async () => {
        // Fetch Users
        const { data: userData } = await supabase.from('users').select('*');
        if (userData) setUsers(userData.map((u: any) => ({ uid: u.uuid, ...u })));

        // Fetch Submissions
        const { data: subData } = await supabase.from('submissions').select('*').order('submitted_at', { ascending: false });
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
            const { data: regData } = await supabase.from('registration_logs').select('*').order('registered_at', { ascending: false }).limit(50);
            if (regData) setRegistrationLogs(regData);
        } catch { /* table may not exist yet */ }

        // Fetch Activity Logs
        try {
            const { data: actData } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (actData) setActivityLogs(actData);
        } catch { /* table may not exist yet */ }

        // Fetch Proctor Logs
        try {
            const { data: procData } = await supabase.from('proctor_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (procData) setProctorLogs(procData);
        } catch { /* table may not exist yet */ }

        // Fetch Teacher Logs
        try {
            const { data: teachData } = await supabase.from('teacher_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (teachData) setTeacherLogs(teachData);
        } catch { /* table may not exist yet */ }

        // Fetch moderator uuid
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) setModeratorUuid(authUser.id);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        if (!isOpen) return;
        fetchData();
        const userSub = supabase.channel('users-all').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchData()).subscribe();
        return () => { userSub.unsubscribe(); };
    }, [isOpen]);

    const handleRoleChange = async (uid: string, newRole: string) => {
        try {
            const { error } = await supabase.from('users').update({ role: newRole }).eq('uuid', uid);
            if (error) throw error;
            toast.success("Роль обновлена");
            fetchData();
        } catch {
            toast.error("Ошибка обновления роли");
        }
    };

    const handleToggleBan = async (uid: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('users').update({ is_banned: !currentStatus }).eq('uuid', uid);
            if (error) throw error;
            toast.success(currentStatus ? "Доступ восстановлен" : "Пользователь заблокирован");
            fetchData();
        } catch {
            toast.error("Ошибка при смене статуса");
        }
    };

    const handleDeleteUser = async (uid: string, name: string) => {
        if (!confirm(`Удалить пользователя ${name}? Это действие нельзя отменить.`)) return;
        try {
            const { error } = await supabase.from('users').delete().eq('uuid', uid);
            if (error) throw error;
            toast.success("Пользователь удалён");
            fetchData();
        } catch {
            toast.error("Ошибка удаления");
        }
    };

    const handleManualGrade = async (uid: string, taskId: string, oldScore: number) => {
        const newVal = prompt(`Изменение оценки для ${taskId}. Текущая: ${oldScore}. Введите новую:`, String(oldScore));
        if (newVal === null) return;
        const score = parseInt(newVal);
        if (isNaN(score) || score < 0 || score > 100) { toast.error("Неверная оценка"); return; }
        try {
            const { error } = await supabase.from('submissions').update({ review_score: score, status: 'reviewed' }).match({ task_id: taskId, uuid: uid });
            if (error) throw error;
            toast.success("Оценка обновлена");
            fetchData();
        } catch { toast.error("Ошибка"); }
    };

    const filteredUsers = users
        .filter(u => {
            if (filterRole !== 'all' && u.role !== filterRole) return false;
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
        .sort((a, b) => sortBy === 'name' ? (a.fullName || '').localeCompare(b.fullName || '') : (b.createdAt || 0) - (a.createdAt || 0));

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        banned: users.filter(u => u.is_banned).length,
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] bg-[#020205]/95 backdrop-blur-2xl overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 z-50 bg-[#020205]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-400/30">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tight text-white">Панель Модератора</h1>
                            </div>
                        </div>

                        <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'users', label: 'Люди', icon: Users },
                                { id: 'submissions', label: 'Работы', icon: MessageSquareCode },
                                { id: 'assignments', label: 'Задания', icon: BookOpen },
                                { id: 'reg-logs', label: 'Рег.', icon: History },
                                { id: 'activity-logs', label: 'Активность', icon: Clock },
                                { id: 'proctor-logs', label: 'Проктор', icon: ShieldAlert },
                                { id: 'teacher-logs', label: 'Учителя', icon: GraduationCap },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20'
                                        : 'text-white/40 hover:text-white'
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
                    {/* Stats mini-cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatItem label="Всего" value={stats.total} icon={Users} color="text-blue-400" />
                        <StatItem label="Студенты" value={stats.students} icon={GraduationCap} color="text-green-400" />
                        <StatItem label="Учителя" value={stats.teachers} icon={UserCheck} color="text-purple-400" />
                        <StatItem label="В бане" value={stats.banned} icon={ShieldAlert} color="text-red-400" />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                placeholder="Поиск по базе..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none"
                            />
                        </div>
                    </div>

                    {activeTab === 'users' && (
                        <div className="space-y-3">
                            {filteredUsers.map(user => (
                                <div key={user.uid} className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-colors ${user.is_banned ? 'border-red-500/20' : 'border-white/10'}`}>
                                    <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={() => setExpandedUser(expandedUser === user.uid ? null : user.uid)}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${user.is_banned ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                            {user.fullName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold ${user.is_banned ? 'text-red-400' : 'text-white'}`}>{user.fullName}</p>
                                            <p className="text-xs text-white/30">{user.id} · {user.group}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black uppercase text-white/40">{user.role}</span>
                                            {user.is_banned && <span className="bg-red-500/20 text-red-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Banned</span>}
                                        </div>
                                    </div>
                                    {expandedUser === user.uid && (
                                        <div className="p-5 border-t border-white/5 bg-black/20 text-sm">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <DetailBox label="Email" value={user.email} />
                                                <DetailBox label="Группа" value={user.group} />
                                                <DetailBox label="Активность" value={user.last_active_at ? new Date(user.last_active_at).toLocaleString() : '---'} />
                                                <DetailBox label="ID" value={user.id} />
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => handleToggleBan(user.uid, user.is_banned || false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${user.is_banned ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}>
                                                    {user.is_banned ? 'Разблокировать' : 'Заблокировать'}
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.uid, user.fullName)} className="text-[10px] text-white/20 hover:text-red-400 font-black uppercase transition-colors">Удалить из БД</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'submissions' && (
                        <div className="space-y-3">
                            {submissions.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Нет работ.</p>
                            ) : submissions.map((sub) => (
                                <div key={sub.taskId + sub.userId} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-white">{sub.studentName}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{sub.taskId} · {new Date(sub.submittedAt).toLocaleString()}</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-white/5 text-lg font-black text-white">{sub.score}</div>
                                    </div>
                                    <pre className="p-3 bg-black/40 rounded-lg text-[10px] text-blue-300 font-mono overflow-auto max-h-32 mb-3">{sub.code}</pre>
                                    <button onClick={() => handleManualGrade(sub.userId, sub.taskId, sub.score)} className="text-[9px] font-black uppercase text-amber-400 hover:underline">Изменить оценку</button>
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
                                <div key={log.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="w-5 h-5 text-green-400" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{log.full_name}</p>
                                            <p className="text-[10px] text-white/30">{log.email} · {log.group}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-white/20">{new Date(log.registered_at).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Activity Logs Tab */}
                    {activeTab === 'activity-logs' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Логи Активности</h3>
                            {activityLogs.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Нет логов активности. Убедитесь что таблица activity_logs создана в Supabase.</p>
                            ) : activityLogs.map(log => {
                                const user = users.find(u => u.uid === log.user_uuid);
                                return (
                                    <div key={log.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-white/30" />
                                            </div>
                                            <div>
                                                <span className="text-white/60 font-bold">{user?.fullName || 'Система'}</span>
                                                <span className="text-white/20 mx-2">→</span>
                                                <span className="text-amber-400 uppercase font-black tracking-widest text-[9px]">{log.action}</span>
                                            </div>
                                        </div>
                                        <span className="text-white/20">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Proctor Logs Tab */}
                    {activeTab === 'proctor-logs' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">Логи Прокторинга</h3>
                            {proctorLogs.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-8">Нет логов прокторинга. Убедитесь что таблица proctor_logs создана в Supabase.</p>
                            ) : proctorLogs.map(log => {
                                const user = users.find(u => u.uid === log.uuid);
                                return (
                                    <div key={log.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{user?.fullName || 'ID: ' + log.uuid}</p>
                                                <p className="text-[10px] text-red-400/60 uppercase font-black">
                                                    {log.type === 'tab_switch' ? 'Переключение вкладки' : log.type} · Раз: {log.count}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/30">Задача: {log.task_id}</p>
                                            <p className="text-[10px] text-white/20">{new Date(log.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                );
                            })}
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

function StatItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
                <p className="text-xl font-black text-white">{value}</p>
                <p className="text-[10px] uppercase font-bold text-white/20">{label}</p>
            </div>
        </div>
    );
}

function DetailBox({ label, value }: { label: string, value: any }) {
    return (
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[9px] text-white/20 uppercase font-black mb-1">{label}</p>
            <p className="text-xs text-white/70 truncate">{value || '---'}</p>
        </div>
    );
}
