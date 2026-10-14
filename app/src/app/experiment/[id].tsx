import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditsPill } from '@/components/CreditsPill';
import { RecipePreviewCard } from '@/components/recipe/RecipePreviewCard';
import { RecipeRow } from '@/components/recipe/RecipeRow';
import { TypingIndicator } from '@/components/TypingIndicator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { Txt } from '@/components/ui/Text';
import type { Macros } from '@/data/types';
import { api, type ExperimentResponse } from '@/lib/api';
import { handleApiError } from '@/lib/gates';
import { t } from '@/i18n';
import { formatInteger } from '@/i18n/format';
import { haptics } from '@/lib/haptics';
import { usePricing } from '@/lib/pricing';
import { fromApiRecipe, profileForAI, toExperimentInput } from '@/lib/recipes';
import { useLibrary, useRecipe } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';

const TWISTS = [
  { id: 'vegan', emoji: '🌱' },
  { id: 'protein', emoji: '💪' },
  { id: 'lighter', emoji: '🔥' },
  { id: 'spicier', emoji: '🌶️' },
  { id: 'budget', emoji: '💸' },
  { id: 'quick', emoji: '⚡' },
  { id: 'onePot', emoji: '🍳' },
  { id: 'airFryer', emoji: '🌀' },
  { id: 'mealPrep', emoji: '🥡' },
  { id: 'kids', emoji: '🧒' },
] as const;
type TwistId = (typeof TWISTS)[number]['id'];
const twistLabel = (id: TwistId) => t(`experiment.twists.${id}`);

/** "+12 g" / "−4 g" with a real minus sign. */
function signed(diff: number, grams: boolean): string {
  const n = `${diff > 0 ? '+' : '\u2212'}${formatInteger(Math.abs(diff))}`;
  return grams ? t('experiment.macros.grams', { n }) : n;
}

/** Which direction counts as an improvement; 'either' keeps the change neutral. */
type Better = 'up' | 'down' | 'either';

function MacroDelta({ label, before, after, grams, better }: { label: string; before: number; after: number; grams: boolean; better: Better }) {
  const { colors } = useTheme();
  const diff = Math.round(after - before);
  const improved = better === 'up' ? diff > 0 : diff < 0;
  const color = diff === 0 || better === 'either' ? colors.textMuted : improved ? colors.accent : colors.primary;
  return (
    <View style={styles.delta}>
      <Txt variant="caption" color="textMuted">
        {label}
      </Txt>
      <Txt variant="headline">{grams ? t('experiment.macros.grams', { n: formatInteger(after) }) : formatInteger(after)}</Txt>
      <Txt variant="caption" color={color}>
        {diff === 0 ? t('experiment.macros.same') : signed(diff, grams)}
      </Txt>
    </View>
  );
}

