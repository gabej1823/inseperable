import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/supabase';
import { colors } from '../src/theme';

export default function SignIn() {
  const [creating, setCreating] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit() {
    if (!supabase) { setMessage('Supabase connection is not configured.'); return; }
    if (!email.trim() || password.length < 6 || (creating && !name.trim())) {
      setMessage('Enter your email, a password of at least 6 characters, and your name when signing up.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      if (creating) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { display_name: name.trim() } },
        });
        if (error) throw error;
        if (!data.session) setMessage('Check your email for a confirmation link, then sign in.');
        else router.replace('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace('/');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heart}>💕</Text>
      <Text style={styles.title}>Inseparable</Text>
      <Text style={styles.subtitle}>Grow closer. Level up together.</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>{creating ? 'Start your adventure' : 'Welcome back'}</Text>
        {creating && <TextInput style={styles.input} placeholder="Your first name" placeholderTextColor={colors.muted} autoCapitalize="words" value={name} onChangeText={setName} maxLength={80} />}
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry autoComplete={creating ? 'new-password' : 'current-password'} value={password} onChangeText={setPassword} />
        {!!message && <Text style={styles.message}>{message}</Text>}
        <Pressable style={[styles.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{creating ? 'Create my account' : 'Sign in'}</Text>}
        </Pressable>
        <Pressable style={styles.switch} onPress={() => { setCreating(!creating); setMessage(''); }}><Text style={styles.switchText}>{creating ? 'Already have an account? Sign in' : 'New here? Create an account'}</Text></Pressable>
      </View>
      <Text style={styles.footnote}>One adventure, two people. Your partner creates their own account.</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 26, backgroundColor: colors.background },
  heart: { fontSize: 52, textAlign: 'center' },
  title: { fontSize: 38, fontWeight: '900', textAlign: 'center', color: colors.text, marginTop: 10 },
  subtitle: { color: colors.muted, textAlign: 'center', marginBottom: 32, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 28, padding: 22, borderColor: colors.border, borderWidth: 1 },
  heading: { fontSize: 23, fontWeight: '800', color: colors.text, marginBottom: 20 },
  input: { backgroundColor: colors.background, borderRadius: 15, padding: 15, marginBottom: 13, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  button: { padding: 18, backgroundColor: colors.pinkDark, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  switch: { padding: 16, alignItems: 'center' },
  switchText: { color: colors.pinkDark, fontWeight: '700' },
  message: { color: colors.pinkDark, lineHeight: 21, marginBottom: 10 },
  footnote: { color: colors.muted, textAlign: 'center', marginTop: 24, fontSize: 12 },
});
