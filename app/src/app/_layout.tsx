import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { reloadAppAsync } from 'expo';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastHost } from '@/components/ui/ToastHost';
import { isRTL, reloadIfDeviceLanguageChanged, syncLayoutDirection } from '@/i18n';
import { useImports } from '@/state/imports';
import { useKitchen } from '@/state/kitchen';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

type Persisted = { persist: { hasHydrated(): boolean; onFinishHydration(cb: () => void): () => void } };
const persisted = (store: Persisted) =>
  new Promise<void>((resolve) => {
    if (store.persist.hasHydrated()) return resolve();
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [ready, setReady] = useState(false);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    let active = true;
    const boot = async () => {
      // The language was read synchronously when '@/i18n' loaded. Arabic also needs a right-to-left
      // layout, which React Native only applies after a restart — do that before anything renders.
      if (syncLayoutDirection()) {
        try {
          await reloadAppAsync('Layout direction changed');
          return;
        } catch {
          // Carry on in the old direction; it applies on the next launch.
        }
      }
      await Promise.allSettled([
        persisted(useProfile),
        persisted(useSettings),
        persisted(useImports),
        useSession.getState().hydrate(),
        useLibrary.getState().hydrate(),
        useKitchen.getState().hydrate(),
      ]);
      if (active) setReady(true);
    };
    void boot();
    // With "phone language" selected, follow a language change made in system settings.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reloadIfDeviceLanguageChanged().catch(() => undefined);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const loaded = (fontsLoaded || !!fontError) && ready;
  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);
  if (!loaded) return null;

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.border, primary: colors.primary },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: isRTL() ? 'slide_from_left' : 'slide_from_right' }}>
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
            <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
            <Stack.Screen name="pricing" options={{ presentation: 'modal' }} />
            <Stack.Screen name="cook/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade', contentStyle: { backgroundColor: '#0B0908' } }} />
          </Stack>
          <ToastHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
