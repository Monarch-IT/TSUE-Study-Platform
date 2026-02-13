import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ArrowLeft, Clock, CheckCircle2, Send, Loader2,
    Code2, FileText, HelpCircle, AlertTriangle, ChevronRight,
    BarChart3, Brain, Star, XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    getAssignmentsForGroup, submitAssignment, getMySubmissionForAssignment,
    logActivity, Assignment, AssignmentSubmission
} from '@/lib/teacherService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Props {
    onClose: () => void;
}

export default function StudentAssignmentsPanel({ onClose }: Props) {
    const { user, metadata } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [mySubmission, setMySubmission] = useState<AssignmentSubmission | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [codeAnswer, setCodeAnswer] = useState('');
    const [theoryAnswer, setTheoryAnswer] = useState('');
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

    const studentGroup = metadata?.group || '';
    const studentUuid = user?.id || '';

    const loadAssignments = useCallback(async () => {
        if (!studentGroup) { setLoading(false); return; }
        setLoading(true);
        try {
            const data = await getAssignmentsForGroup(studentGroup);
            setAssignments(data);
        } catch (err) {
            console.error('Load assignments:', err);
        } finally {
            setLoading(false);
        }
    }, [studentGroup]);

    useEffect(() => { loadAssignments(); }, [loadAssignments]);

    const openAssignment = async (a: Assignment) => {
        setSelectedAssignment(a);
        setCodeAnswer('');
        setTheoryAnswer('');
        setQuizAnswers({});
        try {
            const sub = await getMySubmissionForAssignment(a.id, studentUuid);
            setMySubmission(sub);
            if (sub?.code) setCodeAnswer(sub.code);
            if (sub?.answers?.theory) setTheoryAnswer(sub.answers.theory);
            if (sub?.answers?.quiz) setQuizAnswers(sub.answers.quiz);
            // Log that student opened the assignment
            await logActivity({
                assignment_id: a.id,
                student_uuid: studentUuid,
                student_name: metadata?.fullName || 'Студент',
                action: 'opened',
                details: {},
            });
        } catch (err) {
            console.error('Open assignment:', err);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAssignment) return;
        setSubmitting(true);
        try {
            const payload: Partial<AssignmentSubmission> = {
                assignment_id: selectedAssignment.id,
                student_uuid: studentUuid,
                student_name: metadata?.fullName || 'Студент',
                student_tsue_id: metadata?.id || '',
                status: 'submitted',
                submitted_at: Date.now(),
            };
            if (selectedAssignment.type === 'code') {
                if (!codeAnswer.trim()) { toast.error('Введите код решения'); setSubmitting(false); return; }
                payload.code = codeAnswer;
            } else if (selectedAssignment.type === 'theory') {
                if (!theoryAnswer.trim()) { toast.error('Введите ответ'); setSubmitting(false); return; }
                payload.answers = { theory: theoryAnswer };
            } else {
                payload.answers = { quiz: quizAnswers };
            }

            await submitAssignment(payload);

            // Log activity in background (don't block on errors)
            logActivity({
                assignment_id: selectedAssignment.id,
                student_uuid: studentUuid,
                student_name: metadata?.fullName || 'Студент',
                action: 'submitted',
                details: {},
            }).catch(() => { /* ignore log errors */ });

            toast.success('Работа сдана!');
            const sub = await getMySubmissionForAssignment(selectedAssignment.id, studentUuid);
            setMySubmission(sub);
        } catch (err: any) {
            console.error('Submit error:', err);
            const msg = err?.message || err?.details || 'Ошибка при сдаче';
            toast.error(`Ошибка: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const typeIcon = (type: string) => {
        if (type === 'code') return <Code2 className="w-4 h-4 text-blue-400" />;
        if (type === 'quiz') return <HelpCircle className="w-4 h-4 text-purple-400" />;
        return <FileText className="w-4 h-4 text-orange-400" />;
    };

    const typeLabel = (type: string) => type === 'code' ? 'Код' : type === 'quiz' ? 'Квиз' : 'Теория';
    const typeBadgeColor = (type: string) =>
        type === 'code' ? 'bg-blue-500/20 text-blue-300' :
            type === 'quiz' ? 'bg-purple-500/20 text-purple-300' :
                'bg-orange-500/20 text-orange-300';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#020205]/95 backdrop-blur-xl overflow-y-auto"
        >
            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={selectedAssignment ? () => { setSelectedAssignment(null); setMySubmission(null); } : onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-primary" />
                                {selectedAssignment ? selectedAssignment.title : 'Мои задания'}
                            </h1>
                            <p className="text-sm text-white/40 mt-0.5">
                                {selectedAssignment
                                    ? `${typeLabel(selectedAssignment.type)} • ${selectedAssignment.grading_mode === 'ai' ? 'ИИ оценка' : 'Ручная проверка'}`
                                    : `${metadata?.group || 'Группа не указана'} • ${assignments.length} заданий`
                                }
                            </p>
                        </div>
                    </div>
                    {!selectedAssignment && (
                        <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                            <XCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {/* ─── Assignment List ─── */}
                    {!selectedAssignment && (
                        <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : !studentGroup ? (
                                <div className="text-center py-16">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-400/60" />
                                    <p className="text-white/50 text-sm mb-2">Группа не указана в профиле</p>
                                    <p className="text-white/30 text-xs">Укажите свою группу в настройках профиля, чтобы видеть назначенные задания</p>
                                </div>
                            ) : assignments.length === 0 ? (
                                <div className="text-center py-16">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/20" />
                                    <p className="text-white/50 text-sm">Нет заданий для вашей группы</p>
                                    <p className="text-white/30 text-xs mt-1">Преподаватель еще не назначил задания для {studentGroup}</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {assignments.map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => openAssignment(a)}
                                            className="w-full bg-white/5 rounded-xl border border-white/10 p-4 hover:border-primary/30 hover:bg-white/[0.07] transition-all text-left group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeBadgeColor(a.type)}`}>
                                                            {typeLabel(a.type)}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${a.grading_mode === 'ai' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                                                            }`}>
                                                            {a.grading_mode === 'ai' ? 'ИИ оценка' : 'Ручная'}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-white text-sm mb-1 group-hover:text-primary transition-colors">{a.title}</h3>
                                                    {a.description && <p className="text-xs text-white/40 line-clamp-2">{a.description}</p>}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Clock className="w-3 h-3 text-white/20" />
                                                        <span className="text-[10px] text-white/30">
                                                            {new Date(a.created_at).toLocaleDateString('ru')}
                                                        </span>
                                                        {a.manual_content?.length > 0 && (
                                                            <span className="text-[10px] text-white/20">• {a.manual_content.length} заданий</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary/60 transition-colors ml-3 mt-1" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── Assignment Detail ─── */}
                    {selectedAssignment && (
                        <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Status banner */}
                            {mySubmission && (
                                <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${mySubmission.status === 'teacher_reviewed' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                                    mySubmission.status === 'ai_graded' ? 'bg-cyan-500/10 border border-cyan-500/20' :
                                        'bg-yellow-500/10 border border-yellow-500/20'
                                    }`}>
                                    {mySubmission.status === 'teacher_reviewed' ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : mySubmission.status === 'ai_graded' ? (
                                        <Brain className="w-5 h-5 text-cyan-400" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">
                                            {mySubmission.status === 'teacher_reviewed' ? 'Проверено преподавателем' :
                                                mySubmission.status === 'ai_graded' ? 'Оценено ИИ' : 'Работа сдана, ожидает проверки'}
                                        </p>
                                        <div className="flex gap-4 mt-1">
                                            {mySubmission.ai_score != null && (
                                                <span className="text-xs text-white/50">ИИ: <span className={`font-bold ${mySubmission.ai_score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{mySubmission.ai_score}/100</span></span>
                                            )}
                                            {mySubmission.teacher_score != null && (
                                                <span className="text-xs text-white/50">Преподаватель: <span className="font-bold text-amber-400">{mySubmission.teacher_score}/100</span></span>
                                            )}
                                        </div>
                                        {mySubmission.ai_feedback && (
                                            <p className="text-xs text-white/40 mt-2 whitespace-pre-wrap">{mySubmission.ai_feedback}</p>
                                        )}
                                        {mySubmission.teacher_feedback && (
                                            <p className="text-xs text-white/40 mt-2 italic">«{mySubmission.teacher_feedback}»</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {selectedAssignment.description && (
                                <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
                                    <p className="text-sm text-white/70 whitespace-pre-wrap">{selectedAssignment.description}</p>
                                </div>
                            )}

                            {/* Tasks (manual_content) */}
                            {selectedAssignment.manual_content?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Задания</h3>
                                    <div className="space-y-2">
                                        {selectedAssignment.manual_content.map((task: any, i: number) => (
                                            <div key={i} className="flex gap-3 bg-white/5 rounded-xl border border-white/10 p-4">
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm text-white/80">{task.question}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Answer form */}
                            {(!mySubmission || mySubmission.status === 'submitted') && (
                                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        {typeIcon(selectedAssignment.type)}
                                        {mySubmission ? 'Обновить ответ' : 'Ваш ответ'}
                                    </h3>

                                    {selectedAssignment.type === 'code' && (
                                        <div className="space-y-3">
                                            <label className="text-xs text-white/40 block">Вставьте ваш код:</label>
                                            <textarea
                                                value={codeAnswer}
                                                onChange={e => setCodeAnswer(e.target.value)}
                                                placeholder="# Ваше решение на Python..."
                                                rows={12}
                                                className="w-full px-4 py-3 rounded-xl bg-[#0a0a1a] border border-white/10 text-green-300 placeholder:text-white/20 text-sm font-mono focus:border-primary/50 focus:outline-none resize-none"
                                                spellCheck={false}
                                            />
                                        </div>
                                    )}

                                    {selectedAssignment.type === 'theory' && (
                                        <div className="space-y-3">
                                            <label className="text-xs text-white/40 block">Ваш ответ:</label>
                                            <textarea
                                                value={theoryAnswer}
                                                onChange={e => setTheoryAnswer(e.target.value)}
                                                placeholder="Напишите ваш ответ..."
                                                rows={8}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm focus:border-primary/50 focus:outline-none resize-none"
                                            />
                                        </div>
                                    )}

                                    {selectedAssignment.type === 'quiz' && selectedAssignment.manual_content?.length > 0 && (
                                        <div className="space-y-4">
                                            {selectedAssignment.manual_content.map((task: any, i: number) => (
                                                <div key={i}>
                                                    <label className="text-xs text-white/60 block mb-1">Задание {i + 1}: {task.question}</label>
                                                    <input
                                                        value={quizAnswers[i] || ''}
                                                        onChange={e => setQuizAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                                        placeholder="Ваш ответ..."
                                                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm focus:border-primary/50 focus:outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full mt-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-white font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {mySubmission ? 'Обновить ответ' : 'Сдать работу'}
                                    </button>
                                </div>
                            )}

                            {/* Already graded - readonly */}
                            {mySubmission && (mySubmission.status === 'ai_graded' || mySubmission.status === 'teacher_reviewed') && (
                                <div className="bg-white/5 rounded-xl border border-white/10 p-6 mt-4">
                                    <h3 className="text-sm font-bold text-white/60 mb-3">Ваш ответ (только чтение)</h3>
                                    {mySubmission.code && (
                                        <pre className="text-xs text-green-300/70 font-mono bg-[#0a0a1a] rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{mySubmission.code}</pre>
                                    )}
                                    {mySubmission.answers?.theory && (
                                        <p className="text-sm text-white/50 whitespace-pre-wrap">{mySubmission.answers.theory}</p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
