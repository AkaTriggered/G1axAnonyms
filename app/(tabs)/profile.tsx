import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LogOut, User } from 'lucide-react-native';

const THEMES = [
  { id: 'minimal', name: 'Minimal', colors: ['#FFFFFF', '#000000'] },
  { id: 'neon', name: 'Neon', colors: ['#0F0F0F', '#A78BFA'] },
  { id: 'soft', name: 'Soft', colors: ['#FDE2E4', '#F4ACB7'] },
  { id: 'bold', name: 'Bold', colors: ['#FF6B6B', '#4ECDC4'] },
  { id: 'glass', name: 'Glass', colors: ['#E3F2FD', '#90CAF9'] },
];

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const router = useRouter();

  const handleThemeSelect = async (themeId: string) => {
    await updateUser({ theme: themeId });
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/onboarding');
  };

  const getInitials = () => {
    const name = user?.username || 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <Text style={styles.sectionDescription}>
          Choose how your profile looks to others
        </Text>
        <View style={styles.themesGrid}>
          {THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                user?.theme === theme.id && styles.themeCardSelected,
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={styles.themeColors}>
                {theme.colors.map((color, index) => (
                  <View
                    key={index}
                    style={[styles.themeColorBox, { backgroundColor: color }]}
                  />
                ))}
              </View>
              <Text style={styles.themeName}>{theme.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <User size={20} color="#6B7280" />
          <Text style={styles.settingText}>Privacy & Blocking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>anonyms v1.0.0</Text>
        <Text style={styles.footerText}>Made with 👻 for honest conversations</Text>
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
    paddingBottom: 40,
  },
  header: {
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F0F0F',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
  },
  themeCardSelected: {
    borderColor: '#A78BFA',
    backgroundColor: '#F3F0FF',
  },
  themeColors: {
    flexDirection: 'row',
    gap: 4,
  },
  themeColorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F0F0F',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  logoutText: {
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
