import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatPeso } from '@/lib/format';
import type { Order } from '@/lib/types';

type OrderType = 'pickup' | 'delivery';

const DELIVERY_FEE = 49;

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cart = useCart();

  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [notes, setNotes] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const total = cart.subtotal + deliveryFee;

  const placeOrder = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post<{ order: Order }>('/api/orders/me', {
        orderType,
        items: cart.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          // Promo pricing is applied client-side, so the discounted unit price
          // is what the customer is actually charged.
          price: i.price
        })),
        totalAmount: total,
        riderNotes: notes.trim() || undefined,
        changeFor: changeFor.trim() || undefined
      });

      // The server empties the cart as part of placing the order; sync locally.
      await cart.refresh();
      router.replace({
        pathname: '/(customer)/order-detail',
        params: { id: res.order._id }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty. Add a few items first."
          action={<Button label="Back to the menu" variant="secondary" onPress={() => router.back()} />}
        />
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
          Checkout
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            How would you like it?
          </ThemedText>
          <View style={styles.typeRow}>
            <TypeOption
              icon="store"
              label="Pickup"
              hint="Collect at the store"
              active={orderType === 'pickup'}
              onPress={() => setOrderType('pickup')}
            />
            <TypeOption
              icon="delivery"
              label="Delivery"
              hint={`+${formatPeso(DELIVERY_FEE)}`}
              active={orderType === 'delivery'}
              onPress={() => setOrderType('delivery')}
            />
          </View>
        </View>

        {orderType === 'delivery' && user?.address ? (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <AppIcon name="location" size={16} color={Palette.brand} />
              <ThemedText type="smallBold">Delivering to</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {user.address}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Notes for the store
          </ThemedText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any allergies or special requests?"
            placeholderTextColor={Palette.faint}
            style={[styles.input, styles.multiline]}
            multiline
            textAlignVertical="top"
          />
        </View>

        {orderType === 'delivery' ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Cash change for
            </ThemedText>
            <TextInput
              value={changeFor}
              onChangeText={setChangeFor}
              placeholder="e.g. 1000"
              placeholderTextColor={Palette.faint}
              style={styles.input}
              keyboardType="number-pad"
            />
          </View>
        ) : null}

        <View style={styles.summary}>
          <Row label={`Subtotal (${cart.count} items)`} value={formatPeso(cart.subtotal)} />
          {cart.savings > 0 ? (
            <Row label="Promo savings" value={`−${formatPeso(cart.savings)}`} accent />
          ) : null}
          {deliveryFee > 0 ? (
            <Row label="Delivery fee" value={formatPeso(deliveryFee)} />
          ) : null}
          <View style={styles.divider} />
          <Row label="Total" value={formatPeso(total)} emphasis />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Placing order…' : `Place order · ${formatPeso(total)}`}
          onPress={placeOrder}
          loading={submitting}
          disabled={submitting}
          fullWidth
        />
      </View>
    </Screen>
  );
}

function TypeOption({
  icon,
  label,
  hint,
  active,
  onPress
}: {
  icon: 'store' | 'delivery';
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.typeOption, active && styles.typeOptionActive]}>
      <AppIcon name={icon} size={20} color={active ? '#FFFFFF' : Palette.brand} />
      <ThemedText type="smallBold" style={active ? styles.typeLabelActive : undefined}>
        {label}
      </ThemedText>
      <ThemedText
        type="small"
        style={active ? styles.typeHintActive : styles.typeHint}>
        {hint}
      </ThemedText>
    </Pressable>
  );
}

function Row({
  label,
  value,
  emphasis = false,
  accent = false
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText
        type={emphasis ? 'smallBold' : 'small'}
        style={[emphasis && styles.emphasis, accent && styles.accent]}>
        {value}
      </ThemedText>
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
  section: { gap: Space.sm },
  sectionTitle: { fontSize: 16, color: Palette.ink },
  typeRow: { flexDirection: 'row', gap: Space.md },
  typeOption: {
    flex: 1,
    gap: 4,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface
  },
  typeOptionActive: { backgroundColor: Palette.brand, borderColor: Palette.brand },
  typeLabelActive: { color: '#FFFFFF' },
  typeHint: { color: Palette.muted },
  typeHintActive: { color: '#C9DECF' },
  addressCard: {
    gap: Space.sm,
    padding: Space.lg,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.lg
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    fontSize: 15,
    color: Palette.ink,
    backgroundColor: Palette.surface
  },
  multiline: { minHeight: 84 },
  summary: {
    gap: Space.sm,
    padding: Space.lg,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.lg
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Space.md },
  emphasis: { color: Palette.brand, fontSize: 16 },
  accent: { color: Palette.success },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.border },
  errorBox: {
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.dangerSoft
  },
  errorText: { color: Palette.danger },
  footer: {
    padding: Space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
    backgroundColor: Palette.surface
  }
});
