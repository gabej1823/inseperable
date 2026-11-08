import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../src/auth';
import { supabase } from '../../src/supabase';
import { firstChapter } from '../../src/content';
import { colors } from '../../src/theme';

type Answer = { user_id: string; answer: string };

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const challenge = firstChapter.find(c => c.id === id);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Answer[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!supabase || !session || !id) { setLoading(false); return; }
    const { data: currentCouple, error } = await supabase.rpc('my_couple_id');
    if (error) { setMessage('The multiplayer database setup is not complete yet.'); setLoading(false); return; }
    setCoupleId(currentCouple);
    if (currentCouple) {
      const { data, error: responseError } = await supabase.from('challenge_responses')
        .select('user_id,answer').eq('couple_id', currentCouple).eq('challenge_id', id);
      if (!responseError) {
        const parsed = (data || []).map(row => ({ user_id: row.user_id as string, answer: typeof row.answer === 'string' ? row.answer : JSON.stringify(row.answer) }));
        setResponses(parsed);
        setSubmitted(parsed.some(row => row.user_id === session.user.id));
      }
    }
    setLoading(false);
  }, [id, session]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function submit() {
    if (!supabase || !challenge || !answer.trim()) return;
    setBusy(true); setMessage('');
    const { error } = await supabase.rpc('submit_challenge_response', { target_challenge: challenge.id, response: answer.trim() });
    if (error) setMessage(error.message);
    else { setSubmitted(true); await refresh(); }
    setBusy(false);
  }

  if (!challenge) return <View style={styles.container}><Text>Challenge not found.</Text></View>;
  const revealed = responses.length === 2;
  return <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>CHAPTER 1 · +{challenge.xp} SHARED XP</Text>
    <Text style={styles.title}>{challenge.title}</Text>
    <View style={styles.prompt}><Text style={styles.emoji}>💗</Text><Text style={styles.question}>{challenge.prompt}</Text></View>
    {loading ? <ActivityIndicator color={colors.pinkDark} /> : !session ? <Pressable style={styles.primary} onPress={() => router.push('/sign-in')}><Text style={styles.primaryText}>Sign in to play</Text></Pressable> : !coupleId ? <Pressable style={styles.primary} onPress={() => router.push('/partner')}><Text style={styles.primaryText}>Connect with your partner first</Text></Pressable> : revealed ? <View style={styles.feedback}>
      <Text style={styles.feedbackTitle}>You did it together! ✨</Text>
      {responses.map(row => <View key={row.user_id} style={styles.answer}><Text style={styles.answerLabel}>{row.user_id === session.user.id ? 'Your answer' : "Your partner's answer"}</Text><Text style={styles.answerText}>{row.answer}</Text></View>)}
      <Text style={styles.feedbackText}>+{challenge.xp} shared XP awarded once to your couple.</Text>
    </View> : submitted ? <View style={styles.feedback}>
      <Text style={styles.feedbackTitle}>Answer saved! 💌</Text>
      <Text style={styles.feedbackText}>Waiting for your partner. Your answers will be revealed together.</Text>
      <Pressable style={styles.primary} onPress={() => void refresh()}><Text style={styles.primaryText}>Check for partner's answer</Text></Pressable>
    </View> : <>
      {challenge.choices ? challenge.choices.map(choice => <Pressable key={choice} onPress={() => setAnswer(choice)} style={[styles.option, answer === choice && styles.chosen]}><Text style={styles.optionText}>{choice}</Text><Text>{answer === choice ? '✓' : '○'}</Text></Pressable>) : challenge.type === 'mission' ? <Pressable onPress={() => setAnswer('Completed together')} style={[styles.option, !!answer && styles.chosen]}><Text style={styles.optionText}>{answer ? '✓ Completed!' : 'Mark my part complete'}</Text></Pressable> : <TextInput style={[styles.option, styles.input]} multiline maxLength={1000} placeholder="Write your answer privately..." placeholderTextColor={colors.muted} value={answer} onChangeText={setAnswer} />}
      <Pressable disabled={!answer.trim() || busy} style={[styles.primary, (!answer.trim() || busy) && { opacity: 0.5 }]} onPress={submit}><Text style={styles.primaryText}>{busy ? 'Saving...' : 'Lock in my answer'}</Text></Pressable>
    </>}
    {!!message && <Text style={styles.error}>{message}</Text>}
    <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>← Back to adventures</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 56, backgroundColor: colors.background, flexGrow: 1 },
  eyebrow: { color: colors.pinkDark, fontWeight: '800', letterSpacing: 2, fontSize: 11 },
  title: { fontWeight: '900', fontSize: 32, color: colors.text, marginTop: 10, marginBottom: 28 },
  prompt: { backgroundColor: colors.lavender, padding: 28, borderRadius: 28, marginBottom: 24 },
  emoji: { fontSize: 38, marginBottom: 14 },
  question: { color: colors.text, fontSize: 22, lineHeight: 32, fontWeight: '800' },
  option: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: colors.surface, borderRadius: 17, borderWidth: 2, borderColor: colors.border, marginBottom: 12 },
  chosen: { borderColor: colors.pinkDark, backgroundColor: '#FFF1F6' },
  optionText: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  input: { minHeight: 120, textAlignVertical: 'top', fontSize: 16, color: colors.text },
  feedback: { padding: 19, backgroundColor: colors.mint, borderRadius: 20, marginTop: 8 },
  feedbackTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  feedbackText: { color: colors.text, lineHeight: 21, marginTop: 7 },
  answer: { backgroundColor: '#FFFFFFAA', padding: 12, borderRadius: 12, marginTop: 14 },
  answerLabel: { fontWeight: '800', fontSize: 12, color: colors.pinkDark },
  answerText: { fontSize: 16, color: colors.text, marginTop: 5 },
  primary: { padding: 17, backgroundColor: colors.pinkDark, borderRadius: 15, alignItems: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800' },
  error: { marginTop: 14, color: '#AA3555' },
  back: { alignItems: 'center', padding: 20, marginTop: 25 },
  backText: { color: colors.pinkDark, fontWeight: '800' },
});
