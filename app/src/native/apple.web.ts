import { t } from '@/i18n';
import { LocalizedError } from '@/lib/errors';

export type AppleResult =
  | { identityToken: string; authorizationCode: string | null; fullName: string | null }
  | { cancelled: true };

export const appleAuth = {
  isAvailable: async () => false,
  async signIn(): Promise<AppleResult> {
    throw new LocalizedError(t('auth.errors.appleIosOnly'));
  },
};
