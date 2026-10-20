import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Palette, Space } from '@/constants/design';
import { useAuth } from '@/lib/auth-context';

export default function CashierHome() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <ThemedText type="subtitle" style={styles.title}>
            Cashier Dashboard
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Welcome, {user?.firstName || user?.username || 'Cashier'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Full cashier UI is coming next. Use the buttons below for now.
          </ThemedText>

          <View style={styles.actions}>
            <Button label="Orders" onPress={() => router.push('/cashier-orders')} fullWidth />
            <Button label="Counter Order" onPress={() => router.push('/cashier-counter')} fullWidth />
            <Button label="Create Counter Order" onPress={() => router.push('/cashier-counter-create')} fullWidth />
          </View>
        </View>
        <Button label="Sign out" variant="secondary" onPress={signOut} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.surface },
  safe: { flex: 1, padding: Space.lg, justifyContent: 'space-between' },
  body: { gap: Space.sm },
  title: { fontSize: 24, lineHeight: 30 },
  hint: { marginTop: Space.sm },
  actions: { gap: Space.sm, marginTop: Space.xl }
});
