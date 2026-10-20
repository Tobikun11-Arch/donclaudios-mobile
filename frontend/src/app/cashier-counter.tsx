import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type CounterOrder = { _id: string; totalAmount: number; orderStatus: string; createdAt?: string };

export default function CashierCounterScreen() {
  const [orders, setOrders] = useState<CounterOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.get<{ orders: CounterOrder[] }>('/api/orders/counter');
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

  async function voidOrder(id: string) {
    try {
      await api.post(`/api/orders/counter/${id}/void`);
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
        <Text style={styles.title}>Counter Orders</Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No counter orders.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.id}>#{item._id.slice(-6)}</Text>
              <Text style={styles.meta}>{item.orderStatus}</Text>
              <Text style={styles.total}>₱{item.totalAmount}</Text>
              <Pressable style={styles.btn} onPress={() => voidOrder(item._id)}>
                <Text style={styles.btnText}>Void</Text>
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
  btn: { marginTop: 8, backgroundColor: '#C30010', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '600' }
});