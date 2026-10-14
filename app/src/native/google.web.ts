import { t } from '@/i18n';
import { LocalizedError } from '@/lib/errors';

export type GoogleResult = { idToken: string } | { cancelled: true };

/** The web preview has no native Google Sign-In; use the dev sign-in instead. */
export const googleAuth = {
  isConfigured: () => false,
  async signIn(): Promise<GoogleResult> {
    throw new LocalizedError(t('auth.errors.googleAppsOnly'));
  },
  async signOut() {},
};
