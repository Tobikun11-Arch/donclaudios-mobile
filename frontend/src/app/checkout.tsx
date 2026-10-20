import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/auth/auth-screen';
import { api } from '@/lib/api';

type CartItem = { productId: string; name: string; price: number; quantity: number };

export default function CheckoutScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ cart: { items: CartItem[] } }>('/api/cart/me');
        setItems(data.cart?.items ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 49 : 0;
  const grandTotal = total + deliveryFee;

  async function onSubmit() {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post<{ order: { _id: string } }>('/api/orders/me', {
        orderType,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        totalAmount: grandTotal,
        paymentMethod: 'cash'
      });
      router.replace(`/order-detail?id=${res.order._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
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
        <Text style={styles.title}>Checkout</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.section}>Order type</Text>
        <View style={styles.row}>
          {(['pickup', 'delivery'] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, orderType === t && styles.chipActive]}
              onPress={() => setOrderType(t)}
            >
              <Text style={[styles.chipText, orderType === t && styles.chipTextActive]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Subtotal: ₱{total}</Text>
          {deliveryFee ? <Text style={styles.summaryText}>Delivery fee: ₱{deliveryFee}</Text> : null}
          <Text style={styles.grand}>Total: ₱{grandTotal}</Text>
        </View>

        <PrimaryButton label="Place order" onPress={onSubmit} loading={submitting} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  error: { color: '#C30010', marginBottom: 8 },
  section: { fontWeight: '600', color: '#1A1A1A', marginTop: 12, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F5F5' },
  chipActive: { backgroundColor: '#3C5E45' },
  chipText: { color: '#1A1A1A', textTransform: 'capitalize' },
  chipTextActive: { color: '#FFFFFF' },
  summary: { marginVertical: 16, gap: 4 },
  summaryText: { color: '#6B7280' },
  grand: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' }
});