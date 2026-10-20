import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/auth/auth-screen';
import { api } from '@/lib/api';

type Product = { _id: string; name: string; price: number };
type Item = { productId: string; name: string; price: number; quantity: number };

export default function CashierCounterCreateScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ products: Product[] }>('/api/products');
        setProducts(data.products ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function addItem(p: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p._id);
      if (existing) {
        return prev.map((i) => i.productId === p._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: p._id, name: p.name, price: p.price, quantity: 1 }];
    });
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post<{ order: { _id: string } }>('/api/orders/counter', {
        customerInfo: { firstName, lastName, phoneNumber: phone },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        paymentMethod: 'cash'
      });
      setReceipt(res.order._id);
      setItems([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create counter order');
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

  if (receipt) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text style={styles.title}>Receipt</Text>
        <Text style={styles.meta}>Order #{receipt}</Text>
        <PrimaryButton label="Done" onPress={() => { setReceipt(null); router.back(); }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>New Counter Order</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />

        <Text style={styles.section}>Products</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.productChip} onPress={() => addItem(item)}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>₱{item.price}</Text>
            </Pressable>
          )}
        />

        <Text style={styles.section}>Items</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} x {item.quantity}</Text>
              <Text style={styles.itemPrice}>₱{item.price * item.quantity}</Text>
            </View>
          )}
        />
        <Text style={styles.total}>Total: ₱{total}</Text>
        <PrimaryButton label="Create order" onPress={submit} loading={submitting} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  error: { color: '#C30010', marginBottom: 8 },
  meta: { color: '#6B7280', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginBottom: 8 },
  section: { fontWeight: '600', color: '#1A1A1A', marginTop: 12, marginBottom: 8 },
  productChip: { backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, marginRight: 8, minWidth: 100 },
  productName: { fontWeight: '600', color: '#1A1A1A' },
  productPrice: { color: '#3C5E45', marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { color: '#1A1A1A' },
  itemPrice: { color: '#3C5E45', fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 }
});