import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/format';
import type { Order } from '@/lib/types';

type Message = {
  _id: string;
  authorType: 'customer' | 'admin';
  senderName?: string;
  body: string;
  createdAt: string;
};

export default function OrderChatScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    try {
      const [msgRes, orderRes] = await Promise.allSettled([
        api.get<{ messages: Message[] }>(`/api/orders/${id}/messages`),
        api.get<{ order: Order }>(`/api/orders/customer/track/${id}`)
      ]);

      if (msgRes.status === 'fulfilled') {
        setMessages(msgRes.value.messages ?? []);
      }
      if (orderRes.status === 'fulfilled') {
        setOrder(orderRes.value.order);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  const send = useCallback(async () => {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      await api.post(`/api/orders/${id}/messages`, { body });
      setText('');
      await load();
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } finally {
      setSending(false);
    }
  }, [text, sending, id, load]);

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading conversation…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}>
          <AppIcon name="back" size={20} color={Palette.ink} />
        </Pressable>
        <View style={styles.headerText}>
          <ThemedText type="subtitle" style={styles.title}>
            Order chat
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {order ? `#${order._id.slice(-6).toUpperCase()}` : id.slice(-6).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <EmptyState
              title="Ask about your order"
              description="If you have a question about your pickup or delivery, send a message here."
            />
          }
          renderItem={({ item }) => {
            const mine = item.authorType === 'customer';
            return (
              <View style={[styles.bubbleWrap, mine ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <ThemedText
                    type="small"
                    style={[styles.bubbleName, mine ? styles.bubbleNameMine : styles.bubbleNameTheirs]}>
                    {mine ? user?.firstName || 'You' : item.senderName || 'Store'}
                  </ThemedText>
                  <ThemedText style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
                    {item.body}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[styles.time, mine ? styles.timeMine : styles.timeTheirs]}>
                    {formatDateTime(item.createdAt)}
                  </ThemedText>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={Palette.faint}
            style={styles.input}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Button
            label={sending ? '…' : 'Send'}
            size="sm"
            onPress={send}
            disabled={!text.trim() || sending}
            loading={sending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.border
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, lineHeight: 22 },
  messages: { padding: Space.lg, gap: Space.sm, paddingBottom: Space.lg },
  bubbleWrap: { maxWidth: '85%' },
  bubbleWrapLeft: { alignSelf: 'flex-start' },
  bubbleWrapRight: { alignSelf: 'flex-end' },
  bubble: { borderRadius: Radius.lg, padding: Space.md, gap: 4 },
  bubbleMine: { backgroundColor: Palette.brand, borderTopRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: Palette.surfaceAlt,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Palette.border
  },
  bubbleName: { fontWeight: '700' },
  bubbleNameMine: { color: '#C9DECF' },
  bubbleNameTheirs: { color: Palette.brand },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTextTheirs: { color: Palette.ink },
  time: { fontSize: 11 },
  timeMine: { color: '#C9DECF', alignSelf: 'flex-end' },
  timeTheirs: { color: Palette.muted, alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Space.sm,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
    backgroundColor: Palette.surface
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    fontSize: 15,
    color: Palette.ink,
    maxHeight: 100
  }
});
