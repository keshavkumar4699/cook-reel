import { plural } from '../../catalog';

/** Me tab: account, credits and settings. */
export default {
  /** Name shown for a signed-in cook without a name. */
  cook: 'Cook',
  guest: 'Guest cook',
  signedIn: 'Signed in',
  recipesOnPhone: plural({ one: '{count} recipe on this phone', other: '{count} recipes on this phone' }),
  credits: {
    title: 'Credits',
    /** Badge for cooks without a subscription: they have the one-time starter credits. */
    starter: 'Starter',
    /** {allowance} is the plan's monthly credits, {date} the refill date. */
    refill: 'Plan credits refill to {allowance} on {date}',
    /** Added after the refill line when the cook also has top-up credits (which never expire). */
    extra: plural({ one: '{count} extra credit', other: '{count} extra credits' }),
    starterNote: 'One-time starter credits. Subscribe for a fresh batch every month.',
    more: 'Get more credits',
    plans: 'See plans',
  },
  guestCard: {
    title: 'Unlock Chef and YouTube reels',
    body: 'Create a free account to use AI features. Your recipes stay on this phone either way.',
    cta: 'Create free account',
  },
  groups: {
    cooking: 'Cooking',
    voice: 'Voice and narration',
    appearance: 'Appearance',
    language: 'Language',
    privacy: 'Privacy',
    purchases: 'Purchases',
    account: 'Account',
  },
  rows: {
    profile: 'Cooking profile',
    /** Shown when the cooking profile is empty. */
    profileEmpty: 'Diet, kitchen, goals',
    voiceControl: 'Voice control',
    /** Use the command words of your language's voice commands. */
    voiceControlDetail: 'Say “next”, “back”, “stop” while cooking',
    readAloud: 'Read steps aloud',
    readAloudDetail: 'Always on for YouTube Shorts',
    language: 'App language',
    sharing: 'Help Chef learn from my imports',
    sharingDetail: 'Recipes from videos you import improve suggestions for everyone. Turning this off withdraws them.',
    plans: 'Plans and credits',
    restore: 'Restore purchases',
    manage: 'Manage subscription',
    signOut: 'Sign out',
    deleteAccount: 'Delete account',
  },
  /** Short summary of the cooking profile under "Cooking profile". */
  profileSummary: {
    household: plural({ one: 'Cooks for {count}', other: 'Cooks for {count}' }),
    appliances: plural({ one: '{count} appliance', other: '{count} appliances' }),
  },
  voice: {
    natural: 'Natural voice',
    naturalDetail: 'Chef sounds like a real person, in every language. Needs an internet connection.',
    /** Shown instead of the switch to cooks without an account. */
    naturalGuest: 'Create a free account to hear Chef’s natural voice. Until then, steps use your phone’s voice.',
    /** Heading over the list of voices. */
    choose: 'Chef’s voice',
    /** Voice names: describe how each sounds. Short. */
    voices: {
      warm: 'Warm',
      friendly: 'Friendly',
      gentle: 'Gentle',
      easygoing: 'Easygoing',
    },
    /** Accessibility label of the play button next to a voice. {voice} is its name. */
    playSample: 'Play a sample of {voice}',
    stopSample: 'Stop the sample',
    /** Spoken by each voice as its sample. Write it the way a friendly cook would talk. */
    sample: 'Hi! I’m Chef. Let’s cook something delicious together — I’ll talk you through every step.',
    /** Shown under the voice list while a sample is being prepared. */
    preparing: 'Getting Chef’s voice ready…',
    pace: 'Narration pace',
    paces: {
      relaxed: 'Relaxed',
      normal: 'Normal',
      brisk: 'Brisk',
    },
  },
  appearance: {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  deleteConfirm: {
    title: 'Delete your account?',
    message: 'Your credits, subscription link and contributions are removed permanently. Recipes on this phone stay. Cancel any subscription in your app store settings too.',
    confirm: 'Delete account',
  },
  toasts: {
    deleted: 'Your account has been deleted',
  },
  /** Footer; {version} is the app version. */
  footer: 'CookReel {version} · Made for hungry people',
} as const;
