import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { firstChapter } from '../../src/content';
import { colors } from '../../src/theme';

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenge = firstChapter.find(c => c.id === id);
  const [answer, setAnswer] = useState<string | null>(null);
  if (!challenge) return <View style={styles.container}><Text>Challenge not found.</Text></View>;
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.eyebrow}>CHAPTER 1 · +{challenge.xp} XP</Text>
    <Text style={styles.title}>{challenge.title}</Text>
    <View style={styles.prompt}><Text style={styles.emoji}>💗</Text><Text style={styles.question}>{challenge.prompt}</Text></View>
    {challenge.choices ? challenge.choices.map(choice => <Pressable key={choice} onPress={() => setAnswer(choice)} style={[styles.option, answer === choice && styles.chosen]}><Text style={styles.optionText}>{choice}</Text><Text>{answer === choice ? '✓' : '○'}</Text></Pressable>) : <Pressable onPress={() => setAnswer('done')} style={[styles.option, answer && styles.chosen]}><Text style={styles.optionText}>{answer ? '✓ We did it!' : 'Mark this activity as done'}</Text></Pressable>}
    {answer && <View style={styles.feedback}><Text style={styles.feedbackTitle}>Lovely choice! ✨</Text><Text style={styles.feedbackText}>This is a local gameplay preview. In the connected version, both partners will submit before the answer reveal and XP award.</Text></View>}
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
  feedback: { padding: 19, backgroundColor: colors.mint, borderRadius: 20, marginTop: 20 },
  feedbackTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  feedbackText: { color: colors.text, lineHeight: 21, marginTop: 7 },
  back: { alignItems: 'center', padding: 20, marginTop: 25 },
  backText: { color: colors.pinkDark, fontWeight: '800' },
});
