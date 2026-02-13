import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

export default function GlobalAuthEnforcer() {
    const { needsProfileCompletion, loading } = useAuth();
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
