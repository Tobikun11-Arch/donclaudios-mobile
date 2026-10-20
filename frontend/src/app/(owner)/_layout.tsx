import { Stack } from 'expo-router';

export default function OwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="order-detail" />
      <Stack.Screen name="product-form" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="promos" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="ingredients" />
      <Stack.Screen name="cashiers" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="support" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
