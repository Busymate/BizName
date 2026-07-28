import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); setProfileError(''); return; }
    setProfileError('');
    api.me()
      .then((res) => setProfile(res.user))
      .catch((err) => {
        // BUG FIX: this used to swallow the error and just leave profile
        // null forever, so PrivateRoute/Dashboard rendered a blank page
        // with zero feedback — looked exactly like "login/signup doesn't
        // work" even though auth had actually succeeded. Most likely cause
        // if you see this: the Express server (server/) isn't running, or
        // server/.env has the wrong SUPABASE_SERVICE_ROLE_KEY.
        setProfile(null);
        setProfileError(err.message || 'Could not load your account.');
      });
  }, [session]);

  // Realtime: keeps `profile` live without a refresh. Matters most for
  // plan/role changes that happen server-side and aren't triggered by
  // anything the user just clicked — e.g. a Flutterwave webhook
  // upgrading them to Premium a few seconds after payment, or an admin
  // changing their role. The row itself comes in the event payload, so
  // this updates state directly instead of re-fetching from /auth/me.
  useEffect(() => {
    if (!session?.user?.id) return undefined;
    const channel = supabase
      .channel(`realtime:profiles:${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => setProfile(payload.new)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  // Settings.jsx updates profiles.full_name directly via the Supabase
  // client (RLS: profiles_update_own). That write doesn't flow through
  // the Express /auth/me cache above, so expose a manual refetch instead
  // of forcing a full page reload after every save.
  const refreshProfile = () => {
    if (!session) return Promise.resolve();
    return api.me().then((res) => setProfile(res.user));
  };

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });

  // BUG FIX: this used to always resolve "successfully" even if the
  // post-signup login step failed, because Supabase's signInWithPassword
  // returns { data, error } instead of throwing — Signup.jsx would then
  // navigate to /dashboard as if it worked. Now it throws so the UI shows
  // the real error.
  const signup = async (email, password, full_name, referred_by) => {
    const { referral_code } = await api.signup({ email, password, full_name, referred_by: referred_by || undefined });
    const { error } = await login(email, password);
    if (error) throw new Error(error.message);
    void referral_code; // available on /dashboard immediately after login
  };

  const logout = () => supabase.auth.signOut();

  // OAuth (Google / GitHub) — Supabase redirects the browser to the
  // provider and back to /dashboard on success. No server round-trip
  // needed for these; Supabase issues the session directly.
  const loginWithOAuth = (provider) =>
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, profileError, login, signup, logout, loginWithOAuth, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
