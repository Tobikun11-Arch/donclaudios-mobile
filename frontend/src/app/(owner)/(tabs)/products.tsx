import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { Product } from '@/lib/types';

export default function OwnerProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await api.get<Product[]>('/products');
      setProducts(p || []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    Alert.alert('Delete', 'Delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/products/${id}`); await load(); } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
      }}
    ]);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center justify-between">
        <ThemedText className="text-lg font-semibold" style={{ color: '#fff' }}>Products</ThemedText>
        <Pressable onPress={() => router.push('/(owner)/product-form' as any)} className="px-3 py-1.5 rounded-full flex-row items-center gap-1" style={{ backgroundColor: '#fff' }}>
          <Ionicons name="add" size={16} color={Palette.brand} />
          <Text className="text-xs font-medium" style={{ color: Palette.brand }}>Add</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        {products.map((p) => (
          <Pressable key={p._id} onPress={() => router.push(`/(owner)/product-form?id=${p._id}` as any)} className="rounded-2xl p-4 flex-row items-center justify-between" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <View className="flex-1">
              <Text className="font-medium" style={{ color: Palette.ink }}>{p.name}</Text>
              <Text className="text-xs" style={{ color: Palette.muted }}>{p.category} · ₱{p.price} · Stock {p.stock}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable onPress={() => remove(p._id)} className="px-2 py-1"><Ionicons name="trash-outline" size={18} color={Palette.danger} /></Pressable>
              <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