export default function Experiment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipe(id);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const pricing = usePricing();
  const profile = useProfile((s) => s.profile);
  const recipes = useLibrary((s) => s.recipes);
  const save = useLibrary((s) => s.save);
  const setBalance = useSession((s) => s.setBalance);
  const [selected, setSelected] = useState<TwistId[]>([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExperimentResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const aiProfile = useMemo(() => profileForAI(profile, Object.values(recipes)), [profile, recipes]);

  if (!recipe) {
    return (
      <Screen>
        <TopBar title={t('experiment.title')} />
        <EmptyState emoji="🧪" title={t('experiment.notFound.title')} body={t('experiment.notFound.body')} />
      </Screen>
    );
  }

  const instruction = [...selected.map(twistLabel), custom.trim()].filter(Boolean).join('; ');

  const run = async () => {
    if (!instruction || loading) return;
    setLoading(true);
    setResult(null);
    abortRef.current = new AbortController();
    try {
      const res = await api.experiment({ recipe: toExperimentInput(recipe), instruction, profile: aiProfile }, abortRef.current.signal);
      haptics.success();
      setBalance(res.balance);
      setResult(res);
    } catch (error) {
      if (!abortRef.current.signal.aborted) handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const keep = () => {
    if (!result) return;
    const saved = save(fromApiRecipe(result.recipe, { parentId: recipe.id, changes: result.changes, collections: recipe.collections }));
    haptics.success();
    toast(t('experiment.saved'), { tone: 'success' });
    router.replace(`/recipe/${saved.id}`);
  };

  const before: Macros | undefined = recipe.nutrition?.perServing;
  const kcalBetter: Better = profile.goal === 'lose_fat' ? 'down' : profile.goal === 'build_muscle' ? 'up' : 'either';
  const after: Macros | undefined = result?.recipe.nutrition?.perServing;

  return (
    <Screen>
      <TopBar title={t('experiment.title')} subtitle={t('experiment.subtitle')} right={<CreditsPill />} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <RecipeRow recipe={recipe} subtitle={t('experiment.startingFrom')} />

        {!result && !loading ? (
          <Animated.View entering={FadeInDown.springify().damping(18)}>
            <Txt variant="title2" style={{ marginTop: 26 }}>
              {t('experiment.pickTitle')}
            </Txt>
            <Txt variant="subhead" color="textMuted" style={{ marginTop: 4 }}>
              {t('experiment.pickHint')}
            </Txt>
            <View style={styles.grid}>
              {TWISTS.map((twist) => {
                const on = selected.includes(twist.id);
                const label = twistLabel(twist.id);
                return (
                  <PressableScale
                    key={twist.id}
                    haptic="select"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={label}
                    onPress={() => setSelected(on ? selected.filter((x) => x !== twist.id) : selected.length < 3 ? [...selected, twist.id] : selected)}
                    style={[styles.twist, { backgroundColor: on ? colors.aiSoft : colors.surface, borderColor: on ? colors.ai : colors.border }]}
                  >
                    <Txt style={{ fontSize: 24, lineHeight: 30 }}>{twist.emoji}</Txt>
                    <Txt variant="subheadStrong" style={{ flex: 1 }}>
                      {label}
                    </Txt>
                    {on ? <Icon name="checkmark-circle" size={18} color={colors.ai} /> : null}
                  </PressableScale>
                );
              })}
            </View>
            <TextField
              containerStyle={{ marginTop: 16 }}
              placeholder={t('experiment.customPlaceholder')}
              value={custom}
              onChangeText={setCustom}
              maxLength={200}
              icon="create-outline"
            />
            <Button
              label={t('experiment.create')}
              icon="flask"
              variant="ai"
              disabled={!instruction}
              style={{ marginTop: 20 }}
              meta={t('common.counts.credits', { count: pricing.costs.experiment })}
              onPress={() => void run()}
            />
          </Animated.View>
        ) : null}

        {loading ? (
          <Animated.View entering={FadeIn} style={{ marginTop: 32 }}>
            <Card tone="ai" style={{ alignItems: 'center', paddingVertical: 32, gap: 14 }}>
              <Txt style={{ fontSize: 44, lineHeight: 52 }}>🧪</Txt>
              <Txt variant="title3" align="center">
                {instruction}
              </Txt>
              <TypingIndicator
                phrases={[t('experiment.working.ingredients'), t('experiment.working.timings'), t('experiment.working.macros'), t('experiment.working.plating')]}
              />
            </Card>
          </Animated.View>
        ) : null}

        {result ? (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 16, marginTop: 24 }}>
            <Card tone="ai">
              <Txt variant="overline" color="ai">
                {t('experiment.changes')}
              </Txt>
              <Txt variant="subhead" color="textMuted" style={{ marginTop: 6 }}>
                {result.message}
              </Txt>
              <View style={{ gap: 8, marginTop: 12 }}>
                {result.changes.map((c) => (
                  <View key={c} style={styles.bullet}>
                    <Icon name="sparkles" size={14} color={colors.ai} />
                    <Txt variant="subhead" style={{ flex: 1 }}>
                      {c}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
            {before && after ? (
              <Card>
                <Txt variant="overline" color="textMuted">
                  {t('experiment.perServingCompare')}
                </Txt>
                <View style={styles.deltas}>
                  <MacroDelta label={t('experiment.macros.calories')} before={before.kcal} after={after.kcal} grams={false} better={kcalBetter} />
                  <MacroDelta label={t('experiment.macros.protein')} before={before.proteinG} after={after.proteinG} grams better="up" />
                  <MacroDelta label={t('experiment.macros.carbs')} before={before.carbsG} after={after.carbsG} grams better="either" />
                  <MacroDelta label={t('experiment.macros.fat')} before={before.fatG} after={after.fatG} grams better="either" />
                </View>
              </Card>
            ) : null}
            <RecipePreviewCard recipe={result.recipe} />
            <Button label={t('experiment.save')} icon="bookmark" onPress={keep} />
            <Button label={t('experiment.again')} icon="refresh" variant="secondary" onPress={() => setResult(null)} />
          </Animated.View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  twist: { width: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.lg, borderWidth: 1.5 },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  deltas: { flexDirection: 'row', marginTop: 12 },
  delta: { flex: 1, gap: 2 },
});
