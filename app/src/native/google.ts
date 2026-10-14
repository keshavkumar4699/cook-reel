import { Platform } from 'react-native';
import { t } from '@/i18n';
import { LocalizedError } from '@/lib/errors';

type GoogleModule = typeof import('@react-native-google-signin/google-signin');

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let mod: GoogleModule | null = null;
let configured = false;

/** Loaded lazily so the app still runs in environments without the native module (e.g. Expo Go). */
function load(): GoogleModule {
  if (!mod) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mod = require('@react-native-google-signin/google-signin') as GoogleModule;
    } catch {
      throw new LocalizedError(t('auth.errors.googleNeedsBuild'));
    }
  }
  if (!configured) {
    mod.GoogleSignin.configure({ webClientId, iosClientId, scopes: ['profile', 'email'] });
    configured = true;
  }
  return mod;
}

export type GoogleResult = { idToken: string } | { cancelled: true };

export const googleAuth = {
  isConfigured: () => !!webClientId && (Platform.OS !== 'ios' || !!iosClientId),

  async signIn(): Promise<GoogleResult> {
    const { GoogleSignin, isErrorWithCode, statusCodes } = load();
    try {
      if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type !== 'success') return { cancelled: true };
      const idToken = response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
      // Usually a wrong web client ID in the build's configuration.
      if (!idToken) throw new LocalizedError(t('auth.errors.googleNoToken'));
      return { idToken };
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return { cancelled: true };
        if (error.code === statusCodes.IN_PROGRESS) return { cancelled: true };
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new LocalizedError(t('auth.errors.googleNoPlayServices'));
        }
      }
      throw error;
    }
  },

  async signOut() {
    try {
      await load().GoogleSignin.signOut();
    } catch {
      // Not signed in with Google, or module unavailable — nothing to do.
    }
  },
};
