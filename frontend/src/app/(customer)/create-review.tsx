import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Space } from '@/constants/design';
import { api } from '@/lib/api';

const RATING_HINT: Record<number, string> = {
  1: 'Not great',
  2: 'Could be better',
  3: 'It was okay',
  4: 'Really good',
  5: 'Excellent!'
};

export default function CreateReviewScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const body = comment.trim();
    if (body.length === 0) {
      setError('Please write a few words about your order.');
      return;
    }
    if (body.length > 1000) {
      setError('Please keep your review under 1000 characters.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/reviews', { rating, comment: body });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

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
          Write a review
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.ratingBlock}>
          <ThemedText type="small" themeColor="textSecondary">
            How was your order?
          </ThemedText>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable
                key={n}
                onPress={() => setRating(n)}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                hitSlop={4}>
                <AppIcon
                  name={n <= rating ? { sf: 'star.fill', material: 'star' } : 'reviews'}
                  size={34}
                  color={n <= rating ? Palette.accent : Palette.border}
                />
              </Pressable>
            ))}
          </View>
          <ThemedText type="smallBold" style={styles.ratingHint}>
            {RATING_HINT[rating]}
          </ThemedText>
        </View>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Tell us what you thought — the food, the service, anything."
          placeholderTextColor={Palette.faint}
          style={styles.input}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.counter}>
          {comment.length}/1000
        </ThemedText>

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
          label={submitting ? 'Submitting…' : 'Submit review'}
          onPress={submit}
          loading={submitting}
          disabled={submitting}
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
  content: { padding: Space.lg, paddingBottom: Space['3xl'], gap: Space.md },
  ratingBlock: { alignItems: 'center', gap: Space.sm, paddingVertical: Space.lg },
  stars: { flexDirection: 'row', gap: Space.sm },
  ratingHint: { color: Palette.brand, fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    padding: Space.md,
    fontSize: 15,
    color: Palette.ink,
    backgroundColor: Palette.surface,
    minHeight: 140
  },
  counter: { textAlign: 'right' },
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
