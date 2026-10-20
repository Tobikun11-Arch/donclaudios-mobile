import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { useCart } from '@/lib/cart-context';
import { formatPeso } from '@/lib/format';

/**
 * Cart sheet, presented as a modal from the Order tab.
 *
 * Backed by the shared cart context, so quantities edited here are reflected on
 * the tab badge and in checkout without a refetch.
 */
export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCart();

  const goToCheckout = () => {
    router.back();
    router.push('/(customer)/checkout');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle" style={styles.title}>
            Your cart
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {cart.count} item{cart.count === 1 ? '' : 's'}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close cart"
          style={styles.close}>
          <AppIcon name="close" size={20} color={Palette.ink} />
        </Pressable>
      </View>

      {cart.error ? (
        <View style={styles.banner}>
          <ThemedText type="small" style={styles.bannerText}>
            {cart.error}
          </ThemedText>
        </View>
      ) : null}

      <FlatList
        data={cart.items}
        keyExtractor={item => item.productId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Your cart is empty"
            description="Add something from the menu to get started."
            action={<Button label="Browse the menu" variant="secondary" onPress={() => router.back()} />}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              source={item.imageUrl ? { uri: item.imageUrl } : undefined}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
            <View style={styles.rowBody}>
              <ThemedText type="smallBold" numberOfLines={2}>
                {item.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatPeso(item.price)} each
              </ThemedText>
              {item.instructions ? (
                <ThemedText type="small" style={styles.note} numberOfLines={2}>
                  “{item.instructions}”
                </ThemedText>
              ) : null}

              <View style={styles.rowFooter}>
                <View style={styles.stepper}>
                  <StepperButton
                    icon="remove"
                    label="Decrease quantity"
                    onPress={() =>
                      item.quantity <= 1
                        ? cart.removeItem(item.productId)
                        : cart.setQuantity(item.productId, item.quantity - 1)
                    }
                  />
                  <ThemedText type="smallBold" style={styles.qty}>
                    {item.quantity}
                  </ThemedText>
                  <StepperButton
                    icon="add"
                    label="Increase quantity"
                    onPress={() => cart.setQuantity(item.productId, item.quantity + 1)}
                  />
                </View>
                <ThemedText type="smallBold" style={styles.lineTotal}>
                  {formatPeso(item.price * item.quantity)}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          cart.items.length > 0 ? (
            <Pressable
              onPress={cart.clear}
              accessibilityRole="button"
              style={styles.clear}>
              <ThemedText type="smallBold" style={styles.clearText}>
                Clear cart
              </ThemedText>
            </Pressable>
          ) : null
        }
      />

      {cart.items.length > 0 ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Space.lg }]}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Subtotal
              </ThemedText>
              <ThemedText type="smallBold" style={styles.totalValue}>
                {formatPeso(cart.subtotal)}
              </ThemedText>
            </View>
            {cart.savings > 0 ? (
              <View style={styles.totalRow}>
                <ThemedText type="small" style={styles.savings}>
                  Promo savings
                </ThemedText>
                <ThemedText type="small" style={styles.savings}>
                  −{formatPeso(cart.savings)}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <Button label="Checkout" onPress={goToCheckout} fullWidth />
        </View>
      ) : null}
    </View>
  );
}

function StepperButton({
  icon,
  label,
  onPress
}: {
  icon: 'add' | 'remove';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.stepButton, { opacity: pressed ? 0.6 : 1 }]}>
      <AppIcon name={icon} size={16} color={Palette.brand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md
  },
  headerText: { gap: 2 },
  title: { fontSize: 24, lineHeight: 30 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  banner: {
    marginHorizontal: Space.lg,
    padding: Space.md,
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.md
  },
  bannerText: { color: Palette.danger },
  list: { paddingHorizontal: Space.lg, paddingBottom: Space.lg },
  row: {
    flexDirection: 'row',
    gap: Space.md,
    paddingVertical: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.divider
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceAlt
  },
  rowBody: { flex: 1, gap: 4 },
  note: { color: Palette.muted, fontStyle: 'italic' },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.xs
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.xs,
    paddingVertical: 2
  },
  stepButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qty: { minWidth: 18, textAlign: 'center', color: Palette.ink },
  lineTotal: { color: Palette.ink },
  clear: { alignSelf: 'center', padding: Space.lg },
  clearText: { color: Palette.danger },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    gap: Space.md,
    backgroundColor: Palette.surface
  },
  totals: { gap: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalValue: { color: Palette.ink },
  savings: { color: Palette.success }
});
