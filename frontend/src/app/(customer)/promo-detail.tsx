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
import { formatDate, formatPeso } from '@/lib/format';
import type { Promo } from '@/lib/promo-pricing';

import { promoHeadline } from './customer-promos';

export default function PromoDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = (params.id ?? '').toString();
  const router = useRouter();

  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      // The public list can be empty; fetch the detail via the public endpoint.
      const data = await api.get<{ promos: Promo[] }>(`/api/promos/${id}`);
      setPromo(data.promos?.[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this promo.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading promo…" />
      </Screen>
    );
  }

  if (error || !promo) {
    return (
      <Screen>
        <ErrorState message={error || 'Promo not found.'} onRetry={load} />
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
          Promo
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={promo.imageUrl ? { uri: promo.imageUrl } : undefined}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <ThemedText type="subtitle" style={styles.promoTitle}>
              {promo.title}
            </ThemedText>
            <Pill label={promoHeadline(promo)} color={Palette.deep} background={Palette.accent} />
          </View>

          {promo.description ? (
            <ThemedText style={styles.description}>{promo.description}</ThemedText>
          ) : null}

          {promo.promoType === 'bundle' && typeof promo.price === 'number' ? (
            <View style={styles.bundle}>
              <ThemedText type="small" themeColor="textSecondary">
                Bundle price
              </ThemedText>
              <ThemedText type="subtitle" style={styles.bundlePrice}>
                {formatPeso(promo.price)}
              </ThemedText>
            </View>
          ) : null}

          {(promo.startDate || promo.endDate) ? (
            <View style={styles.period}>
              <AppIcon name="clock" size={16} color={Palette.warning} />
              <ThemedText type="small" style={styles.periodText}>
                {promo.startDate && promo.endDate
                  ? `${formatDate(promo.startDate)} – ${formatDate(promo.endDate)}`
                  : promo.endDate
                    ? `Until ${formatDate(promo.endDate)}`
                    : `From ${formatDate(promo.startDate!)}`}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="View items in the menu"
          onPress={() => router.back()}
          fullWidth
        />
      </View>
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
  content: { paddingBottom: Space['3xl'] },
  image: { width: '100%', height: 220, backgroundColor: Palette.surfaceAlt },
  body: { padding: Space.lg, gap: Space.md },
  topRow: { gap: Space.sm },
  promoTitle: { fontSize: 24, lineHeight: 30 },
  description: { color: Palette.ink, lineHeight: 22 },
  bundle: {
    padding: Space.lg,
    backgroundColor: Palette.surfaceTint,
    borderRadius: Radius.lg,
    gap: 4
  },
  bundlePrice: { color: Palette.brand, fontSize: 28, lineHeight: 34 },
  period: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodText: { color: Palette.warning, fontWeight: '600' },
  footer: {
    padding: Space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
    backgroundColor: Palette.surface
  }
});
