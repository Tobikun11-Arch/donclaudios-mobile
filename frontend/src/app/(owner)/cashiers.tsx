import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { Cashier } from '@/lib/types';

export default function CashiersScreen() {
  const router = useRouter();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await api.get<any>('/cashiers');
      setCashiers(Array.isArray(r?.cashiers) ? r.cashiers : Array.isArray(r) ? r : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) { Alert.alert('Missing fields'); return; }
    try {
      await api.post('/cashiers', { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, phoneNumber: phone.trim() });
      setShowForm(false); setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setPhone('');
      await load();
      Alert.alert('Created');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
          <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Cashiers</ThemedText>
        </View>
        <Pressable onPress={() => setShowForm(v => !v)} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#fff' }}>
          <Text className="text-xs font-medium" style={{ color: Palette.brand }}>+ Add</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        {showForm && (
          <View className="rounded-2xl p-4 gap-2" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="First name" className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <TextInput value={lastName} onChangeText={setLastName} placeholder="Last name" className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <Pressable onPress={create} className="px-4 py-2 rounded-xl items-center" style={{ backgroundColor: Palette.brand }}><Text className="font-medium" style={{ color: '#fff' }}>Create</Text></Pressable>
          </View>
        )}
        {cashiers.map((c) => (
          <View key={c._id} className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <Text className="font-medium" style={{ color: Palette.ink }}>{c.firstName} {c.lastName}</Text>
            <Text className="text-xs" style={{ color: Palette.muted }}>{c.email || c.phoneNumber || ''}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
