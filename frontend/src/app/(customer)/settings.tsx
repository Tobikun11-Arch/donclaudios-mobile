import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Space } from '@/constants/design';
import { useAuth } from '@/lib/auth-context';
import { initialsOf } from '@/lib/format';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Customer';

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Settings
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarInitials}>
              {initialsOf(user?.firstName, user?.lastName)}
            </ThemedText>
          </View>
          <View style={styles.profileText}>
            <ThemedText type="smallBold">{fullName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.email || user?.phoneNumber}
            </ThemedText>
          </View>
        </View>

        <View style={styles.group}>
          <Row icon="profile" label="Personal details" />
          <Row icon="lock" label="Change password" />
          <Row icon="location" label="Addresses" />
        </View>

        <View style={styles.group}>
          <Row icon="bell" label="Notifications" />
          <Row icon="support" label="Help & support" onPress={() => router.push('/(customer)/support')} />
        </View>

        <Button
          label="Sign out"
          variant="secondary"
          onPress={signOut}
          fullWidth
          style={styles.signOut}
        />

        <ThemedText type="small" themeColor="textSecondary" style={styles.version}>
          Don Claudio’s · Mobile
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  onPress
}: {
  icon: Parameters<typeof AppIcon>[0]['name'];
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? 0.7 : 1 }
      ]}>
      <View style={styles.rowIcon}>
        <AppIcon name={icon} size={18} color={Palette.brand} />
      </View>
      <ThemedText type="smallBold" style={styles.rowLabel}>
        {label}
      </ThemedText>
      {onPress ? <AppIcon name="forward" size={18} color={Palette.faint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md
  },
  title: { fontSize: 28, lineHeight: 34 },
  content: { padding: Space.lg, paddingBottom: Space['3xl'], gap: Space.lg },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.lg,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.lg
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: { fontSize: 20, fontWeight: '800', color: Palette.deep },
  profileText: { flex: 1, gap: 2 },
  group: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.divider
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowLabel: { flex: 1 },
  signOut: { marginTop: Space.sm },
  version: { textAlign: 'center' }
});
