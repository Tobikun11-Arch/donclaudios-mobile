import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<any>(null);
  const [storeStatus, setStoreStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get<any>('/api/settings');
        setSettings(s);
        const st = await api.get<any>('/api/store-status');
        setStoreStatus(st);
      } catch {
        // ignore
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
        <Text style={styles.title}>Settings</Text>
        <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
          <View style={styles.card}>
            <Text style={styles.label}>Store status</Text>
            <Text style={styles.meta}>{JSON.stringify(storeStatus ?? {}, null, 2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Site settings</Text>
            <Text style={styles.meta}>{JSON.stringify(settings ?? {}, null, 2)}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5' },
  label: { fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  meta: { color: '#6B7280', fontSize: 12 }
});