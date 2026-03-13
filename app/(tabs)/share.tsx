import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { useAuthStore } from '@/stores/authStore';
import {
  Copy,
  Share2,
  MessageCircle,
  Instagram,
  Dice5,
  Sparkles,
} from 'lucide-react-native';

const THEMES = [
  {
    id: 'minimal',
    name: 'Minimal',
    gradient: ['#FFFFFF', '#F3F4F6'],
    textColor: '#111827',
    accent: '#A78BFA',
  },
  {
    id: 'neon',
    name: 'Neon',
    gradient: ['#0F172A', '#4C1D95'],
    textColor: '#F9FAFB',
    accent: '#F97316',
  },
  {
    id: 'soft',
    name: 'Soft',
    gradient: ['#FDE2E4', '#F4ACB7'],
    textColor: '#1F2933',
    accent: '#F97373',
  },
  {
    id: 'bold',
    name: 'Bold',
    gradient: ['#FF6B6B', '#4ECDC4'],
    textColor: '#FFFFFF',
    accent: '#111827',
  },
  {
    id: 'glass',
    name: 'Glass',
    gradient: ['#E3F2FD', '#90CAF9'],
    textColor: '#0F172A',
    accent: '#2563EB',
  },
];

const MODES = [
  {
    id: 'anonymous',
    name: 'Anonymous',
    emoji: '👻',
    prompt: "What's one thing you've\nalways wanted to tell me?",
    color: '#6B7280',
  },
  {
    id: 'truth',
    name: 'Truth',
    emoji: '💯',
    prompt: 'Ask me a truth question\nI dare you!',
    color: '#3B82F6',
  },
  {
    id: 'dare',
    name: 'Dare',
    emoji: '🔥',
    prompt: 'Give me a dare\nI might just do it!',
    color: '#EF4444',
  },
  {
    id: 'guesswho',
    name: 'Guess Who',
    emoji: '🎭',
    prompt: 'Send me a message\nLet me guess who you are!',
    color: '#10B981',
  },
  {
    id: 'hottake',
    name: 'Hot Take',
    emoji: '🌶️',
    prompt: "What's your hot take\nabout me?",
    color: '#F59E0B',
  },
  {
    id: 'wouldyourather',
    name: 'Would You Rather',
    emoji: '🤔',
    prompt: 'Would you rather...\nAsk me anything!',
    color: '#8B5CF6',
  },
];

