import { useState, useEffect } from 'react';
import { auth, database } from '@/lib/firebase';
import {
    onAuthStateChanged,
    User as FirebaseUser,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { ref, onValue, get } from 'firebase/database';

export type UserRole = 'student' | 'teacher' | 'moderator';

export interface TSPUserMetadata {
    id: string;
    fullName: string;
    group: string;
    course: number;
    role: UserRole;
    createdAt: number;
    provider?: string;
    scores?: Record<string, number>;
}

export interface AuthState {
    user: FirebaseUser | null;
    metadata: TSPUserMetadata | null;
    loading: boolean;
    error: string | null;
    needsProfileCompletion: boolean;
}

// Hardcoded moderator credentials (checked client-side for login gate)
const MODERATOR_LOGIN = 'TSUE-Monarch';
const MODERATOR_EMAIL = 'tsue.monarch.admin@tsue-platform.edu';

export const isModeratorLogin = (login: string, password: string) => {
    return login === MODERATOR_LOGIN && password === 'Dodash2008';
};

export const getModeratorEmail = () => MODERATOR_EMAIL;
export const getModeratorPassword = () => 'Dodash2008!Secure';

export const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        user: null,
        metadata: null,
        loading: true,
        error: null,
        needsProfileCompletion: false,
    });

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const metaRef = ref(database, `users/${firebaseUser.uid}`);
                const snapshot = await get(metaRef);
                const data = snapshot.val();

                // Listen for real-time updates
                const unsub = onValue(metaRef, (snap) => {
                    const liveData = snap.val();
                    setState(prev => ({
                        ...prev,
                        user: firebaseUser,
                        metadata: liveData,
                        loading: false,
                        needsProfileCompletion: !liveData,
                    }));
                });

                setState(prev => ({
                    ...prev,
                    user: firebaseUser,
                    metadata: data,
                    loading: false,
                    needsProfileCompletion: !data,
                }));

                return () => unsub();
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

        return () => unsubAuth();
    }, []);

    const signOut = () => firebaseSignOut(auth);

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
