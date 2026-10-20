import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Product = {
  _id: string;
  name: string;
  category?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  isAvailable?: boolean;
};

export default function MenuScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ products: Product[] }>('/api/products');
        setProducts(data.products ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addToCart(p: Product) {
    setAdding(p._id);
    try {
      await api.post('/api/cart/items', {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl
      });
      router.push('/cart');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add to cart');
    } finally {
      setAdding(null);
    }
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
          <Text style={styles.title}>Menu</Text>
          <Pressable onPress={() => router.push('/cart')}>
            <Text style={styles.cartLink}>Cart</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category ?? ''}</Text>
                <Text style={styles.price}>₱{item.price}</Text>
              </View>
              <Pressable
                style={styles.addButton}
                onPress={() => addToCart(item)}
                disabled={adding === item._id}
              >
                <Text style={styles.addButtonText}>
                  {adding === item._id ? '...' : 'Add'}
                </Text>
              </Pressable>
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
  cartLink: { color: '#3C5E45', fontWeight: '600' },
  error: { color: '#C30010', marginBottom: 8 },
  card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10, alignItems: 'center' },
  image: { width: 64, height: 64, borderRadius: 8 },
  name: { fontWeight: '600', color: '#1A1A1A' },
  category: { fontSize: 12, color: '#6B7280' },
  price: { color: '#3C5E45', fontWeight: '700', marginTop: 4 },
  addButton: { backgroundColor: '#3C5E45', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontWeight: '600' }
});