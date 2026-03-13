import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { MessageCircle } from 'lucide-react-native';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { createUser } = useAuthStore();

  const handleCreateAccount = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore)');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createUser(username);

    if (result.success) {
      console.log('User created successfully, navigating to inbox');
      router.replace('/(tabs)/inbox');
    } else {
      setError(result.error || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepContainer}>
          <View style={styles.logoContainer}>
            <MessageCircle size={64} color="#A78BFA" strokeWidth={2} />
            <Text style={styles.appName}>anonyms</Text>
            <Text style={styles.tagline}>Say it. No name needed.</Text>
          </View>
          
          <Text style={styles.description}>
            Get anonymous messages from friends, answer truth or dare challenges,
            and share hot takes.
          </Text>

          <Text style={styles.stepTitle}>Choose your username</Text>
          <Text style={styles.stepDescription}>
            Your link: {process.env.EXPO_PUBLIC_APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000'}/{username || 'username'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="username"
            value={username}
            onChangeText={(text) => {
              setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
              setError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity
            style={[styles.primaryButton, (!username || loading) && styles.disabledButton]}
            onPress={handleCreateAccount}
            disabled={!username || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0F0F0F',
    marginTop: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  primaryButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
  },
});
