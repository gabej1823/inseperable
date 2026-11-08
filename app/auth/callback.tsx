import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/auth';
import { colors } from '../../src/theme';

export default function AuthCallback() {
  const { session, loading } = useAuth();
  useEffect(() => { if (session) router.replace('/'); }, [session]);

  return <View style={styles.container}>
    <Text style={styles.title}>You're almost there 💕</Text>
    {loading ? <ActivityIndicator color={colors.pinkDark} /> : <Text style={styles.body}>If your email was verified, return to Inseparable and sign in with your email and password.</Text>}
    <Pressable style={styles.button} onPress={() => router.replace(session ? '/' : '/sign-in')}><Text style={styles.buttonText}>{session ? 'Start our adventure' : 'Continue to sign in'}</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 28, backgroundColor: colors.background },
  title: { fontSize: 29, fontWeight: '900', color: colors.text, marginBottom: 18 },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  button: { padding: 17, alignItems: 'center', backgroundColor: colors.pinkDark, borderRadius: 15, marginTop: 28 },
  buttonText: { color: '#fff', fontWeight: '800' },
});
