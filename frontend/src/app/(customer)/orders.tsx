import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button, Pill } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import {
  formatDateTime,
  formatPeso,
  isActiveOrder,
  orderReference,
  orderStatusColors,
  orderStatusHint,
  orderStatusLabel,
  orderTypeLabel
} from '@/lib/format';
import type { Order } from '@/lib/types';

type Filter = 'active' | 'past';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('active');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<{ orders: Order[] }>('/api/orders/me');
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      orders.filter(o =>
        filter === 'active' ? isActiveOrder(o.orderStatus) : !isActiveOrder(o.orderStatus)
      ),
    [orders, filter]
  );

  const activeCount = useMemo(
    () => orders.filter(o => isActiveOrder(o.orderStatus)).length,
    [orders]
  );

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading your orders…" />
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
          style={styles.back}>
          <AppIcon name="back" size={20} color={Palette.ink} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.title}>
          My orders
        </ThemedText>
        <View style={styles.back} />
      </View>

      <View style={styles.segments}>
        <Segment
          label={activeCount > 0 ? `Active · ${activeCount}` : 'Active'}
          active={filter === 'active'}
          onPress={() => setFilter('active')}
        />
        <Segment
          label="Past"
          active={filter === 'past'}
          onPress={() => setFilter('past')}
        />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={filter === 'active' ? 'No active orders' : 'No past orders'}
              description={
                filter === 'active'
                  ? 'Anything you order will show up here while it’s in progress.'
                  : 'Completed and cancelled orders land here.'
              }
              action={
                filter === 'active' ? (
                  <Button
                    label="Browse the menu"
                    variant="secondary"
                    onPress={() => router.back()}
                  />
                ) : undefined
              }
            />
          }
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}
    </Screen>
  );
}

function Segment({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.segment, active && styles.segmentActive]}>
      <ThemedText
        type="smallBold"
        style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const status = orderStatusColors(order.orderStatus);
  const itemCount = (order.items ?? []).reduce((n, i) => n + i.quantity, 0);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(customer)/order-detail',
          params: { id: order._id }
        })
      }
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopText}>
          <ThemedText type="smallBold" style={styles.ref}>
            {orderReference(order._id)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {orderTypeLabel(order.orderType)} · {formatDateTime(order.createdAt)}
          </ThemedText>
        </View>
        <Pill label={orderStatusLabel(order.orderStatus)} color={status.fg} background={status.bg} />
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {orderStatusHint(order.orderStatus, order.orderType)}
      </ThemedText>

      <View style={styles.cardFooter}>
        <ThemedText type="small" themeColor="textSecondary">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.total}>
          {formatPeso(order.totalAmount)}
        </ThemedText>
      </View>
    </Pressable>
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
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: 20, lineHeight: 26 },
  segments: {
    flexDirection: 'row',
    gap: Space.sm,
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md
  },
  segment: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Palette.surfaceAlt
  },
  segmentActive: { backgroundColor: Palette.brand },
  segmentText: { color: Palette.inkSoft },
  segmentTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: Space.lg, paddingBottom: Space['3xl'] },
  card: {
    gap: Space.sm,
    padding: Space.lg,
    marginBottom: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Space.md
  },
  cardTopText: { flex: 1, gap: 2 },
  ref: { fontSize: 16 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.xs
  },
  total: { fontSize: 16, color: Palette.brand }
});
