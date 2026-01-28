import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obwhrazjfczrkvtdaudg.supabase.co';
const supabaseAnonKey = 'sb_publishable_nXY802H8P4UboIXM-4Abyg_Rzbhpmm6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);