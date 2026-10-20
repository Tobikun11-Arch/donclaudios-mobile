import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button, Pill } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingState } from '@/components/ui/states';
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
  orderTypeLabel,
  paymentStatusLabel,
  trackingStepsFor
} from '@/lib/format';
import type { Order, OrderItem } from '@/lib/types';

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api.get<{ order: Order }>(`/api/orders/customer/track/${id}`);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while the order is in flight so the status advances on its own.
  useEffect(() => {
    if (!order || !isActiveOrder(order.orderStatus)) return;
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [order, load]);

  const cancel = useCallback(async () => {
    setCancelling(true);
    setNotice('');
    try {
      await api.post(`/api/orders/customer/track/${id}/cancel`);
      await load();
      setNotice('Order cancelled.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not cancel this order.');
    } finally {
      setCancelling(false);
    }
  }, [id, load]);

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading your order…" />
      </Screen>
    );
  }

  if (error || !order) {
    return (
      <Screen>
        <ErrorState message={error || 'Order not found.'} onRetry={load} />
      </Screen>
    );
  }

  const status = orderStatusColors(order.orderStatus);
  const steps = trackingStepsFor(order.orderType);
  const reachedIndex = Math.max(
    0,
    steps.indexOf(order.orderStatus as (typeof steps)[number])
  );
  const cancelled = order.orderStatus === 'cancelled';
  const items = order.items ?? [];

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
          {orderReference(order._id)}
        </ThemedText>
        <Pressable
          onPress={() => router.push({ pathname: '/(customer)/order-chat', params: { id } })}
          accessibilityRole="button"
          accessibilityLabel="Message the store"
          style={styles.headerButton}>
          <AppIcon name="chat" size={20} color={Palette.brand} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <Pill
              label={orderStatusLabel(order.orderStatus)}
              color={status.fg}
              background={status.bg}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {orderTypeLabel(order.orderType)}
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.hint}>
            {orderStatusHint(order.orderStatus, order.orderType)}
          </ThemedText>

          {order.prepTiming?.isRunning && !cancelled ? (
            <View style={styles.timer}>
              <AppIcon name="clock" size={15} color={Palette.brand} />
              <ThemedText type="small" style={styles.timerText}>
                {order.prepTiming.isOverdue
                  ? 'Taking a little longer than usual'
                  : `About ${order.prepTiming.minutesRemaining ?? '—'} min to go`}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {!cancelled ? (
          <View style={styles.stepper}>
            {steps.map((step, index) => {
              const done = index <= reachedIndex;
              const current = index === reachedIndex;
              return (
                <View key={step} style={styles.step}>
                  <View style={styles.stepRail}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        current && styles.stepDotCurrent
                      ]}
                    />
                    {index < steps.length - 1 ? (
                      <View style={[styles.stepLine, done && styles.stepLineDone]} />
                    ) : null}
                  </View>
                  <ThemedText
                    type={current ? 'smallBold' : 'small'}
                    style={[styles.stepLabel, done && styles.stepLabelDone]}>
                    {orderStatusLabel(step)}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        ) : null}

        <Section title="Items">
          {items.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No item details available.
            </ThemedText>
          ) : (
            items.map(item => <ItemRow key={item._id} item={item} />)
          )}
        </Section>

        <Section title="Summary">
          <SummaryRow label="Subtotal" value={formatPeso(order.totalAmount - (order.deliveryFee ?? 0))} />
          {order.deliveryFee ? (
            <SummaryRow label="Delivery fee" value={formatPeso(order.deliveryFee)} />
          ) : null}
          <View style={styles.divider} />
          <SummaryRow label="Total" value={formatPeso(order.totalAmount)} emphasis />
          <SummaryRow
            label="Payment"
            value={paymentStatusLabel(order.paymentStatus)}
          />
        </Section>

        <Section title="Details">
          <SummaryRow label="Placed" value={formatDateTime(order.createdAt)} />
          <SummaryRow label="Type" value={orderTypeLabel(order.orderType)} />
          {order.riderNotes ? (
            <SummaryRow label="Notes" value={order.riderNotes} />
          ) : null}
          {order.changeFor ? (
            <SummaryRow label="Change for" value={order.changeFor} />
          ) : null}
        </Section>

        {notice ? (
          <View style={styles.notice}>
            <ThemedText type="small" style={styles.noticeText}>
              {notice}
            </ThemedText>
          </View>
        ) : null}

        {order.orderStatus === 'pending' ? (
          <Button
            label="Cancel order"
            variant="danger"
            onPress={cancel}
            loading={cancelling}
            disabled={cancelling}
            fullWidth
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type={emphasis ? 'smallBold' : 'small'} style={emphasis ? styles.emphasis : undefined}>
        {value}
      </ThemedText>
    </View>
  );
}

function ItemRow({ item }: { item: OrderItem }) {
  const product = typeof item.productId === 'object' ? item.productId : null;
  const name = product?.name ?? 'Item';

  return (
    <View style={styles.itemRow}>
      <Image
        source={product?.imageUrl ? { uri: product.imageUrl } : undefined}
        style={styles.itemImage}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.itemBody}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatPeso(item.price)} × {item.quantity}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{formatPeso(item.price * item.quantity)}</ThemedText>
    </View>
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
  content: { padding: Space.lg, paddingBottom: Space['3xl'], gap: Space.lg },
  statusCard: {
    gap: Space.sm,
    padding: Space.lg,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.lg
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  hint: { color: Palette.ink },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { color: Palette.brand, fontWeight: '600' },
  stepper: { gap: 0 },
  step: { flexDirection: 'row', gap: Space.md, minHeight: 40 },
  stepRail: { alignItems: 'center', width: 18 },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Palette.border,
    backgroundColor: Palette.surface
  },
  stepDotDone: { borderColor: Palette.brand, backgroundColor: Palette.brand },
  stepDotCurrent: { borderColor: Palette.brand, backgroundColor: Palette.surface, borderWidth: 4 },
  stepLine: { flex: 1, width: 2, backgroundColor: Palette.border },
  stepLineDone: { backgroundColor: Palette.brand },
  stepLabel: { color: Palette.faint, paddingBottom: Space.md },
  stepLabelDone: { color: Palette.ink },
  section: { gap: Space.sm },
  sectionTitle: { fontSize: 16, color: Palette.ink },
  sectionBody: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Space.lg,
    gap: Space.sm
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Space.md },
  emphasis: { color: Palette.brand, fontSize: 16 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.border, marginVertical: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Palette.surfaceAlt
  },
  itemBody: { flex: 1, gap: 1 },
  notice: {
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceTint
  },
  noticeText: { color: Palette.deep }
});
