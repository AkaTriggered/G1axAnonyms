import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type User = {
  id: string;
  username: string;
  display_name: string | null;
  instagram_handle: string | null;
  theme: string;
  message_count: number;
  push_token: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  recipient_username: string;
  content: string;
  game_mode: string;
  game_data: any;
  sender_city: string | null;
  sender_country: string | null;
  sender_device: string | null;
  sender_os: string | null;
  sender_time_of_day: string | null;
  is_read: boolean;
  is_blocked: boolean;
  is_flagged: boolean;
  moderation_score: number | null;
  sender_fingerprint: string | null;
  sent_at: string;
};

export type Block = {
  id: string;
  recipient_id: string;
  sender_fingerprint: string;
  created_at: string;
};
