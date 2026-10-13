export type GoogleResult = { idToken: string } | { cancelled: true };

/** The web preview has no native Google Sign-In; use the dev sign-in instead. */
export const googleAuth = {
  isConfigured: () => false,
  async signIn(): Promise<GoogleResult> {
    throw new Error('Google sign-in is available in the iOS and Android apps.');
  },
  async signOut() {},
};
