import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

type Notification = { _id: string; title?: string; message?: string; body?: string; isRead?: boolean; createdAt?: string };

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const endpoint =
    user?.type === 'admin' ? '/api/notifications/admin' :
    user?.type === 'cashier' ? '/api/notifications/cashier' :
    '/api/notifications';

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ notifications: Notification[] }>(endpoint);
        setNotifications(data.notifications ?? []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3C5E45" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title2}>{item.title ?? 'Notification'}</Text>
              <Text style={styles.meta}>{item.message ?? item.body ?? ''}</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  title2: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 }
});