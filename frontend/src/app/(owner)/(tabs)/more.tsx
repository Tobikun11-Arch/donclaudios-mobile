import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Palette, Space } from '@/constants/design';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth-context';

const items = [
  { label: 'Inventory', icon: 'archive-outline', route: '/(owner)/inventory' },
  { label: 'Promos', icon: 'pricetag-outline', route: '/(owner)/promos' },
  { label: 'Categories', icon: 'grid-outline', route: '/(owner)/categories' },
  { label: 'Ingredients', icon: 'leaf-outline', route: '/(owner)/ingredients' },
  { label: 'Cashiers', icon: 'people-outline', route: '/(owner)/cashiers' },
  { label: 'Reports', icon: 'document-text-outline', route: '/(owner)/reports' },
  { label: 'Reviews', icon: 'star-outline', route: '/(owner)/reviews' },
  { label: 'Support', icon: 'help-buoy-outline', route: '/(owner)/support' },
  { label: 'Settings', icon: 'settings-outline', route: '/(owner)/settings' },
  { label: 'Notifications', icon: 'notifications-outline', route: '/(owner)/notifications' },
];

export default function OwnerMoreScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Palette.brand }}>
      <View className="px-4 py-3"><ThemedText className="text-lg font-semibold" style={{ color: '#fff' }}>More</ThemedText></View>
      <ScrollView className="flex-1" style={{ backgroundColor: Palette.surfaceAlt }} contentContainerStyle={{ padding: Space.lg, gap: Space.sm }}>
        {items.map((it) => (
          <Pressable key={it.route} onPress={() => router.push(it.route as any)} className="rounded-2xl px-4 py-3 flex-row items-center justify-between" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.border }}>
            <View className="flex-row items-center gap-3">
              <Ionicons name={it.icon as any} size={20} color={Palette.brand} />
              <Text style={{ color: Palette.ink }}>{it.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
          </Pressable>
        ))}
        <Pressable onPress={() => signOut()} className="rounded-2xl px-4 py-3 items-center" style={{ backgroundColor: Palette.danger, marginTop: Space.lg }}>
          <Text className="font-medium" style={{ color: '#fff' }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
