import { create } from 'zustand';
import { supabase, Message } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type MessageState = {
  messages: Message[];
  loading: boolean;
  subscription: RealtimeChannel | null;
  loadMessages: (username: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  blockSender: (message: Message, userId: string) => Promise<void>;
  subscribeToMessages: (username: string) => void;
  unsubscribe: () => void;
  refreshMessages: (username: string) => Promise<void>;
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: true,
  subscription: null,

  loadMessages: async (username) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_username', username)
        .eq('is_blocked', false)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      set({ messages: data || [], loading: false });
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (messageId) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ),
    }));
  },

  deleteMessage: async (messageId) => {
    await supabase.from('messages').delete().eq('id', messageId);
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    }));
  },

  blockSender: async (message, userId) => {
    if (!message.sender_fingerprint) return;

    await supabase.from('blocks').insert({
      recipient_id: userId,
      sender_fingerprint: message.sender_fingerprint,
    });

    await supabase
      .from('messages')
      .update({ is_blocked: true })
      .eq('sender_fingerprint', message.sender_fingerprint)
      .eq('recipient_username', message.recipient_username);

    set((state) => ({
      messages: state.messages.filter(
        (msg) => msg.sender_fingerprint !== message.sender_fingerprint
      ),
    }));
  },

  subscribeToMessages: (username) => {
    const subscription = supabase
      .channel(`messages:${username}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_username=eq.${username}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (!newMessage.is_blocked) {
            set((state) => ({
              messages: [newMessage, ...state.messages],
            }));
          }
        }
      )
      .subscribe();

    set({ subscription });
  },

  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  refreshMessages: async (username) => {
    const { loadMessages } = get();
    await loadMessages(username);
  },
}));
