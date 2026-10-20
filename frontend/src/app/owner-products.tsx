import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Product = { _id: string; name: string; category?: string; price: number; stock?: number };

export default function OwnerProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.get<{ products: Product[] }>('/api/products');
      setProducts(data.products ?? []);
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

  async function remove(id: string) {
    try {
      await api.delete(`/api/products/${id}`);
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
          <Text style={styles.title}>Products</Text>
          <Pressable style={styles.newBtn} onPress={() => router.push('/product-form')}>
            <Text style={styles.newBtnText}>+ New</Text>
          </Pressable>
        </View>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No products.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.category} • ₱{item.price} • stock {item.stock ?? 0}</Text>
              <View style={styles.actions}>
                <Pressable style={styles.editBtn} onPress={() => router.push(`/product-form?id=${item._id}`)}>
                  <Text style={styles.btnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => remove(item._id)}>
                  <Text style={styles.btnText}>Delete</Text>
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
  newBtn: { backgroundColor: '#3C5E45', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { color: '#FFFFFF', fontWeight: '600' },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  name: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, backgroundColor: '#C30010', padding: 8, borderRadius: 8, alignItems: 'center' },
  editBtn: { flex: 1, backgroundColor: '#3C5E45', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '600' }
});