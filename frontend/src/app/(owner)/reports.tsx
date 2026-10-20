import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';

export default function ReportsScreen() {
  const router = useRouter();
  const [preset, setPreset] = useState<'7d' | '30d' | 'today'>('7d');
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await api.get<any>(`/report/summary?preset=${preset}`);
      setSummary(s);
    } catch (e) {}
    setRefreshing(false);
  }, [preset]);

  useEffect(() => { load(); }, [load]);

  const k = summary?.kpis || {};
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Reports</ThemedText>
      </View>
      <View className="px-4 flex-row gap-2">
        {(['7d','30d','today'] as const).map((p) => (
          <Pressable key={p} onPress={() => setPreset(p)} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: preset===p ? '#fff' : 'rgba(255,255,255,0.2)' }}><Text className="text-xs font-medium" style={{ color: preset===p ? Palette.brand : '#fff' }}>{p}</Text></Pressable>
        ))}
      </View>
      <ScrollView className="flex-1 mt-2" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        <View className="flex-row flex-wrap gap-2">
          <View className="p-3 rounded-2xl flex-1 min-w-[45%]" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}><Text className="text-xs" style={{ color: Palette.muted }}>Revenue</Text><Text className="text-lg font-semibold" style={{ color: Palette.ink }}>₱{Number(k.revenue || 0).toLocaleString()}</Text></View>
          <View className="p-3 rounded-2xl flex-1 min-w-[45%]" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}><Text className="text-xs" style={{ color: Palette.muted }}>Orders</Text><Text className="text-lg font-semibold" style={{ color: Palette.ink }}>{k.orders || 0}</Text></View>
          <View className="p-3 rounded-2xl flex-1 min-w-[45%]" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}><Text className="text-xs" style={{ color: Palette.muted }}>AOV</Text><Text className="text-lg font-semibold" style={{ color: Palette.ink }}>₱{Number(k.aov || 0).toLocaleString()}</Text></View>
          <View className="p-3 rounded-2xl flex-1 min-w-[45%]" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}><Text className="text-xs" style={{ color: Palette.muted }}>Items Sold</Text><Text className="text-lg font-semibold" style={{ color: Palette.ink }}>{k.itemsSold || 0}</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
