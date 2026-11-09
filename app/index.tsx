import { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { chapters, firstChapter } from '../src/content';
import { colors } from '../src/theme';
import { useAuth } from '../src/auth';
import { supabase } from '../src/supabase';
import { ActivityIndicator } from 'react-native';
import { AvatarPreview } from '../src/AvatarPreview';
import { AvatarConfig, defaultAvatar, normalizeAvatar } from '../src/avatar';

export default function Home() {
  const { session, loading } = useAuth();
  const [finished, setFinished] = useState<string[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [xp, setXp] = useState(0);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [linked, setLinked] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(defaultAvatar);
  useFocusEffect(useCallback(() => {
    let active = true;
    async function load() {
      if (!supabase || !session) return;
      const { data: profile } = await supabase.from('profiles').select('avatar_config').eq('id', session.user.id).single();
      if (active) setAvatar(normalizeAvatar(profile?.avatar_config));
      const { data: coupleId } = await supabase.rpc('my_couple_id');
      if (!active) return;
      setLinked(!!coupleId);
      if (!coupleId) { setXp(0); setFinished([]); setResponseCounts({}); return; }
      const [{ data: couple }, { data: completed }, { data: responses }] = await Promise.all([
        supabase.from('couples').select('xp,chapter_number').eq('id', coupleId).single(),
        supabase.from('completed_challenges').select('challenge_id').eq('couple_id', coupleId),
        supabase.from('challenge_responses').select('challenge_id,user_id').eq('couple_id', coupleId),
      ]);
      if (!active) return;
      setXp(couple?.xp ?? 0);
      setChapterNumber(couple?.chapter_number ?? 1);
      setFinished((completed || []).map(c => c.challenge_id));
      const participants: Record<string, Set<string>> = {};
      for (const response of responses || []) {
        (participants[response.challenge_id] ??= new Set<string>()).add(response.user_id);
      }
      setResponseCounts(Object.fromEntries(Object.entries(participants).map(([key, users]) => [key, users.size])));
    }
    void load();
    return () => { active = false; };
  }, [session]));
  if (loading) return <View style={[styles.container, { flex: 1, justifyContent: 'center' }]}><ActivityIndicator size="large" color={colors.pinkDark} /></View>;
  if (!session) return <View style={[styles.container, { flex: 1, justifyContent: 'center' }]}><Text style={styles.title}>Welcome to Inseparable 💕</Text><Text style={styles.subtitle}>Your relationship adventure starts here.</Text><Pressable style={[styles.hero, { alignItems: 'center' }]} onPress={() => router.push('/sign-in')}><Text style={styles.heroTitle}>Create an account or sign in →</Text></Pressable></View>;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>YOUR SHARED ADVENTURE ♡</Text>
      <Text style={styles.title}>Better together.</Text>
      <Text style={styles.subtitle}>A little more love, one challenge at a time.</Text>
      <Pressable style={styles.avatarCard} onPress={() => router.push('/avatar')}>
        <AvatarPreview avatar={avatar} size={72} />
        <View style={{ flex: 1, marginLeft: 15 }}><Text style={styles.cardTitle}>Your mini-me</Text><Text style={styles.cardHint}>Tap to create or edit your avatar</Text></View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
      <Pressable style={[styles.card, { backgroundColor: colors.mint }]} onPress={() => router.push('/partner')}><Text style={styles.cardTitle}>{linked ? '💞 View your couple profile' : '💞 Connect with your partner'}</Text><Text style={styles.arrow}>›</Text></Pressable>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>💕</Text>
        <Text style={styles.heroTitle}>Chapter {chapterNumber}: {chapters[chapterNumber - 1]}</Text>
        <Text style={styles.heroText}>{finished.length} of {firstChapter.length} starter challenges complete</Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${finished.length / firstChapter.length * 100}%` }]} /></View>
        <Text style={styles.xp}>{xp} XP earned</Text>
      </View>
      <Text style={styles.section}>Today's adventures</Text>
      {firstChapter.map((challenge, i) => (
        <Pressable key={challenge.id} style={[styles.card, responseCounts[challenge.id] === 1 && styles.partiallyComplete, responseCounts[challenge.id] >= 2 && styles.fullyComplete]} onPress={() => router.push({ pathname: '/challenge/[id]', params: { id: challenge.id } })}>
          <View style={styles.icon}><Text style={styles.iconText}>{['💭','💌','🎁','🎲','✨'][i]}</Text></View>
          <View style={styles.cardCopy}><Text style={styles.cardTitle}>{challenge.title}</Text><Text style={styles.cardHint}>{challenge.type} · +{challenge.xp} XP</Text></View>
          <Text style={styles.arrow}>›</Text>
          {responseCounts[challenge.id] >= 2 && <View style={styles.completedBadge}><Text style={styles.completedCheck}>✓</Text></View>}
        </Pressable>
      ))}
      <Text style={styles.note}>Multiplayer test: these five challenges are the first playable chapter. More activities and chapters are in development.</Text>
      <Text style={styles.section}>Your journey</Text>
      {chapters.map((name,i) => <View key={name} style={[styles.chapter, i + 1 > chapterNumber && styles.locked]}><Text style={styles.chapterNumber}>{i + 1 <= chapterNumber ? '🌷' : '🔒'}</Text><Text style={styles.chapterText}>{i + 1}. {name}</Text></View>)}
      <Pressable onPress={() => supabase?.auth.signOut()} style={styles.signOut}><Text style={{ color: colors.pinkDark, fontWeight: '700' }}>Sign out</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 50, paddingBottom: 70, backgroundColor: colors.background },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: '800', color: colors.pinkDark },
  title: { fontSize: 36, fontFamily: 'Fredoka', color: colors.text, marginTop: 10 },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 23, marginTop: 6, marginBottom: 26 },
  hero: { padding: 24, borderRadius: 28, backgroundColor: colors.lavender, marginBottom: 28 },
  heroEmoji: { fontSize: 38, marginBottom: 12 },
  heroTitle: { fontSize: 22, fontFamily: 'Fredoka', color: colors.text },
  heroText: { color: colors.text, marginTop: 8 },
  track: { height: 10, borderRadius: 10, backgroundColor: '#FFFFFF99', overflow: 'hidden', marginTop: 20 },
  fill: { height: '100%', backgroundColor: colors.pinkDark, borderRadius: 10 },
  xp: { color: colors.text, fontWeight: '700', marginTop: 8 },
  section: { fontFamily: 'Fredoka', fontSize: 20, color: colors.text, marginBottom: 14 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.surface, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  partiallyComplete: { backgroundColor: '#D9F2DF', borderColor: '#B6DFC2' },
  fullyComplete: { backgroundColor: '#74C69D', borderColor: '#52A97A' },
  completedBadge: { position: 'absolute', top: 7, right: 8, width: 23, height: 23, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  completedCheck: { fontSize: 15, fontWeight: '900', color: '#328657' },
  icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconText: { fontSize: 25 },
  cardCopy: { flex: 1 },
  cardTitle: { fontSize: 17, fontFamily: 'Fredoka', color: colors.text },
  cardHint: { textTransform: 'capitalize', color: colors.muted, fontSize: 12, marginTop: 4 },
  arrow: { fontSize: 30, color: colors.pinkDark },
  note: { fontSize: 12, lineHeight: 18, color: colors.muted, marginVertical: 16 },
  avatarCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 13 },
  chapter: { padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, marginBottom: 9 },
  locked: { opacity: 0.55 },
  chapterNumber: { fontSize: 18, marginRight: 12 },
  chapterText: { fontWeight: '700', color: colors.text },
  signOut: { padding: 18, alignItems: 'center', marginTop: 26, borderTopWidth: 1, borderTopColor: colors.border },
});
