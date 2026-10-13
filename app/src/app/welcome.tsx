import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthButtons } from '@/components/AuthButtons';
import { HeroReels } from '@/components/HeroReels';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import { useProfile } from '@/state/profile';
import { GUTTER, useTheme } from '@/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const onboarded = useProfile((s) => s.onboarded);
  const next = () => router.replace(onboarded ? '/home' : '/onboarding');

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]} bounces={false}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Icon name="play" size={13} color="#FFFFFF" />
          </View>
          <Txt variant="title3">CookReel</Txt>
        </Animated.View>

        <HeroReels />

        <Animated.View entering={FadeInDown.delay(250).springify().damping(18)} style={styles.copy}>
          <Txt variant="hero">
            Cook anything,{'\n'}
            <Txt variant="hero" color="primary" style={styles.italic}>
              one step at a time.
            </Txt>
          </Txt>
          <Txt variant="body" color="textMuted" style={{ marginTop: 12 }}>
            Turn YouTube recipes into hands-free step reels, or let Chef create dishes that fit your kitchen, goals and budget.
          </Txt>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).springify().damping(18)} style={styles.actions}>
          <AuthButtons onSuccess={next} />
          <PressableScale onPress={next} style={styles.guest} accessibilityLabel="Continue without an account">
            <Txt variant="bodyStrong">Continue without an account</Txt>
            <Icon name="arrow-forward" size={18} />
          </PressableScale>
          <Txt variant="caption" color="textFaint" align="center">
            Saving and cooking recipes is free. AI features need an account — new accounts get free credits to start.
          </Txt>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, flexGrow: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' },
  logo: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  copy: { marginTop: 4 },
  italic: { fontFamily: 'Fraunces_600SemiBold_Italic' },
  actions: { marginTop: 28, gap: 14 },
  guest: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48 },
});
