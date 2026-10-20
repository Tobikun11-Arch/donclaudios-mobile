import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/auth/auth-screen';
import { api } from '@/lib/api';

export default function CreateReviewScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/reviews', { rating, comment: comment.trim() });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Write a review</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.label}>Rating</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              style={[styles.star, rating >= n && styles.starActive]}
              onPress={() => setRating(n)}
            >
              <Text style={styles.starText}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Your review"
          multiline
        />
        <PrimaryButton label="Submit" onPress={onSubmit} loading={loading} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  error: { color: '#C30010', marginBottom: 8 },
  label: { fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  star: { padding: 10, borderRadius: 8, backgroundColor: '#F5F5F5' },
  starActive: { backgroundColor: '#3C5E45' },
  starText: { color: '#1A1A1A', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, minHeight: 100, marginBottom: 12, textAlignVertical: 'top' }
});