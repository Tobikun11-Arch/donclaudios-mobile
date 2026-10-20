import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { Product, StockMovement } from '@/lib/types';

export default function InventoryScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<any>('/inventory/movements?limit=30').catch(() => ({ movements: [] })),
      ]);
      setProducts(p || []);
      setMovements(Array.isArray(m?.movements) ? m.movements : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const restock = async (p: Product) => {
    Alert.prompt?.('Restock', `Add stock for ${p.name}`, async (text) => {
      const qty = Number(text);
      if (!qty || qty <= 0) return;
      try { await api.patch(`/inventory/${p._id}/restock`, { quantity: qty }); await load(); Alert.alert('Restocked'); } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
    }, 'plain-text', '', 'numeric') || Alert.alert('Restock', 'Use the web app for restock entry, or contact backend.');
  };

  const adjust = async (p: Product) => {
    Alert.alert('Adjust Stock', `${p.name}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Spoilage', onPress: async () => {
        try { await api.patch(`/inventory/${p._id}/adjust`, { quantity: -1, reason: 'spoilage' }); await load(); } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
      }},
      { text: 'Manual adjust', onPress: async () => {
        Alert.prompt?.('Manual adjust', 'Enter negative/positive quantity and reason required', async (text) => {
          // Simplified
        }) || Alert.alert('Info', 'Use REST: PATCH /inventory/:id/adjust {quantity, reason}');
      }},
    ]);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Inventory</ThemedText>
      </View>
      <View className="px-4 flex-row gap-2">
        <Pressable onPress={() => setTab('stock')} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: tab==='stock' ? '#fff' : 'rgba(255,255,255,0.2)' }}><Text className="text-xs font-medium" style={{ color: tab==='stock' ? Palette.brand : '#fff' }}>Stock</Text></Pressable>
        <Pressable onPress={() => setTab('movements')} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: tab==='movements' ? '#fff' : 'rgba(255,255,255,0.2)' }}><Text className="text-xs font-medium" style={{ color: tab==='movements' ? Palette.brand : '#fff' }}>Movements</Text></Pressable>
      </View>
      <ScrollView className="flex-1 mt-2" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        {tab === 'stock' && products.map((p) => (
          <View key={p._id} className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-medium" style={{ color: Palette.ink }}>{p.name}</Text>
              <Text className={p.stock <= 10 ? 'font-medium' : ''} style={{ color: p.stock <= 10 ? Palette.danger : Palette.inkSoft }}>Stock: {p.stock}</Text>
            </View>
            <View className="flex-row gap-2 mt-2">
              <Pressable onPress={() => restock(p)} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Palette.surfaceTint }}><Text className="text-xs font-medium" style={{ color: Palette.brand }}>Restock</Text></Pressable>
              <Pressable onPress={() => adjust(p)} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Palette.surfaceAlt }}><Text className="text-xs font-medium" style={{ color: Palette.inkSoft }}>Adjust</Text></Pressable>
            </View>
          </View>
        ))}
        {tab === 'movements' && movements.map((m) => (
          <View key={m._id} className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-medium" style={{ color: Palette.ink }}>{m.productId?.name || 'Product'}</Text>
              <Text className="text-xs capitalize" style={{ color: Palette.muted }}>{m.type}</Text>
            </View>
            <Text className="text-xs mt-1" style={{ color: Palette.inkSoft }}>{m.previousStock} → {m.newStock} ({m.quantity > 0 ? '+' : ''}{m.quantity})</Text>
            {m.note && <Text className="text-xs mt-1" style={{ color: Palette.muted }}>{m.note}</Text>}
            <Text className="text-xs mt-1" style={{ color: Palette.muted }}>{new Date(m.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
