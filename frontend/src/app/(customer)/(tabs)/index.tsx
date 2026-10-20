import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button, IconButton, Pill } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatPeso } from '@/lib/format';
import {
  getDiscountedUnitPrice,
  preOrderDisplay,
  type Promo
} from '@/lib/promo-pricing';
import type { Category, Product, StoreStatus } from '@/lib/types';

type Tab = { id: string; label: string };

const FEATURED_ID = '__featured__';

export default function OrderTabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cart = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [store, setStore] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  // Promos come from the shared cart context so menu badges and cart totals
  // can never disagree.
  const promos = cart.promos;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productRes, categoryRes, storeRes] = await Promise.allSettled([
        api.get<{ products: Product[] }>('/api/products'),
        api.get<{ categories: Category[] }>('/api/categories'),
        api.get<{ status: StoreStatus }>('/api/store-status')
      ]);

      if (productRes.status === 'fulfilled') {
        setProducts(productRes.value.products ?? []);
      } else {
        throw productRes.reason;
      }
      setCategories(
        categoryRes.status === 'fulfilled' ? (categoryRes.value.categories ?? []) : []
      );
      setStore(storeRes.status === 'fulfilled' ? (storeRes.value.status ?? null) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the menu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const available = useMemo(
    () =>
      products.filter(
        p => p.isAvailable && p.stock > 0 && !(p.isPreOrder && preOrderDisplay(p).closed)
      ),
    [products]
  );

  const preOrders = useMemo(() => available.filter(p => p.isPreOrder), [available]);

  const tabs = useMemo<Tab[]>(() => {
    const names = Array.from(
      new Set(
        available
          .map(p => p.category)
          .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    return [
      ...(preOrders.length > 0 ? [{ id: FEATURED_ID, label: 'Pre-order' }] : []),
      ...names.map(n => ({ id: n, label: n }))
    ];
  }, [available, preOrders.length]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = available;

    if (activeTab === FEATURED_ID) {
      list = preOrders;
    } else if (activeTab) {
      list = list.filter(p => p.category === activeTab);
    }

    if (q) {
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [available, preOrders, activeTab, query]);

  const addToCart = useCallback(
    async (product: Product) => {
      setAddingId(product._id);
      try {
        const { unitPrice } = getDiscountedUnitPrice({
          promos,
          productId: product._id,
          basePrice: product.price
        });
        await cart.addItem({
          productId: product._id,
          name: product.name,
          price: unitPrice,
          quantity: 1,
          imageUrl: product.imageUrl
        });
      } catch (err) {
        // Surface stock/pre-order limit errors from the server verbatim.
        setError(err instanceof Error ? err.message : 'Could not add that item.');
      } finally {
        setAddingId(null);
      }
    },
    [cart, promos]
  );

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading the menu…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={visible}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <StoreHero
              store={store}
              firstName={user?.firstName}
              cartCount={cart.count}
              onCartPress={() => router.push('/(customer)/cart')}
              onNotifications={() => router.push('/(customer)/notifications')}
            />

            <View style={styles.searchRow}>
              <View style={styles.search}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search the menu"
                  placeholderTextColor={Palette.faint}
                  style={styles.searchInput}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
              </View>
            </View>

            {tabs.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}>
                <CategoryChip
                  label="All"
                  active={activeTab === null}
                  onPress={() => setActiveTab(null)}
                />
                {tabs.map(t => (
                  <CategoryChip
                    key={t.id}
                    label={t.label}
                    active={activeTab === t.id}
                    onPress={() => setActiveTab(t.id)}
                  />
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.sectionRow}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {activeTab === FEATURED_ID
                  ? 'Open pre-orders'
                  : activeTab
                    ? activeTab
                    : 'All items'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {visible.length} item{visible.length === 1 ? '' : 's'}
              </ThemedText>
            </View>
          </View>
        }
        ListEmptyComponent={
          error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <EmptyState
              title="Nothing here"
              description={
                query
                  ? `No items match “${query}”.`
                  : 'There are no items in this category right now.'
              }
            />
          )
        }
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            promos={promos}
            busy={addingId === item._id}
            onAdd={() => addToCart(item)}
            onPress={() => router.push('/(customer)/promo-detail')}
          />
        )}
      />
    </Screen>
  );
}

/** Green hero with store status, greeting, and the cart / bell buttons. */
function StoreHero({
  store,
  firstName,
  cartCount,
  onCartPress,
  onNotifications
}: {
  store: StoreStatus | null;
  firstName?: string;
  cartCount: number;
  onCartPress: () => void;
  onNotifications: () => void;
}) {
  const open = store?.isOpen ?? true;

  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.heroText}>
          <ThemedText style={styles.heroGreeting}>
            Kumusta{firstName ? `, ${firstName}` : ''}!
          </ThemedText>
          <ThemedText style={styles.heroBrand}>Don Claudio’s</ThemedText>
        </View>
        <View style={styles.heroActions}>
          <IconButton onPress={onNotifications} accessibilityLabel="Notifications">
            <AppIcon name="bell" size={22} color="#FFFFFF" />
          </IconButton>
          <IconButton onPress={onCartPress} accessibilityLabel="Cart">
            <AppIcon name="cart" size={22} color="#FFFFFF" />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>
                  {cartCount > 9 ? '9+' : cartCount}
                </ThemedText>
              </View>
            ) : null}
          </IconButton>
        </View>
      </View>

      <View style={styles.heroStatus}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: open ? Palette.mint : Palette.accent }
          ]}
        />
        <ThemedText style={styles.heroStatusText}>
          {open
            ? store?.closesAt
              ? `Open until ${store.closesAt}`
              : 'Open now'
            : store?.reopenMessage || 'Closed right now'}
        </ThemedText>
      </View>
    </View>
  );
}

