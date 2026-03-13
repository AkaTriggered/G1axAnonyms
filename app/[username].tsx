import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

const MODES = [
  { id: 'anonymous', name: 'Anonymous', emoji: '👻', prompt: "What's one thing you've always wanted to tell me?" },
  { id: 'truth', name: 'Truth', emoji: '💯', prompt: 'Ask me a truth question - I dare you!' },
  { id: 'dare', name: 'Dare', emoji: '🔥', prompt: 'Give me a dare - I might just do it!' },
  { id: 'guesswho', name: 'Guess Who', emoji: '🎭', prompt: 'Send me a message and let me guess who you are!' },
  { id: 'hottake', name: 'Hot Take', emoji: '🌶️', prompt: "What's your hot take about me?" },
  { id: 'wouldyourather', name: 'Would You Rather', emoji: '🤔', prompt: 'Would you rather... Ask me anything!' },
];

export default function SendMessageScreen() {
  const params = useLocalSearchParams<{ username: string; mode?: string }>();
  const username = params.username;
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [gameMode, setGameMode] = useState('anonymous');

  useEffect(() => {
    const mode = params.mode || 'anonymous';
    if (MODES.find(m => m.id === mode)) {
      setGameMode(mode);
    }
  }, [params.mode]);

  const currentMode = MODES.find(m => m.id === gameMode) || MODES[0];

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!username) {
      Alert.alert('Error', 'Missing username in URL.');
      return;
    }

    try {
      setSending(true);
      
      const { error } = await supabase.from('messages').insert({
        recipient_username: String(username).toLowerCase(),
        content: trimmed,
        game_mode: gameMode,
      });

      if (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Could not send your message. Please try again.');
        return;
      }

      setContent('');
      Alert.alert('Sent! 🎉', 'Your anonymous message was sent!');
    } catch (e) {
      console.error('Error sending message:', e);
      Alert.alert('Error', 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const disabled = !content.trim() || sending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.modeEmoji}>{currentMode.emoji}</Text>
          <Text style={styles.title}>{currentMode.name} Mode</Text>
          <Text style={styles.subtitle}>
            to <Text style={styles.username}>@{username}</Text>
          </Text>
          <Text style={styles.prompt}>{currentMode.prompt}</Text>

          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>

          <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={disabled}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send anonymously</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Your identity is not stored. Only the message is sent.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modeEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  username: {
    fontWeight: '700',
    color: '#A78BFA',
  },
  prompt: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  input: {
    marginTop: 20,
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
  },
  charCount: {
    marginTop: 8,
    textAlign: 'right',
    fontSize: 12,
    color: '#9CA3AF',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 12,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
