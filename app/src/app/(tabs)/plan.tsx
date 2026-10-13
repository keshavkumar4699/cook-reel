import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeRow } from '@/components/recipe/RecipeRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Text';
import type { MealSlot, PlanEntry, Recipe, ShoppingItem } from '@/data/types';
import { addDays, isSameDay, toDateKey, weekDays, weekdayShort, weekLabel } from '@/lib/dates';
import { formatQuantity, plural } from '@/lib/format';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/shopping';
import { useTabBarSpace } from '@/lib/useBottomSpace';
import { MEAL_SLOTS, useKitchen } from '@/state/kitchen';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';

function RecipePicker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (r: Recipe) => void }) {
  const recipesMap = useLibrary((s) => s.recipes);
  const [q, setQ] = useState('');
  const list = useMemo(
    () =>
      Object.values(recipesMap)
        .filter((r) => !q.trim() || r.title.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => Number(b.cookLater) - Number(a.cookLater) || b.updatedAt.localeCompare(a.updatedAt)),
    [recipesMap, q],
  );
  return (
    <Sheet visible={visible} onClose={onClose} title="Pick a recipe">
      <View style={{ paddingHorizontal: GUTTER, paddingBottom: 12 }}>
        <TextField icon="search" placeholder="Search your library" value={q} onChangeText={setQ} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 10, paddingBottom: 12 }}
        renderItem={({ item }) => <RecipeRow recipe={item} onPress={() => onPick(item)} subtitle={item.cookLater ? 'Cook later' : undefined} />}
        style={{ maxHeight: 420 }}
        keyboardShouldPersistTaps="handled"
      />
    </Sheet>
  );
}