function CategoryChip({
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
      style={[styles.chip, active && styles.chipActive]}>
      <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function ProductRow({
  product,
  promos,
  busy,
  onAdd,
  onPress
}: {
  product: Product;
  promos: Promo[];
  busy: boolean;
  onAdd: () => void;
  onPress: () => void;
}) {
  const { unitPrice, badge } = getDiscountedUnitPrice({
    promos,
    productId: product._id,
    basePrice: product.price
  });
  const discounted = unitPrice < product.price;

  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <Image
        source={product.imageUrl ? { uri: product.imageUrl } : undefined}
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.cardName}>
            {product.name}
          </ThemedText>
          {badge ? (
            <Pill label={badge.label} color={Palette.deep} background={Palette.accent} />
          ) : null}
        </View>

        {product.category ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {product.category}
          </ThemedText>
        ) : null}

        <View style={styles.priceRow}>
          <ThemedText type="smallBold" style={styles.price}>
            {formatPeso(unitPrice)}
          </ThemedText>
          {discounted ? (
            <ThemedText type="small" style={styles.strike}>
              {formatPeso(product.price)}
            </ThemedText>
          ) : null}
        </View>

        {product.isPreOrder ? (
          <ThemedText type="small" style={styles.preOrderNote}>
            {preOrderDisplay(product).subLine}
          </ThemedText>
        ) : null}

        <Button
          label={busy ? 'Adding…' : 'Add to cart'}
          size="sm"
          onPress={onAdd}
          loading={busy}
          disabled={busy}
          style={styles.addButton}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: Space['3xl'] },
  hero: {
    backgroundColor: Palette.deep,
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    paddingBottom: Space.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  heroText: { flex: 1, gap: 2 },
  heroGreeting: { color: '#C9DECF', fontSize: 13, lineHeight: 18 },
  heroBrand: { color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '800' },
  heroActions: { flexDirection: 'row', gap: Space.xs },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartBadgeText: { fontSize: 10, fontWeight: '800', color: Palette.deep },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    marginTop: Space.lg
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  heroStatusText: { color: '#EAF4EC', fontSize: 13, fontWeight: '600' },
  searchRow: { paddingHorizontal: Space.lg, marginTop: -Space.xl },
  search: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: Space.md
  },
  searchInput: { fontSize: 15, color: Palette.ink, padding: 0 },
  chips: {
    gap: Space.sm,
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    paddingBottom: Space.xs
  },
  chip: {
    paddingHorizontal: Space.lg,
    height: 36,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Palette.surfaceAlt,
    borderWidth: 1,
    borderColor: Palette.border
  },
  chipActive: { backgroundColor: Palette.brand, borderColor: Palette.brand },
  chipText: { fontSize: 14, fontWeight: '600', color: Palette.inkSoft },
  chipTextActive: { color: '#FFFFFF' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    marginTop: Space.lg,
    marginBottom: Space.sm
  },
  sectionTitle: { fontSize: 16, color: Palette.ink },
  card: {
    flexDirection: 'row',
    gap: Space.md,
    marginHorizontal: Space.lg,
    marginBottom: Space.md,
    padding: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border
  },
  cardImage: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceAlt
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { gap: 4 },
  cardName: { fontSize: 15, lineHeight: 20, color: Palette.ink },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  price: { fontSize: 16, color: Palette.brand },
  strike: { textDecorationLine: 'line-through', color: Palette.faint },
  preOrderNote: { color: Palette.warning, fontWeight: '600' },
  addButton: { marginTop: Space.xs, alignSelf: 'flex-start' }
});
