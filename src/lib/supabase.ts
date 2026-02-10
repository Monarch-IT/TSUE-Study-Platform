
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "PLACEHOLDER";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "PLACEHOLDER";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Helper for error logging
export const logError = (error: any) => {
    console.error('Supabase Error:', error);
};
