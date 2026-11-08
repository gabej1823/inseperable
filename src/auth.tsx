import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Linking } from 'react-native';
import { supabase } from './supabase';

type AuthState = { session: Session | null; loading: boolean };
const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    const client = supabase;
    async function handleAuthUrl(url: string | null) {
      if (!url || !url.startsWith('inseparable://')) return;
      // Supabase's confirmation redirect may return implicit-flow tokens in
      // a URL fragment. Some configurations instead return an OAuth/PKCE code.
      const fragment = url.includes('#') ? url.split('#')[1] : '';
      const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
      const params = new URLSearchParams(fragment || query);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const code = params.get('code');
      if (access_token && refresh_token) await client.auth.setSession({ access_token, refresh_token });
      else if (code) await client.auth.exchangeCodeForSession(code);
    }
    void Linking.getInitialURL().then(handleAuthUrl).catch(() => {});
    const linkSubscription = Linking.addEventListener('url', ({ url }) => { void handleAuthUrl(url).catch(() => {}); });
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });
    return () => { active = false; subscription.unsubscribe(); linkSubscription.remove(); };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
