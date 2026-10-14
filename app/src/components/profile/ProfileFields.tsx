import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Stepper } from '@/components/ui/Stepper';
import { Txt } from '@/components/ui/Text';
import type { CookProfile, Persona } from '@/data/types';
import { t } from '@/i18n';
import { ALLERGY_IDS, EQUIPMENT_IDS, type EquipmentId } from '@/lib/profileOptions';
import { radius, useTheme } from '@/theme';

export const PERSONAS: { id: Persona; emoji: string }[] = [
  { id: 'saver', emoji: '📌' },
  { id: 'quick', emoji: '⚡' },
  { id: 'fridge', emoji: '🧺' },
  { id: 'creator', emoji: '🧪' },
  { id: 'fitness', emoji: '💪' },
  { id: 'learner', emoji: '🍳' },
];

const DIETS: { id: NonNullable<CookProfile['diet']>; emoji: string }[] = [
  { id: 'vegetarian', emoji: '🥦' },
  { id: 'eggetarian', emoji: '🥚' },
  { id: 'non-vegetarian', emoji: '🍗' },
  { id: 'vegan', emoji: '🌱' },
  { id: 'pescatarian', emoji: '🐟' },
];
const SPICE: { id: NonNullable<CookProfile['spiceLevel']>; emoji: string }[] = [
  { id: 'mild', emoji: '🙂' },
  { id: 'medium', emoji: '🌶️' },
  { id: 'hot', emoji: '🔥' },
];
const EQUIPMENT_EMOJI: Record<EquipmentId, string> = {
  gasStove: '🔥',
  induction: '⚡',
  microwave: '📟',
  oven: '♨️',
  airFryer: '🌀',
  pressureCooker: '🫕',
  riceCooker: '🍚',
  kettle: '☕',
  blender: '🥤',
  toaster: '🍞',
};
const TIMES = [10, 20, 30, 45];
const SKILLS: { id: NonNullable<CookProfile['skill']>; emoji: string }[] = [
  { id: 'new', emoji: '🐣' },
  { id: 'basic', emoji: '🙂' },
  { id: 'confident', emoji: '😎' },
];
const GOALS: { id: NonNullable<CookProfile['goal']>; emoji: string; protein: number }[] = [
  { id: 'build_muscle', emoji: '💪', protein: 120 },
  { id: 'lose_fat', emoji: '🔥', protein: 110 },
  { id: 'maintain', emoji: '⚖️', protein: 80 },
  { id: 'eat_healthy', emoji: '🥗', protein: 70 },
  { id: 'none', emoji: '🙂', protein: 0 },
];
const BUDGETS: { id: NonNullable<CookProfile['budget']>; emoji: string }[] = [
  { id: 'tight', emoji: '💸' },
  { id: 'moderate', emoji: '👛' },
  { id: 'flexible', emoji: '✨' },
];

export function localeDefaults(): Pick<CookProfile, 'region' | 'currency' | 'units'> {
  const locale = getLocales()[0];
  if (!locale) return {};
  let region: string | undefined;
  try {
    region = locale.regionCode ? new Intl.DisplayNames(['en'], { type: 'region' }).of(locale.regionCode) ?? undefined : undefined;
  } catch {
    region = locale.regionCode ?? undefined;
  }
  return {
    region,
    currency: locale.currencyCode ?? undefined,
    units: locale.measurementSystem === 'us' ? 'us' : 'metric',
  };
}

export function OptionCard({ emoji, title, body, selected, onPress }: { emoji: string; title: string; body?: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={[
        styles.option,
        { backgroundColor: selected ? colors.primarySoft : colors.surface, borderColor: selected ? colors.primary : colors.border },
      ]}
    >
      <Txt style={styles.optionEmoji}>{emoji}</Txt>
      <View style={{ flex: 1 }}>
        <Txt variant="headline">{title}</Txt>
        {body ? (
          <Txt variant="footnote" color="textMuted">
            {body}
          </Txt>
        ) : null}
      </View>
      <View style={[styles.check, { borderColor: selected ? colors.primary : colors.borderStrong, backgroundColor: selected ? colors.primary : 'transparent' }]}>
        {selected ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
      </View>
    </PressableScale>
  );
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Txt variant="overline" color="textMuted" style={{ marginBottom: 10 }}>
        {label}
      </Txt>
      {children}
    </View>
  );
}


const toggle = <T,>(list: T[] | undefined, item: T) => (list?.includes(item) ? list.filter((x) => x !== item) : [...(list ?? []), item]);

type FieldsProps = { profile: CookProfile; patch: (p: Partial<CookProfile>) => void };

export function PersonaPicker({ value, onChange }: { value: Persona[]; onChange: (v: Persona[]) => void }) {
  return (
    <View style={styles.cards}>
      {PERSONAS.map((p) => (
        <OptionCard
          key={p.id}
          emoji={p.emoji}
          title={t(`onboarding.personas.${p.id}.title`)}
          body={t(`onboarding.personas.${p.id}.body`)}
          selected={value.includes(p.id)} onPress={() => onChange(toggle(value, p.id))} />
      ))}
    </View>
  );
}

