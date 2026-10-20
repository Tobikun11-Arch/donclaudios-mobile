import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';

export default function PromosScreen() {
  const router = useRouter();
  const [promos, setPromos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await api.get<any>('/promos/admin/all').catch(() => api.get<any>('/promos'));
      setPromos(Array.isArray(p?.promos) ? p.promos : Array.isArray(p) ? p : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (pr: any) => {
    try { await api.patch(`/promos/${pr._id}/toggle`, {}); await load(); } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Promos</ThemedText>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        {promos.length === 0 && <ThemedText className="text-center" style={{ color: Palette.muted }}>No promos</ThemedText>}
        {promos.map((pr) => (
          <View key={pr._id} className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-medium" style={{ color: Palette.ink }}>{pr.title}</Text>
              <Text className="text-xs" style={{ color: pr.isActive ? Palette.success : Palette.muted }}>{pr.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
            <Text className="text-xs mt-1" style={{ color: Palette.muted }}>{pr.type} · {pr.discount ? `${pr.discount}%` : pr.discountAmount ? `₱${pr.discountAmount}` : ''}</Text>
            <Pressable onPress={() => toggle(pr)} className="self-start mt-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: Palette.surfaceTint }}><Text className="text-xs font-medium" style={{ color: Palette.brand }}>{pr.isActive ? 'Disable' : 'Enable'}</Text></Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
