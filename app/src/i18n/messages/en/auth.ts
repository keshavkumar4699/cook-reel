import { plural } from '../../catalog';

/** Welcome screen, sign-in and account creation. */
export default {
  welcome: {
    /** First line of the big headline. */
    heroLine1: 'Cook anything,',
    /** Second line of the headline, shown in an accent colour and italics. */
    heroLine2: 'one step at a time.',
    body: 'Turn YouTube recipes into hands-free step reels, or let Chef create dishes that fit your kitchen, goals and budget.',
    guest: 'Continue without an account',
    note: 'Saving and cooking recipes is free. AI features need an account — new accounts get free credits to start.',
    /** Accessibility label of the language button in the corner; {language} is the current language's name. */
    language: 'Language: {language}',
  },
  signIn: {
    title: 'Sign up to cook with AI',
    body: 'It takes one tap. Your recipes, plans and lists stay on this device.',
    perks: {
      chef: { title: 'Chef, your AI cook', body: 'Describe a craving — get a recipe for your kitchen and goals.' },
      youtube: { title: 'YouTube to step reels', body: 'Any recipe video becomes short clips you can follow by voice.' },
      credits: { title: 'Free credits to start', body: 'Try every AI feature on us. Your saved recipes stay on your phone.' },
    },
    legal: 'By continuing you agree to the Terms and Privacy Policy.',
  },
  buttons: {
    google: 'Continue with Google',
    /** Developer-only sign-in panel (never shown in store builds). */
    devTitle: 'Development sign-in',
    devName: 'Your name',
    devButton: 'Sign in for testing',
  },
  /** Toast after a new account is created. */
  welcomeCredits: plural({
    one: 'Welcome! {count} free credit is in your account.',
    other: 'Welcome! {count} free credits are in your account.',
  }),
  errors: {
    generic: 'Couldn’t sign you in. Please try again.',
    appleNoToken: 'Apple didn’t confirm your sign-in. Please try again.',
    appleIosOnly: 'Sign in with Apple is available in the iOS app.',
    googleNeedsBuild: 'Google sign-in needs the CookReel app build (it isn’t available in Expo Go).',
    googleNoToken: 'Google didn’t confirm your sign-in. Please try again.',
    googleNoPlayServices: 'Google Play Services is unavailable on this device.',
    googleAppsOnly: 'Google sign-in is available in the iOS and Android apps.',
    purchasesAppsOnly: 'Purchases are available in the iOS and Android apps.',
  },
} as const;
