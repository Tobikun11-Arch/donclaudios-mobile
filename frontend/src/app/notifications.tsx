import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

type Notification = { _id: string; title?: string; message?: string; body?: string; isRead?: boolean; createdAt?: string };

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const base =
    user?.type === 'admin' ? '/api/notifications/admin' :
    user?.type === 'cashier' ? '/api/notifications/cashier' :
    '/api/notifications';

  const load = async () => {
    try {
      const data = await api.get<{ notifications: Notification[] }>(base);
      setNotifications(data.notifications ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  async function markRead(id: string) {
    try {
      await api.patch(`${base}/${id}/read`);
      await load();
    } catch {}
  }

  async function remove(id: string) {
    try {
      await api.delete(`${base}/${id}`);
      await load();
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.patch(`${base}/read-all`);
      await load();
    } catch {}
  }

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
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          {notifications.length ? (
            <Pressable onPress={markAllRead}>
              <Text style={styles.link}>Mark all read</Text>
            </Pressable>
          ) : null}
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.isRead && styles.unread]}>
              <Text style={styles.title2}>{item.title ?? 'Notification'}</Text>
              <Text style={styles.meta}>{item.message ?? item.body ?? ''}</Text>
              <View style={styles.actions}>
                {!item.isRead ? (
                  <Pressable style={styles.actionBtn} onPress={() => markRead(item._id)}>
                    <Text style={styles.actionText}>Mark read</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.deleteBtn} onPress={() => remove(item._id)}>
                  <Text style={styles.actionText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  link: { color: '#3C5E45', fontWeight: '600' },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  unread: { backgroundColor: '#E8F0E3' },
  title2: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { backgroundColor: '#3C5E45', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  deleteBtn: { backgroundColor: '#C30010', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionText: { color: '#FFFFFF', fontWeight: '600' }
});