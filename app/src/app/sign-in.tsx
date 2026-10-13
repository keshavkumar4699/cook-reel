import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthButtons } from '@/components/AuthButtons';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { Txt } from '@/components/ui/Text';
import { GUTTER, radius, useTheme } from '@/theme';

const PERKS: { icon: IconName; title: string; body: string; tone: 'ai' | 'youtube' | 'accent' }[] = [
  { icon: 'sparkles', title: 'Chef, your AI cook', body: 'Describe a craving — get a recipe for your kitchen and goals.', tone: 'ai' },
  { icon: 'logo-youtube', title: 'YouTube → step reels', body: 'Any recipe video becomes short clips you can follow by voice.', tone: 'youtube' },
  { icon: 'flash', title: 'Free credits to start', body: 'Try every AI feature on us. Your saved recipes stay on your phone.', tone: 'accent' },
];

/** "Sign up to use AI": shown whenever a guest taps an AI feature. */
export default function SignIn() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { next } = useLocalSearchParams<{ next?: string }>();

  const done = () => {
    if (router.canGoBack()) router.back();
    if (next) setTimeout(() => router.push(next as Href), 250);
  };

  return (
    <Screen>
      <TopBar leading="close" transparent />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.badge, { backgroundColor: colors.aiSoft }]}>
          <Txt style={{ fontSize: 34, lineHeight: 42 }}>👩‍🍳</Txt>
        </View>
        <Txt variant="title1" align="center" style={{ marginTop: 16 }}>
          Sign up to cook with AI
        </Txt>
        <Txt variant="body" color="textMuted" align="center" style={{ marginTop: 8 }}>
          It takes one tap. Your recipes, plans and lists stay on this device.
        </Txt>

        <View style={styles.perks}>
          {PERKS.map((perk) => {
            const tint = perk.tone === 'ai' ? colors.ai : perk.tone === 'youtube' ? colors.youtube : colors.accent;
            const bg = perk.tone === 'ai' ? colors.aiSoft : perk.tone === 'youtube' ? colors.primarySoft : colors.accentSoft;
            return (
              <View key={perk.title} style={styles.perk}>
                <View style={[styles.perkIcon, { backgroundColor: bg }]}>
                  <Icon name={perk.icon} size={20} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="headline">{perk.title}</Txt>
                  <Txt variant="subhead" color="textMuted">
                    {perk.body}
                  </Txt>
                </View>
              </View>
            );
          })}
        </View>

        <AuthButtons onSuccess={done} />
        <Txt variant="caption" color="textFaint" align="center" style={{ marginTop: 14 }}>
          By continuing you agree to the Terms and Privacy Policy.
        </Txt>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER },
  badge: { alignSelf: 'center', width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  perks: { gap: 18, marginVertical: 28 },
  perk: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  perkIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
