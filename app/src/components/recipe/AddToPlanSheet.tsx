import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { MealSlot, Recipe } from '@/data/types';
import { t } from '@/i18n';
import { isSameDay, toDateKey, weekdayShort, addDays } from '@/lib/dates';
import { MEAL_SLOTS, useKitchen } from '@/state/kitchen';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { PressableScale } from '../ui/PressableScale';
import { Sheet } from '../ui/Sheet';
import { Stepper } from '../ui/Stepper';
import { Txt } from '../ui/Text';

export function AddToPlanSheet({ recipe, visible, onClose }: { recipe: Recipe; visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const addToPlan = useKitchen((s) => s.addToPlan);
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => addDays(today, i)), [today]);
  const [day, setDay] = useState(today);
  const [slot, setSlot] = useState<MealSlot>(recipe.mealTypes.includes('breakfast') ? 'breakfast' : 'dinner');
  const [servings, setServings] = useState(recipe.servings);

  return (
    <Sheet visible={visible} onClose={onClose} title={t('plan.addSheet.title')} subtitle={recipe.title}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {days.map((d) => {
          const active = isSameDay(d, day);
          return (
            <PressableScale
              key={d.toISOString()}
              haptic="select"
              onPress={() => setDay(d)}
              style={[styles.day, { backgroundColor: active ? colors.ink : colors.surface, borderColor: active ? colors.ink : colors.border }]}
            >
              <Txt variant="caption" color={active ? colors.onInk : 'textMuted'}>
                {isSameDay(d, today) ? t('common.dates.today') : weekdayShort(d)}
              </Txt>
              <Txt variant="title3" color={active ? colors.onInk : 'text'}>
                {d.getDate()}
              </Txt>
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={styles.body}>
        <View style={styles.slots}>
          {MEAL_SLOTS.map((m) => (
            <Chip key={m.slot} label={m.label} emoji={m.emoji} selected={slot === m.slot} onPress={() => setSlot(m.slot)} />
          ))}
        </View>
        <View style={styles.servings}>
          <Txt variant="bodyStrong">{t('plan.addSheet.servings')}</Txt>
          <Stepper value={servings} onChange={setServings} min={1} max={20} />
        </View>
        <Button
          label={t('plan.addSheet.add')}
          icon="calendar"
          onPress={() => {
            addToPlan({ date: toDateKey(day), slot, recipeId: recipe.id, servings });
            const slotLabel = MEAL_SLOTS.find((m) => m.slot === slot)?.label ?? '';
            const message = isSameDay(day, today) ? t('plan.addSheet.plannedToday', { slot: slotLabel }) : t('plan.addSheet.plannedOn', { day: weekdayShort(day), slot: slotLabel });
            toast(message, { tone: 'success' });
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  days: { paddingHorizontal: GUTTER, gap: 8, paddingBottom: 16 },
  day: { width: 58, height: 68, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth * 2, alignItems: 'center', justifyContent: 'center', gap: 2 },
  body: { paddingHorizontal: GUTTER, gap: 18 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  servings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
