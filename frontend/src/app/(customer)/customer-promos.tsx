import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Pill } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { formatDate, formatPeso } from '@/lib/format';
import type { Promo } from '@/lib/promo-pricing';

export default function CustomerPromosScreen() {
  const router = useRouter();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<{ promos: Promo[] }>('/api/promos');
      setPromos(data.promos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load promos.');
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
        <LoadingState label="Loading promos…" />
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
          Promos
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={promos}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No promos right now"
              description="Check back soon — the kitchen runs specials regularly."
            />
          }
          renderItem={({ item }) => <PromoCard promo={item} />}
        />
      )}
    </Screen>
  );
}

export function promoHeadline(promo: Promo): string {
  if (promo.promoType === 'percentage' && typeof promo.discountRate === 'number') {
    return `${promo.discountRate}% OFF`;
  }
  if (promo.promoType === 'fixed_amount' && typeof promo.discountAmount === 'number') {
    return `${formatPeso(promo.discountAmount)} OFF`;
  }
  if (promo.promoType === 'bundle' && typeof promo.price === 'number') {
    return `Bundle · ${formatPeso(promo.price)}`;
  }
  return 'Promo';
}

function PromoCard({ promo }: { promo: Promo }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/(customer)/promo-detail', params: { id: promo._id } })
      }
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}>
      <Image
        source={promo.imageUrl ? { uri: promo.imageUrl } : undefined}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.body}>
        <View style={styles.rowTop}>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
            {promo.title}
          </ThemedText>
          <Pill label={promoHeadline(promo)} color={Palette.deep} background={Palette.accent} />
        </View>
        {promo.description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {promo.description}
          </ThemedText>
        ) : null}
        {promo.endDate ? (
          <ThemedText type="small" style={styles.until}>
            Until {formatDate(promo.endDate)}
          </ThemedText>
        ) : null}
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
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: 20, lineHeight: 26 },
  list: { paddingHorizontal: Space.lg, paddingBottom: Space['3xl'] },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    overflow: 'hidden',
    marginBottom: Space.md
  },
  image: { width: '100%', height: 150, backgroundColor: Palette.surfaceAlt },
  body: { padding: Space.lg, gap: 6 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Space.md
  },
  name: { flex: 1, fontSize: 16 },
  until: { color: Palette.warning, fontWeight: '600' }
});
