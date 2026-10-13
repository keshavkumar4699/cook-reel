import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ApiRecipe } from '@/data/types';
import { formatMinutes, plural } from '@/lib/format';
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
          <Badge label={plural(recipe.servings, 'serving')} icon="people-outline" />
          {n ? <Badge label={`${n.kcal} kcal`} icon="flame-outline" tone="primary" /> : null}
          {n ? <Badge label={`${Math.round(n.proteinG)} g protein`} icon="barbell-outline" tone="accent" /> : null}
          <Badge label={plural(recipe.steps.length, 'step')} icon="list-outline" />
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
