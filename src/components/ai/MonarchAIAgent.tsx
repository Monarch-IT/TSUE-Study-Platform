import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    X,
    Send,
    Bot,
    User,
    Loader2,
    MessageSquare,
    Zap,
    Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { topics } from '@/data/topics';
import { programmingTasks } from '@/data/tasks';
import { getAdvancedAIResponse } from '@/lib/AIBrainService';
import { MonarchAvatar } from './MonarchAvatar';



interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface MonarchAIAgentProps {
    activeTopicId?: string;
    activeTaskId?: string;
}

export default function MonarchAIAgent({ activeTopicId, activeTaskId }: MonarchAIAgentProps) {
    const { user, metadata } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('monarch_chat_history');
        return saved ? JSON.parse(saved) : [
            {
                id: '1',
                role: 'assistant',
                content: `Приветствую, ${metadata?.fullName || 'искатель'}! Я — Monarch AI, цифровая эманация вашего разума и проводник в этой вселенной знаний. Я вижу, что вы находитесь в секторе "${getActiveContextName() || 'главного ядра'}". Мои алгоритмы готовы к анализу. Какую задачу мы трансформируем сегодня?`,

                timestamp: Date.now()
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('monarch_chat_history', JSON.stringify(messages));
    }, [messages]);


    function getActiveContextName() {
        if (activeTaskId) {
            const task = programmingTasks.find(t => t.id === activeTaskId);
            return `Задание: ${task?.title}`;
        }
        if (activeTopicId) {
            const topic = topics.find(t => t.id === activeTopicId);
            return `Тема: ${topic?.title}`;
        }
        return null;
    }

    const suggestions = activeTaskId ? [
        "Дай подсказку по задаче",
        "Объясни условие",
        "Какие типичные ошибки?"
    ] : activeTopicId ? [
        "Объясни эту тему",
        "Дай пример кода",
        "Зачем это нужно?"
    ] : [
        "С чего начать?",
        "Как работает платформа?",
        "Кто тебя создал?"
    ];

    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Simulated deep reasoning delay
            setTimeout(async () => {
                const responseText = await getAdvancedAIResponse(userMsg.content, {
                    taskId: activeTaskId,
                    topicId: activeTopicId
                });

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: responseText,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setIsLoading(false);
        }
    };


    // Mock response logic has been moved to AIBrainService for better scalability


    const sendSuggestion = (text: string) => {
        setInput(text);
        const event = new Event('submit', { cancelable: true }) as any;
        handleSend(event);
    };


    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 z-[100] w-18 h-18 rounded-full bg-slate-950 shadow-2xl shadow-primary/20 flex items-center justify-center group border border-white/10 overflow-visible"
            >
                {isOpen ? <X className="w-8 h-8 text-white" /> : <MonarchAvatar size={56} isThinking={isLoading} />}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>



            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        className="fixed bottom-28 right-8 z-[100] w-[400px] h-[600px] bg-slate-900/80 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-tighter">Monarch AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Агент в сети</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (confirm('Очистить историю нейронной связи?')) {
                                            setMessages([]);
                                            localStorage.removeItem('monarch_chat_history');
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-colors group"
                                    title="Очистить историю"
                                >
                                    <X className="w-4 h-4 text-white/40 group-hover:text-red-400" />
                                </button>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                </div>
                            </div>

                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center`}>
                                            {msg.role === 'user' ? (
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                            ) : (
                                                <MonarchAvatar size={36} isThinking={false} />
                                            )}
                                        </div>

                                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                            : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-none shadow-xl shadow-black/20'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start items-center gap-4">
                                    <MonarchAvatar size={36} isThinking={true} />
                                    <div className="relative bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex flex-col gap-1 shadow-xl overflow-hidden group">
                                        <div className="flex gap-1 animate-pulse">
                                            <div className="w-1 h-1 bg-primary rounded-full" />
                                            <div className="w-1 h-1 bg-primary rounded-full delay-75" />
                                            <div className="w-1 h-1 bg-primary rounded-full delay-150" />
                                        </div>
                                        <span className="text-[9px] uppercase font-black tracking-widest text-primary/70">Нейронная связь...</span>
                                        {/* Neural Link Beam Effect */}
                                        <motion.div
                                            animate={{ x: [-100, 200] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12"
                                        />
                                    </div>
                                </div>
                            )}


                        </div>

                        {/* Suggestions */}
                        {!isLoading && (
                            <div className="px-6 pb-4 flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const userMsg: Message = {
                                                id: Date.now().toString(),
                                                role: 'user',
                                                content: s,
                                                timestamp: Date.now()
                                            };
                                            setMessages(prev => [...prev, userMsg]);
                                            setIsLoading(true);
                                            setTimeout(async () => {
                                                const response = await getAdvancedAIResponse(s, { taskId: activeTaskId, topicId: activeTopicId });
                                                const aiMsg: Message = {
                                                    id: (Date.now() + 1).toString(),
                                                    role: 'assistant',
                                                    content: response,
                                                    timestamp: Date.now()
                                                };
                                                setMessages(prev => [...prev, aiMsg]);
                                                setIsLoading(false);
                                            }, 1200);

                                        }}
                                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}


                        {/* Input Area */}
                        <form
                            onSubmit={handleSend}
                            className="p-6 pt-0"
                        >
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Спросите Monarch AI..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                                <Brain className="w-3 h-3" />
                                Исследуйте космос знаний с Monarch AI
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
