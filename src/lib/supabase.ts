import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing!');
}

// Ensure we don't pass empty strings to createClient if they are literally undefined
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
        auth: {
            persistSession: true,
            storageKey: 'tsue-monarch-auth',
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    }
);

