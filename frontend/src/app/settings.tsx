import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/auth/auth-screen';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { validateNewPassword } from '@/lib/validation';

type Tab = 'general' | 'contact' | 'appearance' | 'account';

export default function SettingsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const [tab, setTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<any>(null);
  const [storeStatus, setStoreStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get<{ settings: any }>('/api/settings');
        setSettings(s.settings ?? {});
        const st = await api.get<any>('/api/store-status');
        setStoreStatus(st);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function patchSettings(path: string[], value: unknown) {
    setSettings((prev: any) => {
      const next = { ...(prev ?? {}) };
      let cursor = next;
      for (let i = 0; i < path.length - 1; i++) {
        cursor[path[i]] = { ...(cursor[path[i]] ?? {}) };
        cursor = cursor[path[i]];
      }
      cursor[path[path.length - 1]] = value;
      return next;
    });
  }

  async function saveSettings() {
    setError('');
    setMsg('');
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      setMsg('Settings saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleManualClose() {
    try {
      const res = await api.patch<{ storeStatus: any }>('/api/store-status/manual', {});
      setStoreStatus((prev: any) => ({ ...(prev ?? {}), ...(res.storeStatus ?? {}) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  if (loading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3C5E45" />
      </ThemedView>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'contact', label: 'Contact' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'account', label: 'Account' }
  ];

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4">
        <Text style={styles.title}>Settings</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={styles.tabRow}>
            {tabs.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.tab, tab === t.key && styles.tabActive]}
                onPress={() => setTab(t.key)}
              >
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {msg ? <Text style={styles.success}>{msg}</Text> : null}

        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {tab === 'general' ? (
            <>
              <View style={styles.card}>
                <Text style={styles.label}>Store status</Text>
                <Text style={styles.meta}>
                  {storeStatus?.isOpen ? 'Open' : 'Closed'}
                  {storeStatus?.reason ? ` — ${storeStatus.reason}` : ''}
                </Text>
                <Text style={styles.meta}>Closing: {storeStatus?.closingTime ?? '—'}</Text>
                {isAdmin ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={String(storeStatus?.closingTime ?? '')}
                      onChangeText={(v) => setStoreStatus((p: any) => ({ ...(p ?? {}), closingTime: v }))}
                      placeholder="Closing time (HH:MM)"
                    />
                    <TextInput
                      style={styles.input}
                      value={String(storeStatus?.advanceCloseMinutes ?? '')}
                      onChangeText={(v) => setStoreStatus((p: any) => ({ ...(p ?? {}), advanceCloseMinutes: Number(v) || 0 }))}
                      placeholder="Advance close minutes"
                      keyboardType="number-pad"
                    />
                    <View style={styles.switchRow}>
                      <Text style={styles.label}>Manually closed</Text>
                      <Switch
                        value={!!storeStatus?.isManuallyClosed}
                        onValueChange={toggleManualClose}
                        trackColor={{ true: '#3C5E45' }}
                      />
                    </View>
                  </>
                ) : null}
              </View>

              {isAdmin ? (
                <View style={styles.card}>
                  <Text style={styles.label}>Business</Text>
                  <Text style={styles.meta}>Brand: {settings?.footer?.brandName ?? '—'}</Text>
                  <TextInput
                    style={styles.input}
                    value={String(settings?.footer?.brandName ?? '')}
                    onChangeText={(v) => patchSettings(['footer', 'brandName'], v)}
                    placeholder="Brand name"
                  />
                  <TextInput
                    style={styles.input}
                    value={String(settings?.promo?.title ?? '')}
                    onChangeText={(v) => patchSettings(['promo', 'title'], v)}
                    placeholder="Promo title"
                  />
                </View>
              ) : null}
            </>
          ) : null}

          {tab === 'contact' ? (
            <View style={styles.card}>
              <Text style={styles.label}>Contact</Text>
              <TextInput
                style={styles.input}
                value={String(settings?.contact?.address ?? '')}
                onChangeText={(v) => patchSettings(['contact', 'address'], v)}
                placeholder="Address"
                editable={isAdmin}
              />
              <TextInput
                style={styles.input}
                value={String(settings?.contact?.email ?? '')}
                onChangeText={(v) => patchSettings(['contact', 'email'], v)}
                placeholder="Email"
                editable={isAdmin}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={String(settings?.contact?.hours ?? '')}
                onChangeText={(v) => patchSettings(['contact', 'hours'], v)}
                placeholder="Hours"
                editable={isAdmin}
              />
              <TextInput
                style={styles.input}
                value={(settings?.contact?.phones ?? []).join(', ')}
                onChangeText={(v) => patchSettings(['contact', 'phones'], v.split(',').map((p: string) => p.trim()).filter(Boolean))}
                placeholder="Phones (comma-separated)"
                editable={isAdmin}
              />
            </View>
          ) : null}

          {tab === 'appearance' ? (
            <View style={styles.card}>
              <Text style={styles.label}>Colors</Text>
              {(['primary', 'accent', 'textColor', 'backgroundColor'] as const).map((key) => (
                <View key={key}>
                  <Text style={styles.meta}>{key}</Text>
                  <View style={styles.colorRow}>
                    <View style={[styles.swatch, { backgroundColor: String(settings?.colors?.[key] ?? '#ffffff') }]} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={String(settings?.colors?.[key] ?? '')}
                      onChangeText={(v) => patchSettings(['colors', key], v)}
                      editable={isAdmin}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {tab === 'account' ? (
            <>
              <View style={styles.card}>
                <Text style={styles.label}>Profile</Text>
                <Text style={styles.meta}>{user?.email}</Text>
                <Text style={styles.meta}>{user?.firstName} {user?.lastName}</Text>
              </View>
              {user && user.type !== 'customer' ? (
                <View style={styles.card}>
                  <Text style={styles.label}>Change password</Text>
                  {pwError ? <Text style={styles.error}>{pwError}</Text> : null}
                  {pwSuccess ? <Text style={styles.success}>{pwSuccess}</Text> : null}
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current password"
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password"
                    secureTextEntry
                  />
                  <PrimaryButton
                    label="Update password"
                    loading={savingPw}
                    onPress={async () => {
                      setPwError('');
                      setPwSuccess('');
                      const v = validateNewPassword(newPassword);
                      if (v) {
                        setPwError(v);
                        return;
                      }
                      setSavingPw(true);
                      try {
                        await api.put('/api/auth/password', { currentPassword, newPassword });
                        setPwSuccess('Password updated.');
                        setCurrentPassword('');
                        setNewPassword('');
                      } catch (e) {
                        setPwError(e instanceof Error ? e.message : 'Update failed');
                      } finally {
                        setSavingPw(false);
                      }
                    }}
                  />
                </View>
              ) : null}
            </>
          ) : null}

          {isAdmin && (tab === 'general' || tab === 'contact' || tab === 'appearance') ? (
            <PrimaryButton label="Save changes" onPress={saveSettings} loading={saving} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginVertical: 12 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F5F5F5' },
  tabActive: { backgroundColor: '#3C5E45' },
  tabText: { color: '#1A1A1A', fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginBottom: 12 },
  label: { fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  meta: { color: '#6B7280', fontSize: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#FFFFFF' },
  error: { color: '#C30010', marginBottom: 6 },
  success: { color: '#3C5E45', marginBottom: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }
});