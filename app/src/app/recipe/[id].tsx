import { useMemo, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddToPlanSheet } from '@/components/recipe/AddToPlanSheet';
import { CollectionSheet } from '@/components/recipe/CollectionSheet';
import { IngredientList } from '@/components/recipe/IngredientList';
import { NutritionCard } from '@/components/recipe/NutritionCard';
import { RecipeCover } from '@/components/recipe/RecipeCover';
import { RecipeRow } from '@/components/recipe/RecipeRow';
import { StepList } from '@/components/recipe/StepList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Text';
import { confirm } from '@/lib/confirm';
import { formatCurrency, formatMinutes, plural } from '@/lib/format';
import { withAccount } from '@/lib/gates';
import { haptics } from '@/lib/haptics';
import { recipeToText, sourceLabel } from '@/lib/recipes';
import { nutritionFor } from '@/lib/scale';
import { useKitchen } from '@/state/kitchen';
import { useLibrary, useRecipe } from '@/state/library';
import { toast } from '@/state/toast';
import { GUTTER, radius, shadow, useTheme } from '@/theme';

const HERO = 340;

function Stat({ icon, value, label, tint }: { icon: IconName; value: string; label: string; tint: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name={icon} size={18} color={tint} />
      <Txt variant="stat" style={{ marginTop: 6 }}>
        {value}
      </Txt>
      <Txt variant="caption" color="textMuted">
        {label}
      </Txt>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} style={[styles.menuItem, { borderColor: colors.border }]} accessibilityLabel={label}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.dangerSoft : colors.surfaceMuted }]}>
        <Icon name={icon} size={18} color={danger ? colors.danger : colors.text} />
      </View>
      <Txt variant="bodyStrong" color={danger ? 'danger' : 'text'}>
        {label}
      </Txt>
    </PressableScale>
  );
}

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipe(id);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const recipesMap = useLibrary((s) => s.recipes);
  const update = useLibrary((s) => s.update);
  const remove = useLibrary((s) => s.remove);
  const toggleCookLater = useLibrary((s) => s.toggleCookLater);
  const addRecipesToShopping = useKitchen((s) => s.addRecipesToShopping);

  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [menu, setMenu] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [notes, setNotes] = useState(recipe?.notes ?? '');

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-HERO, 0, HERO], [-HERO / 2, 0, HERO * 0.45], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-HERO, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));
  const barStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [HERO - 140, HERO - 80], [0, 1], Extrapolation.CLAMP) }));

  const variations = useMemo(
    () => (recipe ? Object.values(recipesMap).filter((r) => r.parentId === recipe.id) : []),
    [recipesMap, recipe],
  );
  const parent = recipe?.parentId ? recipesMap[recipe.parentId] : undefined;

  if (!recipe) {
    return (
      <Screen>
        <View style={{ paddingTop: insets.top + 60 }}>
          <EmptyState emoji="🍽️" title="Recipe not found" body="It may have been deleted." action="Back to library" onAction={() => router.replace('/library')} />
        </View>
      </Screen>
    );
  }

  const factor = servings / Math.max(1, recipe.servings);
  const nutrition = nutritionFor(recipe, servings);
  const per = recipe.nutrition?.perServing;

  const closeMenu = (fn: () => void) => () => {
    setMenu(false);
    setTimeout(fn, 200);
  };
  const addToShopping = () => {
    const added = addRecipesToShopping([{ recipe, servings }]);
    haptics.success();
    toast(added > 0 ? `${plural(added, 'item')} added to your shopping list` : 'Shopping list updated', {
      tone: 'success',
      action: { label: 'View', onPress: () => router.push({ pathname: '/plan', params: { tab: 'shopping' } }) },
    });
  };
  const share = () => void Share.share({ message: recipeToText(recipe), title: recipe.title }).catch(() => undefined);
  const del = async () => {
    const ok = await confirm({ title: 'Delete this recipe?', message: 'It will be removed from this phone.', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    remove(recipe.id);
    toast('Recipe deleted');
    router.back();
  };

  return (
    <Screen>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ height: HERO }, heroStyle]}>
          <RecipeCover recipe={recipe} style={StyleSheet.absoluteFill} emojiSize={110} badges={false} />
        </Animated.View>

        <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
          <View style={styles.source}>
            <Icon
              name={recipe.source === 'youtube' ? 'logo-youtube' : recipe.source === 'ai' ? 'sparkles' : recipe.starter ? 'restaurant' : 'person'}
              size={14}
              color={recipe.source === 'youtube' ? colors.youtube : recipe.source === 'ai' ? colors.ai : colors.textMuted}
            />
            <Txt variant="footnote" color="textMuted" numberOfLines={1}>
              {sourceLabel(recipe)}
              {recipe.youtube?.isShort ? ' · Short' : ''}
            </Txt>
          </View>
          <Txt variant="title1">{recipe.title}</Txt>
          {recipe.description ? (
            <Txt variant="body" color="textMuted" style={{ marginTop: 8 }}>
              {recipe.description}
            </Txt>
          ) : null}

          <View style={styles.stats}>
            <Stat icon="time-outline" value={formatMinutes(recipe.totalMinutes)} label="Total time" tint={colors.saffron} />
            <Stat icon="flame-outline" value={per ? `${per.kcal}` : '—'} label="kcal / serving" tint={colors.primary} />
            <Stat icon="mci:arm-flex-outline" value={per ? `${Math.round(per.proteinG)} g` : '—'} label="Protein" tint={colors.protein} />
          </View>

          <View style={styles.badges}>
            <Badge label={recipe.difficulty[0]!.toUpperCase() + recipe.difficulty.slice(1)} icon="speedometer-outline" />
            {recipe.cuisine ? <Badge label={recipe.cuisine} icon="globe-outline" /> : null}
            {recipe.mealPrepFriendly ? <Badge label="Meal prep" icon="cube-outline" tone="accent" /> : null}
            {recipe.estCost ? <Badge label={`${formatCurrency(recipe.estCost.perServing, recipe.estCost.currency)} / serving`} icon="wallet-outline" tone="saffron" /> : null}
            {recipe.tags.slice(0, 3).map((t) => (
              <Badge key={t} label={`#${t}`} />
            ))}
          </View>

          {recipe.changes.length ? (
            <Card tone="ai" style={{ marginTop: 20 }}>
              <Txt variant="overline" color="ai">
                What changed
              </Txt>
              {parent ? (
                <PressableScale onPress={() => router.push(`/recipe/${parent.id}`)} style={{ marginTop: 4 }}>
                  <Txt variant="footnote" color="textMuted">
                    Variation of <Txt variant="footnote" color="ai">{parent.title}</Txt>
                  </Txt>
                </PressableScale>
              ) : null}
              <View style={{ gap: 6, marginTop: 10 }}>
                {recipe.changes.map((c) => (
                  <View key={c} style={styles.bullet}>
                    <Icon name="sparkles" size={13} color={colors.ai} />
                    <Txt variant="subhead" style={{ flex: 1 }}>
                      {c}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          <View style={[styles.servings, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Txt variant="headline">Servings</Txt>
              <Txt variant="footnote" color="textMuted">
                {factor === 1 ? 'As written' : `Quantities scaled ×${Math.round(factor * 100) / 100}`}
              </Txt>
            </View>
            <Stepper value={servings} onChange={setServings} min={1} max={24} />
          </View>

          {nutrition ? (
            <View style={{ marginTop: 16 }}>
              <NutritionCard perServing={nutrition.perServing} total={nutrition.total} servings={servings} />
            </View>
          ) : null}

          {recipe.equipment.length ? (
            <View style={styles.block}>
              <Txt variant="title3" style={styles.blockTitle}>
                You’ll need
              </Txt>
              <View style={styles.badges}>
                {recipe.equipment.map((e) => (
                  <Badge key={e} label={e} icon="construct-outline" />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Txt variant="title3">Ingredients</Txt>
              <Button label="Add to list" icon="cart-outline" variant="soft" size="sm" onPress={addToShopping} />
            </View>
            <Txt variant="footnote" color="textMuted" style={{ marginBottom: 10 }}>
              Tap to tick off what you already have.
            </Txt>
            <IngredientList ingredients={recipe.ingredients} factor={factor} />
          </View>

          <View style={styles.block}>
            <Txt variant="title3" style={styles.blockTitle}>
              Method
            </Txt>
            <StepList steps={recipe.steps} />
          </View>

          {recipe.storage ? (
            <Card tone="muted" style={styles.storage}>
              <Txt style={{ fontSize: 24, lineHeight: 30 }}>🧊</Txt>
              <View style={{ flex: 1 }}>
                <Txt variant="headline">Storing leftovers</Txt>
                <Txt variant="subhead" color="textMuted">
                  {recipe.storage}
                </Txt>
              </View>
            </Card>
          ) : null}

          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Txt variant="title3">Experiment</Txt>
              {variations.length ? (
                <Txt variant="footnote" color="textMuted">
                  {plural(variations.length, 'variation')}
                </Txt>
              ) : null}
            </View>
            <Card tone="ai" onPress={() => withAccount(`/experiment/${recipe.id}`)} style={styles.experiment} accessibilityLabel="Create a variation">
              <View style={[styles.flask, { backgroundColor: colors.ai }]}>
                <Icon name="flask" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="headline">Make it your own</Txt>
                <Txt variant="footnote" color="textMuted">
                  Vegan, more protein, air fryer, cheaper… Chef rewrites it.
                </Txt>
              </View>
              <Icon name="chevron-forward" size={18} color="textFaint" />
            </Card>
            {variations.length ? (
              <View style={{ gap: 10, marginTop: 12 }}>
                {variations.map((v) => (
                  <RecipeRow key={v.id} recipe={v} subtitle={v.changes[0] ?? 'Variation'} />
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.block}>
            <Txt variant="title3" style={styles.blockTitle}>
              Your notes
            </Txt>
            <TextField
              multiline
              placeholder="Less chilli next time, add a squeeze of lime…"
              value={notes}
              onChangeText={setNotes}
              onBlur={() => notes !== recipe.notes && update(recipe.id, { notes })}
            />
          </View>

          <View style={styles.block}>
            <Txt variant="title3" style={styles.blockTitle}>
              How was it?
            </Txt>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <PressableScale
                  key={n}
                  haptic="select"
                  scaleTo={0.85}
                  onPress={() => update(recipe.id, { rating: recipe.rating === n ? null : n })}
                  accessibilityLabel={`Rate ${n} out of 5`}
                >
                  <Icon name={(recipe.rating ?? 0) >= n ? 'star' : 'star-outline'} size={32} color={(recipe.rating ?? 0) >= n ? colors.saffron : colors.borderStrong} />
                </PressableScale>
              ))}
            </View>
            {recipe.timesCooked ? (
              <Txt variant="footnote" color="textMuted" style={{ marginTop: 6 }}>
                Cooked {plural(recipe.timesCooked, 'time')}
              </Txt>
            ) : null}
          </View>
        </View>
      </Animated.ScrollView>

      <Animated.View style={[styles.topFill, { height: insets.top + 56, backgroundColor: colors.bg, borderColor: colors.border }, barStyle]}>
        <Txt variant="headline" numberOfLines={1} style={styles.topTitle}>
          {recipe.title}
        </Txt>
      </Animated.View>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <IconButton icon="chevron-back" label="Back" variant="surface" onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
        <View style={styles.topRight}>
          <IconButton
            icon={recipe.cookLater ? 'bookmark' : 'bookmark-outline'}
            label={recipe.cookLater ? 'Remove from cook later' : 'Save to cook later'}
            color={recipe.cookLater ? colors.primary : undefined}
            onPress={() => {
              const saved = toggleCookLater(recipe.id);
              toast(saved ? 'Saved to Cook later' : 'Removed from Cook later');
            }}
          />
          <IconButton icon="ellipsis-horizontal" label="More" onPress={() => setMenu(true)} />
        </View>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, backgroundColor: colors.bg, borderColor: colors.border }, !isDark ? shadow(colors, 3) : null]}>
        <IconButton icon="flask-outline" label="Experiment" size={56} iconSize={24} variant="surface" onPress={() => withAccount(`/experiment/${recipe.id}`)} />
        <Button
          label="Start cooking"
          icon="play"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/cook/[id]', params: { id: recipe.id, servings: String(servings) } })}
          meta={recipe.youtube ? (recipe.youtube.isShort ? 'Narrated clips' : 'Video clips') : 'Voice guided'}
        />
      </View>

      <Sheet visible={menu} onClose={() => setMenu(false)} title={recipe.title}>
        <View style={styles.menu}>
          <MenuItem icon="create-outline" label="Edit recipe" onPress={closeMenu(() => router.push({ pathname: '/edit-recipe', params: { id: recipe.id } }))} />
          <MenuItem icon="folder-open-outline" label="Add to collection" onPress={closeMenu(() => setCollecting(true))} />
          <MenuItem icon="calendar-outline" label="Add to meal plan" onPress={closeMenu(() => setPlanning(true))} />
          <MenuItem icon="cart-outline" label="Add ingredients to shopping list" onPress={closeMenu(addToShopping)} />
          <MenuItem icon="share-outline" label="Share recipe" onPress={closeMenu(share)} />
          <MenuItem icon="trash-outline" label="Delete recipe" danger onPress={closeMenu(() => void del())} />
        </View>
      </Sheet>
      <AddToPlanSheet recipe={recipe} visible={planning} onClose={() => setPlanning(false)} />
      <CollectionSheet recipe={recipe} visible={collecting} onClose={() => setCollecting(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sheet: { marginTop: -28, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: GUTTER, paddingTop: 22 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: { flex: 1, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  servings: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, padding: 14, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  block: { marginTop: 30 },
  blockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  blockTitle: { marginBottom: 12 },
  storage: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 24 },
  experiment: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  flask: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stars: { flexDirection: 'row', gap: 10 },
  topFill: { position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: 'flex-end', paddingBottom: 16 },
  topTitle: { textAlign: 'center', paddingHorizontal: 110 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: GUTTER - 4 },
  topRight: { flexDirection: 'row', gap: 10 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menu: { paddingHorizontal: GUTTER },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
