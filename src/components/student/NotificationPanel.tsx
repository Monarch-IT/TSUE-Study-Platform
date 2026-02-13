import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, ExternalLink, Trash2, Info, BookOpen, Star, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'task' | 'grade' | 'alert';
    is_read: boolean;
    link?: string;
    created_at: string;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    userUuid: string;
    onUnreadChange?: (count: number) => void;
}

export default function NotificationPanel({ isOpen, onClose, userUuid, onUnreadChange }: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_uuid', userUuid)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);

            const unreadCount = (data || []).filter(n => !n.is_read).length;
            onUnreadChange?.(unreadCount);
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && userUuid) {
            fetchNotifications();
        }
    }, [isOpen, userUuid]);

    // Realtime subscription
    useEffect(() => {
        if (!userUuid) return;

        const channel = supabase
            .channel(`notifications-${userUuid}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_uuid=eq.${userUuid}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                    onUnreadChange?.(notifications.filter(n => !n.is_read).length + 1);
                    toast.info(`Новое уведомление: ${payload.new.title}`);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userUuid]);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

            const newUnreadCount = notifications.filter(n => n.id !== id && !n.is_read).length;
            onUnreadChange?.(newUnreadCount);
        } catch (error: any) {
            toast.error("Ошибка при обновлении");
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));

            const newUnreadCount = notifications.filter(n => n.id !== id && !n.is_read).length;
            onUnreadChange?.(newUnreadCount);
        } catch (error: any) {
            toast.error("Ошибка при удалении");
        }
    };

    const markAllRead = async () => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_uuid', userUuid)
                .eq('is_read', false);

            if (error) throw error;
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            onUnreadChange?.(0);
            toast.success("Все уведомления прочитаны");
        } catch (error: any) {
            toast.error("Ошибка");
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'task': return <BookOpen className="w-4 h-4 text-primary" />;
            case 'grade': return <Star className="w-4 h-4 text-yellow-500" />;
            case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-[#0c0c14] border-l border-white/10 z-[2001] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-black uppercase tracking-tight text-white">Уведомления</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Actions */}
                        {notifications.length > 0 && (
                            <div className="px-6 py-3 border-b border-white/5 flex justify-end">
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                >
                                    Прочитать все
                                </button>
                            </div>
                        )}

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Загрузка...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                                    <Bell className="w-12 h-12" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Нет уведомлений</span>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`group relative p-4 rounded-2xl border transition-all ${notif.is_read
                                                ? 'bg-white/[0.02] border-white/5 opacity-60'
                                                : 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-white/5' : 'bg-primary/20'
                                                }`}>
                                                {getTypeIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`text-sm font-bold truncate ${notif.is_read ? 'text-white/60' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-[9px] text-white/20 font-medium">
                                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/40 leading-relaxed mb-3">
                                                    {notif.message}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    {notif.link && (
                                                        <a
                                                            href={notif.link}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase transition-all hover:bg-primary/20"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Перейти
                                                        </a>
                                                    )}
                                                    {!notif.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold uppercase transition-all hover:bg-green-500/20"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            Прочитано
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notif.id)}
                                                        className="p-1.5 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-black/40 border-t border-white/5 text-center">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                TSUE Study Platform Notification Service
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
