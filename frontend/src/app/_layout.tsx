import '../../global.css';

import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status } = useAuth();
  const theme = Colors.light;

  if (status === 'loading') {
    return null;
  }

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
        {/* Signing in swaps the whole group, so a cross-fade reads better than a push. */}
        <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="menu" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order-detail" />
        <Stack.Screen name="order-chat" />
        <Stack.Screen name="cashier-orders" />
        <Stack.Screen name="staff-order-detail" />
        <Stack.Screen name="cashier-counter" />
        <Stack.Screen name="cashier-counter-create" />
        <Stack.Screen name="owner-products" />
        <Stack.Screen name="product-form" />
        <Stack.Screen name="owner-dashboard" />
        <Stack.Screen name="owner-inventory" />
        <Stack.Screen name="owner-categories" />
        <Stack.Screen name="owner-ingredients" />
        <Stack.Screen name="owner-cashiers" />
        <Stack.Screen name="owner-reports" />
        <Stack.Screen name="owner-promos" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="customer-promos" />
        <Stack.Screen name="promo-detail" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="reviews" />
        <Stack.Screen name="create-review" />
        <Stack.Screen name="support" />
        <Stack.Screen name="support-admin" />
        <Stack.Screen name="support-chat" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
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
