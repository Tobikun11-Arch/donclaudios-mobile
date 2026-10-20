import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button, Pill } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { Review, ReviewEligibility } from '@/lib/types';

const REVIEW_STATUS: Record<string, { label: string; fg: string; bg: string }> = {
  pending: { label: 'Pending review', fg: Palette.warning, bg: Palette.warningSoft },
  approved: { label: 'Published', fg: Palette.success, bg: Palette.successSoft },
  rejected: { label: 'Not published', fg: Palette.danger, bg: Palette.dangerSoft }
};

export default function ReviewsTabScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mine, eligible] = await Promise.allSettled([
        api.get<{ reviews: Review[] }>('/api/reviews/my'),
        api.get<ReviewEligibility>('/api/reviews/eligibility')
      ]);

      if (mine.status === 'fulfilled') {
        setReviews(mine.value.reviews ?? []);
      } else {
        throw mine.reason;
      }
      setEligibility(eligible.status === 'fulfilled' ? eligible.value : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your reviews.');
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
        <LoadingState label="Loading your reviews…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={load} />
      </Screen>
    );
  }

  const canReview = eligibility?.eligible ?? false;

  return (
    <Screen>
      <FlatList
        data={reviews}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.heading}>
              <ThemedText type="subtitle" style={styles.title}>
                Your reviews
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {canReview
                  ? `You have ${eligibility?.remainingCount ?? 1} order${
                      (eligibility?.remainingCount ?? 1) === 1 ? '' : 's'
                    } waiting for a review.`
                  : 'Share how your last lechon went.'}
              </ThemedText>
            </View>

            <Button
              label={canReview ? 'Write a review' : 'No orders to review yet'}
              disabled={!canReview}
              onPress={() => router.push('/(customer)/create-review')}
              fullWidth
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No reviews yet"
            description="Once you review a completed order, it will show up here."
          />
        }
        renderItem={({ item }) => <ReviewCard review={item} />}
      />
    </Screen>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const meta = REVIEW_STATUS[review.status] ?? REVIEW_STATUS.pending;
  const teamReplies = (review.messages ?? []).filter(m => m.authorType === 'admin');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Stars value={review.rating} />
        <Pill label={meta.label} color={meta.fg} background={meta.bg} />
      </View>

      <ThemedText type="default" style={styles.comment}>
        {review.comment}
      </ThemedText>

      {review.images && review.images.length > 0 ? (
        <View style={styles.images}>
          {review.images.slice(0, 3).map((img, i) => (
            <Image
              key={`${review._id}-img-${i}`}
              source={{ uri: img.url }}
              style={styles.reviewImage}
              contentFit="cover"
            />
          ))}
        </View>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary">
        {formatDateTime(review.createdAt)}
      </ThemedText>

      {teamReplies.length > 0 ? (
        <View style={styles.reply}>
          <View style={styles.replyHeader}>
            <AppIcon name="support" size={14} color={Palette.brand} />
            <ThemedText type="smallBold" style={styles.replyName}>
              {teamReplies[teamReplies.length - 1].senderName || 'Don Claudio’s Team'}
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.replyBody}>
            {teamReplies[teamReplies.length - 1].body}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(n => (
        <AppIcon
          key={n}
          name={n <= value ? { sf: 'star.fill', material: 'star' } : 'reviews'}
          size={15}
          color={n <= value ? Palette.accent : Palette.border}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Space.lg, paddingBottom: Space['3xl'] },
  heading: { gap: 4, marginBottom: Space.lg },
  title: { fontSize: 28, lineHeight: 34 },
  card: {
    gap: Space.sm,
    padding: Space.lg,
    marginTop: Space.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stars: { flexDirection: 'row', gap: 2 },
  comment: { color: Palette.ink },
  images: { flexDirection: 'row', gap: Space.sm },
  reviewImage: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceAlt
  },
  reply: {
    marginTop: Space.xs,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceTint,
    gap: 4
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replyName: { color: Palette.deep },
  replyBody: { color: Palette.deep }
});
