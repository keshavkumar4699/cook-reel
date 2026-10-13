import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Macros } from '@/data/types';
import { t } from '@/i18n';
import { formatGrams } from '@/lib/format';
import { macroSplit } from '@/lib/scale';
import { radius, useTheme } from '@/theme';
import { Card } from '../ui/Card';
import { Segmented } from '../ui/Segmented';
import { Txt } from '../ui/Text';

export function NutritionCard({ perServing, total, servings }: { perServing: Macros; total: Macros; servings: number }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'serving' | 'total'>('serving');
  const m = mode === 'serving' ? perServing : total;
  const split = macroSplit(m);
  const items = [
    { label: t('recipe.nutrition.protein'), value: m.proteinG, color: colors.protein },
    { label: t('recipe.nutrition.carbs'), value: m.carbsG, color: colors.carbs },
    { label: t('recipe.nutrition.fat'), value: m.fatG, color: colors.fat },
    { label: t('recipe.nutrition.fibre'), value: m.fiberG, color: colors.fiber },
  ];
  return (
    <Card>
      <View style={styles.head}>
        <View>
          <Txt variant="overline" color="textMuted">
            {t('recipe.nutrition.title')}
          </Txt>
          <View style={styles.kcalRow}>
            <Txt variant="title1">{Math.round(m.kcal)}</Txt>
            <Txt variant="subheadStrong" color="textMuted">
              {t('recipe.nutrition.kcalUnit')}
            </Txt>
          </View>
        </View>
        <View style={{ width: 168 }}>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'serving', label: t('recipe.nutrition.serving') },
              { value: 'total', label: t('recipe.nutrition.allServings', { count: servings }) },
            ]}
          />
        </View>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.surfaceMuted }]} accessibilityLabel={t('recipe.nutrition.barLabel')}>
        <View style={{ flex: split.protein || 0.001, backgroundColor: colors.protein }} />
        <View style={{ flex: split.carbs || 0.001, backgroundColor: colors.carbs }} />
        <View style={{ flex: split.fat || 0.001, backgroundColor: colors.fat }} />
      </View>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.cell}>
            <View style={styles.cellHead}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Txt variant="caption" color="textMuted">
                {item.label}
              </Txt>
            </View>
            <Txt variant="headline">{formatGrams(item.value)}</Txt>
          </View>
        ))}
      </View>
      <Txt variant="caption" color="textFaint" style={{ marginTop: 12 }}>
        {t('recipe.nutrition.disclaimer')}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  kcalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  bar: { flexDirection: 'row', height: 10, borderRadius: radius.pill, overflow: 'hidden', marginTop: 14, gap: 2 },
  grid: { flexDirection: 'row', marginTop: 14 },
  cell: { flex: 1, gap: 2 },
  cellHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
