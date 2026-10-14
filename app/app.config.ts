import type { ExpoConfig } from 'expo/config';

const bundleId = process.env.APP_BUNDLE_ID ?? 'com.cookreel.app';
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
const microphonePermission = 'CookReel listens for "next", "back" and "stop" so you can cook hands-free.';
/** App languages besides English; each has its system permission texts in ./locales. */
const languages = ['es', 'fr', 'de', 'pt', 'it', 'ar', 'ja'] as const;

const config: ExpoConfig = {
  name: 'CookReel',
  slug: 'cookreel',
  scheme: 'cookreel',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#FBF7F2',
  // Permission prompts in the phone's language.
  locales: Object.fromEntries(languages.map((code) => [code, `./locales/${code}.json`])),
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: false,
    usesAppleSignIn: true,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      // Video clips keep playing (and the timer keeps counting) when the phone is locked mid-step.
      UIBackgroundModes: ['audio'],
    },
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: '#E2552D',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    'expo-font',
    'expo-image',
    // Lists CookReel's languages in the system's per-app language settings (Android 13+, iOS).
    ['expo-localization', { supportedLocales: ['en', ...languages] }],
    'expo-apple-authentication',
    'expo-asset',
    // Natural narration plays through expo-audio; it never records (speech recognition does that).
    ['expo-audio', { microphonePermission, recordAudioAndroid: false, enableBackgroundPlayback: false }],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 120,
        backgroundColor: '#FBF7F2',
        dark: { image: './assets/splash-icon.png', backgroundColor: '#121010' },
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission,
        speechRecognitionPermission: 'CookReel turns your voice commands into actions while you cook.',
        androidSpeechServicePackages: ['com.google.android.googlequicksearchbox'],
      },
    ],
    // The Google Sign-In plugin requires the iOS URL scheme; add it once you've created the OAuth client.
    ...(googleIosUrlScheme
      ? ([['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]] as ExpoConfig['plugins'] & object)
      : []),
  ],
};

export default config;
