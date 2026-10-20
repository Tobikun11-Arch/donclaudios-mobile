import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { Category, Product } from '@/lib/types';

export default function ProductFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? String(params.id) : null;
  const editing = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([
        api.get<Category[]>('/categories'),
        editing ? api.get<Product>(`/products/${id}`).catch(() => null) : Promise.resolve(null),
      ]);
      setCategories(c || []);
      if (!editing && c?.[0]) setCategory(c[0].name);
      if (p) {
        setName(p.name);
        setCategory(p.category);
        setPrice(String(p.price));
        setStock(String(p.stock));
        setDescription(p.description || '');
        setImageUrl(p.imageUrl || '');
        setIsAvailable(p.isAvailable);
        setIsPreOrder(!!p.isPreOrder);
      }
    } catch (e) {}
  }, [editing, id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!name.trim() || !category.trim() || !price) { Alert.alert('Missing fields'); return; }
    setSaving(true);
    try {
      const payload: any = { name: name.trim(), category: category.trim(), price: Number(price), stock: Number(stock), description, imageUrl, isAvailable, isPreOrder };
      if (editing) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>{editing ? 'Edit Product' : 'Add Product'}</ThemedText>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.lg }}>
        <View className="rounded-2xl p-4 gap-3" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
          <Text className="font-semibold" style={{ color: Palette.ink }}>Details</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Name" className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Space.sm }}>
            {categories.map((c) => (
              <Pressable key={c._id} onPress={() => setCategory(c.name)} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: category === c.name ? Palette.brand : Palette.surfaceAlt }}>
                <Text className="text-xs font-medium" style={{ color: category === c.name ? '#fff' : Palette.inkSoft }}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View className="flex-row gap-2">
            <TextInput value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" className="flex-1 px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <TextInput value={stock} onChangeText={setStock} placeholder="Stock" keyboardType="numeric" className="flex-1 px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
          </View>
          <TextInput value={description} onChangeText={setDescription} placeholder="Description" multiline className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border, minHeight: 60 }} />
          <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="Image URL (optional)" className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
        </View>
        <View className="rounded-2xl p-4 gap-3" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
          <View className="flex-row items-center justify-between"><Text style={{ color: Palette.ink }}>Available</Text><Switch value={isAvailable} onValueChange={setIsAvailable} /></View>
          <View className="flex-row items-center justify-between"><Text style={{ color: Palette.ink }}>Pre-order</Text><Switch value={isPreOrder} onValueChange={setIsPreOrder} /></View>
        </View>
        <Pressable disabled={saving} onPress={save} className="rounded-2xl px-4 py-3 items-center" style={{ backgroundColor: Palette.brand, opacity: saving ? 0.5 : 1 }}>
          <Text className="font-medium" style={{ color: '#fff' }}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
