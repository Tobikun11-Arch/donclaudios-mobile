import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Order = { _id: string; orderStatus: string; orderType: string; totalAmount: number; createdAt?: string };

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ orders: Order[] }>('/api/orders/me');
        setOrders(data.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          <Text style={styles.title}>My Orders</Text>
          <Pressable onPress={() => router.push('/menu')}>
            <Text style={styles.link}>Menu</Text>
          </Pressable>
        </View>
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/order-detail?id=${item._id}`)}>
              <Text style={styles.id}>#{item._id.slice(-6)}</Text>
              <Text style={styles.meta}>{item.orderType} • {item.orderStatus}</Text>
              <Text style={styles.total}>₱{item.totalAmount}</Text>
            </Pressable>
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
  id: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  total: { color: '#3C5E45', fontWeight: '700', marginTop: 4 }
});