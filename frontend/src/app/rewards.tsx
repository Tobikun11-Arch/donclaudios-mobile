import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Product = { _id: string; name: string; pointsRequired: number };
type Redemption = { _id: string; productName: string; redeemCode: string; status: string };

export default function RewardsScreen() {
  const [points, setPoints] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.get<{ points: number; products: Product[]; redemptions: Redemption[] }>('/api/rewards');
      setPoints(data.points ?? 0);
      setProducts(data.products ?? []);
      setRedemptions(data.redemptions ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function redeem(productId: string) {
    try {
      await api.post('/api/rewards/redeem', { productId, quantity: 1 });
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
        <Text style={styles.title}>Rewards</Text>
        <Text style={styles.points}>Points: {points}</Text>
        <Text style={styles.section}>Redeemable</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No redeemable products.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.pointsRequired} pts</Text>
              <Pressable style={styles.btn} onPress={() => redeem(item._id)}>
                <Text style={styles.btnText}>Redeem</Text>
              </Pressable>
            </View>
          )}
        />
        <Text style={styles.section}>My redemptions</Text>
        <FlatList
          data={redemptions}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No redemptions.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.productName}</Text>
              <Text style={styles.meta}>Code: {item.redeemCode} • {item.status}</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  points: { fontSize: 18, fontWeight: '700', color: '#3C5E45' },
  section: { fontWeight: '600', color: '#1A1A1A', marginTop: 16, marginBottom: 8 },
  empty: { color: '#6B7280', marginTop: 12, textAlign: 'center' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  name: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  btn: { marginTop: 8, backgroundColor: '#3C5E45', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '600' }
});