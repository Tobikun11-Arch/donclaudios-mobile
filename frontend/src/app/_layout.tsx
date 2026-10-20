import '../../global.css';

import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

/** Per-role home, used as the signed-in landing group. */
function homeFor(type: 'customer' | 'cashier' | 'admin' | undefined) {
  if (type === 'admin') return '(owner)' as const;
  if (type === 'cashier') return '(cashier)' as const;
  return '(customer)' as const;
}

function RootNavigator() {
  const { status, user } = useAuth();
  const theme = Colors.light;

  if (status === 'loading') {
    return null;
  }

  const home = homeFor(user?.type);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Paint every scene with the app background. Without this the scene is
        // transparent during a transition, so you see a flash of the window
        // background behind it — that's the "blink" between screens.
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right'
      }}>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="verify-phone" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>

      <Stack.Protected guard={status === 'signedIn'}>
        {/* Signing in swaps the whole group, so a cross-fade reads better than a push.
            Only the signed-in role's group is registered, so deep links into another
            role's routes simply don't resolve. */}
        <Stack.Screen name={home} options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }
});
