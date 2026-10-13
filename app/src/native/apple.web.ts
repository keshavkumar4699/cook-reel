export type AppleResult =
  | { identityToken: string; authorizationCode: string | null; fullName: string | null }
  | { cancelled: true };

export const appleAuth = {
  isAvailable: async () => false,
  async signIn(): Promise<AppleResult> {
    throw new Error('Sign in with Apple is available in the iOS app.');
  },
};
