import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import {
  AuthLayout,
  AuthFooterLink,
  BrandHeader,
  FormError,
  PrimaryButton,
  useToAuth
} from '@/components/auth/auth-screen';
import { FormField } from '@/components/auth/form-field';
import { ThemedText } from '@/components/themed-text';
import { validateEmail } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const goToLogin = useToAuth('/');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      throw new Error(
        'This feature is not available yet. Please contact support or try again later.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      footer={<AuthFooterLink prompt="Remembered it?" link="Sign in" onPress={goToLogin} />}>
      <BrandHeader
        title="Forgot password"
        subtitle="Enter your email and we will send you a link to reset your password."
      />
      <View style={styles.form}>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <FormError message={error} />
        <PrimaryButton label="Send reset link" onPress={onSubmit} loading={loading} />
        <ThemedText type="small" themeColor="textSecondary">
          Password reset is coming soon. Contact support if you are locked out.
        </ThemedText>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 }
});