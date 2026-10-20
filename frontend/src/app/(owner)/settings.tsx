import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';

export default function OwnerSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [manual, setManual] = useState(false);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, st] = await Promise.all([
        api.get<any>('/settings').catch(() => ({})),
        api.get<any>('/store-status').catch(() => ({})),
      ]);
      setSettings(s?.settings);
      setStore(st?.status || st?.settings);
      setManual(st?.status?.isManuallyClosed || false);
    } catch (e) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async () => {
    try {
      await api.put('/store-status', { isManuallyClosed: !manual, manualCloseReason: reason || 'Manual close' });
      setManual(!manual);
      await load();
      Alert.alert('Updated');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Store Settings</ThemedText>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.lg }}>
        <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
          <Text className="font-semibold mb-2" style={{ color: Palette.ink }}>Store Status</Text>
          <View className="flex-row items-center justify-between">
            <Text style={{ color: Palette.ink }}>Manual Close</Text>
            <Switch value={manual} onValueChange={() => toggle()} />
          </View>
          {store?.isOpen !== undefined && <Text className="text-xs mt-1" style={{ color: Palette.muted }}>System: {store.isOpen ? 'Open' : 'Closed'}</Text>}
        </View>
        <View className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
          <Text className="font-semibold mb-2" style={{ color: Palette.ink }}>Payment (from settings)</Text>
          <Text className="text-xs" style={{ color: Palette.muted }}>{settings?.payment?.accountName || ''}</Text>
          <Text className="text-xs" style={{ color: Palette.muted }}>{settings?.payment?.accountNumber || ''}</Text>
          <Text className="text-xs mt-1" style={{ color: Palette.inkSoft }}>{settings?.payment?.instructions || ''}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
