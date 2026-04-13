import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, X, Send } from 'lucide-react';
import { getStreamingAIResponse } from '@/lib/AIBrainService';
import { toast } from 'sonner';

export default function AISelectionAssistant() {
    const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleSelection = () => {
            const activeElement = document.activeElement;
            // Игнорируем выделение внутри полей ввода и текстовых областей
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.getAttribute('contenteditable') === 'true')) {
                return;
            }

            const sel = window.getSelection();
            if (sel && sel.toString().trim().length > 10 && !isActive) {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelection({ text: sel.toString().trim(), rect });
            } else if (!isActive) {
                setSelection(null);
            }
        };

        document.addEventListener('mouseup', handleSelection);
        return () => document.removeEventListener('mouseup', handleSelection);
    }, [isActive]);

    // Закрытие тултипа при клике вне его области
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                setIsActive(false);
                setSelection(null);
                setStreamedText('');
                setIsComplete(false);
            }
        };
        if (isActive) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isActive]);

    const handleAskAI = async () => {
        if (!selection) return;
        setIsActive(true);
        setIsLoading(true);
        setStreamedText('');
        setIsComplete(false);

        const prompt = `Объясни мне этот отрывок текста (максимально понятно и по-существу):\n\n"${selection.text}"`;

        await getStreamingAIResponse(
            prompt,
            {},
            (chunk) => {
                setStreamedText(prev => prev + chunk);
            },
            () => {
                setIsLoading(false);
                setIsComplete(true);
            },
            (error) => {
                toast.error('Ошибка ИИ: ' + error);
                setIsLoading(false);
                setIsComplete(true);
            }
        );
    };

    if (!selection) return null;

    // Позиционирование тултипа: пытаемся разместить сверху, если места нет — снизу
    const TOOLTIP_MARGIN = 10;
    const topPosition = selection.rect.top - TOOLTIP_MARGIN;
    const isAbove = topPosition > 300; 

    return (
        <AnimatePresence>
            <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                style={{
                    position: 'fixed',
                    top: isActive ? (isAbove ? selection.rect.top - 20 : selection.rect.bottom + 20) : selection.rect.top - 40,
                    left: selection.rect.left + (selection.rect.width / 2),
                    transform: 'translateX(-50%)' + (isActive && isAbove ? ' translateY(-100%)' : ''),
                    zIndex: 9999,
                }}
                className={`flex flex-col items-center ${isActive ? 'w-[320px] sm:w-[400px]' : 'w-auto'}`}
            >
                {!isActive ? (
                    <button
                        onClick={handleAskAI}
                        className="-translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-slate-900 border border-primary/30 rounded-xl shadow-2xl shadow-primary/20 text-white hover:bg-slate-800 hover:scale-105 transition-all outline-none"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold tracking-wider">Объяснить через ИИ</span>
                    </button>
                ) : (
                    <div className="-translate-x-1/2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest text-white/80">Monarch AI</span>
                            </div>
                            <button onClick={() => { setIsActive(false); setSelection(null); }} className="text-white/40 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="text-[10px] text-white/30 italic mb-3 pb-3 border-b border-white/5 line-clamp-3">
                                "{selection.text}"
                            </div>
                            
                            <div className="text-sm text-white/90 leading-relaxed">
                                {streamedText || (isLoading && "Изучаю текст...")}
                                {isLoading && <span className="inline-block w-1.5 h-3.5 bg-primary/80 animate-pulse ml-1 rounded-sm align-middle" />}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
