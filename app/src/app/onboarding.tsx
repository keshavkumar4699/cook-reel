import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DietFields, GoalFields, KitchenFields, localeDefaults, PersonaPicker } from '@/components/profile/ProfileFields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Text';
import type { CookProfile, Persona } from '@/data/types';
import { firstName } from '@/lib/format';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { GUTTER, useTheme } from '@/theme';

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const userName = useSession((s) => s.user?.name);
  const store = useProfile();
  const [step, setStep] = useState(0);
  const [personas, setPersonas] = useState<Persona[]>(store.personas);
  const [profile, setProfile] = useState<CookProfile>(() => ({ householdSize: 1, ...localeDefaults(), ...store.profile }));
  const patch = (p: Partial<CookProfile>) => setProfile((prev) => ({ ...prev, ...p }));

  const steps = useMemo(
    () => [
      { title: 'What brings you\nto CookReel?', subtitle: 'Pick all that fit — we’ll shape your home screen around them.' },
      { title: 'How do you eat?', subtitle: 'Chef will never suggest anything you can’t have.' },
      { title: 'Your kitchen', subtitle: 'Recipes will only use what you actually own.' },
      { title: 'You & your goals', subtitle: 'For portions, macros and grocery budgets.' },
    ],
    [],
  );

  const finish = () => {
    store.setPersonas(personas);
    store.updateProfile(profile);
    store.completeOnboarding();
    router.replace('/home');
  };
  const next = () => (step < steps.length - 1 ? setStep(step + 1) : finish());
  const current = steps[step]!;
  const name = firstName(userName);

  return (
    <Screen>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        {step > 0 ? (
          <PressableScale onPress={() => setStep(step - 1)} hitSlop={10} accessibilityLabel="Back">
            <Icon name="chevron-back" size={24} />
          </PressableScale>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <View style={styles.progress}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? colors.primary : colors.border }]} />
          ))}
        </View>
        <PressableScale onPress={finish} hitSlop={10} accessibilityLabel="Skip setup">
          <Txt variant="subheadStrong" color="textMuted">
            Skip
          </Txt>
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        <Animated.View key={step} entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(120)}>
          {step === 0 && name ? (
            <Txt variant="subheadStrong" color="primary" style={{ marginBottom: 6 }}>
              Hi {name} 👋
            </Txt>
          ) : null}
          <Txt variant="title1">{current.title}</Txt>
          <Txt variant="body" color="textMuted" style={{ marginTop: 8 }}>
            {current.subtitle}
          </Txt>
          {step === 0 ? <PersonaPicker value={personas} onChange={setPersonas} /> : null}
          {step === 1 ? <DietFields profile={profile} patch={patch} /> : null}
          {step === 2 ? <KitchenFields profile={profile} patch={patch} /> : null}
          {step === 3 ? <GoalFields profile={profile} patch={patch} /> : null}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: colors.bg }]}>
        <Button label={step === steps.length - 1 ? 'Start cooking' : 'Continue'} iconRight="arrow-forward" onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: GUTTER, paddingBottom: 8 },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2 },
  content: { paddingHorizontal: GUTTER, paddingTop: 20 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 12 },
});
