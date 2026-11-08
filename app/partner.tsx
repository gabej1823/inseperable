import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/auth';
import { supabase } from '../src/supabase';
import { colors } from '../src/theme';

export default function PartnerScreen() {
  const { session, loading: authLoading } = useAuth();
  const [code, setCode] = useState('');
  const [invite, setInvite] = useState('');
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!supabase || !session) return;
    const { data, error } = await supabase.rpc('my_couple_id');
    if (error) { setMessage('Partner linking is not installed yet. Apply the partner-linking SQL migration.'); return; }
    setCoupleId(data);
    if (data) {
      const { data: members } = await supabase.from('couple_members').select('user_id').eq('couple_id', data);
      const other = members?.find(member => member.user_id !== session.user.id);
      if (other) {
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', other.user_id).single();
        setPartnerName(profile?.display_name || 'your partner');
      } else setPartnerName(null);
    } else setPartnerName(null);
  }, [session]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function createInvite() {
    if (!supabase) return;
    setBusy(true); setMessage('');
    const { data, error } = await supabase.rpc('get_or_create_partner_invite');
    if (error) setMessage(error.message);
    else { setInvite(data); await refresh(); }
    setBusy(false);
  }

  async function join() {
    if (!supabase) return;
    if (!/^([a-fA-F0-9]{8}|[a-fA-F0-9]{12})$/.test(code.trim())) { setMessage('Enter the 8-character invitation code.'); return; }
    setBusy(true); setMessage('');
    const { error } = await supabase.rpc('join_partner_with_code', { invite_code: code.trim() });
    if (error) setMessage(error.message);
    else { setMessage('You are linked! Your adventure begins now.'); await refresh(); }
    setBusy(false);
  }

  if (authLoading) return <View style={styles.container}><ActivityIndicator /></View>;
  if (!session) return <View style={styles.container}><Text style={styles.heading}>Sign in to connect with your partner.</Text><Pressable style={styles.button} onPress={() => router.replace('/sign-in')}><Text style={styles.buttonText}>Sign in</Text></Pressable></View>;

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.heart}>💞</Text>
    <Text style={styles.heading}>Better as two.</Text>
    <Text style={styles.lead}>Each of you gets your own account. Link them once to unlock your shared journey.</Text>
    {partnerName ? <View style={styles.card}><Text style={styles.cardTitle}>You're inseparable! 💕</Text><Text style={styles.lead}>Connected with {partnerName}. You're ready for shared challenges.</Text><Pressable style={styles.button} onPress={() => router.replace('/')}><Text style={styles.buttonText}>Go to our adventure</Text></Pressable></View> : <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invite your partner</Text>
        <Text style={styles.lead}>Generate a code and send it to your partner. It expires after seven days.</Text>
        {!!invite && <Text selectable style={styles.invite}>{invite}</Text>}
        <Pressable disabled={busy} style={styles.button} onPress={createInvite}><Text style={styles.buttonText}>{invite ? 'Show current invite' : 'Get invitation code'}</Text></Pressable>
      </View>
      {!coupleId && <View style={styles.card}>
        <Text style={styles.cardTitle}>Have a code?</Text>
        <TextInput style={styles.input} placeholder="8-character code" placeholderTextColor={colors.muted} autoCapitalize="characters" autoCorrect={false} value={code} onChangeText={setCode} maxLength={12} />
        <Pressable disabled={busy} style={styles.button} onPress={join}><Text style={styles.buttonText}>Link with my partner</Text></Pressable>
      </View>}
      {coupleId && <Text style={styles.lead}>Waiting for your partner to join. They should create their own account, then enter your invitation code above.</Text>}
    </>}
    {!!message && <Text style={styles.message}>{message}</Text>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24, paddingTop: 50 },
  heart: { fontSize: 52, textAlign: 'center' },
  heading: { fontSize: 32, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 12 },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 23, padding: 22, marginTop: 24, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800' },
  button: { backgroundColor: colors.pinkDark, borderRadius: 16, padding: 17, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  invite: { fontSize: 30, fontWeight: '900', letterSpacing: 3, color: colors.pinkDark, textAlign: 'center', marginTop: 20 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: 16, borderRadius: 16, marginTop: 18, color: colors.text },
  message: { marginTop: 24, color: colors.pinkDark, lineHeight: 22 },
});
