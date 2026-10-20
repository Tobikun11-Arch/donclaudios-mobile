import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';

export default function OwnerDashboardScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [top, setTop] = useState<any[]>([]);
  const [low, setLow] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, t, tp, ls] = await Promise.all([
        api.get<any>('/dashboard/summary'),
        api.get<any>('/dashboard/sales-trend?days=7'),
        api.get<any>('/dashboard/top-products?limit=5'),
        api.get<any>('/dashboard/low-stock?limit=10'),
      ]);
      setSummary(s);
      setTrend(Array.isArray(t?.days) ? t.days : []);
      setTop(Array.isArray(tp) ? tp : []);
      setLow(Array.isArray(ls) ? ls : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = summary?.cards || [];
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3"><ThemedText className="text-lg font-semibold" style={{ color: '#fff' }}>Dashboard</ThemedText></View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        <View className="flex-row flex-wrap gap-2">
          {cards.map((c: any) => (
            <View key={c.key} className="p-3 rounded-2xl flex-1 min-w-[45%]" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
              <Text className="text-xs" style={{ color: Palette.muted }}>{c.label}</Text>
              <Text className="text-xl font-semibold mt-1" style={{ color: Palette.ink }}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</Text>
              {c.context && <Text className="text-xs mt-1" style={{ color: Palette.inkSoft }}>{c.context}</Text>}
            </View>
          ))}
        </View>
        {trend.length > 0 && (
          <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <Text className="font-semibold mb-2" style={{ color: Palette.ink }}>Sales Trend (7d)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Space.sm, alignItems: 'flex-end' }}>
              {trend.map((d: any) => {
                const rev = Number(d.revenue || 0);
                const h = Math.max(4, Math.min(80, rev / 1000 * 40));
                return (
                  <View key={d.date} className="items-center">
                    <View className="rounded-t-md" style={{ width: 10, height: h, backgroundColor: Palette.brand }} />
                    <Text className="text-[9px] mt-1" style={{ color: Palette.muted }}>{d.date.slice(5)}</Text>
                    <Text className="text-[9px]" style={{ color: Palette.inkSoft }}>₱{Math.round(rev).toLocaleString()}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        {top.length > 0 && (
          <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <Text className="font-semibold mb-2" style={{ color: Palette.ink }}>Top Products</Text>
            {top.map((t: any, i: number) => (
              <View key={i} className="flex-row items-center justify-between py-2" style={{ borderTopWidth: i===0?0:1, borderColor: Palette.divider }}>
                <Text className="text-sm" style={{ color: Palette.ink }}>{t.name}</Text>
                <Text className="text-xs" style={{ color: Palette.muted }}>Sold: {t.quantitySold}</Text>
              </View>
            ))}
          </View>
        )}
        {low.length > 0 && (
          <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <Text className="font-semibold mb-2" style={{ color: Palette.ink }}>Low Stock</Text>
            {low.map((l: any, i: number) => (
              <View key={i} className="flex-row items-center justify-between py-2" style={{ borderTopWidth: i===0?0:1, borderColor: Palette.divider }}>
                <Text className="text-sm" style={{ color: Palette.ink }}>{l.name}</Text>
                <Text className="text-xs" style={{ color: Palette.danger }}>Stock: {l.stock}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
