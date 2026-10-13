import { StyleSheet, View } from 'react-native';
import type { Recipe } from '@/data/types';
import { t } from '@/i18n';
import { formatMinutes } from '@/lib/format';
import { Icon } from '../ui/Icon';
import { Txt } from '../ui/Text';

/** "⏱ 25 min · 🔥 480 kcal · 32 g protein" */
export function RecipeMeta({ recipe, compact }: { recipe: Pick<Recipe, 'totalMinutes' | 'nutrition'>; compact?: boolean }) {
  const n = recipe.nutrition?.perServing;
  return (
    <View style={styles.row}>
      {recipe.totalMinutes > 0 ? (
        <View style={styles.item}>
          <Icon name="time-outline" size={13} color="textMuted" />
          <Txt variant="caption" color="textMuted">
            {formatMinutes(recipe.totalMinutes)}
          </Txt>
        </View>
      ) : null}
      {n ? (
        <View style={styles.item}>
          <Icon name="flame-outline" size={13} color="textMuted" />
          <Txt variant="caption" color="textMuted">
            {t('recipe.facts.kcal', { n: String(n.kcal) })}
          </Txt>
        </View>
      ) : null}
      {n && !compact ? (
        <View style={styles.item}>
          <Icon name="mci:arm-flex-outline" size={13} color="protein" />
          <Txt variant="caption" color="protein">
            {t('common.units.g', { n: String(Math.round(n.proteinG)) })}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
