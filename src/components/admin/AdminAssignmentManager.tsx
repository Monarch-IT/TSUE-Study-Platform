import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Trash2, BookOpen, ClipboardCheck,
    Loader2, BarChart3, Clock, CheckCircle2, XCircle,
    PenTool, Wand2, Eye, Upload, Brain
} from 'lucide-react';
import {
    getTeacherGroups, addTeacherGroup, deleteTeacherGroup,
    getStudentsInGroups, getTeacherAssignments, createAssignment,
    deleteAssignment, getSubmissionsForAssignment, updateSubmissionGrade,
    getActivityLogs, TeacherGroup, Assignment, AssignmentSubmission, ActivityLog
} from '@/lib/teacherService';
import { analyzeCodeQuality } from '@/lib/AIGradingService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Shared Assignment Manager component used by both Admin and Teacher dashboards.
 * Accepts a userUuid to scope all operations.
 */

interface Props {
    userUuid: string;
    accentColor?: string; // 'amber' for admin, 'emerald' for teacher
}

export default function AdminAssignmentManager({ userUuid, accentColor = 'amber' }: Props) {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'groups' | 'assignments' | 'grading'>('assignments');

    // Groups
    const [groups, setGroups] = useState<TeacherGroup[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [newGroupName, setNewGroupName] = useState('');

    // Assignments
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [showCreator, setShowCreator] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
        title: '', description: '', type: 'code' as 'quiz' | 'code' | 'theory',
        mode: 'manual' as 'auto' | 'manual', grading_mode: 'ai' as 'ai' | 'manual',
        target_groups: [] as string[],
    });
    const [manualTasks, setManualTasks] = useState<{ question: string; expected?: string }[]>([
        { question: '', expected: '' }
    ]);

    // Grading
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [gradingView, setGradingView] = useState<'submissions' | 'logs'>('submissions');

    // For moderators: load ALL groups system-wide (not just own groups)
    const loadGroups = useCallback(async () => {
        try {
            // Try loading own groups first
            const g = await getTeacherGroups(userUuid);
            setGroups(g);
            const groupNames = g.map(gr => gr.group_name);
            if (groupNames.length > 0) {
                const s = await getStudentsInGroups(groupNames);
                setStudents(s);
            }
        } catch (err) {
            console.error('Load groups error:', err);
        }
    }, [userUuid]);

    const loadAssignments = useCallback(async () => {
        try {
            const a = await getTeacherAssignments(userUuid);
            setAssignments(a);
        } catch (err) {
            console.error('Load assignments error:', err);
        }
    }, [userUuid]);

    useEffect(() => {
        loadGroups();
        loadAssignments();
    }, [loadGroups, loadAssignments]);

    // Group management
    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;
        setLoading(true);
        try {
            await addTeacherGroup(userUuid, newGroupName.trim().toUpperCase());
            setNewGroupName('');
            toast.success('Группа добавлена');
            loadGroups();
        } catch (err: any) {
            toast.error(err.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (id: number) => {
        try {
            await deleteTeacherGroup(id);
            toast.success('Группа удалена');
            loadGroups();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Assignment creation
    const toggleTargetGroup = (g: string) => {
        setAssignmentForm(prev => ({
            ...prev,
            target_groups: prev.target_groups.includes(g)
                ? prev.target_groups.filter(x => x !== g)
                : [...prev.target_groups, g]
        }));
    };

    const handleCreateAssignment = async () => {
        if (!assignmentForm.title.trim()) { toast.error('Введите название'); return; }
        if (assignmentForm.target_groups.length === 0) { toast.error('Выберите группы'); return; }
        setLoading(true);
        try {
            await createAssignment({
                teacher_uuid: userUuid,
                title: assignmentForm.title.trim(),
                description: assignmentForm.description.trim(),
                type: assignmentForm.type,
                mode: assignmentForm.mode,
                grading_mode: assignmentForm.grading_mode,
                target_groups: assignmentForm.target_groups,
                manual_content: assignmentForm.mode === 'manual' ? manualTasks.filter(t => t.question.trim()) : [],
                status: 'active',
            });
            toast.success('Задание создано!');
            setShowCreator(false);
            setAssignmentForm({ title: '', description: '', type: 'code', mode: 'manual', grading_mode: 'ai', target_groups: [] });
            setManualTasks([{ question: '', expected: '' }]);
            loadAssignments();
        } catch (err: any) {
            toast.error(err.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssignment = async (id: number) => {
        try {
            await deleteAssignment(id);
            toast.success('Задание удалено');
            loadAssignments();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Grading
    const loadSubmissions = async (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setView('grading');
        try {
            const subs = await getSubmissionsForAssignment(assignment.id);
            setSubmissions(subs);
            const l = await getActivityLogs(assignment.id);
            setLogs(l);
        } catch (err) {
            console.error('Load submissions error:', err);
        }
    };

    const handleAIGradeAll = async () => {
        if (!selectedAssignment) return;
        setLoading(true);
        const ungraded = submissions.filter(s => !s.ai_score && s.code);
        for (const sub of ungraded) {
            try {
                const result = await analyzeCodeQuality(sub.code || '', selectedAssignment.title, true);
                await updateSubmissionGrade(sub.id, {
                    ai_score: result.score,
                    ai_feedback: result.feedback,
                    ai_metrics: result.metrics,
                    status: 'ai_graded',
                    graded_at: Date.now(),
                });
            } catch (err) {
                console.error('Grading error for', sub.student_name, err);
            }
        }
        toast.success(`ИИ оценил ${ungraded.length} работ`);
        loadSubmissions(selectedAssignment);
        setLoading(false);
    };

    const accent = accentColor === 'amber' ? {
        bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300',
        btn: 'bg-amber-600 hover:bg-amber-500', btnText: 'text-white',
        tabActive: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    } : {
        bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300',
        btn: 'bg-emerald-600 hover:bg-emerald-500', btnText: 'text-white',
        tabActive: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    };

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-4">
                {[
                    { id: 'groups' as const, label: 'Группы', icon: Users, count: groups.length },
                    { id: 'assignments' as const, label: 'Задания', icon: BookOpen, count: assignments.length },
                    { id: 'grading' as const, label: 'Оценки', icon: ClipboardCheck, count: submissions.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${view === tab.id ? accent.tabActive : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/10">{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Groups */}
            {view === 'groups' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex gap-2 mb-4">
                        <input
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="Название группы (напр. AT-31/25)"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:border-amber-500/50 focus:outline-none"
                            onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                        />
                        <button
                            onClick={handleAddGroup}
                            disabled={loading || !newGroupName.trim()}
                            className={`px-5 py-3 rounded-xl ${accent.btn} disabled:opacity-40 text-white font-bold text-sm transition-all flex items-center gap-2`}
                        >
                            <Plus className="w-4 h-4" /> Добавить
                        </button>
                    </div>
                    <div className="grid gap-3">
                        {groups.length === 0 && (
                            <div className="text-center py-8 text-white/30">
                                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Нет групп. Добавьте группу выше.</p>
                            </div>
                        )}
                        {groups.map(g => {
                            const gs = students.filter(s => s.group === g.group_name);
                            return (
                                <div key={g.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center`}>
                                                <Users className={`w-4 h-4 ${accent.text}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">{g.group_name}</h3>
                                                <p className="text-xs text-white/40">{gs.length} студентов</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteGroup(g.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {gs.length > 0 && (
                                        <div className="grid gap-1 ml-11">
                                            {gs.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-white/50 py-1 px-2 rounded-lg hover:bg-white/5">
                                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/60">
                                                        {(s.fullName || '?')[0]}
                                                    </div>
                                                    <span className="text-white/70">{s.fullName || 'Без имени'}</span>
                                                    <span className="text-white/20 ml-auto text-[10px]">{s.id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Assignments */}
            {view === 'assignments' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {!showCreator ? (
                        <>
                            <button
                                onClick={() => setShowCreator(true)}
                                className={`w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:${accent.border} text-white/40 hover:${accent.text} font-bold text-sm transition-all flex items-center justify-center gap-2 mb-4`}
                            >
                                <Plus className="w-5 h-5" /> Создать задание
                            </button>
                            <div className="grid gap-3">
                                {assignments.length === 0 && (
                                    <div className="text-center py-8 text-white/30">
                                        <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Нет заданий.</p>
                                    </div>
                                )}
                                {assignments.map(a => (
                                    <div key={a.id} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${a.type === 'code' ? 'bg-blue-500/20 text-blue-300' :
                                                            a.type === 'quiz' ? 'bg-purple-500/20 text-purple-300' :
                                                                'bg-orange-500/20 text-orange-300'
                                                        }`}>{a.type === 'code' ? 'Код' : a.type === 'quiz' ? 'Квиз' : 'Теория'}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${a.grading_mode === 'ai' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                                                        }`}>{a.grading_mode === 'ai' ? 'ИИ' : 'Ручная'}</span>
                                                </div>
                                                <h3 className="font-bold text-white text-sm mb-1">{a.title}</h3>
                                                {a.description && <p className="text-xs text-white/40 mb-2">{a.description}</p>}
                                                <div className="flex gap-1 flex-wrap">
                                                    {a.target_groups?.map(g => (
                                                        <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{g}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3">
                                                <button onClick={() => loadSubmissions(a)} className={`p-2 rounded-lg ${accent.bg} hover:opacity-80 ${accent.text} transition-all`} title="Оценки">
                                                    <ClipboardCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteAssignment(a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Assignment Creator */
                        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <PenTool className={`w-5 h-5 ${accent.text}`} />
                                    Новое задание
                                </h2>
                                <button onClick={() => setShowCreator(false)} className="text-white/30 hover:text-white/60 text-sm">Отмена</button>
                            </div>
                            <div className="space-y-4">
                                <input
                                    value={assignmentForm.title}
                                    onChange={e => setAssignmentForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Название задания"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none"
                                />
                                <textarea
                                    value={assignmentForm.description}
                                    onChange={e => setAssignmentForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Описание задания"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none resize-none"
                                />

                                {/* Type */}
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Тип</label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'code', label: '💻 Код' },
                                            { value: 'quiz', label: '📝 Квиз' },
                                            { value: 'theory', label: '📖 Теория' },
                                        ].map(t => (
                                            <button
                                                key={t.value}
                                                onClick={() => setAssignmentForm(p => ({ ...p, type: t.value as any }))}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${assignmentForm.type === t.value
                                                        ? `${accent.bg} ${accent.border} ${accent.text} border`
                                                        : 'bg-white/5 border border-white/10 text-white/50'
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mode */}
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Режим</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setAssignmentForm(p => ({ ...p, mode: 'manual' }))}
                                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${assignmentForm.mode === 'manual' ? 'bg-white/10 border-white/30 text-white border' : 'bg-white/5 border border-white/10 text-white/50'
                                                }`}
                                        >
                                            <PenTool className="w-4 h-4" /> Ручной
                                        </button>
                                        <button
                                            onClick={() => setAssignmentForm(p => ({ ...p, mode: 'auto' }))}
                                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${assignmentForm.mode === 'auto' ? `${accent.bg} ${accent.border} ${accent.text} border` : 'bg-white/5 border border-white/10 text-white/50'
                                                }`}
                                        >
                                            <Wand2 className="w-4 h-4" /> Авто-генерация
                                        </button>
                                    </div>
                                </div>

                                {/* Manual tasks */}
                                {assignmentForm.mode === 'manual' && (
                                    <div>
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Задания</label>
                                        {manualTasks.map((task, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input
                                                    value={task.question}
                                                    onChange={e => {
                                                        const newTasks = [...manualTasks];
                                                        newTasks[i].question = e.target.value;
                                                        setManualTasks(newTasks);
                                                    }}
                                                    placeholder={`Задание ${i + 1}`}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none"
                                                />
                                                {manualTasks.length > 1 && (
                                                    <button onClick={() => setManualTasks(manualTasks.filter((_, idx) => idx !== i))} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={() => setManualTasks([...manualTasks, { question: '', expected: '' }])} className={`text-xs ${accent.text} hover:opacity-80 mt-1 flex items-center gap-1`}>
                                            <Plus className="w-3 h-3" /> Добавить задание
                                        </button>
                                    </div>
                                )}

                                {/* Auto mode */}
                                {assignmentForm.mode === 'auto' && (
                                    <div className={`${accent.bg} rounded-xl border ${accent.border} p-4`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Upload className={`w-5 h-5 ${accent.text}`} />
                                            <span className={`text-sm font-bold ${accent.text}`}>Авто-генерация из документа</span>
                                        </div>
                                        <p className="text-xs text-white/40">
                                            Загрузите Word/PDF — ИИ автоматически создаст задания. Доступно после развёртывания бекенда.
                                        </p>
                                    </div>
                                )}

                                {/* Grading mode */}
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Оценивание</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setAssignmentForm(p => ({ ...p, grading_mode: 'ai' }))}
                                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${assignmentForm.grading_mode === 'ai' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 border' : 'bg-white/5 border border-white/10 text-white/50'
                                                }`}
                                        >
                                            <Brain className="w-4 h-4" /> ИИ
                                        </button>
                                        <button
                                            onClick={() => setAssignmentForm(p => ({ ...p, grading_mode: 'manual' }))}
                                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${assignmentForm.grading_mode === 'manual' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 border' : 'bg-white/5 border border-white/10 text-white/50'
                                                }`}
                                        >
                                            <Eye className="w-4 h-4" /> Ручная
                                        </button>
                                    </div>
                                </div>

                                {/* Target groups */}
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Для групп</label>
                                    <div className="flex flex-wrap gap-2">
                                        {groups.map(g => (
                                            <button
                                                key={g.id}
                                                onClick={() => toggleTargetGroup(g.group_name)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${assignmentForm.target_groups.includes(g.group_name)
                                                        ? `${accent.bg} ${accent.border} ${accent.text} border`
                                                        : 'bg-white/5 border border-white/10 text-white/50'
                                                    }`}
                                            >
                                                {g.group_name}
                                            </button>
                                        ))}
                                        {groups.length === 0 && <p className="text-xs text-white/30">Сначала добавьте группы</p>}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateAssignment}
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl ${accent.btn} disabled:opacity-40 text-white font-bold transition-all flex items-center justify-center gap-2`}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Создать задание
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Grading */}
            {view === 'grading' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {!selectedAssignment ? (
                        <div className="text-center py-8 text-white/30">
                            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Выберите задание из вкладки "Задания" для просмотра оценок</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-white">{selectedAssignment.title}</h3>
                                    <p className="text-xs text-white/40">
                                        {submissions.length} работ • {submissions.filter(s => s.ai_score || s.teacher_score).length} оценено
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setGradingView('submissions')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${gradingView === 'submissions' ? accent.tabActive : 'bg-white/5 text-white/50'}`}>
                                        <BarChart3 className="w-3 h-3 inline mr-1" /> Работы
                                    </button>
                                    <button onClick={() => setGradingView('logs')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${gradingView === 'logs' ? accent.tabActive : 'bg-white/5 text-white/50'}`}>
                                        <Clock className="w-3 h-3 inline mr-1" /> Логи
                                    </button>
                                    {selectedAssignment.grading_mode === 'ai' && (
                                        <button onClick={handleAIGradeAll} disabled={loading} className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-medium hover:bg-cyan-500/30 transition-all flex items-center gap-1">
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />} ИИ оценить
                                        </button>
                                    )}
                                </div>
                            </div>

                            {gradingView === 'submissions' && (
                                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left p-3 text-white/50 font-medium text-xs">Студент</th>
                                                <th className="text-center p-3 text-white/50 font-medium text-xs">Статус</th>
                                                <th className="text-center p-3 text-white/50 font-medium text-xs">ИИ</th>
                                                <th className="text-center p-3 text-white/50 font-medium text-xs">Препод.</th>
                                                <th className="text-right p-3 text-white/50 font-medium text-xs">Дата</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.length === 0 && (
                                                <tr><td colSpan={5} className="text-center py-8 text-white/30 text-xs">Пока нет сданных работ</td></tr>
                                            )}
                                            {submissions.map(sub => (
                                                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                                                                {(sub.student_name || '?')[0]}
                                                            </div>
                                                            <span className="text-white text-xs font-medium">{sub.student_name || 'Студент'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sub.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                sub.status === 'ai_graded' ? 'bg-cyan-500/20 text-cyan-300' :
                                                                    sub.status === 'teacher_reviewed' ? 'bg-emerald-500/20 text-emerald-300' :
                                                                        'bg-white/10 text-white/40'
                                                            }`}>
                                                            {sub.status === 'submitted' ? 'Сдано' : sub.status === 'ai_graded' ? 'ИИ' : sub.status === 'teacher_reviewed' ? '✓' : sub.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {sub.ai_score != null ? (
                                                            <span className={`font-bold text-xs ${sub.ai_score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{sub.ai_score}</span>
                                                        ) : <span className="text-white/20">—</span>}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {sub.teacher_score != null ? (
                                                            <span className="font-bold text-xs text-amber-400">{sub.teacher_score}</span>
                                                        ) : <span className="text-white/20">—</span>}
                                                    </td>
                                                    <td className="p-3 text-right text-[10px] text-white/30">
                                                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('ru') : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {gradingView === 'logs' && (
                                <div className="space-y-2">
                                    {logs.length === 0 && (
                                        <div className="text-center py-8 text-white/30">
                                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Нет активности</p>
                                        </div>
                                    )}
                                    {logs.map(log => (
                                        <div key={log.id} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${log.action === 'submitted' ? 'bg-emerald-500/20' :
                                                    log.action === 'opened' ? 'bg-blue-500/20' : 'bg-white/10'
                                                }`}>
                                                {log.action === 'submitted' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> :
                                                    log.action === 'opened' ? <Eye className="w-3 h-3 text-blue-400" /> :
                                                        <XCircle className="w-3 h-3 text-red-400" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-white">
                                                    <span className="font-bold">{log.student_name || 'Студент'}</span>
                                                    {' — '}
                                                    {log.action === 'opened' ? 'открыл' : log.action === 'submitted' ? 'сдал' : log.action}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-white/30">
                                                {log.created_at ? new Date(log.created_at).toLocaleString('ru') : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}
