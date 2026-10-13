import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export type AppleResult =
  | { identityToken: string; authorizationCode: string | null; fullName: string | null }
  | { cancelled: true };

export const appleAuth = {
  isAvailable: async () => Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync()),

  async signIn(): Promise<AppleResult> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('Apple did not return an identity token.');
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
        : '';
      return {
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        fullName: name || null,
      };
    } catch (error) {
      if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return { cancelled: true };
      throw error;
    }
  },
};
