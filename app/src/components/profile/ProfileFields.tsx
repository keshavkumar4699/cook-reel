import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Stepper } from '@/components/ui/Stepper';
import { Txt } from '@/components/ui/Text';
import type { CookProfile, Persona } from '@/data/types';
import { radius, useTheme } from '@/theme';

export const PERSONAS: Array<{ id: Persona; emoji: string; title: string; body: string }> = [
  { id: 'saver', emoji: '📌', title: 'Save YouTube recipes', body: 'Keep what I find and cook it later' },
  { id: 'quick', emoji: '⚡', title: 'Quick meals on the go', body: 'Busy with work, study or the gym' },
  { id: 'fridge', emoji: '🧺', title: 'Cook with what I have', body: 'Use up the fridge, waste less' },
  { id: 'creator', emoji: '🧪', title: 'Create & experiment', body: 'Invent new dishes and twists' },
  { id: 'fitness', emoji: '💪', title: 'Eat for my goals', body: 'Protein, calories and macros' },
  { id: 'learner', emoji: '🍳', title: 'Learn to cook', body: 'Step by step, from the basics' },
];

const DIETS: Array<{ id: NonNullable<CookProfile['diet']>; emoji: string; label: string }> = [
  { id: 'vegetarian', emoji: '🥦', label: 'Vegetarian' },
  { id: 'eggetarian', emoji: '🥚', label: 'Eggetarian' },
  { id: 'non-vegetarian', emoji: '🍗', label: 'Non-veg' },
  { id: 'vegan', emoji: '🌱', label: 'Vegan' },
  { id: 'pescatarian', emoji: '🐟', label: 'Pescatarian' },
];
const ALLERGIES = ['Peanuts', 'Tree nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'Sesame'];
const SPICE: Array<{ id: NonNullable<CookProfile['spiceLevel']>; emoji: string; label: string }> = [
  { id: 'mild', emoji: '🙂', label: 'Mild' },
  { id: 'medium', emoji: '🌶️', label: 'Medium' },
  { id: 'hot', emoji: '🔥', label: 'Hot' },
];
const EQUIPMENT: Array<{ id: string; emoji: string }> = [
  { id: 'Gas stove', emoji: '🔥' },
  { id: 'Induction', emoji: '⚡' },
  { id: 'Microwave', emoji: '📟' },
  { id: 'Oven / OTG', emoji: '♨️' },
  { id: 'Air fryer', emoji: '🌀' },
  { id: 'Pressure cooker', emoji: '🫕' },
  { id: 'Rice cooker', emoji: '🍚' },
  { id: 'Electric kettle', emoji: '☕' },
  { id: 'Mixer / blender', emoji: '🥤' },
  { id: 'Toaster', emoji: '🍞' },
];
const TIMES = [10, 20, 30, 45];
const SKILLS: Array<{ id: NonNullable<CookProfile['skill']>; emoji: string; title: string; body: string }> = [
  { id: 'new', emoji: '🐣', title: 'New to cooking', body: 'Explain everything, please' },
  { id: 'basic', emoji: '🙂', title: 'I know the basics', body: 'Dal, eggs, pasta — that level' },
  { id: 'confident', emoji: '😎', title: 'Confident cook', body: 'Skip the hand-holding' },
];
const GOALS: Array<{ id: NonNullable<CookProfile['goal']>; emoji: string; label: string; protein: number }> = [
  { id: 'build_muscle', emoji: '💪', label: 'Build muscle', protein: 120 },
  { id: 'lose_fat', emoji: '🔥', label: 'Lose fat', protein: 110 },
  { id: 'maintain', emoji: '⚖️', label: 'Maintain', protein: 80 },
  { id: 'eat_healthy', emoji: '🥗', label: 'Eat healthier', protein: 70 },
  { id: 'none', emoji: '🙂', label: 'No goal', protein: 0 },
];
const BUDGETS: Array<{ id: NonNullable<CookProfile['budget']>; emoji: string; label: string }> = [
  { id: 'tight', emoji: '💸', label: 'Tight' },
  { id: 'moderate', emoji: '👛', label: 'Moderate' },
  { id: 'flexible', emoji: '✨', label: 'Flexible' },
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
        <OptionCard key={p.id} emoji={p.emoji} title={p.title} body={p.body} selected={value.includes(p.id)} onPress={() => onChange(toggle(value, p.id))} />
      ))}
    </View>
  );
}

