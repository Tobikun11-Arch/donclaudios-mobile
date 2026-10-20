import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/auth/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const roleLabel =
    user?.type === 'admin' ? 'Owner' : user?.type === 'cashier' ? 'Cashier' : 'Customer';

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-6 py-6">
        <View style={styles.header}>
          <ThemedText type="subtitle">Dashboard</ThemedText>
          <ThemedText themeColor="textSecondary">
            Welcome back, {user?.firstName ?? ''}!
          </ThemedText>
          <ThemedText type="smallBold" style={styles.roleBadge}>
            {roleLabel}
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">Name</ThemedText>
          <ThemedText type="default">
            {user?.firstName || ''} {user?.lastName || ''}
          </ThemedText>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
            Email
          </ThemedText>
          <ThemedText type="default">{user?.email || '—'}</ThemedText>

          {user?.phoneNumber ? (
            <>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
                Phone
              </ThemedText>
              <ThemedText type="default">{user.phoneNumber}</ThemedText>
            </>
          ) : null}

          {user?.address ? (
            <>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
                Address
              </ThemedText>
              <ThemedText type="default">{user.address}</ThemedText>
            </>
          ) : null}

          {user?.type === 'admin' ? (
            <>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.spaced}>
                Business
              </ThemedText>
              <ThemedText type="default">{user.businessName || '—'}</ThemedText>
            </>
          ) : null}
        </ThemedView>

        <View style={styles.actions}>
          {user?.type === 'customer' ? (
            <>
              <PrimaryButton label="Browse menu" onPress={() => router.push('/menu')} />
              <PrimaryButton label="My cart" onPress={() => router.push('/cart')} />
              <PrimaryButton label="My orders" onPress={() => router.push('/orders')} />
              <PrimaryButton label="Profile" onPress={() => router.push('/profile')} />
              <PrimaryButton label="Promos" onPress={() => router.push('/customer-promos')} />
              <PrimaryButton label="Rewards" onPress={() => router.push('/rewards')} />
            </>
          ) : null}
          {user?.type === 'cashier' ? (
            <>
              <PrimaryButton label="Order queue" onPress={() => router.push('/cashier-orders')} />
              <PrimaryButton label="Counter orders" onPress={() => router.push('/cashier-counter')} />
              <PrimaryButton label="New counter order" onPress={() => router.push('/cashier-counter-create')} />
            </>
          ) : null}
          {user?.type === 'admin' ? (
            <>
              <PrimaryButton label="Dashboard" onPress={() => router.push('/owner-dashboard')} />
              <PrimaryButton label="Products" onPress={() => router.push('/owner-products')} />
              <PrimaryButton label="Inventory" onPress={() => router.push('/owner-inventory')} />
              <PrimaryButton label="Promos" onPress={() => router.push('/owner-promos')} />
              <PrimaryButton label="Settings" onPress={() => router.push('/settings')} />
              <PrimaryButton label="Categories" onPress={() => router.push('/owner-categories')} />
              <PrimaryButton label="Cashiers" onPress={() => router.push('/owner-cashiers')} />
              <PrimaryButton label="Reports" onPress={() => router.push('/owner-reports')} />
              <PrimaryButton label="Ingredients" onPress={() => router.push('/owner-ingredients')} />
              <PrimaryButton label="Support inbox" onPress={() => router.push('/support-admin')} />
            </>
          ) : null}
        </View>
        <PrimaryButton label="Notifications" onPress={() => router.push('/notifications')} />
        <PrimaryButton label="Reviews" onPress={() => router.push('/reviews')} />
        <PrimaryButton label="Support" onPress={() => router.push('/support')} />
        <View style={styles.spacer} />
        <PrimaryButton label="Sign out" onPress={() => signOut()} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, marginBottom: 16 },
  card: { borderRadius: 16, padding: 16, gap: 4 },
  spaced: { marginTop: 12 },
  spacer: { flex: 1 },
  roleBadge: { color: '#3C5E45', marginTop: 4 },
  actions: { gap: 8, marginBottom: 12 }
});