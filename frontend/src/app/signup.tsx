import {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';

import {
  AuthLayout,
  AuthFooterLink,
  BrandHeader,
  FormError,
  PrimaryButton,
  useToAuth
} from '@/components/auth/auth-screen';
import {FormField} from '@/components/auth/form-field';
import {ThemedText} from '@/components/themed-text';
import {useAuth} from '@/lib/auth-context';
import {
  firstError,
  validateCode,
  validateEmail,
  validateNewPassword,
  validateRequired
} from '@/lib/validation';

export default function SignUpScreen() {
  const {signUp, verify, resendVerification} = useAuth();
  const goToLogin = useToAuth('/');

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function onSignUp() {
    const validationError = firstError(
      validateRequired(firstName, 'First name'),
      validateRequired(lastName, 'Last name'),
      validateRequired(username, 'Username'),
      validateEmail(email),
      validateNewPassword(password)
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signUp({
        firstName,
        lastName,
        username,
        email: email.trim(),
        password
      });
      setStep('verify');
      setNotice(`We sent a 6-digit code to ${email.trim()}. Check your inbox.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    const validationError = validateCode(code);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await verify(email.trim(), code.trim());
      setNotice('Email verified! You can now sign in.');
      setStep('details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError('');
    setLoading(true);
    try {
      await resendVerification(email.trim());
      setNotice('A new code has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      footer={
        step === 'details' ? (
          <AuthFooterLink
            prompt="Already have an account?"
            link="Sign in"
            onPress={goToLogin}
          />
        ) : undefined
      }
    >
      {step === 'details' ? (
        <View style={styles.header}>
          <BrandHeader
            title="Create account"
            subtitle="Join Exposs-kit and get started."
          />
        </View>
      ) : (
        <View style={styles.header}>
          <BrandHeader
            title="Verify your email"
            subtitle="Enter the 6-digit code we emailed you."
          />
        </View>
      )}

      {step === 'details' ? (
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormField
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
            <View style={styles.rowItem}>
              <FormField
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>
          <FormField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. joenel"
            autoComplete="username"
          />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min 8 chars, mixed case, number & symbol"
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
          />
          <FormError message={error} />
          <PrimaryButton
            label="Create account"
            onPress={onSignUp}
            loading={loading}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <ThemedText type="small" themeColor="textSecondary">
            {notice}
          </ThemedText>
          <FormField
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="6-digit code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
          />
          <FormError message={error} />
          <PrimaryButton
            label="Verify email"
            onPress={onVerify}
            loading={loading}
          />
          <Text style={styles.resend} onPress={onResend}>
            Resend code
          </Text>
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: {gap: 0},
  form: {gap: 16},
  row: {flexDirection: 'row', gap: 12},
  rowItem: {flex: 1},
  resend: {
    color: '#3c87f7',
    textAlign: 'center',
    fontWeight: '600',
    alignSelf: 'center'
  }
});
