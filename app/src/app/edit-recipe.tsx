import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { Txt } from '@/components/ui/Text';
import type { Difficulty, Ingredient, Recipe, Step } from '@/data/types';
import { t } from '@/i18n';
import { formatDecimal, parseLocaleNumber } from '@/i18n/format';
import { haptics } from '@/lib/haptics';
import { newId } from '@/lib/id';
import { parseIngredientList } from '@/lib/parseIngredient';
import { emptyRecipe } from '@/lib/recipes';
import { recomputeNutrition } from '@/lib/scale';
import { useLibrary } from '@/state/library';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';

const EMOJIS = ['🍛', '🍳', '🍜', '🍲', '🥗', '🍝', '🌮', '🍗', '🥘', '🍚', '🥣', '🥪', '🍕', '🍤', '🥞', '🍰', '🥤', '🍽️'];

interface DraftIngredient {
  key: string;
  quantity: string;
  unit: string;
  name: string;
  source?: Ingredient;
}

interface DraftStep {
  key: string;
  instruction: string;
  minutes: string;
  source?: Step;
}

const num = (value: string) => {
  const n = parseLocaleNumber(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Tags are typed comma-separated; accept the Japanese and Arabic commas too. */
const TAG_SEPARATOR = /[,\uFF0C\u3001\u060C]/;

export default function EditRecipe() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useLibrary((s) => (id ? s.recipes[id] : undefined));
  const save = useLibrary((s) => s.save);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const base = useMemo<Recipe>(() => existing ?? emptyRecipe(), [existing]);

  const [title, setTitle] = useState(base.title);
  const [description, setDescription] = useState(base.description);
  const [emoji, setEmoji] = useState(base.emoji);
  const [servings, setServings] = useState(base.servings);
  const [prep, setPrep] = useState(String(base.prepMinutes || ''));
  const [cook, setCook] = useState(String(base.cookMinutes || ''));
  const [difficulty, setDifficulty] = useState<Difficulty>(base.difficulty);
  const [tags, setTags] = useState(base.tags.join(t('common.format.listSeparator')));
  const [ingredients, setIngredients] = useState<DraftIngredient[]>(() =>
    base.ingredients.length
      ? base.ingredients.map((i) => ({ key: i.id, quantity: i.quantity === null ? '' : formatDecimal(i.quantity, 2), unit: i.unit, name: i.name, source: i }))
      : [{ key: newId(), quantity: '', unit: '', name: '' }],
  );
  const [steps, setSteps] = useState<DraftStep[]>(() =>
    base.steps.length
      ? base.steps.map((s) => ({ key: s.id, instruction: s.instruction, minutes: s.durationSec ? String(Math.round(s.durationSec / 60)) : '', source: s }))
      : [{ key: newId(), instruction: '', minutes: '' }],
  );
  const per = base.nutrition?.perServing;
  const [kcal, setKcal] = useState(per ? formatDecimal(per.kcal) : '');
  const [protein, setProtein] = useState(per ? formatDecimal(per.proteinG) : '');
  const [carbs, setCarbs] = useState(per ? formatDecimal(per.carbsG) : '');
  const [fat, setFat] = useState(per ? formatDecimal(per.fatG) : '');
  const [pasting, setPasting] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateIngredient = (key: string, patch: Partial<DraftIngredient>) => setIngredients((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const updateStep = (key: string, patch: Partial<DraftStep>) => setSteps((list) => list.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const onSave = () => {
    const cleanIngredients = ingredients.filter((i) => i.name.trim());
    const cleanSteps = steps.filter((s) => s.instruction.trim());
    if (!title.trim()) return setError(t('edit.errors.noTitle'));
    if (!cleanIngredients.length) return setError(t('edit.errors.noIngredients'));
    if (!cleanSteps.length) return setError(t('edit.errors.noSteps'));

    const nextIngredients: Ingredient[] = cleanIngredients.map((d) => {
      const quantity = num(d.quantity);
      const unchanged = d.source && d.source.name === d.name.trim() && d.source.unit === d.unit.trim() && d.source.quantity === quantity;
      return {
        id: d.source?.id ?? newId(),
        name: d.name.trim(),
        quantity,
        unit: d.unit.trim(),
        note: d.source?.note ?? null,
        category: d.source?.category ?? 'other',
        substitutes: d.source?.substitutes ?? [],
        optional: d.source?.optional ?? false,
        // Per-ingredient nutrition only stays valid if the line wasn't changed.
        nutrition: unchanged ? d.source?.nutrition : undefined,
      };
    });
    const nextSteps: Step[] = cleanSteps.map((d, i) => {
      const minutes = num(d.minutes);
      return {
        id: d.source?.id ?? newId(),
        title: d.source?.title ?? t('edit.defaultStepTitle', { n: i + 1 }),
        instruction: d.instruction.trim(),
        durationSec: minutes ? Math.round(minutes * 60) : null,
        tip: d.source?.tip ?? null,
        doneCue: d.source?.doneCue ?? null,
        glossary: d.source?.glossary ?? [],
        clip: d.source?.clip ?? null,
        narration: d.source?.instruction === d.instruction.trim() ? (d.source?.narration ?? null) : null,
      };
    });

    const manualPer = num(kcal)
      ? { kcal: num(kcal) ?? 0, proteinG: num(protein) ?? 0, carbsG: num(carbs) ?? 0, fatG: num(fat) ?? 0, fiberG: per?.fiberG ?? 0 }
      : null;
    const nutritionEdited =
      !!manualPer && (!per || per.kcal !== manualPer.kcal || per.proteinG !== manualPer.proteinG || per.carbsG !== manualPer.carbsG || per.fatG !== manualPer.fatG);
    const allTracked = nextIngredients.every((i) => i.nutrition);
    let nutrition: Recipe['nutrition'] = base.nutrition;
    if (nutritionEdited && manualPer) {
      nutrition = {
        perServing: manualPer,
        total: {
          kcal: manualPer.kcal * servings,
          proteinG: manualPer.proteinG * servings,
          carbsG: manualPer.carbsG * servings,
          fatG: manualPer.fatG * servings,
          fiberG: manualPer.fiberG * servings,
        },
      };
    } else if (allTracked) {
      nutrition = recomputeNutrition({ ingredients: nextIngredients, servings, nutrition: base.nutrition });
    } else if (!manualPer) {
      nutrition = null;
    }

    const prepMinutes = Math.round(num(prep) ?? 0);
    const cookMinutes = Math.round(num(cook) ?? 0);
    const saved = save({
      ...base,
      title: title.trim(),
      description: description.trim(),
      emoji,
      servings,
      prepMinutes,
      cookMinutes,
      totalMinutes: prepMinutes + cookMinutes,
      difficulty,
      tags: tags
        .split(TAG_SEPARATOR)
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean)
        .slice(0, 8),
      ingredients: nextIngredients,
      steps: nextSteps,
      nutrition,
      starter: existing?.starter && existing.title === title.trim() ? existing.starter : undefined,
      // Edited text is the cook's own: it no longer follows the app language.
      starterText: existing?.starterText ? false : existing?.starterText,
    });
    haptics.success();
    toast(existing ? t('edit.toasts.updated') : t('edit.toasts.saved'), { tone: 'success' });
    if (existing) router.back();
    else router.replace(`/recipe/${saved.id}`);
  };

  return (
    <Screen>
      <TopBar title={existing ? t('edit.titleEdit') : t('edit.titleNew')} leading="close" right={<Button label={t('common.actions.save')} size="sm" onPress={onSave} />} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojis}>
            {EMOJIS.map((e) => (
              <Chip key={e} label={e} selected={emoji === e} onPress={() => setEmoji(e)} style={{ paddingHorizontal: 10 }} />
            ))}
          </ScrollView>

          <TextField label={t('edit.fields.name')} placeholder={t('edit.fields.namePlaceholder')} value={title} onChangeText={setTitle} maxLength={120} />
          <TextField
            label={t('edit.fields.description')}
            placeholder={t('edit.fields.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            containerStyle={{ marginTop: 14 }}
          />

          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Txt variant="footnote" color="textMuted" style={styles.label}>
                {t('edit.fields.servings')}
              </Txt>
              <View style={styles.stepperBox}>
                <Stepper value={servings} onChange={setServings} min={1} max={24} />
              </View>
            </View>
            <TextField label={t('edit.fields.prep')} value={prep} onChangeText={setPrep} keyboardType="number-pad" containerStyle={{ width: 92 }} />
            <TextField label={t('edit.fields.cook')} value={cook} onChangeText={setCook} keyboardType="number-pad" containerStyle={{ width: 92 }} />
          </View>

          <Txt variant="footnote" color="textMuted" style={[styles.label, { marginTop: 16 }]}>
            {t('edit.fields.difficulty')}
          </Txt>
          <Segmented<Difficulty>
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'easy', label: t('common.difficulty.easy') },
              { value: 'medium', label: t('common.difficulty.medium') },
              { value: 'hard', label: t('common.difficulty.hard') },
            ]}
          />

          <View style={styles.sectionHead}>
            <Txt variant="title3">{t('edit.ingredients.title')}</Txt>
            <Button label={t('edit.paste.open')} variant="soft" size="sm" icon="clipboard-outline" onPress={() => setPasting(true)} />
          </View>
          <Animated.View layout={LinearTransition} style={{ gap: 8 }}>
            {ingredients.map((ing) => (
              <Animated.View key={ing.key} entering={FadeIn} style={styles.ingredientRow}>
                <TextField placeholder={t('edit.ingredients.quantity')} value={ing.quantity} onChangeText={(v) => updateIngredient(ing.key, { quantity: v })} keyboardType="decimal-pad" containerStyle={{ width: 64 }} />
                <TextField placeholder={t('edit.ingredients.unit')} value={ing.unit} onChangeText={(v) => updateIngredient(ing.key, { unit: v })} autoCapitalize="none" containerStyle={{ width: 70 }} />
                <TextField placeholder={t('edit.ingredients.name')} value={ing.name} onChangeText={(v) => updateIngredient(ing.key, { name: v })} containerStyle={{ flex: 1 }} />
                <IconButton icon="close" label={t('edit.ingredients.remove')} variant="ghost" size={32} iconSize={16} onPress={() => setIngredients((list) => list.filter((i) => i.key !== ing.key))} />
              </Animated.View>
            ))}
          </Animated.View>
          <Button label={t('edit.ingredients.add')} variant="ghost" icon="add" size="md" onPress={() => setIngredients((list) => [...list, { key: newId(), quantity: '', unit: '', name: '' }])} style={styles.addButton} />

          <View style={styles.sectionHead}>
            <Txt variant="title3">{t('edit.steps.title')}</Txt>
          </View>
          <Animated.View layout={LinearTransition} style={{ gap: 12 }}>
            {steps.map((step, index) => (
              <Animated.View key={step.key} entering={FadeIn} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.ink }]}>
                  <Txt variant="caption" color={colors.onInk}>
                    {index + 1}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <TextField placeholder={t('edit.steps.placeholder')} value={step.instruction} onChangeText={(v) => updateStep(step.key, { instruction: v })} multiline />
                  <View style={styles.stepMeta}>
                    <TextField placeholder={t('edit.steps.timer')} value={step.minutes} onChangeText={(v) => updateStep(step.key, { minutes: v })} keyboardType="number-pad" containerStyle={{ width: 130 }} icon="timer-outline" />
                    {step.source?.clip ? (
                      <Txt variant="caption" color="textFaint" style={{ flex: 1 }}>
                        {t('edit.steps.keepsClip')}
                      </Txt>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                    <IconButton icon="trash-outline" label={t('edit.steps.remove')} variant="ghost" size={32} iconSize={16} onPress={() => setSteps((list) => list.filter((s) => s.key !== step.key))} />
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
          <Button label={t('edit.steps.add')} variant="ghost" icon="add" size="md" onPress={() => setSteps((list) => [...list, { key: newId(), instruction: '', minutes: '' }])} style={styles.addButton} />

          <TextField label={t('edit.fields.tags')} placeholder={t('edit.fields.tagsPlaceholder')} value={tags} onChangeText={setTags} autoCapitalize="none" containerStyle={{ marginTop: 18 }} />

          <Card tone="muted" style={{ marginTop: 22 }} elevated={false}>
            <Txt variant="headline">{t('edit.nutrition.title')}</Txt>
            <Txt variant="footnote" color="textMuted" style={{ marginTop: 2 }}>
              {t('edit.nutrition.hint')}
            </Txt>
            <View style={styles.macros}>
              <TextField label={t('edit.nutrition.kcal')} value={kcal} onChangeText={setKcal} keyboardType="decimal-pad" containerStyle={styles.macro} />
              <TextField label={t('edit.nutrition.protein')} value={protein} onChangeText={setProtein} keyboardType="decimal-pad" containerStyle={styles.macro} />
              <TextField label={t('edit.nutrition.carbs')} value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" containerStyle={styles.macro} />
              <TextField label={t('edit.nutrition.fat')} value={fat} onChangeText={setFat} keyboardType="decimal-pad" containerStyle={styles.macro} />
            </View>
          </Card>

          {error ? (
            <Txt variant="subheadStrong" color="danger" style={{ marginTop: 16 }} accessibilityLiveRegion="assertive">
              {error}
            </Txt>
          ) : null}
          <Button label={existing ? t('edit.saveChanges') : t('edit.saveRecipe')} icon="checkmark" onPress={onSave} style={{ marginTop: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Sheet visible={pasting} onClose={() => setPasting(false)} title={t('edit.paste.title')} subtitle={t('edit.paste.subtitle')}>
        <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
          <TextField multiline value={pasteText} onChangeText={setPasteText} placeholder={t('edit.paste.placeholder')} style={{ minHeight: 140 }} autoFocus />
          <Button
            label={t('edit.paste.add')}
            disabled={!pasteText.trim()}
            onPress={() => {
              const parsed = parseIngredientList(pasteText).map((p) => ({
                key: newId(),
                quantity: p.quantity === null ? '' : formatDecimal(p.quantity, 2),
                unit: p.unit,
                name: p.note ? `${p.name} (${p.note})` : p.name,
              }));
              setIngredients((list) => [...list.filter((i) => i.name.trim()), ...parsed]);
              setPasteText('');
              setPasting(false);
              toast(t('edit.paste.added', { count: parsed.length }), { tone: 'success' });
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER },
  emojis: { gap: 8, paddingBottom: 16 },
  label: { marginBottom: 6, marginLeft: 4 },
  rowFields: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'flex-start' },
  // Same height as a TextField so the labels and controls line up across the row.
  stepperBox: { height: 52, justifyContent: 'center', alignItems: 'flex-start' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addButton: { alignSelf: 'flex-start', marginTop: 6 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macros: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  macro: { width: '47%', flexGrow: 1, borderRadius: radius.md },
});
