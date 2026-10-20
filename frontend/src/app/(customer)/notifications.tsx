import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { Notification } from '@/lib/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<{ notifications: Notification[] }>('/api/notifications');
      setNotifications(data.notifications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading notifications…" />
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
        <ThemedText type="subtitle" style={styles.title}>
          Notifications
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="Nothing yet"
              description="You’ll get updates about orders and promos here."
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.unread]}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              {item.message ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {item.message}
                </ThemedText>
              ) : null}
              <ThemedText type="small" themeColor="textSecondary" style={styles.time}>
                {formatDateTime(item.createdAt)}
              </ThemedText>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: 20, lineHeight: 26 },
  list: { paddingHorizontal: Space.lg, paddingBottom: Space['3xl'] },
  card: {
    gap: 4,
    padding: Space.lg,
    marginBottom: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border
  },
  unread: { borderColor: Palette.brand },
  time: { marginTop: 2 }
});
