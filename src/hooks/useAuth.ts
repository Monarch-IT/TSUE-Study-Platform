import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'student' | 'teacher' | 'moderator';

export interface TSPUserMetadata {
    id: string;
    fullName: string;
    email?: string;
    group: string;
    course: number;
    role: UserRole;
    createdAt: number;
    provider?: string;
    scores?: Record<string, number>;
}

export interface AuthState {
    user: SupabaseUser | null;
    metadata: TSPUserMetadata | null;
    loading: boolean;
    error: string | null;
    needsProfileCompletion: boolean;
}

// Hardcoded moderator credentials (checked client-side for login gate)
const MODERATOR_LOGIN = 'TSUE-Monarch';
const MODERATOR_ALIASES = ['tsue-monarch', 'monarch', 'монарх', 'админ', 'admin', 'administrator', 'администратор', 'модератор', 'moderator'];

const MODERATOR_PASSWORDS = ['Dodash2008', 'Dodash2024', 'Monarch2024'];

// Local admin session key
const ADMIN_SESSION_KEY = 'tsue-monarch-admin-session';

export const isModeratorLogin = (login: string, password: string) => {
    const normalized = login.trim().toLowerCase();
    const isMatch = normalized === MODERATOR_LOGIN.toLowerCase() || MODERATOR_ALIASES.includes(normalized);
    return isMatch && MODERATOR_PASSWORDS.includes(password);
};

// Admin session management (bypasses Supabase Auth)
export const setAdminSession = () => {
    const session = {
        role: 'moderator' as UserRole,
        fullName: 'TSUE Monarch',
        id: 'TSUE-Monarch',
        group: 'ADMIN',
        timestamp: Date.now(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const getAdminSession = (): TSPUserMetadata | null => {
    try {
        const raw = localStorage.getItem(ADMIN_SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Admin session is valid for 7 days
        if (Date.now() - session.timestamp > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            return null;
        }
        return {
            id: session.id,
            fullName: session.fullName,
            group: session.group,
            course: 0,
            role: 'moderator',
            createdAt: session.timestamp,
            provider: 'admin-local',
            scores: {},
        };
    } catch {
        return null;
    }
};

export const clearAdminSession = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        user: null,
        metadata: null,
        loading: true,
        error: null,
        needsProfileCompletion: false,
    });

    useEffect(() => {
        // Check for admin local session first
        const adminSession = getAdminSession();
        if (adminSession) {
            setState({
                user: { id: 'admin-local', email: 'admin@tsue' } as any,
                metadata: adminSession,
                loading: false,
                error: null,
                needsProfileCompletion: false,
            });
            // Don't return — still listen for real auth changes below
        }

        // 1. Check initial Supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchMetadata(session.user);
            } else if (!adminSession) {
                setState(prev => ({ ...prev, loading: false }));
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                fetchMetadata(session.user);
            } else if (!getAdminSession()) {
                setState({
                    user: null,
                    metadata: null,
                    loading: false,
                    error: null,
                    needsProfileCompletion: false,
                });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchMetadata = async (user: SupabaseUser) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', user.id)
                .maybeSingle();

            if (error) {
                console.error("Metadata fetch error:", error);
            }

            setState({
                user,
                metadata: data || null,
                loading: false,
                error: null,
                needsProfileCompletion: !data,
            });
        } catch (err) {
            console.error("Metadata fetch exception:", err);
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const signOut = async () => {
        clearAdminSession();
        await supabase.auth.signOut();
        setState({
            user: null,
            metadata: null,
            loading: false,
            error: null,
            needsProfileCompletion: false,
        });
    };

    // Check for admin session override
    const adminSession = getAdminSession();
    const effectiveMetadata = state.metadata || adminSession;

    return {
        user: state.user,
        metadata: effectiveMetadata,
        loading: state.loading,
        error: state.error,
        needsProfileCompletion: state.needsProfileCompletion,
        signOut,
        isModerator: effectiveMetadata?.role === 'moderator',
        isTeacher: effectiveMetadata?.role === 'teacher',
    };
};

export const generateTSUEId = async () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const genPart = () => {
        let res = '';
        for (let i = 0; i < 3; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
    };
    return `TSUE-${genPart()}-${genPart()}-${genPart()}`;
};

export const validateGroup = (group: string) => {
    const regex = /^[A-Za-z]{2}-\d{2}(\/\d{2})?$/;
    return regex.test(group);
};

export const findUserByLogin = async (login: string) => {
    const normalizedLogin = login.trim().toLowerCase();

    // 1. Direct match for Monarch (Admin)
    if (normalizedLogin === MODERATOR_LOGIN.toLowerCase() || MODERATOR_ALIASES.includes(normalizedLogin)) {
        return { email: '__admin__', isModerator: true };
    }

    try {
        // Search by custom TSUE ID
        const { data: idMatch } = await supabase
            .from('users')
            .select('email, role')
            .eq('id', login)
            .maybeSingle();

        if (idMatch?.email) {
            return { email: idMatch.email, isModerator: idMatch.role === 'moderator' };
        }

        // Search by Full Name (exact match)
        const { data: nameMatch } = await supabase
            .from('users')
            .select('email, role')
            .eq('fullName', login.trim())
            .maybeSingle();

        if (nameMatch?.email) {
            return { email: nameMatch.email, isModerator: nameMatch.role === 'moderator' };
        }

        // Search by Full Name (case-insensitive - ilike)
        const { data: nameIlikeMatch } = await supabase
            .from('users')
            .select('email, role')
            .ilike('fullName', login.trim())
            .maybeSingle();

        if (nameIlikeMatch?.email) {
            return { email: nameIlikeMatch.email, isModerator: nameIlikeMatch.role === 'moderator' };
        }

    } catch (error) {
        console.error("Supabase lookup error:", error);
    }

    return null;
};
