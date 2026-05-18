import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a no-op mock client when credentials are missing
const createNoopClient = () => ({
  from: () => ({
    select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase disabled') }) }),
    upsert: () => Promise.resolve({ error: null }),
  }),
});

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoopClient() as any;
