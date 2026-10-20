import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { Ingredient } from '@/lib/types';

export default function IngredientsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [name, setName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get<any>('/ingredients');
      setItems(Array.isArray(r?.ingredients) ? r.ingredients : Array.isArray(r) ? r : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name.trim()) return;
    try { await api.post('/ingredients', { name: name.trim(), iconKey: 'salt' }); setName(''); await load(); } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Ingredients</ThemedText>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        <View className="rounded-2xl p-3 flex-row items-center gap-2" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
          <TextInput value={name} onChangeText={setName} placeholder="New ingredient" className="flex-1 px-2 py-1" />
          <Pressable onPress={add} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Palette.brand }}><Text className="text-xs font-medium" style={{ color: '#fff' }}>Add</Text></Pressable>
        </View>
        {items.map((it) => (
          <View key={it._id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <Text style={{ color: Palette.ink }}>{it.name}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
