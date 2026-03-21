import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lhjpobxiajosghfqpfjc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_fNsB7rAASg8XGb6STDcuVw_iSiLlM_x';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
