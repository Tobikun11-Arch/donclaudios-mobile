import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Palette, Space } from '@/constants/design';
import { useAuth } from '@/lib/auth-context';

export default function OwnerHome() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <ThemedText type="subtitle" style={styles.title}>
            Owner Dashboard
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Welcome, {user?.firstName || user?.username || 'Admin'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Full owner UI is coming next. Use the buttons below for now.
          </ThemedText>

          <View style={styles.actions}>
            <Button label="Dashboard" onPress={() => router.push('/owner-dashboard')} fullWidth />
            <Button label="Products" onPress={() => router.push('/owner-products')} fullWidth />
            <Button label="Inventory" onPress={() => router.push('/owner-inventory')} fullWidth />
            <Button label="Orders/Reports" onPress={() => router.push('/owner-reports')} fullWidth />
            <Button label="Promos" onPress={() => router.push('/owner-promos')} fullWidth />
            <Button label="Cashiers" onPress={() => router.push('/owner-cashiers')} fullWidth />
            <Button label="Categories" onPress={() => router.push('/owner-categories')} fullWidth />
            <Button label="Ingredients" onPress={() => router.push('/owner-ingredients')} fullWidth />
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
