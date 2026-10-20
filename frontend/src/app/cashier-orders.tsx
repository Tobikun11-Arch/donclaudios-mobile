import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Order = { _id: string; orderStatus: string; orderType: string; totalAmount: number; createdAt?: string };

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'completed', 'cancelled'];

export default function CashierOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.get<{ orders: Order[] }>('/api/orders/all');
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function advance(order: Order) {
    const idx = STATUSES.indexOf(order.orderStatus);
    const next = STATUSES[Math.min(idx + 1, STATUSES.length - 2)];
    if (!next || next === order.orderStatus) return;
    try {
      await api.patch(`/api/orders/${order._id}/status`, { status: next });
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
        <Text style={styles.title}>Order Queue</Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No orders.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.id}>#{item._id.slice(-6)}</Text>
              <Text style={styles.meta}>{item.orderType} • {item.orderStatus}</Text>
              <Text style={styles.total}>₱{item.totalAmount}</Text>
              <Pressable style={styles.btn} onPress={() => advance(item)}>
                <Text style={styles.btnText}>Advance</Text>
              </Pressable>
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
  id: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  total: { color: '#3C5E45', fontWeight: '700', marginTop: 4 },
  btn: { marginTop: 8, backgroundColor: '#3C5E45', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '600' }
});