import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Conversation = { _id: string };
type Message = { _id: string; body: string; senderType?: string };

export default function SupportScreen() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const convRes = await api.post<{ conversation: Conversation }>('/api/support/conversations', {});
      setConversation(convRes.conversation);
      const msgRes = await api.get<{ messages: Message[] }>(`/api/support/conversations/${convRes.conversation._id}/messages`);
      setMessages(msgRes.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function send() {
    if (!conversation || !text.trim()) return;
    try {
      await api.post(`/api/support/conversations/${conversation._id}/messages`, { body: text.trim() });
      setText('');
      await load();
    } catch {}
  }

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3C5E45" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Support</Text>
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.meta}>{item.senderType ?? 'user'}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />
        <View style={styles.row}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Type a message" />
          <Pressable style={styles.btn} onPress={send}>
            <Text style={styles.btnText}>Send</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  meta: { color: '#6B7280', fontSize: 12 },
  body: { color: '#1A1A1A', marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10 },
  btn: { backgroundColor: '#3C5E45', padding: 12, borderRadius: 8, justifyContent: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '600' }
});