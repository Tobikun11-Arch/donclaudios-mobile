import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Space } from '@/constants/design';
import { useAuth } from '@/lib/auth-context';
import { initialsOf } from '@/lib/format';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Customer';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          {user?.profilePhoto ? (
            <Image
              source={{ uri: user.profilePhoto }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <ThemedText style={styles.avatarInitials}>
                {initialsOf(user?.firstName, user?.lastName)}
              </ThemedText>
            </View>
          )}

          <ThemedText type="subtitle" style={styles.name}>
            {fullName}
          </ThemedText>
          {user?.email ? (
            <ThemedText type="small" themeColor="textSecondary">
              {user.email}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.group}>
          <Row
            icon="receipt"
            label="My orders"
            hint="Track and review past orders"
            onPress={() => router.push('/(customer)/orders')}
          />
          <Row
            icon="promo"
            label="Promos"
            hint="See what’s on offer"
            onPress={() => router.push('/(customer)/customer-promos')}
          />
          <Row
            icon="bell"
            label="Notifications"
            onPress={() => router.push('/(customer)/notifications')}
          />
        </View>

        <View style={styles.group}>
          <Row
            icon="support"
            label="Help & support"
            hint="Chat with the store"
            onPress={() => router.push('/(customer)/support')}
          />
          <Row
            icon="profile"
            label="Account settings"
            onPress={() => router.push('/(customer)/settings')}
          />
        </View>

        {user?.address ? (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <AppIcon name="location" size={16} color={Palette.brand} />
              <ThemedText type="smallBold">Delivery address</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {user.address}
            </ThemedText>
          </View>
        ) : null}

        <Button
          label="Sign out"
          variant="secondary"
          onPress={signOut}
          fullWidth
          style={styles.signOut}
        />
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  hint,
  onPress
}: {
  icon: AppIconName;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={styles.rowIcon}>
        <AppIcon name={icon} size={18} color={Palette.brand} />
      </View>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {hint ? (
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      <AppIcon name="forward" size={18} color={Palette.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Space.lg, paddingBottom: Space['3xl'], gap: Space.lg },
  identity: { alignItems: 'center', gap: Space.sm, paddingTop: Space.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: Palette.surfaceAlt },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceTint
  },
  avatarInitials: { fontSize: 34, fontWeight: '800', color: Palette.deep },
  name: { fontSize: 22, lineHeight: 28 },
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
  rowText: { flex: 1, gap: 1 },
  addressCard: {
    gap: Space.sm,
    padding: Space.lg,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.lg
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signOut: { marginTop: Space.sm }
});
