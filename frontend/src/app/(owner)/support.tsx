import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/lib/api';
import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import type { SupportConversation, SupportMessage } from '@/lib/types';

export default function OwnerSupportScreen() {
  const router = useRouter();
  const [convos, setConvos] = useState<SupportConversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [msg, setMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const c = await api.get<any>('/support/admin/conversations');
      setConvos(Array.isArray(c) ? c : Array.isArray(c?.conversations) ? c.conversations : []);
    } catch (e) {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = async (id: string) => {
    setActive(id);
    try {
      const m = await api.get<SupportMessage[]>(`/support/admin/${id}/messages`);
      setMessages(m || []);
    } catch (e) { setMessages([]); }
  };

  const send = async () => {
    if (!active || !msg.trim()) return;
    try {
      await api.post(`/support/admin/${active}/messages`, { body: msg });
      setMsg('');
      const m = await api.get<SupportMessage[]>(`/support/admin/${active}/messages`);
      setMessages(m || []);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
  };

  if (active) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
        <View className="px-4 py-3 flex-row items-center">
          <Pressable onPress={() => setActive(null)} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
          <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Support Chat</ThemedText>
        </View>
        <View className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }}>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: Space.lg, gap: Space.sm }}>
            {messages.map((m, idx) => (
              <View key={m._id || idx} className="p-2 rounded-lg" style={{ backgroundColor: m.authorType === 'admin' ? Palette.surfaceTint : '#fff', alignSelf: m.authorType === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <Text className="text-xs" style={{ color: Palette.muted }}>{m.senderName || m.authorType}</Text>
                <Text className="text-sm" style={{ color: Palette.ink }}>{m.body}</Text>
              </View>
            ))}
          </ScrollView>
          <View className="flex-row items-center gap-2 p-3" style={{ backgroundColor: '#fff', borderTopWidth: 1, borderColor: Palette.border }}>
            <TextInput value={msg} onChangeText={setMsg} placeholder="Reply..." className="flex-1 px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.surfaceAlt, borderWidth: 1, borderColor: Palette.border }} />
            <Pressable onPress={send} className="px-3 py-2 rounded-xl" style={{ backgroundColor: Palette.brand }}><Ionicons name="send" size={18} color="#fff" /></Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="px-2 py-1"><Ionicons name="arrow-back" size={20} color="#fff" /></Pressable>
        <ThemedText className="text-lg font-semibold ml-2" style={{ color: '#fff' }}>Support</ThemedText>
      </View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Palette.brand} />}>
        {convos.length === 0 && <ThemedText className="text-center" style={{ color: Palette.muted }}>No conversations</ThemedText>}
        {convos.map((c) => (
          <Pressable key={c._id} onPress={() => open(c._id)} className="rounded-2xl p-4" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <Text className="font-medium" style={{ color: Palette.ink }}>{c.subject || 'Support'}</Text>
            <Text className="text-xs mt-1" style={{ color: Palette.muted }}>{c.lastMessage || ''}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
