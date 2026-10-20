import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Card = { key: string; label: string; value: number; context?: string };

export default function OwnerDashboardScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ cards: Card[] }>('/api/dashboard/summary');
        setCards(data.cards ?? []);
      } catch {
        setCards([]);
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
        <Text style={styles.title}>Owner Dashboard</Text>
        <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
          {cards.map((c) => (
            <View key={c.key} style={styles.card}>
              <Text style={styles.label}>{c.label}</Text>
              <Text style={styles.value}>{c.value}</Text>
              {c.context ? <Text style={styles.context}>{c.context}</Text> : null}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#F5F5F5' },
  label: { color: '#6B7280', fontWeight: '600' },
  value: { fontSize: 24, fontWeight: '700', color: '#3C5E45', marginTop: 4 },
  context: { color: '#6B7280', marginTop: 2, fontSize: 12 }
});