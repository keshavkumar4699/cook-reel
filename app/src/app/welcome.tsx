import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthButtons } from '@/components/AuthButtons';
import { HeroReels } from '@/components/HeroReels';
import { LanguageSheet } from '@/components/LanguageSheet';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import { getLanguage, LANGUAGE_INFO, t } from '@/i18n';
import { useProfile } from '@/state/profile';
import { font, GUTTER, radius, useTheme } from '@/theme';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const onboarded = useProfile((s) => s.onboarded);
  const next = () => router.replace(onboarded ? '/home' : '/onboarding');
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageName = LANGUAGE_INFO[getLanguage()].nativeName;

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]} bounces={false}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.top}>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Icon name="play" size={13} color="#FFFFFF" />
            </View>
            <Txt variant="title3">{t('common.appName')}</Txt>
          </View>
          <PressableScale
            onPress={() => setLanguageOpen(true)}
            haptic="select"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('auth.welcome.language', { language: languageName })}
            style={[styles.language, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Icon name="globe-outline" size={15} color={colors.textMuted} />
            <Txt variant="caption" color="textMuted" numberOfLines={1}>
              {languageName}
            </Txt>
          </PressableScale>
        </Animated.View>

        <HeroReels />

        <Animated.View entering={FadeInDown.delay(250).springify().damping(18)} style={styles.copy}>
          <Txt variant="hero">
            {t('auth.welcome.heroLine1')}
            {'\n'}
            <Txt variant="hero" color="primary" style={styles.italic}>
              {t('auth.welcome.heroLine2')}
            </Txt>
          </Txt>
          <Txt variant="body" color="textMuted" style={{ marginTop: 12 }}>
            {t('auth.welcome.body')}
          </Txt>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).springify().damping(18)} style={styles.actions}>
          <AuthButtons onSuccess={next} />
          <PressableScale onPress={next} style={styles.guest} accessibilityLabel={t('auth.welcome.guest')}>
            <Txt variant="bodyStrong">{t('auth.welcome.guest')}</Txt>
            <Icon name="arrow-forward" size={18} />
          </PressableScale>
          <Txt variant="caption" color="textFaint" align="center">
            {t('auth.welcome.note')}
          </Txt>
        </Animated.View>
      </ScrollView>
      <LanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, flexGrow: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 36 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  language: {
    position: 'absolute',
    end: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logo: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  copy: { marginTop: 4 },
  italic: font('displayItalic'),
  actions: { marginTop: 28, gap: 14 },
  guest: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48 },
});