export function DietFields({ profile, patch }: FieldsProps) {
  return (
    <>
      <Group label="Diet">
        <View style={styles.wrap}>
          {DIETS.map((d) => (
            <Chip key={d.id} label={d.label} emoji={d.emoji} selected={profile.diet === d.id} onPress={() => patch({ diet: d.id })} />
          ))}
        </View>
      </Group>
      <Group label="Allergies">
        <View style={styles.wrap}>
          {ALLERGIES.map((a) => (
            <Chip key={a} label={a} tone="primary" selected={profile.allergies?.includes(a)} onPress={() => patch({ allergies: toggle(profile.allergies, a) })} />
          ))}
        </View>
      </Group>
      <Group label="Spice level">
        <View style={styles.wrap}>
          {SPICE.map((s) => (
            <Chip key={s.id} label={s.label} emoji={s.emoji} selected={profile.spiceLevel === s.id} onPress={() => patch({ spiceLevel: s.id })} />
          ))}
        </View>
      </Group>
    </>
  );
}

export function KitchenFields({ profile, patch }: FieldsProps) {
  return (
    <>
      <Group label="I have…">
        <View style={styles.wrap}>
          {EQUIPMENT.map((e) => (
            <Chip key={e.id} label={e.id} emoji={e.emoji} selected={profile.equipment?.includes(e.id)} onPress={() => patch({ equipment: toggle(profile.equipment, e.id) })} />
          ))}
        </View>
      </Group>
      <Group label="Time I usually have to cook">
        <View style={styles.wrap}>
          {TIMES.map((t) => (
            <Chip key={t} label={t === 45 ? '45+ min' : `${t} min`} selected={profile.maxMinutes === t} onPress={() => patch({ maxMinutes: t })} />
          ))}
        </View>
      </Group>
      <Group label="Cooking skill">
        <View style={styles.cardsTight}>
          {SKILLS.map((s) => (
            <OptionCard key={s.id} emoji={s.emoji} title={s.title} body={s.body} selected={profile.skill === s.id} onPress={() => patch({ skill: s.id })} />
          ))}
        </View>
      </Group>
    </>
  );
}

export function GoalFields({ profile, patch }: FieldsProps) {
  return (
    <>
      <Group label="I usually cook for">
        <View style={styles.servingRow}>
          <Stepper value={profile.householdSize ?? 1} onChange={(v) => patch({ householdSize: v })} min={1} max={10} />
          <Txt variant="bodyStrong" color="textMuted">
            {(profile.householdSize ?? 1) === 1 ? 'Just me' : `${profile.householdSize} people`}
          </Txt>
        </View>
      </Group>
      <Group label="Goal">
        <View style={styles.wrap}>
          {GOALS.map((g) => (
            <Chip key={g.id} label={g.label} emoji={g.emoji} selected={profile.goal === g.id} onPress={() => patch({ goal: g.id, dailyProteinG: g.protein || undefined })} />
          ))}
        </View>
      </Group>
      {profile.goal && profile.goal !== 'none' ? (
        <Group label="Daily protein target">
          <View style={styles.wrap}>
            {[60, 80, 100, 120, 150].map((p) => (
              <Chip key={p} label={`${p} g`} tone="accent" selected={profile.dailyProteinG === p} onPress={() => patch({ dailyProteinG: p })} />
            ))}
          </View>
        </Group>
      ) : null}
      <Group label="Grocery budget">
        <View style={styles.wrap}>
          {BUDGETS.map((b) => (
            <Chip key={b.id} label={b.label} emoji={b.emoji} selected={profile.budget === b.id} onPress={() => patch({ budget: b.id })} />
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
