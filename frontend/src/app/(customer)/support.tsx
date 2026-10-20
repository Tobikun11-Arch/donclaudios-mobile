import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Space } from '@/constants/design';
import { useAuth } from '@/lib/auth-context';

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}>
          <AppIcon name="back" size={20} color={Palette.ink} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.title}>
          Help & support
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <AppIcon name="support" size={28} color={Palette.brand} />
          </View>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            Need help?
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.heroText}>
            Chat with the Don Claudio’s team about orders, payments, or anything else.
          </ThemedText>
        </View>

        <Button
          label="Start a support chat"
          onPress={() => router.push('/(customer)/support-chat')}
          fullWidth
        />

        <View style={styles.tips}>
          <ThemedText type="smallBold">Quick tips</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            For questions about a specific order, it’s usually faster to use the chat from that order’s details page.
          </ThemedText>
        </View>

        <View style={styles.account}>
          <ThemedText type="small" themeColor="textSecondary">
            Signed in as {user?.email || user?.phoneNumber || 'your account'}
          </ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: 20, lineHeight: 26 },
  content: { padding: Space.lg, paddingBottom: Space['3xl'], gap: Space.lg },
  hero: { alignItems: 'center', gap: Space.sm, paddingVertical: Space.xl },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm
  },
  heroTitle: { fontSize: 24, lineHeight: 30 },
  heroText: { textAlign: 'center', maxWidth: 280 },
  tips: {
    gap: 6,
    padding: Space.lg,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.lg
  },
  account: { alignItems: 'center' }
});