export function DietFields({ profile, patch }: FieldsProps) {
  return (
    <>
      <Group label={t('onboarding.groups.diet')}>
        <View style={styles.wrap}>
          {DIETS.map((d) => (
            <Chip key={d.id} label={t(`onboarding.diets.${d.id}`)} emoji={d.emoji} selected={profile.diet === d.id} onPress={() => patch({ diet: d.id })} />
          ))}
        </View>
      </Group>
      <Group label={t('onboarding.groups.allergies')}>
        <View style={styles.wrap}>
          {ALLERGY_IDS.map((a) => (
            <Chip key={a} label={t(`onboarding.allergies.${a}`)} tone="primary" selected={profile.allergies?.includes(a)} onPress={() => patch({ allergies: toggle(profile.allergies, a) })} />
          ))}
        </View>
      </Group>
      <Group label={t('onboarding.groups.spice')}>
        <View style={styles.wrap}>
          {SPICE.map((s) => (
            <Chip key={s.id} label={t(`onboarding.spice.${s.id}`)} emoji={s.emoji} selected={profile.spiceLevel === s.id} onPress={() => patch({ spiceLevel: s.id })} />
          ))}
        </View>
      </Group>
    </>
  );
}

export function KitchenFields({ profile, patch }: FieldsProps) {
  return (
    <>
      <Group label={t('onboarding.groups.equipment')}>
        <View style={styles.wrap}>
          {EQUIPMENT_IDS.map((id) => (
            <Chip
              key={id}
              label={t(`onboarding.equipment.${id}`)}
              emoji={EQUIPMENT_EMOJI[id]}
              selected={profile.equipment?.includes(id)}
              onPress={() => patch({ equipment: toggle(profile.equipment, id) })}
            />
          ))}
        </View>
      </Group>
      <Group label={t('onboarding.groups.time')}>
        <View style={styles.wrap}>
          {TIMES.map((minutes) => (
            <Chip
              key={minutes}
              label={t(minutes === 45 ? 'onboarding.time.orMore' : 'onboarding.time.minutes', { n: minutes })}
              selected={profile.maxMinutes === minutes}
              onPress={() => patch({ maxMinutes: minutes })}
            />
          ))}
        </View>
      </Group>
      <Group label={t('onboarding.groups.skill')}>
        <View style={styles.cardsTight}>
          {SKILLS.map((s) => (
            <OptionCard
              key={s.id}
              emoji={s.emoji}
              title={t(`onboarding.skills.${s.id}.title`)}
              body={t(`onboarding.skills.${s.id}.body`)}
              selected={profile.skill === s.id} onPress={() => patch({ skill: s.id })} />
          ))}
        </View>
      </Group>
    </>
  );
}

export function GoalFields({ profile, patch }: FieldsProps) {
  return (
    <>
      <Group label={t('onboarding.groups.household')}>
        <View style={styles.servingRow}>
          <Stepper value={profile.householdSize ?? 1} onChange={(v) => patch({ householdSize: v })} min={1} max={10} />
          <Txt variant="bodyStrong" color="textMuted">
            {(profile.householdSize ?? 1) === 1 ? t('onboarding.household.justMe') : t('onboarding.household.people', { count: profile.householdSize ?? 1 })}
          </Txt>
        </View>
      </Group>
      <Group label={t('onboarding.groups.goal')}>
        <View style={styles.wrap}>
          {GOALS.map((g) => (
            <Chip key={g.id} label={t(`onboarding.goals.${g.id}`)} emoji={g.emoji} selected={profile.goal === g.id} onPress={() => patch({ goal: g.id, dailyProteinG: g.protein || undefined })} />
          ))}
        </View>
      </Group>
      {profile.goal && profile.goal !== 'none' ? (
        <Group label={t('onboarding.groups.protein')}>
          <View style={styles.wrap}>
            {[60, 80, 100, 120, 150].map((p) => (
              <Chip key={p} label={t('onboarding.proteinGrams', { n: p })} tone="accent" selected={profile.dailyProteinG === p} onPress={() => patch({ dailyProteinG: p })} />
            ))}
          </View>
        </Group>
      ) : null}
      <Group label={t('onboarding.groups.budget')}>
        <View style={styles.wrap}>
          {BUDGETS.map((b) => (
            <Chip key={b.id} label={t(`onboarding.budgets.${b.id}`)} emoji={b.emoji} selected={profile.budget === b.id} onPress={() => patch({ budget: b.id })} />
          ))}
        </View>
      </Group>
    </>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 10, marginTop: 24 },
  cardsTight: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, borderWidth: 1.5 },
  optionEmoji: { fontSize: 28, lineHeight: 34 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  servingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
