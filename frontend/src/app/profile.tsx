import { useState } from 'react';
import { Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/auth/auth-screen';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      await api.put('/api/auth/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim()
      });
      await refreshUser();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Profile</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />
        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone number" keyboardType="phone-pad" />
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />
        <PrimaryButton label="Save" onPress={onSubmit} loading={loading} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  error: { color: '#C30010', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginBottom: 10 }
});