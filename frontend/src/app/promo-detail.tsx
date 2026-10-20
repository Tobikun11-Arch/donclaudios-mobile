import { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export default function PromoDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ promo: any }>(`/api/promos/${id}`);
        setPromo(data.promo);
      } catch {
        setPromo(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3C5E45" />
      </ThemedView>
    );
  }

  if (!promo) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text style={{ color: '#C30010' }}>Promo not found</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>{promo.name ?? promo.title ?? 'Promo'}</Text>
        {promo.description ? <Text style={styles.meta}>{promo.description}</Text> : null}
        <Text style={styles.meta}>{JSON.stringify(promo, null, 2)}</Text>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  meta: { color: '#6B7280', fontSize: 12, marginTop: 8 }
});