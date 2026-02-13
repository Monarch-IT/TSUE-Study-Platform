import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export const withTimeout = (promise: Promise<any>, timeoutMs: number = 15000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
    ]);
};

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
const MODERATOR_EMAIL = 'tsue.monarch.admin@tsue-platform.edu';

export const isModeratorLogin = (login: string, password: string) => {
    const normalized = login.trim().toLowerCase();
    const isMatch = normalized === MODERATOR_LOGIN.toLowerCase() || MODERATOR_ALIASES.includes(normalized);
    return isMatch && (password === 'Dodash2008' || password === 'Dodash2024' || password === 'Monarch2024');
};

export const getModeratorEmail = () => MODERATOR_EMAIL;
export const getModeratorPassword = (providedPassword?: string) => {
    if (providedPassword === 'Dodash2024' || providedPassword === 'Monarch2024') return providedPassword;
    return 'Dodash2008';
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
        // 1. Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchMetadata(session.user);
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                fetchMetadata(session.user);
            } else {
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
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
                console.error("Metadata fetch error:", error);
            }

            setState({
                user,
                metadata: data || null,
                loading: false,
                error: null,
                // Executor: explicit check to prevent admin lockout
                needsProfileCompletion: !data && user.email !== MODERATOR_EMAIL,
            });
        } catch (err) {
            console.error("Metadata fetch exception:", err);
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const signOut = () => supabase.auth.signOut();

    return {
        ...state,
        signOut,
        isModerator: state.metadata?.role === 'moderator',
        isTeacher: state.metadata?.role === 'teacher',
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
        return { email: MODERATOR_EMAIL, isModerator: true };
    }

    try {
        // Search by custom TSUE ID
        const { data: idMatch, error: idError } = await supabase
            .from('users')
            .select('email, role')
            .eq('id', login)
            .single();

        if (idMatch) {
            return { email: idMatch.email, isModerator: idMatch.role === 'moderator' };
        }

        // Search by Full Name
        const { data: nameMatch, error: nameError } = await supabase
            .from('users')
            .select('email, role')
            .eq('fullName', login.trim())
            .single();

        if (nameMatch) {
            return { email: nameMatch.email, isModerator: nameMatch.role === 'moderator' };
        }

    } catch (error) {
        console.error("Supabase lookup error:", error);
    }

    return null;
};
