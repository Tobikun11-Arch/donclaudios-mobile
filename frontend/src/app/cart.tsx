import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type Cart = { items: CartItem[] };

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.get<{ cart: Cart }>('/api/cart/me');
      setCart(data.cart ?? { items: [] });
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function setQty(productId: string, quantity: number) {
    try {
      const data = await api.patch<{ cart: Cart }>(`/api/cart/items/${productId}`, { quantity });
      setCart(data.cart ?? { items: [] });
    } catch {}
  }

  async function remove(productId: string) {
    try {
      const data = await api.delete<{ cart: Cart }>(`/api/cart/items/${productId}`);
      setCart(data.cart ?? { items: [] });
    } catch {}
  }

  const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

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
          <Text style={styles.title}>Cart</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Back</Text>
          </Pressable>
        </View>
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item.productId}
          ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₱{item.price} x {item.quantity}</Text>
              </View>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => setQty(item.productId, Math.max(1, item.quantity - 1))}>
                  <Text style={styles.qtyBtn}>-</Text>
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable onPress={() => setQty(item.productId, item.quantity + 1)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => remove(item.productId)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₱{total}</Text>
          <Pressable
            style={[styles.checkoutBtn, cart.items.length === 0 && styles.disabled]}
            disabled={cart.items.length === 0}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  link: { color: '#3C5E45', fontWeight: '600' },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  card: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10, alignItems: 'center' },
  name: { fontWeight: '600', color: '#1A1A1A' },
  price: { color: '#6B7280', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { fontSize: 18, fontWeight: '700', color: '#3C5E45', paddingHorizontal: 8 },
  qty: { fontWeight: '600' },
  remove: { color: '#C30010', marginLeft: 8 },
  footer: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, gap: 8 },
  total: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  checkoutBtn: { backgroundColor: '#3C5E45', padding: 14, borderRadius: 10, alignItems: 'center' },
  checkoutText: { color: '#FFFFFF', fontWeight: '600' },
  disabled: { opacity: 0.5 }
});