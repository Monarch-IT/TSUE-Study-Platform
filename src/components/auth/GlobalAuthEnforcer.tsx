import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function GlobalAuthEnforcer() {
    const { needsProfileCompletion, loading, isBanned, signOut } = useAuth();
    const [isManualOpen, setIsManualOpen] = useState(false);

    // Listen for manual trigger events from anywhere in the app
    useEffect(() => {
        const handleOpen = () => setIsManualOpen(true);
        const handleClose = () => setIsManualOpen(false);

        window.addEventListener('open-auth-modal', handleOpen);
        window.addEventListener('close-auth-modal', handleClose);

        return () => {
            window.removeEventListener('open-auth-modal', handleOpen);
            window.removeEventListener('close-auth-modal', handleClose);
        };
    }, []);

    if (isBanned) {
        return (
            <div className="fixed inset-0 z-[3000] bg-[#020205] flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full glass-elite p-10 rounded-[3rem] border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
                    <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Доступ заблокирован</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-8">
                        Ваш аккаунт был временно или навсегда заблокирован администрацией TSUE Study Platform за нарушение правил использования системы.
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Выйти из системы
                    </button>
                </div>
            </div>
        );
    }

    // The modal should be open if:
    // 1. It was manually triggered (Login button)
    // 2. Profile completion is forced (Logged in but metadata missing)
    const isModalOpen = isManualOpen || (!loading && needsProfileCompletion);

    return (
        <AuthModal
            isOpen={isModalOpen}
            onClose={() => setIsManualOpen(false)}
        />
    );
}

// Helper to open the modal from non-React code or separate components
export const openGlobalAuthModal = () => {
    window.dispatchEvent(new CustomEvent('open-auth-modal'));
};
