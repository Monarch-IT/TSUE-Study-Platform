import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    RefreshCw,
    ChevronLeft,
    Terminal as TerminalIcon,
    AlertTriangle,
    CheckCircle2,
    Code2,
    ShieldAlert,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { programmingTasks, ProgrammingTask } from '../data/tasks';
import { database } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { useAuth } from '../hooks/useAuth';

declare global {
    interface Window {
        loadPyodide: any;
    }
}

interface ProgrammingLabProps {
    taskId: string;
    onClose: () => void;
}

export default function ProgrammingLab({ taskId, onClose }: ProgrammingLabProps) {
    const { user, metadata } = useAuth();
    const task = programmingTasks.find(t => t.id === taskId) || programmingTasks[0];

    const [code, setCode] = useState(task.boilerplate);
    const [output, setOutput] = useState<string[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [pyodide, setPyodide] = useState<any>(null);
    const [isPyodideLoading, setIsPyodideLoading] = useState(true);
    const [testResults, setTestResults] = useState<{ passed: boolean; message: string } | null>(null);
    const [switchCount, setSwitchCount] = useState(0);

    // --- PROCTORING LOGIC ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setSwitchCount(prev => prev + 1);
                toast.warning("Обнаружено переключение вкладки! Инцидент зафиксирован.", {
                    icon: <ShieldAlert className="w-5 h-5 text-red-500" />
                });

                // Log to Firebase if in a real test context
                if (user) {
                    const logRef = ref(database, `proctor_logs/${user.uid}/${Date.now()}`);
                    set(logRef, {
                        type: 'tab_switch',
                        taskId,
                        timestamp: Date.now(),
                        count: switchCount + 1
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, taskId, switchCount]);

    // --- PYODIDE INITIALIZATION ---
    useEffect(() => {
        const loadPy = async () => {
            try {
                // Load Pyodide script dynamically
                if (!document.getElementById('pyodide-script')) {
                    const script = document.createElement('script');
                    script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
                    script.id = 'pyodide-script';
                    script.async = true;
                    document.body.appendChild(script);

                    script.onload = async () => {
                        const py = await window.loadPyodide();
                        setPyodide(py);
                        setIsPyodideLoading(false);
                    };
                } else if (window.loadPyodide) {
                    const py = await window.loadPyodide();
                    setPyodide(py);
                    setIsPyodideLoading(false);
                }
            } catch (err) {
                console.error("Pyodide Load Error:", err);
                setIsPyodideLoading(false);
            }
        };
        loadPy();
    }, []);

    const runCode = async () => {
        if (!pyodide || isExecuting) return;

        setIsExecuting(true);
        setOutput(["Running execution..."]);
        setTestResults(null);

        try {
            // Redirect stdout to our local array
            pyodide.runPython(`
import sys
import io
sys.stdout = io.String()
            `);

            await pyodide.runPythonAsync(code);

            const result = pyodide.runPython("sys.stdout.getvalue()");
            const lines = result.split('\n');
            setOutput(lines);

            // Simple validation
            const isMatch = task.testCases[0].expectedOutput === result;
            setTestResults({
                passed: isMatch,
                message: isMatch ? "Все тесты пройдены!" : "Результат не совпадает с ожидаемым."
            });

            if (isMatch && user) {
                toast.success("Задание успешно выполнено!");
            }

        } catch (err: any) {
            setOutput([`Error: ${err.message}`]);
            setTestResults({ passed: false, message: "Ошибка выполнения кода." });
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col font-sans"
        >
            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 glass-elite z-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-white/5 transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 text-white/50 group-hover:text-white" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black uppercase tracking-tighter text-white">{task.title}</h1>
                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${task.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {task.difficulty}
                            </span>
                        </div>
                        <p className="text-xs text-white/40 font-medium">Модуль: {task.topicId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Проктор: {switchCount}</span>
                    </div>
                    {isPyodideLoading ? (
                        <div className="flex items-center gap-3 px-4 py-2 text-white/40 bg-white/5 rounded-xl border border-white/5">
                            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Загрузка Ядра...</span>
                        </div>
                    ) : (
                        <button
                            onClick={runCode}
                            disabled={isExecuting}
                            className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Запустить Код
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 flex gap-px bg-white/5 overflow-hidden">
                {/* Left: Task Description */}
                <aside className="w-[350px] bg-black/40 p-8 flex flex-col border-r border-white/5">
                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Техническое Задание</span>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/80 leading-relaxed font-medium">
                                {task.description}
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2 block">Тестовые Сценарии</span>
                            <div className="space-y-3">
                                {task.testCases.map((tc, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase mb-2">
                                            <span>Ожидание</span>
                                            <div className="w-2 h-2 rounded-full bg-primary/20" />
                                        </div>
                                        <code className="text-xs text-primary font-mono">{tc.expectedOutput || 'NULL'}</code>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {testResults && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl border ${testResults.passed ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {testResults.passed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    <span className="text-xs font-black uppercase tracking-widest">{testResults.message}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3 text-white/20">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Лимит: 15 минут</span>
                        </div>
                    </div>
                </aside>

                {/* Editor & Console Container */}
                <div className="flex-1 flex flex-col bg-slate-950">
                    {/* Editor */}
                    <div className="flex-1 relative group">
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-lg bg-black/50 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Code2 className="w-3 h-3 text-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/60">main.py</span>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                            className="w-full h-full bg-transparent p-12 text-lg font-mono text-white/90 outline-none resize-none selection:bg-primary/30 leading-relaxed"
                            placeholder="# Напишите ваш код здесь..."
                        />
                    </div>

                    {/* Console Output */}
                    <div className="h-[250px] border-t border-white/10 flex flex-col bg-black/60 backdrop-blur-md">
                        <div className="h-10 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <TerminalIcon className="w-3 h-3 text-white/30" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Консоль Вывода</span>
                            </div>
                            <button
                                onClick={() => setOutput([])}
                                className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                            >
                                Сбросить
                            </button>
                        </div>
                        <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-1">
                            {output.length === 0 ? (
                                <span className="text-white/10 italic italic">Ожидание запуска...</span>
                            ) : (
                                output.map((line, i) => (
                                    <div key={i} className={line.startsWith('Error') ? 'text-red-400' : 'text-green-400/80'}>
                                        <span className="text-white/10 mr-2 opacity-50">{i + 1} |</span>
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </motion.div>
    );
}