function MealPlan() {
  const { colors } = useTheme();
  const bottom = useTabBarSpace();
  const plan = useKitchen((s) => s.plan);
  const addToPlan = useKitchen((s) => s.addToPlan);
  const removeFromPlan = useKitchen((s) => s.removeFromPlan);
  const addRecipesToShopping = useKitchen((s) => s.addRecipesToShopping);
  const recipes = useLibrary((s) => s.recipes);
  const targets = useProfile((s) => s.profile);
  const today = useMemo(() => new Date(), []);
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [picking, setPicking] = useState<MealSlot | null>(null);

  const days = useMemo(() => weekDays(anchor), [anchor]);
  const entries = useMemo(() => Object.values(plan), [plan]);
  const dayKey = toDateKey(selected);
  const dayEntries = entries.filter((e) => e.date === dayKey && recipes[e.recipeId]);
  const totals = dayEntries.reduce(
    (acc, e) => {
      const per = recipes[e.recipeId]?.nutrition?.perServing;
      // Planned servings are for the household; count one serving for "my" daily totals.
      return per ? { kcal: acc.kcal + per.kcal, protein: acc.protein + per.proteinG } : acc;
    },
    { kcal: 0, protein: 0 },
  );
  const kcalTarget = targets.dailyCalories ?? 2000;
  const proteinTarget = targets.dailyProteinG ?? 80;

  const shopWeek = () => {
    const keys = new Set(days.map(toDateKey));
    const weekEntries = entries.filter((e) => keys.has(e.date) && recipes[e.recipeId]);
    if (!weekEntries.length) {
      toast('Plan a few meals first, then shop for them in one tap.');
      return;
    }
    const added = addRecipesToShopping(weekEntries.map((e) => ({ recipe: recipes[e.recipeId]!, servings: e.servings })));
    toast(`${plural(added, 'new item')} added for this week`, { tone: 'success' });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottom }} showsVerticalScrollIndicator={false}>
      <View style={styles.weekNav}>
        <IconButton icon="chevron-back" label="Previous week" variant="soft" size={34} onPress={() => setAnchor(addDays(anchor, -7))} />
        <Txt variant="headline">{weekLabel(days)}</Txt>
        <IconButton icon="chevron-forward" label="Next week" variant="soft" size={34} onPress={() => setAnchor(addDays(anchor, 7))} />
      </View>
      <View style={styles.days}>
        {days.map((d) => {
          const active = isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          const planned = entries.some((e) => e.date === toDateKey(d));
          return (
            <PressableScale
              key={d.toISOString()}
              haptic="select"
              onPress={() => setSelected(d)}
              accessibilityLabel={`${weekdayShort(d)} ${d.getDate()}`}
              style={[styles.day, { backgroundColor: active ? colors.ink : colors.surface, borderColor: active ? colors.ink : isToday ? colors.primary : colors.border }]}
            >
              <Txt variant="caption" color={active ? colors.onInk : 'textMuted'}>
                {weekdayShort(d)}
              </Txt>
              <Txt variant="headline" color={active ? colors.onInk : 'text'}>
                {d.getDate()}
              </Txt>
              <View style={[styles.dot, { backgroundColor: planned ? (active ? colors.onInk : colors.primary) : 'transparent' }]} />
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.gutter}>
        <Card style={styles.summary}>
          <ProgressRing size={58} progress={totals.kcal / kcalTarget} color={colors.primary} track={colors.surfaceMuted}>
            <Icon name="flame" size={18} color={colors.primary} />
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <Txt variant="overline" color="textMuted">
              {isSameDay(selected, today) ? 'Today' : `${weekdayShort(selected)} ${selected.getDate()}`}
            </Txt>
            <Txt variant="headline">
              {Math.round(totals.kcal)} <Txt variant="footnote" color="textMuted">/ {kcalTarget} kcal</Txt>
            </Txt>
            <Txt variant="headline" color="protein">
              {Math.round(totals.protein)} g <Txt variant="footnote" color="textMuted">/ {proteinTarget} g protein</Txt>
            </Txt>
          </View>
          <ProgressRing size={58} progress={totals.protein / proteinTarget} color={colors.protein} track={colors.surfaceMuted}>
            <Icon name="mci:arm-flex" size={18} color={colors.protein} />
          </ProgressRing>
        </Card>

        {MEAL_SLOTS.map(({ slot, label, emoji }) => {
          const items = dayEntries.filter((e) => e.slot === slot);
          return (
            <View key={slot} style={styles.slot}>
              <Txt variant="overline" color="textMuted" style={{ marginBottom: 8 }}>
                {emoji} {label}
              </Txt>
              <Animated.View layout={LinearTransition} style={{ gap: 8 }}>
                {items.map((entry: PlanEntry) => (
                  <Animated.View key={entry.id} entering={FadeIn}>
                    <RecipeRow
                      recipe={recipes[entry.recipeId]!}
                      subtitle={`${plural(entry.servings, 'serving')}`}
                      trailing={<IconButton icon="close" label="Remove from plan" variant="ghost" size={30} iconSize={16} onPress={() => removeFromPlan(entry.id)} />}
                    />
                  </Animated.View>
                ))}
                <PressableScale onPress={() => setPicking(slot)} style={[styles.add, { borderColor: colors.borderStrong }]} accessibilityLabel={`Add ${label}`}>
                  <Icon name="add" size={18} color="textMuted" />
                  <Txt variant="subheadStrong" color="textMuted">
                    Add {label.toLowerCase()}
                  </Txt>
                </PressableScale>
              </Animated.View>
            </View>
          );
        })}

        <Button label="Shop for this week" icon="cart-outline" variant="secondary" style={{ marginTop: 24 }} onPress={shopWeek} />
      </View>

      <RecipePicker
        visible={!!picking}
        onClose={() => setPicking(null)}
        onPick={(r) => {
          if (picking) addToPlan({ date: dayKey, slot: picking, recipeId: r.id, servings: r.servings });
          setPicking(null);
        }}
      />
    </ScrollView>
  );
}

function ShoppingList() {
  const { colors } = useTheme();
  const bottom = useTabBarSpace();
  const shopping = useKitchen((s) => s.shopping);
  const toggleItem = useKitchen((s) => s.toggleItem);
  const removeItem = useKitchen((s) => s.removeItem);
  const clearChecked = useKitchen((s) => s.clearChecked);
  const addManualItem = useKitchen((s) => s.addManualItem);
  const [text, setText] = useState('');

  const items = useMemo(() => Object.values(shopping), [shopping]);
  const done = items.filter((i) => i.checked).length;
  const groups = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: items.filter((i) => i.category === category).sort((a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name)),
      })).filter((g) => g.items.length),
    [items],
  );

  const add = () => {
    addManualItem(text);
    setText('');
  };

  return (
    <ScrollView contentContainerStyle={[styles.gutter, { paddingBottom: bottom }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.addRow}>
        <TextField placeholder="Add an item…" value={text} onChangeText={setText} onSubmitEditing={add} returnKeyType="done" containerStyle={{ flex: 1 }} icon="add" />
      </View>
      {items.length ? (
        <>
          <View style={styles.progressRow}>
            <Txt variant="subheadStrong" color="textMuted">
              {done} of {plural(items.length, 'item')}
            </Txt>
            {done ? <Button label="Clear ticked" variant="ghost" size="sm" icon="trash-outline" onPress={clearChecked} /> : null}
          </View>
          <View style={[styles.progress, { backgroundColor: colors.surfaceMuted }]}>
            <View style={{ width: `${(done / items.length) * 100}%`, backgroundColor: colors.accent, borderRadius: radius.pill }} />
          </View>
          {groups.map((g) => (
            <View key={g.category} style={{ marginTop: 22 }}>
              <Txt variant="overline" color="textMuted" style={{ marginBottom: 8 }}>
                {CATEGORY_LABELS[g.category].emoji} {CATEGORY_LABELS[g.category].label}
              </Txt>
              <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {g.items.map((item: ShoppingItem, idx) => (
                  <View key={item.id}>
                    {idx > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                    <PressableScale onPress={() => toggleItem(item.id)} haptic="select" scaleTo={0.99} style={styles.item} accessibilityRole="checkbox" accessibilityState={{ checked: item.checked }}>
                      <View style={[styles.check, { borderColor: item.checked ? colors.accent : colors.borderStrong, backgroundColor: item.checked ? colors.accent : 'transparent' }]}>
                        {item.checked ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
                      </View>
                      <Txt variant="body" color={item.checked ? 'textFaint' : 'text'} style={[{ flex: 1 }, item.checked ? { textDecorationLine: 'line-through' } : null]}>
                        {item.name}
                      </Txt>
                      <Txt variant="subheadStrong" color="textMuted">
                        {formatQuantity(item.quantity, item.unit)}
                      </Txt>
                      <IconButton icon="close" label={`Remove ${item.name}`} variant="ghost" size={28} iconSize={15} color={colors.textFaint} onPress={() => removeItem(item.id)} />
                    </PressableScale>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>
      ) : (
        <EmptyState emoji="🛒" title="Your list is empty" body="Add ingredients from any recipe, or plan your week and shop for it in one tap." />
      )}
    </ScrollView>
  );
}

export default function Plan() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<'plan' | 'shopping'>(params.tab === 'shopping' ? 'shopping' : 'plan');
  useEffect(() => {
    if (params.tab === 'shopping') setTab('shopping');
  }, [params.tab]);
  const pending = useKitchen((s) => Object.values(s.shopping).filter((i) => !i.checked).length);

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Txt variant="title1">Plan</Txt>
        <Txt variant="subhead" color="textMuted">
          {tab === 'plan' ? 'Your week of meals' : pending ? `${plural(pending, 'item')} to buy` : 'All set for now'}
        </Txt>
        <View style={{ marginTop: 14 }}>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'plan', label: 'Meal plan' },
              { value: 'shopping', label: pending ? `Shopping · ${pending}` : 'Shopping' },
            ]}
          />
        </View>
      </View>
      {tab === 'plan' ? <MealPlan /> : <ShoppingList />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: GUTTER, paddingBottom: 12 },
  gutter: { paddingHorizontal: GUTTER },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, marginTop: 6 },
  days: { flexDirection: 'row', gap: 6, paddingHorizontal: GUTTER, marginTop: 14, marginBottom: 16 },
  day: { flex: 1, height: 70, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  slot: { marginTop: 22 },
  add: { height: 52, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  progress: { height: 6, borderRadius: radius.pill, overflow: 'hidden', marginTop: 8, flexDirection: 'row' },
  group: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 34 },
});
