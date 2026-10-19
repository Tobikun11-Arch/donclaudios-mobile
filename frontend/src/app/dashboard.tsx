import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-6 py-6">
        <View style={styles.header}>
          <ThemedText type="subtitle">Dashboard</ThemedText>
          <ThemedText themeColor="textSecondary">Welcome back!</ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">Name</ThemedText>
          <ThemedText type="default">
            {user?.firstName || ''} {user?.lastName || ''}
          </ThemedText>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
            Username
          </ThemedText>
          <ThemedText type="default">{user?.username || '—'}</ThemedText>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
            Email
          </ThemedText>
          <ThemedText type="default">{user?.email || '—'}</ThemedText>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
            Account type
          </ThemedText>
          <ThemedText type="default">{user?.type || '—'}</ThemedText>
        </ThemedView>

        <View style={styles.spacer} />
        <PrimaryButton label="Sign out" onPress={() => signOut()} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, marginBottom: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 4
  },
  spaced: { marginTop: 12 },
  spacer: { flex: 1 }
});