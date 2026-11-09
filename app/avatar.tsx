import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AvatarPreview } from '../src/AvatarPreview';
import { AvatarConfig, avatarOptions, defaultAvatar, normalizeAvatar } from '../src/avatar';
import { useAuth } from '../src/auth';
import { supabase } from '../src/supabase';
import { colors } from '../src/theme';

const groups: { title: string; keys: (keyof AvatarConfig)[] }[] = [
  { title: 'Face', keys: ['skin', 'face', 'eyes', 'brows', 'nose', 'mouth'] },
  { title: 'Hair', keys: ['hair', 'hairColor', 'facialHair'] },
  { title: 'Style', keys: ['glasses', 'shirt', 'shirtColor'] },
];
const labels: Record<keyof AvatarConfig, string> = {
  skin: 'Skin tone', face: 'Face shape', eyes: 'Eyes', brows: 'Eyebrows', nose: 'Nose', mouth: 'Mouth',
  hair: 'Hairstyle', hairColor: 'Hair color', facialHair: 'Facial hair', glasses: 'Glasses', shirt: 'Outfit', shirtColor: 'Clothing color',
};
const colorKeys = new Set(['skin', 'hairColor', 'shirtColor']);

export default function AvatarEditor() {
  const { session, loading } = useAuth();
  const [avatar, setAvatar] = useState<AvatarConfig>(defaultAvatar);
  const [section, setSection] = useState(0);
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
    <Text style={styles.title}>Make your mini-me</Text>
    <Text style={styles.subtitle}>Pick your features and make a character that's uniquely you.</Text>
    <View style={styles.preview}><AvatarPreview avatar={avatar} /></View>
    <View style={styles.tabs}>{groups.map((group, i) => <Pressable key={group.title} onPress={() => setSection(i)} style={[styles.tab, section === i && styles.activeTab]}><Text style={[styles.tabText, section === i && styles.activeTabText]}>{group.title}</Text></Pressable>)}</View>
    {groups[section].keys.map(key => <View key={key} style={styles.group}>
      <Text style={styles.label}>{labels[key]}</Text>
      <View style={styles.options}>{avatarOptions[key].map((option, i) => <Pressable accessibilityRole="button" accessibilityLabel={`${labels[key]}: ${colorKeys.has(key) ? `Option ${i + 1}` : option}`} accessibilityState={{ selected: avatar[key] === i }} key={`${key}-${option}`} onPress={() => setAvatar(old => ({ ...old, [key]: i }))} style={[styles.option, avatar[key] === i && styles.selected, colorKeys.has(key) && styles.swatchFrame]}>
        {colorKeys.has(key) ? <View style={[styles.swatch, { backgroundColor: option }]} /> : <Text style={[styles.optionText, avatar[key] === i && styles.selectedText]}>{option}</Text>}
      </Pressable>)}</View>
    </View>)}
    {!!message && <Text style={styles.error}>{message}</Text>}
    <Pressable disabled={busy} style={[styles.save, busy && { opacity: 0.6 }]} onPress={save}><Text style={styles.saveText}>{busy ? 'Saving…' : 'Save my avatar'}</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 20, paddingBottom: 55, backgroundColor: colors.background, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 29, fontFamily: 'Fredoka', color: colors.text },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 7 },
  preview: { marginTop: 22, alignSelf: 'center', padding: 9, backgroundColor: '#fff', borderRadius: 130, borderWidth: 2, borderColor: colors.border },
  tabs: { flexDirection: 'row', gap: 7, marginTop: 26, marginBottom: 6 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13, backgroundColor: colors.surface, borderRadius: 13, borderWidth: 1, borderColor: colors.border },
  activeTab: { backgroundColor: colors.pinkDark, borderColor: colors.pinkDark },
  tabText: { fontWeight: '800', color: colors.text }, activeTabText: { color: '#fff' },
  group: { marginTop: 18 }, label: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  option: { borderWidth: 2, borderColor: colors.border, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, minHeight: 44, justifyContent: 'center' },
  selected: { borderColor: colors.pinkDark, backgroundColor: '#FFF0F5' },
  optionText: { color: colors.text, fontWeight: '600' }, selectedText: { color: colors.pinkDark, fontWeight: '900' },
  swatchFrame: { width: 49, height: 49, padding: 5, alignItems: 'center' }, swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#00000018' },
  save: { backgroundColor: colors.pinkDark, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  saveText: { color: 'white', fontWeight: '900', fontSize: 16 }, error: { color: '#B32646', marginTop: 16 },
});
