import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/auth/auth-screen';
import { api } from '@/lib/api';

type Category = { _id: string; name: string };

export default function ProductFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const cat = await api.get<{ categories: Category[] }>('/api/categories');
        setCategories(cat.categories ?? []);
      } catch {}
      if (id) {
        try {
          const data = await api.get<{ product: any }>(`/api/products/${id}`);
          const p = data.product;
          setName(p.name ?? '');
          setCategory(p.category ?? '');
          setPrice(String(p.price ?? ''));
          setStock(String(p.stock ?? ''));
          setDescription(p.description ?? '');
          setImageUrl(p.imageUrl ?? '');
          setIsAvailable(p.isAvailable !== false);
        } catch {
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [id]);

  async function save() {
    setError('');
    if (!name.trim() || !category.trim()) {
      setError('Name and category are required');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        category: category.trim(),
        price: Number(price || 0),
        stock: Number(stock || 0),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isAvailable
      };
      if (id) {
        await api.patch(`/api/products/${id}`, body);
      } else {
        await api.post('/api/products', body);
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <Text style={{ color: '#6B7280' }}>Loading...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>{id ? 'Edit product' : 'New product'}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product name" />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder={categories.length ? categories.map((c) => c.name).join(', ') : 'Category'}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0" keyboardType="decimal-pad" />

          <Text style={styles.label}>Stock</Text>
          <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" keyboardType="number-pad" />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />

          <Text style={styles.label}>Image URL</Text>
          <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Available</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ true: '#3C5E45' }}
            />
          </View>

          <PrimaryButton label="Save" onPress={save} loading={saving} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  error: { color: '#C30010', marginBottom: 8 },
  label: { fontWeight: '600', color: '#1A1A1A', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginBottom: 4, backgroundColor: '#FFFFFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }
});