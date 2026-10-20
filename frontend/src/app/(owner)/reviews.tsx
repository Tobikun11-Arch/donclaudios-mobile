import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { Review } from '@/lib/types';

export default function OwnerReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get<any>('/reviews');
      setReviews(Array.isArray(r?.reviews) ? r.reviews : Array.isArray(r) ? r : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, status: 'approved'|'rejected') => {
    try { await api.patch(`/reviews/${id}/status`, { status }); await load(); } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Reviews</ThemedText>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        {reviews.map((rv) => (
          <View key={rv._id} className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-medium" style={{ color: Palette.ink }}>{rv.customerName}</Text>
              <Text className="text-xs capitalize" style={{ color: rv.status === 'approved' ? Palette.success : rv.status === 'rejected' ? Palette.danger : Palette.muted }}>{rv.status}</Text>
            </View>
            <Text className="text-xs mt-1" style={{ color: Palette.accent }}>★ {rv.rating}</Text>
            <Text className="text-sm mt-1" style={{ color: Palette.inkSoft }}>{rv.comment}</Text>
            <View className="flex-row gap-2 mt-2">
              <Pressable onPress={() => update(rv._id, 'approved')} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Palette.successSoft }}><Text className="text-xs font-medium" style={{ color: Palette.success }}>Approve</Text></Pressable>
              <Pressable onPress={() => update(rv._id, 'rejected')} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Palette.dangerSoft }}><Text className="text-xs font-medium" style={{ color: Palette.danger }}>Reject</Text></Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
