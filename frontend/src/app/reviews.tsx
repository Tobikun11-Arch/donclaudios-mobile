import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

type Review = { _id: string; rating?: number; comment?: string; status?: string };

export default function ReviewsScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const endpoint = user?.type === 'admin' ? '/api/reviews/admin' : '/api/reviews/my';

  const load = async () => {
    try {
      const data = await api.get<{ reviews: Review[] }>(endpoint);
      setReviews(data.reviews ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    try {
      await api.patch(`/api/reviews/${id}/status`, { status });
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
        <Text style={styles.title}>Reviews</Text>
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No reviews.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>Rating: {item.rating ?? 0}</Text>
              <Text style={styles.meta}>{item.comment ?? ''}</Text>
              {item.status ? <Text style={styles.meta}>Status: {item.status}</Text> : null}
              {user?.type === 'admin' ? (
                <View style={styles.row}>
                  <Pressable style={styles.btn} onPress={() => updateStatus(item._id, 'approved')}>
                    <Text style={styles.btnText}>Approve</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.btnAlt]} onPress={() => updateStatus(item._id, 'rejected')}>
                    <Text style={styles.btnText}>Reject</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
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
  meta: { color: '#6B7280', marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, backgroundColor: '#3C5E45', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnAlt: { backgroundColor: '#6B7280' },
  btnText: { color: '#FFFFFF', fontWeight: '600' }
});