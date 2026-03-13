import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { MessageCircle } from 'lucide-react-native';
import { Message } from '@/lib/supabase';

const GAME_MODE_COLORS: Record<string, string> = {
  anonymous: '#6B7280',
  truth: '#3B82F6',
  dare: '#EF4444',
  hottake: '#F59E0B',
  wouldyourather: '#8B5CF6',
  guesswho: '#10B981',
};

const GAME_MODE_LABELS: Record<string, string> = {
  anonymous: 'Anonymous',
  truth: 'Truth',
  dare: 'Dare',
  hottake: 'Hot Take',
  wouldyourather: 'Would You Rather',
  guesswho: 'Guess Who',
};

function MessageCard({ message }: { message: Message }) {
  const router = useRouter();
  const gameModeColor = GAME_MODE_COLORS[message.game_mode] || '#6B7280';
  const gameModeLabel = GAME_MODE_LABELS[message.game_mode] || 'Message';
  
  const timeAgo = () => {
    const now = new Date();
    const sent = new Date(message.sent_at);
    const diffMs = now.getTime() - sent.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <TouchableOpacity
      style={[styles.messageCard, !message.is_read && styles.unreadCard]}
      onPress={() => router.push(`/message/${message.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.gameBadge, { backgroundColor: gameModeColor }]}>
          <Text style={styles.gameBadgeText}>{gameModeLabel}</Text>
        </View>
        <View style={styles.statusContainer}>
          {!message.is_read && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          <Text style={styles.timeText}>{timeAgo()}</Text>
        </View>
      </View>
      
      <Text style={styles.teaserText}>
        {!message.is_read ? '🔥 NEW ANONYMOUS MESSAGE' : 'SECRET MESSAGE'}
      </Text>
      
      <View style={styles.hintsPreview}>
        {message.sender_city && (
          <Text style={styles.hintPreview}>📍 {message.sender_city}</Text>
        )}
        {message.sender_device && (
          <Text style={styles.hintPreview}>📱 {message.sender_device}</Text>
        )}
        {message.sender_time_of_day && (
          <Text style={styles.hintPreview}>🕐 {message.sender_time_of_day}</Text>
        )}
      </View>
      
      <Text style={styles.teaserSubtext}>Tap to view message</Text>
      
      {!message.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

function EmptyState() {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <MessageCircle size={80} color="#D1D5DB" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptyDescription}>
        Share your link to receive your first anonymous message
      </Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => router.push('/(tabs)/share')}
      >
        <Text style={styles.shareButtonText}>Share Your Link</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function InboxScreen() {
  const { user } = useAuthStore();
  const { messages, loading, loadMessages, subscribeToMessages, unsubscribe, refreshMessages } =
    useMessageStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Inbox: user changed', user?.username);
    if (user?.username) {
      console.log('Loading messages for:', user.username);
      loadMessages(user.username);
      subscribeToMessages(user.username);
      
      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        refreshMessages(user.username);
      }, 5000);
      
      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    } else {
      console.log('No user found in inbox');
    }

    return () => {
      unsubscribe();
    };
  }, [user?.username]);

  const handleRefresh = async () => {
    if (user?.username) {
      setRefreshing(true);
      await refreshMessages(user.username);
      setRefreshing(false);
    }
  };

  // If no user, show empty state
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Messages</Text>
        </View>
        <EmptyState />
      </View>
    );
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageCard message={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#A78BFA"
            />
          }
        />
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  unreadBadge: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderColor: '#A78BFA',
    borderWidth: 2,
    backgroundColor: '#FEFEFE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  gameBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gameBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  teaserText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 8,
    textAlign: 'center',
  },
  hintsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
  hintPreview: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  teaserSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A78BFA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F0F0F',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
