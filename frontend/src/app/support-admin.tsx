import { useEffect, useState } from 'react';
import { Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/api';

type Conversation = {
  _id: string;
  customerName?: string;
  name?: string;
  status?: string;
  lastMessage?: string;
  updatedAt?: string;
};

export default function SupportAdminScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ conversations: Conversation[] }>('/api/support/admin/conversations');
        setConversations(data.conversations ?? []);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <Text style={styles.title}>Support Inbox</Text>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No conversations.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/support-chat?id=${item._id}&admin=1`)}>
              <Text style={styles.name}>{item.customerName ?? item.name ?? 'Customer'}</Text>
              {item.lastMessage ? <Text style={styles.meta}>{item.lastMessage}</Text> : null}
              {item.status ? <Text style={styles.badge}>{item.status}</Text> : null}
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 10 },
  name: { fontWeight: '600', color: '#1A1A1A' },
  meta: { color: '#6B7280', marginTop: 2 },
  badge: { color: '#3C5E45', marginTop: 4, fontSize: 12, fontWeight: '600' }
});