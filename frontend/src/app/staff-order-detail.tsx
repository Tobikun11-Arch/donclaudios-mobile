import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type OrderItem = { _id: string; name?: string; quantity: number; price: number };
type Order = {
  _id: string;
  orderStatus: string;
  orderType: string;
  totalAmount: number;
  customerInfo?: { firstName?: string; lastName?: string; phoneNumber?: string };
  items: OrderItem[];
};

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'completed', 'cancelled'];

export default function StaffOrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.get<{ order: Order }>(`/api/orders/${id}`);
      setOrder(data.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3C5E45" />
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text style={{ color: '#C30010' }}>{error || 'Order not found'}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>#{order._id.slice(-6)}</Text>
        <Text style={styles.meta}>{order.orderType} • {order.orderStatus}</Text>
        {order.customerInfo ? (
          <Text style={styles.meta}>
            {order.customerInfo.firstName} {order.customerInfo.lastName}
            {order.customerInfo.phoneNumber ? ` • ${order.customerInfo.phoneNumber}` : ''}
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={order.items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name ?? 'Item'} x {item.quantity}</Text>
              <Text style={styles.itemPrice}>₱{item.price * item.quantity}</Text>
            </View>
          )}
        />
        <Text style={styles.total}>Total: ₱{order.totalAmount}</Text>

        <Text style={styles.section}>Update status</Text>
        <View style={styles.statusRow}>
          {STATUSES.filter((s) => s !== order.orderStatus && s !== 'cancelled').map((s) => (
            <Pressable key={s} style={styles.statusBtn} disabled={busy} onPress={() => setStatus(s)}>
              <Text style={styles.statusText}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.chatBtn} onPress={() => router.push(`/order-chat?id=${order._id}`)}>
          <Text style={styles.chatText}>Open chat</Text>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 8 },
  meta: { color: '#6B7280', marginTop: 2 },
  error: { color: '#C30010', marginTop: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { color: '#1A1A1A' },
  itemPrice: { color: '#3C5E45', fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  section: { fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { backgroundColor: '#3C5E45', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  statusText: { color: '#FFFFFF', fontWeight: '600' },
  chatBtn: { marginTop: 16, alignItems: 'center' },
  chatText: { color: '#3C5E45', fontWeight: '600' }
});