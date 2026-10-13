import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ApiRecipe } from '@/data/types';
import { t } from '@/i18n';
import { formatMinutes } from '@/lib/format';
import { radius, shadow, useTheme } from '@/theme';
import { Badge } from '../ui/Badge';
import { Txt } from '../ui/Text';
import { RecipeCover } from './RecipeCover';

/** Compact summary of a freshly generated recipe (chat result, import result, variation). */
export function RecipePreviewCard({ recipe, actions, footer }: { recipe: ApiRecipe; actions?: ReactNode; footer?: ReactNode }) {
  const { colors, isDark } = useTheme();
  const n = recipe.nutrition?.perServing;
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark ? shadow(colors, 2) : null]}>
      <RecipeCover recipe={recipe} style={{ height: 150 }} emojiSize={64} />
      <View style={styles.body}>
        <Txt variant="title3">{recipe.title}</Txt>
        {recipe.description ? (
          <Txt variant="subhead" color="textMuted" numberOfLines={3}>
            {recipe.description}
          </Txt>
        ) : null}
        <View style={styles.stats}>
          <Badge label={formatMinutes(recipe.totalMinutes)} icon="time-outline" />
          <Badge label={t('common.counts.servings', { count: recipe.servings })} icon="people-outline" />
          {n ? <Badge label={t('recipe.facts.kcal', { n: String(n.kcal) })} icon="flame-outline" tone="primary" /> : null}
          {n ? <Badge label={t('recipe.facts.protein', { n: String(Math.round(n.proteinG)) })} icon="barbell-outline" tone="accent" /> : null}
          <Badge label={t('common.counts.steps', { count: recipe.steps.length })} icon="list-outline" />
        </View>
        {footer}
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  body: { padding: 16, gap: 8 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
