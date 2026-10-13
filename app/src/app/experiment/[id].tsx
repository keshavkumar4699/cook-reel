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
import { haptics } from '@/lib/haptics';
import { usePricing } from '@/lib/pricing';
import { fromApiRecipe, profileForAI, toExperimentInput } from '@/lib/recipes';
import { useLibrary, useRecipe } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';

const TWISTS = [
  { emoji: '🌱', label: 'Make it vegan' },
  { emoji: '💪', label: 'More protein' },
  { emoji: '🔥', label: 'Fewer calories' },
  { emoji: '🌶️', label: 'Spicier' },
  { emoji: '💸', label: 'Budget version' },
  { emoji: '⚡', label: 'Ready in 15 min' },
  { emoji: '🍳', label: 'One pot only' },
  { emoji: '🌀', label: 'Air fryer version' },
  { emoji: '🥡', label: 'Meal prep for 4 days' },
  { emoji: '🧒', label: 'Kid-friendly' },
];

/** Which direction counts as an improvement; 'either' keeps the change neutral. */
type Better = 'up' | 'down' | 'either';

function MacroDelta({ label, before, after, unit, better }: { label: string; before: number; after: number; unit: string; better: Better }) {
  const { colors } = useTheme();
  const diff = Math.round(after - before);
  const improved = better === 'up' ? diff > 0 : diff < 0;
  const color = diff === 0 || better === 'either' ? colors.textMuted : improved ? colors.accent : colors.primary;
  return (
    <View style={styles.delta}>
      <Txt variant="caption" color="textMuted">
        {label}
      </Txt>
      <Txt variant="headline">
        {Math.round(after)}
        <Txt variant="footnote" color="textMuted">
          {unit}
        </Txt>
      </Txt>
      <Txt variant="caption" color={color}>
        {diff === 0 ? 'same' : `${diff > 0 ? '+' : ''}${diff}${unit}`}
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
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExperimentResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const aiProfile = useMemo(() => profileForAI(profile, Object.values(recipes)), [profile, recipes]);

  if (!recipe) {
    return (
      <Screen>
        <TopBar title="Experiment" />
        <EmptyState emoji="🧪" title="Recipe not found" body="Pick a recipe from your library to experiment with." />
      </Screen>
    );
  }

  const instruction = [...selected, custom.trim()].filter(Boolean).join('; ');

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
    toast('Variation saved', { tone: 'success' });
    router.replace(`/recipe/${saved.id}`);
  };

  const before: Macros | undefined = recipe.nutrition?.perServing;
  const kcalBetter: Better = profile.goal === 'lose_fat' ? 'down' : profile.goal === 'build_muscle' ? 'up' : 'either';
  const after: Macros | undefined = result?.recipe.nutrition?.perServing;

  return (
    <Screen>
      <TopBar title="Experiment" subtitle="Chef rewrites the recipe your way" right={<CreditsPill />} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <RecipeRow recipe={recipe} subtitle="Starting from" />

        {!result && !loading ? (
          <Animated.View entering={FadeInDown.springify().damping(18)}>
            <Txt variant="title2" style={{ marginTop: 26 }}>
              Pick a twist
            </Txt>
            <Txt variant="subhead" color="textMuted" style={{ marginTop: 4 }}>
              Choose up to three, or describe your own.
            </Txt>
            <View style={styles.grid}>
              {TWISTS.map((t) => {
                const on = selected.includes(t.label);
                return (
                  <PressableScale
                    key={t.label}
                    haptic="select"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={t.label}
                    onPress={() => setSelected(on ? selected.filter((x) => x !== t.label) : selected.length < 3 ? [...selected, t.label] : selected)}
                    style={[styles.twist, { backgroundColor: on ? colors.aiSoft : colors.surface, borderColor: on ? colors.ai : colors.border }]}
                  >
                    <Txt style={{ fontSize: 24, lineHeight: 30 }}>{t.emoji}</Txt>
                    <Txt variant="subheadStrong" style={{ flex: 1 }}>
                      {t.label}
                    </Txt>
                    {on ? <Icon name="checkmark-circle" size={18} color={colors.ai} /> : null}
                  </PressableScale>
                );
              })}
            </View>
            <TextField
              containerStyle={{ marginTop: 16 }}
              placeholder="Or describe it, e.g. no onion or garlic"
              value={custom}
              onChangeText={setCustom}
              maxLength={200}
              icon="create-outline"
            />
            <Button
              label="Create variation"
              icon="flask"
              variant="ai"
              disabled={!instruction}
              style={{ marginTop: 20 }}
              meta={`${pricing.costs.experiment} credit`}
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
              <TypingIndicator phrases={['Rethinking the ingredients…', 'Adjusting heat and timings…', 'Re-balancing the macros…', 'Plating it up…']} />
            </Card>
          </Animated.View>
        ) : null}

        {result ? (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 16, marginTop: 24 }}>
            <Card tone="ai">
              <Txt variant="overline" color="ai">
                What changed
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
                  Per serving · before → after
                </Txt>
                <View style={styles.deltas}>
                  <MacroDelta label="Calories" before={before.kcal} after={after.kcal} unit="" better={kcalBetter} />
                  <MacroDelta label="Protein" before={before.proteinG} after={after.proteinG} unit="g" better="up" />
                  <MacroDelta label="Carbs" before={before.carbsG} after={after.carbsG} unit="g" better="either" />
                  <MacroDelta label="Fat" before={before.fatG} after={after.fatG} unit="g" better="either" />
                </View>
              </Card>
            ) : null}
            <RecipePreviewCard recipe={result.recipe} />
            <Button label="Save as new version" icon="bookmark" onPress={keep} />
            <Button label="Try another twist" icon="refresh" variant="secondary" onPress={() => setResult(null)} />
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
