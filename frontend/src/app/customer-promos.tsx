import { useEffect, useState } from 'react';
import { Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Promo = { _id: string; name?: string; title?: string; description?: string; discountType?: string; discountValue?: number };

export default function CustomerPromosScreen() {
  const router = useRouter();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ promos: Promo[] }>('/api/promos');
        setPromos(data.promos ?? []);
      } catch {
        setPromos([]);
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
        <Text style={styles.title}>Promos</Text>
        <FlatList
          data={promos}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No promos.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/promo-detail?id=${item._id}`)}>
              <Text style={styles.name}>{item.name ?? item.title ?? 'Promo'}</Text>
              {item.description ? <Text style={styles.meta}>{item.description}</Text> : null}
            </Pressable>
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
  name: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 }
});