export default function ShareScreen() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState(user?.theme || 'minimal');
  const [currentMode, setCurrentMode] = useState(MODES[0]);
  const viewShotRef = useRef<ViewShotRef | null>(null);

  const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3000';
  const baseUrl = appUrl.replace(/\/$/, '');
  const userLink = `${baseUrl}/${user?.username}`;

  const currentTheme =
    THEMES.find((t) => t.id === currentThemeId) || THEMES[0];

  const rollTheme = () => {
    const otherThemes = THEMES.filter((t) => t.id !== currentThemeId);
    const next =
      otherThemes[Math.floor(Math.random() * otherThemes.length)] || THEMES[0];
    setCurrentThemeId(next.id);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(userLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${currentMode.emoji} Send me a ${currentMode.name.toLowerCase()} message!\n${userLink}`,
        url: userLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleInstagramShare = async () => {
    try {
      if (!viewShotRef.current) {
        await handleShare();
        return;
      }

      const uri = await viewShotRef.current.capture?.({
        format: 'png',
        quality: 1,
      });

      if (!uri) {
        await handleShare();
        return;
      }

      await Share.share({
        url: uri,
        message: `${currentMode.emoji} ${currentMode.name}\n${userLink}`,
      });
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      Alert.alert(
        'Share Error',
        'Could not open Instagram share sheet. You can still share your link normally.',
        [
          {
            text: 'Share Link',
            onPress: handleShare,
          },
          { text: 'OK' },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Share Your Link</Text>
        <Text style={styles.headerSubtitle}>
          Choose a mode and share to your story
        </Text>
      </View>

      <View style={styles.modesSection}>
        <View style={styles.modesSectionHeader}>
          <Sparkles size={20} color="#A78BFA" />
          <Text style={styles.modesTitle}>Choose Mode</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modesScroll}
        >
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeChip,
                currentMode.id === mode.id && styles.modeChipActive,
                { borderColor: mode.color },
              ]}
              onPress={() => setCurrentMode(mode)}
            >
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              <Text
                style={[
                  styles.modeName,
                  currentMode.id === mode.id && { color: mode.color },
                ]}
              >
                {mode.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.stickerSection}>
        <ViewShot
          ref={viewShotRef}
          style={styles.stickerWrapper}
          options={{ format: 'png', quality: 1 }}
        >
          <LinearGradient
            colors={[currentTheme.gradient[0], currentTheme.gradient[1]]}
            style={styles.stickerCard}
          >
            <View style={styles.stickerHeader}>
              <View style={[styles.stickerIcon, { backgroundColor: `${currentMode.color}20` }]}>
                <Text style={styles.stickerEmoji}>{currentMode.emoji}</Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.stickerTitle,
                    { color: currentTheme.textColor },
                  ]}
                >
                  {currentMode.name} Mode
                </Text>
                <Text
                  style={[
                    styles.stickerSubtitle,
                    { color: currentTheme.textColor },
                  ]}
                >
                  Send me anonymous messages
                </Text>
              </View>
            </View>

            <View style={styles.stickerBody}>
              <Text
                style={[
                  styles.stickerPrompt,
                  { color: currentTheme.textColor },
                ]}
              >
                {currentMode.prompt}
              </Text>
            </View>

            <View style={styles.stickerFooter}>
              <Text style={styles.footerLabel}>Reply at</Text>
              <Text style={styles.footerLinkText}>
                {baseUrl}/{user?.username}
              </Text>
            </View>
          </LinearGradient>
        </ViewShot>

        <TouchableOpacity style={styles.diceButton} onPress={rollTheme}>
          <Dice5 size={20} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.themeHintText}>
          Theme: {currentTheme.name} · Tap the dice to shuffle
        </Text>
      </View>

      <View style={styles.linkCard}>
        <MessageCircle size={40} color={currentMode.color} strokeWidth={2} />
        <Text style={styles.linkLabel}>Your {currentMode.name} link</Text>
        <Text style={styles.link}>{baseUrl.replace(/https?:\/\//, '')}/{user?.username}</Text>

        <TouchableOpacity style={[styles.copyButton, { backgroundColor: currentMode.color }]} onPress={handleCopyLink}>
          <Copy size={20} color="#fff" />
          <Text style={styles.copyButtonText}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Share to</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleInstagramShare}
        >
          <View style={styles.actionIconContainer}>
            <Instagram size={24} color="#E4405F" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Instagram Story</Text>
            <Text style={styles.actionDescription}>
              Share sticker directly to your story
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <View style={styles.actionIconContainer}>
            <Share2 size={24} color="#A78BFA" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Share via...</Text>
            <Text style={styles.actionDescription}>
              WhatsApp, TikTok, Messages, and more
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.message_count || 0}</Text>
            <Text style={styles.statLabel}>Messages Received</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips to get more messages</Text>
        <View style={styles.tip}>
          <Text style={styles.tipNumber}>1</Text>
          <Text style={styles.tipText}>
            Try different modes for different vibes
          </Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipNumber}>2</Text>
          <Text style={styles.tipText}>
            Share stickers directly to your Instagram story
          </Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipNumber}>3</Text>
          <Text style={styles.tipText}>
            Mix it up - share different modes throughout the day
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  modesSection: {
    marginBottom: 24,
  },
  modesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  modesScroll: {
    gap: 8,
    paddingRight: 20,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modeChipActive: {
    borderWidth: 2,
    backgroundColor: '#F9FAFB',
  },
  modeEmoji: {
    fontSize: 20,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stickerSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  stickerWrapper: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 9 / 16,
    borderRadius: 28,
    overflow: 'hidden',
  },
  stickerCard: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  stickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stickerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerEmoji: {
    fontSize: 28,
  },
  stickerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  stickerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.85,
  },
  stickerBody: {
    paddingVertical: 12,
  },
  stickerPrompt: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  stickerFooter: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  diceButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  themeHintText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },
  linkCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F0F0F',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#A78BFA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F0F0F',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F0FF',
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
