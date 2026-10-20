import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button, Pill } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { formatDate, formatPeso } from '@/lib/format';
import type { RewardsSummary } from '@/lib/types';

const REDEMPTION_STATUS: Record<
  string,
  { label: string; fg: string; bg: string }
> = {
  pending: { label: 'Pending', fg: Palette.warning, bg: Palette.warningSoft },
  fulfilled: { label: 'Claimed', fg: Palette.success, bg: Palette.successSoft },
  cancelled: { label: 'Cancelled', fg: Palette.danger, bg: Palette.dangerSoft }
};

export default function RewardsTabScreen() {
  const [data, setData] = useState<RewardsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<RewardsSummary>('/api/rewards');
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your rewards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = useCallback(
    async (productId: string, name: string) => {
      setRedeemingId(productId);
      setNotice('');
      try {
        await api.post('/api/rewards/redeem', { productId, quantity: 1 });
        setNotice(`Redeemed ${name}. Show the code at the counter.`);
        await load();
      } catch (err) {
        setNotice(err instanceof Error ? err.message : 'Could not redeem that item.');
      } finally {
        setRedeemingId(null);
      }
    },
    [load]
  );

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading your rewards…" />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <ErrorState message={error || 'No rewards data.'} onRetry={load} />
      </Screen>
    );
  }

  const points = data.points ?? 0;

  return (
    <Screen>
      <FlatList
        data={data.products ?? []}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <PointsCard points={points} />

            {notice ? (
              <View style={styles.notice}>
                <ThemedText type="small" style={styles.noticeText}>
                  {notice}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.sectionRow}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Redeem your points
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {(data.products ?? []).length} rewards
              </ThemedText>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No rewards yet"
            description="Reward items will appear here once the store adds them."
          />
        }
        renderItem={({ item }) => {
          const affordable = points >= item.pointsRequired;
          const remaining = item.pointsRequired - points;
          return (
            <View style={styles.rewardCard}>
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                style={styles.rewardImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.rewardBody}>
                <ThemedText type="smallBold" numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <View style={styles.rewardMeta}>
                  <AppIcon name="gift" size={14} color={Palette.brand} />
                  <ThemedText type="small" style={styles.pointsRequired}>
                    {item.pointsRequired.toLocaleString('en-PH')} pts
                  </ThemedText>
                  {typeof item.price === 'number' ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      · worth {formatPeso(item.price)}
                    </ThemedText>
                  ) : null}
                </View>

                <Button
                  label={
                    redeemingId === item._id
                      ? 'Redeeming…'
                      : affordable
                        ? 'Redeem'
                        : `${remaining.toLocaleString('en-PH')} pts to go`
                  }
                  size="sm"
                  variant={affordable ? 'primary' : 'secondary'}
                  disabled={!affordable || redeemingId === item._id}
                  loading={redeemingId === item._id}
                  onPress={() => redeem(item._id, item.name)}
                  style={styles.redeemButton}
                />
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          (data.redemptions ?? []).length > 0 ? (
            <View style={styles.history}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Recent redemptions
              </ThemedText>
              {data.redemptions.map(r => {
                const meta = REDEMPTION_STATUS[r.status] ?? REDEMPTION_STATUS.pending;
                return (
                  <View key={r._id} style={styles.historyRow}>
                    <View style={styles.historyText}>
                      <ThemedText type="smallBold" numberOfLines={1}>
                        {r.productName}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {formatDate(r.createdAt)} · {r.pointsSpent.toLocaleString('en-PH')} pts
                      </ThemedText>
                      {r.redeemCode ? (
                        <ThemedText type="small" style={styles.code}>
                          Code {r.redeemCode.slice(0, 8).toUpperCase()}
                        </ThemedText>
                      ) : null}
                    </View>
                    <Pill label={meta.label} color={meta.fg} background={meta.bg} />
                  </View>
                );
              })}
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function PointsCard({ points }: { points: number }) {
  // 1 point per ₱1 spent is the scheme the store rewards on, so the card can
  // anchor the number to something meaningful.
  const worth = Math.round(points * 0.01 * 100) / 100;

  return (
    <View style={styles.pointsCard}>
      <View style={styles.pointsTop}>
        <View style={styles.pointsText}>
          <ThemedText style={styles.pointsLabel}>Your points</ThemedText>
          <ThemedText style={styles.pointsValue}>
            {points.toLocaleString('en-PH')}
          </ThemedText>
        </View>
        <View style={styles.pointsIcon}>
          <AppIcon name="gift" size={30} color={Palette.accent} />
        </View>
      </View>
      <ThemedText style={styles.pointsHint}>
        Earn 1 point for every ₱1 you spend.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Space.lg, paddingBottom: Space['3xl'] },
  pointsCard: {
    backgroundColor: Palette.deep,
    borderRadius: Radius.xl,
    padding: Space.xl,
    gap: Space.sm
  },
  pointsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pointsText: { gap: 2 },
  pointsLabel: { color: '#C9DECF', fontSize: 13, fontWeight: '600' },
  pointsValue: { color: '#FFFFFF', fontSize: 38, lineHeight: 44, fontWeight: '800' },
  pointsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pointsHint: { color: '#C9DECF', fontSize: 12 },
  notice: {
    marginTop: Space.lg,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceTint
  },
  noticeText: { color: Palette.deep },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.xl,
    marginBottom: Space.sm
  },
  sectionTitle: { fontSize: 16, color: Palette.ink },
  rewardCard: {
    flexDirection: 'row',
    gap: Space.md,
    padding: Space.md,
    marginBottom: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border
  },
  rewardImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceAlt
  },
  rewardBody: { flex: 1, gap: 6 },
  rewardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pointsRequired: { color: Palette.brand, fontWeight: '700' },
  redeemButton: { alignSelf: 'flex-start', marginTop: 2 },
  history: { marginTop: Space.xl, gap: Space.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
    padding: Space.md,
    backgroundColor: Palette.surfaceAlt,
    borderRadius: Radius.md
  },
  historyText: { flex: 1, gap: 2 },
  code: { color: Palette.brand, fontWeight: '700', letterSpacing: 0.5 }
});
