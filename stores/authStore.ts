import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase, User } from '@/lib/supabase';

const USER_KEY = 'anonyms_user';

const storage = {
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  createUser: (username: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => {
    set({ user, loading: false });
    if (user) {
      storage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      storage.removeItem(USER_KEY);
    }
  },

  loadUser: async () => {
    try {
      const stored = storage.getItem(USER_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        set({ user, loading: false });
        return;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
    set({ loading: false });
  },

  createUser: async (username) => {
    try {
      const normalized = username.toLowerCase();

      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', normalized)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingUser) {
        return { success: false, error: 'Username already taken' };
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: normalized,
          theme: 'minimal',
        })
        .select()
        .single<User>();

      if (insertError) throw insertError;

      console.log('User created and set:', newUser);
      set({ user: newUser, loading: false });
      storage.setItem(USER_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single<User>();

    if (!error && data) {
      set({ user: data });
    }
  },

  logout: async () => {
    set({ user: null });
    storage.removeItem(USER_KEY);
  },
}));
