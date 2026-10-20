import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Product = { _id: string; name: string; stock?: number };
type Movement = { _id: string; type: string; quantity: number; newStock?: number; note?: string; createdAt?: string };

export default function OwnerInventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const data = await api.get<{ products: Product[] }>('/api/products');
      setProducts(data.products ?? []);
      const m = await api.get<{ movements: Movement[] }>('/api/inventory/movements');
      setMovements(m.movements ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function restock(id: string) {
    const q = Number(qty[id] || '1');
    try {
      await api.patch(`/api/inventory/${id}/restock`, { quantity: q, note: 'mobile' });
      await load();
    } catch {}
  }

  async function adjust(id: string) {
    const q = Number(qty[id] || '-1');
    try {
      await api.patch(`/api/inventory/${id}/adjust`, { quantity: q, reason: 'adjustment', note: 'mobile' });
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
        <Text style={styles.title}>Inventory</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Stock: {item.stock ?? 0}</Text>
              <TextInput
                style={styles.input}
                placeholder="Qty"
                keyboardType="numeric"
                value={qty[item._id] ?? ''}
                onChangeText={(v) => setQty((p) => ({ ...p, [item._id]: v }))}
              />
              <View style={styles.row}>
                <Pressable style={styles.btn} onPress={() => restock(item._id)}>
                  <Text style={styles.btnText}>Restock</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnAlt]} onPress={() => adjust(item._id)}>
                  <Text style={styles.btnText}>Adjust</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
        <Text style={styles.section}>Recent activity</Text>
        <FlatList
          data={movements}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No activity.</Text>}
          renderItem={({ item }) => (
            <View style={styles.movement}>
              <Text style={styles.name}>{item.type} {item.quantity > 0 ? `+${item.quantity}` : item.quantity}</Text>
              <Text style={styles.meta}>
                {item.note ? `${item.note} • ` : ''}new stock {item.newStock ?? '—'}
                {item.createdAt ? ` • ${new Date(item.createdAt).toLocaleString()}` : ''}
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  name: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, backgroundColor: '#3C5E45', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnAlt: { backgroundColor: '#6B7280' },
  btnText: { color: '#FFFFFF', fontWeight: '600' },
  section: { fontWeight: '700', color: '#1A1A1A', marginTop: 20, marginBottom: 8 },
  empty: { color: '#6B7280', marginTop: 8 },
  movement: { padding: 10, borderRadius: 10, backgroundColor: '#F5F5F5', marginBottom: 8 }
});