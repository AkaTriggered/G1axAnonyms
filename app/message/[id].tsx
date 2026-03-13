import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase, Message } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import {
  ArrowLeft,
  MapPin,
  Smartphone,
  Clock,
  Instagram,
  Trash2,
  Ban,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const GAME_MODE_COLORS: Record<string, string> = {
  anonymous: '#6B7280',
  truth: '#3B82F6',
  dare: '#EF4444',
  hottake: '#F59E0B',
  wouldyourather: '#8B5CF6',
  guesswho: '#10B981',
};

const GAME_MODE_LABELS: Record<string, string> = {
  anonymous: 'Anonymous Message',
  truth: 'Truth Question',
  dare: 'Dare Challenge',
  hottake: 'Hot Take',
  wouldyourather: 'Would You Rather',
  guesswho: 'Guess Who',
};

const GAME_MODE_EMOJIS: Record<string, string> = {
  anonymous: '👻',
  truth: '💯',
  dare: '🔥',
  hottake: '🌶️',
  wouldyourather: '🤔',
  guesswho: '🎭',
};

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { markAsRead, deleteMessage } = useMessageStore();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const viewShotRef = useRef<any>(null);

  useEffect(() => {
    loadMessage();
  }, [id]);

  const loadMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setMessage(data);

      if (data && !data.is_read) {
        await markAsRead(id);
      }
    } catch (error) {
      console.error('Error loading message:', error);
      Alert.alert('Error', 'Failed to load message');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToStory = async () => {
    setGenerating(true);
    try {
      const uri = await viewShotRef.current.capture();
      
      const instagramURL = `instagram://story-camera`;
      const canOpen = await Linking.canOpenURL(instagramURL);
      
      if (canOpen) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share to Instagram Story',
          UTI: 'public.png',
        });
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.log('Share error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMessage(id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (!message) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Message not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const gameModeColor = GAME_MODE_COLORS[message.game_mode] || '#6B7280';
  const gameModeLabel = GAME_MODE_LABELS[message.game_mode] || 'Message';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <ArrowLeft size={24} color="#0F0F0F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.messageCard}>
            <View style={[styles.gameBadge, { backgroundColor: gameModeColor }]}>
              <Text style={styles.gameBadgeText}>{gameModeLabel}</Text>
            </View>

            <Text style={styles.messageContent}>{message.content}</Text>

            <View style={styles.timestampContainer}>
              <Clock size={14} color="#9CA3AF" />
              <Text style={styles.timestamp}>
                {new Date(message.sent_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.instagramButton, generating && styles.disabledButton]}
            onPress={handleReplyToStory}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Instagram size={24} color="#fff" />
                <Text style={styles.instagramButtonText}>Reply with Instagram Story</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.hintsSection}>
            <View style={styles.hintsSectionHeader}>
              <Sparkles size={20} color="#A78BFA" />
              <Text style={styles.hintsSectionTitle}>Sender Hints</Text>
            </View>
            
            {message.sender_city || message.sender_device || message.sender_time_of_day ? (
              <View style={styles.hintsGrid}>
                {message.sender_city && (
                  <View style={styles.hintCard}>
                    <MapPin size={20} color="#A78BFA" />
                    <View style={styles.hintContent}>
                      <Text style={styles.hintLabel}>Location</Text>
                      <Text style={styles.hintValue}>{message.sender_city}</Text>
                    </View>
                  </View>
                )}
                {message.sender_device && (
                  <View style={styles.hintCard}>
                    <Smartphone size={20} color="#A78BFA" />
                    <View style={styles.hintContent}>
                      <Text style={styles.hintLabel}>Device</Text>
                      <Text style={styles.hintValue}>{message.sender_device}</Text>
                    </View>
                  </View>
                )}
                {message.sender_time_of_day && (
                  <View style={styles.hintCard}>
                    <Clock size={20} color="#A78BFA" />
                    <View style={styles.hintContent}>
                      <Text style={styles.hintLabel}>Time</Text>
                      <Text style={styles.hintValue}>{message.sender_time_of_day}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noHints}>No hints available for this message</Text>
            )}
          </View>

          <View style={styles.revealSection}>
            <Lock size={24} color="#9CA3AF" />
            <Text style={styles.revealTitle}>Want to know who sent this?</Text>
            <Text style={styles.revealDescription}>
              Reveal sender identity feature coming soon! 🎉
            </Text>
            <TouchableOpacity style={styles.revealButton} disabled>
              <Text style={styles.revealButtonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={styles.dangerButtonText}>Delete Message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.hiddenContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <View style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.storyTitle}>New Anonymous Message! 👀</Text>
              </View>
              
              <View style={styles.storyMessageBox}>
                <Text style={styles.storyMessage}>{message.content}</Text>
              </View>

              <View style={styles.storyFooter}>
                <Text style={styles.storyFooterText}>Reply at</Text>
                <Text style={styles.storyLink}>anonyms.link/{user?.username}</Text>
              </View>
            </View>
          </ViewShot>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backIcon: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gameBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  gameBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  messageContent: {
    fontSize: 20,
    lineHeight: 32,
    color: '#0F0F0F',
    marginBottom: 20,
    fontWeight: '500',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  instagramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#E4405F',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  instagramButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  hintsSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hintsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  hintsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  hintsGrid: {
    gap: 12,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
  },
  hintContent: {
    flex: 1,
  },
  hintLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  hintValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  noHints: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  revealSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  revealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0F0F',
    marginTop: 12,
    marginBottom: 8,
  },
  revealDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  revealButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  revealButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerZone: {
    marginBottom: 40,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  hiddenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  storyCard: {
    width: 1080,
    height: 1920,
    backgroundColor: '#A78BFA',
    padding: 80,
    justifyContent: 'space-between',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    paddingTop: 100,
  },
  storyIcon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyEmoji: {
    fontSize: 56,
  },
  storyTitleContainer: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  storySubtitle: {
    fontSize: 28,
    color: '#fff',
    opacity: 0.85,
    marginTop: 8,
  },
  storyMessageBox: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 60,
    marginVertical: 100,
  },
  storyMessage: {
    fontSize: 56,
    lineHeight: 80,
    color: '#0F0F0F',
    fontWeight: '600',
    textAlign: 'center',
  },
  storyFooter: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
  },
  storyFooterText: {
    fontSize: 36,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  storyLink: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
});
