import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DietFields, GoalFields, KitchenFields, PersonaPicker } from '@/components/profile/ProfileFields';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { Txt } from '@/components/ui/Text';
import type { CookProfile, Persona } from '@/data/types';
import { useProfile } from '@/state/profile';
import { toast } from '@/state/toast';
import { t } from '@/i18n';
import { GUTTER, useTheme } from '@/theme';

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const store = useProfile();
  const [personas, setPersonas] = useState<Persona[]>(store.personas);
  const [profile, setProfile] = useState<CookProfile>(store.profile);
  const patch = (p: Partial<CookProfile>) => setProfile((prev) => ({ ...prev, ...p }));

  const save = () => {
    store.setPersonas(personas);
    store.updateProfile(profile);
    toast(t('onboarding.profile.saved'), { tone: 'success' });
    router.back();
  };

  return (
    <Screen>
      <TopBar title={t('onboarding.profile.title')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <Txt variant="body" color="textMuted">
          {t('onboarding.profile.intro')}
        </Txt>
        <Txt variant="title3" style={styles.section}>
          {t('onboarding.profile.sections.personas')}
        </Txt>
        <PersonaPicker value={personas} onChange={setPersonas} />
        <Txt variant="title3" style={styles.section}>
          {t('onboarding.profile.sections.diet')}
        </Txt>
        <DietFields profile={profile} patch={patch} />
        <Txt variant="title3" style={styles.section}>
          {t('onboarding.profile.sections.kitchen')}
        </Txt>
        <KitchenFields profile={profile} patch={patch} />
        <Txt variant="title3" style={styles.section}>
          {t('onboarding.profile.sections.goals')}
        </Txt>
        <GoalFields profile={profile} patch={patch} />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Button label={t('onboarding.profile.save')} icon="checkmark" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  section: { marginTop: 32 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
