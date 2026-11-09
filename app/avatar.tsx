import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AvatarPreview, clayPortraitCount } from '../src/AvatarPreview';
import { AvatarConfig, defaultAvatar, normalizeAvatar } from '../src/avatar';
import { useAuth } from '../src/auth';
import { supabase } from '../src/supabase';
import { colors } from '../src/theme';

export default function AvatarEditor() {
  const { session, loading } = useAuth();
  const [avatar, setAvatar] = useState<AvatarConfig>(defaultAvatar);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session || !supabase) return;
    let active = true;
    void supabase.from('profiles').select('avatar_config').eq('id', session.user.id).single().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage('Could not load your saved avatar.');
      else setAvatar(normalizeAvatar(data?.avatar_config));
    });
    return () => { active = false; };
  }, [session]);

  async function save() {
    if (!supabase || !session) return;
    setBusy(true); setMessage('');
    const { error } = await supabase.from('profiles').update({ avatar_config: avatar }).eq('id', session.user.id);
    setBusy(false);
    if (error) setMessage(`Could not save: ${error.message}`);
    else router.back();
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.pinkDark} /></View>;
  if (!session) return <View style={styles.center}><Text>Sign in to create your avatar.</Text><Pressable style={styles.save} onPress={() => router.replace('/sign-in')}><Text style={styles.saveText}>Sign in</Text></Pressable></View>;

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Choose your mini-me</Text>
    <Text style={styles.subtitle}>Pick the clay character that feels most like you. You can switch your look anytime.</Text>
    <View style={styles.preview}><AvatarPreview avatar={avatar} size={228}/></View>
    <Text style={styles.section}>Your look</Text>
    <View style={styles.gallery}>
      {Array.from({ length: clayPortraitCount }, (_, preset) => (
        <Pressable key={preset} accessibilityRole="button" accessibilityLabel={`Choose avatar ${preset + 1}`} accessibilityState={{ selected: avatar.preset === preset }} onPress={() => setAvatar(old => ({ ...old, preset }))} style={[styles.tile, avatar.preset === preset && styles.selected]}>
          <AvatarPreview avatar={{ ...avatar, preset }} size={79}/>
          {avatar.preset === preset && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
        </Pressable>
      ))}
    </View>
    <Text style={styles.note}>These are complete, coordinated clay characters so the hair, face, and lighting stay consistent. More mix-and-match features are planned.</Text>
    {!!message && <Text style={styles.error}>{message}</Text>}
    <Pressable disabled={busy} style={[styles.save, busy && { opacity: .6 }]} onPress={save}><Text style={styles.saveText}>{busy ? 'Saving…' : 'Save my avatar'}</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { padding: 23, paddingTop: 20, paddingBottom: 55, backgroundColor: colors.background, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 29, fontFamily: 'Fredoka', color: colors.text },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7 },
  preview: { marginTop: 20, alignSelf: 'center', padding: 7, backgroundColor: '#fff', borderRadius: 130, borderWidth: 2, borderColor: colors.border },
  section: { fontSize: 21, fontFamily: 'Fredoka', color: colors.text, marginTop: 28, marginBottom: 13 },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9 },
  tile: { width: '31.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.border, borderRadius: 18, backgroundColor: '#fff' },
  selected: { borderColor: colors.pinkDark, backgroundColor: '#FCEAF3' },
  check: { position: 'absolute', top: 4, right: 5, width: 23, height: 23, borderRadius: 12, backgroundColor: colors.pinkDark, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#fff', fontWeight: '900' },
  note: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 18 },
  save: { backgroundColor: colors.pinkDark, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 }, error: { color: '#B32646', marginTop: 16 },
});
