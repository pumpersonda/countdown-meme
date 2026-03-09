import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PaydayPreferences {
  id?: string;
  user_id: string;
  frequency: 'monthly' | 'bi-weekly';
  payment_days: number[];
  interests: string[];
  created_at?: string;
  updated_at?: string;
}
