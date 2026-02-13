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
    Brain,
    Trash2,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { topics } from '@/data/topics';
import { programmingTasks } from '@/data/tasks';
import { getStreamingAIResponse, clearConversationHistory } from '@/lib/AIBrainService';
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
        if (saved) {
            try { return JSON.parse(saved); } catch { /* ignore */ }
        }
        return [{
            id: '1',
            role: 'assistant',
            content: `👋 Привет${metadata?.fullName ? `, ${metadata.fullName}` : ''}! Я — **Monarch AI**, твой ИИ-помощник.\n\nЯ могу:\n- 📚 Объяснить любую тему по Python\n- 💡 Дать подсказку по задаче\n- 🔍 Разобрать код и найти ошибки\n- 🎓 Научить шаг за шагом\n\nСпроси меня что-нибудь!`,
            timestamp: Date.now()
        }];
    });

    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Save messages to localStorage
    useEffect(() => {
        localStorage.setItem('monarch_chat_history', JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingContent]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

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
        "Какие типичные ошибки?",
        "Покажи пример решения"
    ] : activeTopicId ? [
        "Объясни эту тему",
        "Дай пример кода",
        "Зачем это нужно?",
        "Главные правила"
    ] : [
        "Что такое Python?",
        "С чего начать?",
        "Объясни переменные",
        "Кто тебя создал?"
    ];

    // ─── Send Message (Streaming) ────────────────────────────────────────────

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');

        let fullResponse = '';

        await getStreamingAIResponse(
            text,
            { taskId: activeTaskId, topicId: activeTopicId },
            // onChunk
            (chunk: string) => {
                fullResponse += chunk;
                setStreamingContent(fullResponse);
            },
            // onComplete
            (completeText: string) => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: completeText,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
                setStreamingContent('');
                setIsLoading(false);
            },
            // onError
            (error: string) => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `⚠️ Ошибка: ${error}\n\nПопробуйте ещё раз.`,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
                setStreamingContent('');
                setIsLoading(false);
            }
        );
    };

    const sendSuggestion = (text: string) => {
        setInput(text);
        // Trigger send on next tick
        setTimeout(() => {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
            setInput(prev => {
                // Use the text directly
                const userMsg: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: text,
                    timestamp: Date.now()
                };
                setMessages(msgs => [...msgs, userMsg]);
                setIsLoading(true);
                setStreamingContent('');

                let fullResponse = '';
                getStreamingAIResponse(
                    text,
                    { taskId: activeTaskId, topicId: activeTopicId },
                    (chunk) => {
                        fullResponse += chunk;
                        setStreamingContent(fullResponse);
                    },
                    (completeText) => {
                        const aiMsg: Message = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: completeText,
                            timestamp: Date.now()
                        };
                        setMessages(msgs => [...msgs, aiMsg]);
                        setStreamingContent('');
                        setIsLoading(false);
                    },
                    (error) => {
                        const aiMsg: Message = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: `⚠️ ${error}`,
                            timestamp: Date.now()
                        };
                        setMessages(msgs => [...msgs, aiMsg]);
                        setStreamingContent('');
                        setIsLoading(false);
                    }
                );
                return '';
            });
        }, 50);
    };

    const clearChat = () => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: '🔄 Чат очищен. Я готов к новому разговору! Спросите меня что-нибудь.',
            timestamp: Date.now()
        }]);
        clearConversationHistory();
        localStorage.removeItem('monarch_chat_history');
    };

    // ─── Simple Markdown Renderer ────────────────────────────────────────────

    const renderMarkdown = (text: string) => {
        // Split by code blocks first
        const parts = text.split(/(```[\s\S]*?```)/g);

        return parts.map((part, i) => {
            // Code block
            if (part.startsWith('```')) {
                const lines = part.slice(3, -3).split('\n');
                const lang = lines[0]?.trim() || '';
                const code = (lang ? lines.slice(1) : lines).join('\n').trim();
                return (
                    <div key={i} className="my-3 rounded-xl overflow-hidden border border-white/10">
                        {lang && (
                            <div className="px-4 py-1.5 bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/50">
                                {lang}
                            </div>
                        )}
                        <pre className="p-4 bg-black/40 text-green-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                            <code>{code}</code>
                        </pre>
                    </div>
                );
            }

            // Inline text processing
            return (
                <span key={i}>
                    {part.split('\n').map((line, j) => {
                        // Headers
                        if (line.startsWith('### ')) return <h4 key={j} className="font-bold text-white mt-2 mb-1 text-sm">{processInline(line.slice(4))}</h4>;
                        if (line.startsWith('## ')) return <h3 key={j} className="font-bold text-white mt-3 mb-1">{processInline(line.slice(3))}</h3>;
                        if (line.startsWith('# ')) return <h2 key={j} className="font-black text-white mt-3 mb-1">{processInline(line.slice(2))}</h2>;
                        // List items
                        if (line.match(/^[-•] /)) return <div key={j} className="flex gap-2 ml-1"><span className="text-primary">•</span><span>{processInline(line.slice(2))}</span></div>;
                        if (line.match(/^\d+\. /)) return <div key={j} className="flex gap-2 ml-1"><span className="text-primary font-bold">{line.match(/^\d+/)![0]}.</span><span>{processInline(line.replace(/^\d+\.\s*/, ''))}</span></div>;
                        // Empty line
                        if (!line.trim()) return <br key={j} />;
                        // Normal line
                        return <span key={j}>{processInline(line)}{j < part.split('\n').length - 1 ? <br /> : null}</span>;
                    })}
                </span>
            );
        });
    };

    const processInline = (text: string): React.ReactNode => {
        // Process bold, italic, inline code
        const parts: React.ReactNode[] = [];
        let rest = text;
        let key = 0;

        while (rest.length > 0) {
            // Bold: **text**
            const boldMatch = rest.match(/\*\*(.+?)\*\*/);
            // Inline code: `text`
            const codeMatch = rest.match(/`([^`]+)`/);
            // Italic: *text*
            const italicMatch = rest.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

            let firstMatch: { index: number; length: number; content: React.ReactNode } | null = null;

            if (boldMatch?.index !== undefined) {
                const candidate = { index: boldMatch.index, length: boldMatch[0].length, content: <strong key={key++} className="text-white font-bold">{boldMatch[1]}</strong> };
                if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
            }
            if (codeMatch?.index !== undefined) {
                const candidate = { index: codeMatch.index, length: codeMatch[0].length, content: <code key={key++} className="px-1.5 py-0.5 bg-white/10 text-amber-300 text-xs rounded font-mono">{codeMatch[1]}</code> };
                if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
            }
            if (italicMatch?.index !== undefined) {
                const candidate = { index: italicMatch.index, length: italicMatch[0].length, content: <em key={key++}>{italicMatch[1]}</em> };
                if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
            }

            if (firstMatch) {
                if (firstMatch.index > 0) {
                    parts.push(rest.slice(0, firstMatch.index));
                }
                parts.push(firstMatch.content);
                rest = rest.slice(firstMatch.index + firstMatch.length);
            } else {
                parts.push(rest);
                break;
            }
        }

        return <>{parts}</>;
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-950 shadow-2xl shadow-primary/20 flex items-center justify-center group border border-white/10 overflow-visible"
            >
                {isOpen ? <X className="w-7 h-7 text-white" /> : <MonarchAvatar size={50} isThinking={isLoading} />}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Notification dot when closed and has unread */}
                {!isOpen && messages.length > 1 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                )}
            </motion.button>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        className="fixed bottom-24 right-4 sm:bottom-28 sm:right-8 z-[100] w-[calc(100vw-2rem)] sm:w-[420px] h-[70vh] sm:h-[600px] max-h-[700px] bg-slate-900/95 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-white/5 bg-white/5 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-tighter text-sm">Monarch AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
                                        <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                                            {isLoading ? 'Думаю...' : getActiveContextName() || 'Готов к работе'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={clearChat}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-colors group"
                                    title="Очистить чат"
                                >
                                    <Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[88%] flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5">
                                            {msg.role === 'user' ? (
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                            ) : (
                                                <MonarchAvatar size={32} isThinking={false} />
                                            )}
                                        </div>

                                        <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/20'
                                            : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm shadow-lg shadow-black/20'
                                            }`}>
                                            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Streaming response */}
                            {isLoading && streamingContent && (
                                <div className="flex justify-start">
                                    <div className="max-w-[88%] flex gap-2.5">
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5">
                                            <MonarchAvatar size={32} isThinking={true} />
                                        </div>
                                        <div className="p-3.5 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed bg-white/5 border border-white/5 text-white/80 shadow-lg shadow-black/20">
                                            {renderMarkdown(streamingContent)}
                                            <span className="inline-block w-1.5 h-4 bg-primary/80 animate-pulse ml-0.5 rounded-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loading indicator (before streaming starts) */}
                            {isLoading && !streamingContent && (
                                <div className="flex justify-start items-center gap-3">
                                    <MonarchAvatar size={32} isThinking={true} />
                                    <div className="relative bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex flex-col gap-1.5 shadow-xl overflow-hidden">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-[9px] uppercase font-black tracking-widest text-primary/60">Генерация ответа...</span>
                                        <motion.div
                                            animate={{ x: [-120, 200] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions */}
                        {!isLoading && messages.length <= 3 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendSuggestion(s)}
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
                            className="p-4 sm:p-5 pt-2 flex-shrink-0 border-t border-white/5"
                        >
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Спросите Monarch AI..."
                                    disabled={isLoading}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-white/15">
                                <Brain className="w-3 h-3" />
                                Monarch AI
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
