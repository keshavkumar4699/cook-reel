import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { api, type SessionResponse } from '@/lib/api';
import { fetchHealth } from '@/lib/health';
import { errorMessage } from '@/lib/errors';
import { haptics } from '@/lib/haptics';
import { appleAuth } from '@/native/apple';
import { googleAuth } from '@/native/google';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';

export type Provider = 'apple' | 'google' | 'dev';

/** Shared sign-in flow for the welcome screen and the "sign up to use AI" sheet. */
export function useSignIn(onSuccess: (session: SessionResponse) => void) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [devAvailable, setDevAvailable] = useState(false);

  useEffect(() => {
    void appleAuth.isAvailable().then(setAppleAvailable).catch(() => setAppleAvailable(false));
    if (__DEV__) void fetchHealth().then((h) => setDevAvailable(!!h?.features.devLogin));
  }, []);

  async function run(provider: Provider, attempt: () => Promise<SessionResponse | null>) {
    if (busy) return;
    setBusy(provider);
    try {
      const session = await attempt();
      if (!session) return;
      await useSession.getState().setSession(session);
      haptics.success();
      if (session.starterCreditsGranted > 0) {
        toast(t('auth.welcomeCredits', { count: session.starterCreditsGranted }), { tone: 'success', durationMs: 4000 });
      }
      onSuccess(session);
    } catch (error) {
      haptics.error();
      toast(errorMessage(error, 'auth.errors.generic'), { tone: 'error', durationMs: 4500 });
    } finally {
      setBusy(null);
    }
  }

  return {
    busy,
    appleAvailable,
    googleAvailable: googleAuth.isConfigured(),
    devAvailable,
    signInWithApple: () =>
      run('apple', async () => {
        const result = await appleAuth.signIn();
        if ('cancelled' in result) return null;
        return api.signInWithApple(result);
      }),
    signInWithGoogle: () =>
      run('google', async () => {
        const result = await googleAuth.signIn();
        if ('cancelled' in result) return null;
        return api.signInWithGoogle(result.idToken);
      }),
    signInDev: (name: string) => run('dev', () => api.signInDev(name || 'Dev Cook')),
  };
}
