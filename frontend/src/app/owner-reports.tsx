import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

const PRESETS = ['today', '7d', '30d', 'thisMonth', 'lastMonth'] as const;

function money(n: unknown) {
  return `₱${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function OwnerReportsScreen() {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>('7d');
  const [summary, setSummary] = useState<any>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [operations, setOperations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [s, t, b, o] = await Promise.all([
          api.get<any>(`/api/report/summary?preset=${preset}`),
          api.get<any>(`/api/report/timeseries?preset=${preset}`),
          api.get<any>(`/api/report/breakdown?preset=${preset}&dimension=product&limit=5`),
          api.get<any>(`/api/report/operations?preset=${preset}`)
        ]);
        if (!active) return;
        setSummary(s);
        setTimeseries(t.points ?? t.data ?? t.timeseries ?? []);
        setBreakdown(b.rows ?? b.data ?? b.breakdown ?? []);
        setOperations(o);
      } catch {
        if (!active) return;
        setSummary(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [preset]);

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Reports</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={styles.presetRow}>
            {PRESETS.map((p) => (
              <Pressable
                key={p}
                style={[styles.preset, preset === p && styles.presetActive]}
                onPress={() => setPreset(p)}
              >
                <Text style={[styles.presetText, preset === p && styles.presetTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#3C5E45" />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 12 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Revenue</Text>
                <Text style={styles.metricValue}>{money(summary?.revenue ?? summary?.totalRevenue)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Orders</Text>
                <Text style={styles.metricValue}>{summary?.orderCount ?? summary?.totalOrders ?? 0}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Avg order</Text>
                <Text style={styles.metricValue}>{money(summary?.averageOrderValue ?? summary?.avgOrderValue)}</Text>
              </View>
            </View>

            {timeseries.length ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sales over time</Text>
                {timeseries.slice(-7).map((p, i) => (
                  <View key={i} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{p.date ?? p.label ?? p.period ?? i}</Text>
                    <Text style={styles.metricValue}>{money(p.revenue ?? p.total)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {breakdown.length ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top products</Text>
                {breakdown.map((row, i) => (
                  <View key={i} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{row.label ?? row.name ?? row.product ?? i}</Text>
                    <Text style={styles.metricValue}>{money(row.revenue ?? row.total)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {operations ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Operations</Text>
                <Text style={styles.meta}>{JSON.stringify(operations, null, 2)}</Text>
              </View>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  presetRow: { flexDirection: 'row', gap: 8 },
  preset: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F5F5F5' },
  presetActive: { backgroundColor: '#3C5E45' },
  presetText: { color: '#1A1A1A', fontWeight: '600' },
  presetTextActive: { color: '#FFFFFF' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5' },
  cardTitle: { fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  metricLabel: { color: '#6B7280' },
  metricValue: { color: '#1A1A1A', fontWeight: '600' },
  meta: { color: '#6B7280', fontSize: 12 }
});