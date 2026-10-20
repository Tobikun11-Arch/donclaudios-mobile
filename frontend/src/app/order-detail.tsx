import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type OrderItem = { quantity: number; price: number; productId?: any; name?: string };
type Order = {
  _id: string;
  orderStatus: string;
  orderType: string;
  totalAmount: number;
  items: OrderItem[];
  prepTiming?: { isOverdue?: boolean; minutesRemaining?: number | null; isRunning?: boolean };
};

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  async function cancel() {
    setCancelling(true);
    try {
      await api.post(`/api/orders/customer/track/${id}/cancel`);
      const data = await api.get<{ order: Order }>(`/api/orders/customer/track/${id}`);
      setOrder(data.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ order: Order }>(`/api/orders/customer/track/${id}`);
        setOrder(data.order);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3C5E45" />
      </ThemedView>
    );
  }

  if (error || !order) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text style={{ color: '#C30010' }}>{error || 'Order not found'}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Order {order._id}</Text>
        <Text style={styles.status}>Status: {order.orderStatus}</Text>
        <Text style={styles.meta}>Type: {order.orderType}</Text>
        <Text style={styles.meta}>Total: ₱{order.totalAmount}</Text>
        {order.prepTiming ? (
          <Text style={styles.meta}>
            {order.prepTiming.isOverdue ? 'Overdue' : `Minutes remaining: ${order.prepTiming.minutesRemaining ?? '—'}`}
          </Text>
        ) : null}
        {order.orderStatus === 'pending' ? (
          <Pressable style={styles.cancelBtn} onPress={cancel} disabled={cancelling}>
            <Text style={styles.cancelText}>{cancelling ? 'Cancelling...' : 'Cancel order'}</Text>
          </Pressable>
        ) : null}

        <Text style={styles.section}>Items</Text>
        {order.items.map((it, idx) => (
          <View key={idx} style={styles.item}>
            <Text style={styles.itemText}>
              {typeof it.productId === 'object' ? it.productId?.name ?? 'Item' : 'Item'} x {it.quantity}
            </Text>
            <Text style={styles.itemText}>₱{it.price}</Text>
          </View>
        ))}

        <Pressable style={styles.back} onPress={() => router.push(`/order-chat?id=${id}`)}>
          <Text style={styles.backText}>Open chat</Text>
        </Pressable>
        <Pressable style={styles.back} onPress={() => router.replace('/orders')}>
          <Text style={styles.backText}>Back to orders</Text>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  status: { fontSize: 16, fontWeight: '600', color: '#3C5E45' },
  meta: { color: '#6B7280', marginTop: 4 },
  section: { fontWeight: '600', color: '#1A1A1A', marginTop: 16, marginBottom: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemText: { color: '#1A1A1A' },
  back: { marginTop: 24, alignItems: 'center' },
  backText: { color: '#3C5E45', fontWeight: '600' },
  cancelBtn: { marginTop: 12, backgroundColor: '#C30010', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelText: { color: '#FFFFFF', fontWeight: '600' }
});