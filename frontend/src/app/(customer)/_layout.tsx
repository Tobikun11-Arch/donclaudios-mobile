import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { CartProvider } from '@/lib/cart-context';
import { api } from '@/lib/api';
import type { Promo } from '@/lib/promo-pricing';

/**
 * Customer area.
 *
 * A stack wraps the tab bar so task-oriented screens (cart, checkout, order
 * detail, chat) push *over* the tabs and keep the full screen to themselves.
 *
 * The active promo list is fetched once here and shared, because both cart
 * pricing and the menu's discount badges need it and they must agree.
 */
export default function CustomerLayout() {
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ promos: Promo[] }>('/api/promos');
        if (!cancelled) setPromos(res.promos ?? []);
      } catch {
        // Promos are a enhancement; the menu still works without them.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CartProvider promos={promos}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="cart"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order-detail" />
        <Stack.Screen name="order-chat" />
        <Stack.Screen name="customer-promos" />
        <Stack.Screen name="promo-detail" />
        <Stack.Screen name="create-review" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="support" />
        <Stack.Screen name="support-chat" />
        <Stack.Screen name="settings" />
      </Stack>
    </CartProvider>
  );
}
