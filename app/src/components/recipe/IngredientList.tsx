import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Ingredient } from '@/data/types';
import { formatQuantity } from '@/lib/format';
import { t } from '@/i18n';
import { Trans } from '@/i18n/Trans';
import { radius, useTheme } from '@/theme';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { Txt } from '../ui/Text';

/** Scaled ingredient checklist ("check you have these" before cooking). */
export function IngredientList({ ingredients, factor }: { ingredients: Ingredient[]; factor: number }) {
  const { colors } = useTheme();
  const [have, setHave] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {ingredients.map((ing, index) => {
        const checked = have.has(ing.id);
        const qty = formatQuantity(ing.quantity === null ? null : ing.quantity * factor, ing.unit);
        const hasSubs = ing.substitutes.length > 0;
        return (
          <View key={ing.id}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            <PressableScale
              scaleTo={0.99}
              haptic="select"
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={qty ? t('recipe.ingredients.line', { quantity: qty, name: ing.name }) : ing.name}
              onPress={() =>
                setHave((prev) => {
                  const next = new Set(prev);
                  if (next.has(ing.id)) next.delete(ing.id);
                  else next.add(ing.id);
                  return next;
                })
              }
              style={styles.row}
            >
              <View
                style={[
                  styles.check,
                  { borderColor: checked ? colors.accent : colors.borderStrong, backgroundColor: checked ? colors.accent : 'transparent' },
                ]}
              >
                {checked ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="body" color={checked ? 'textFaint' : 'text'} style={checked ? styles.struck : null}>
                  {qty ? (
                    <Trans
                      k="recipe.ingredients.line"
                      values={{ quantity: <Txt variant="bodyStrong" color={checked ? 'textFaint' : 'text'}>{qty}</Txt>, name: ing.name }}
                    />
                  ) : (
                    ing.name
                  )}
                  {ing.optional ? <Txt variant="footnote" color="textFaint">{`  ${t('recipe.ingredients.optional')}`}</Txt> : null}
                </Txt>
                {ing.note || (ing.quantity === null && !ing.note) ? (
                  <Txt variant="footnote" color="textMuted">
                    {ing.note ?? t('recipe.ingredients.toTaste')}
                  </Txt>
                ) : null}
                {hasSubs && open === ing.id ? (
                  <Txt variant="footnote" color="accent" style={{ marginTop: 4 }}>
                    {t('recipe.ingredients.swapWith', { items: ing.substitutes.join(' · ') })}
                  </Txt>
                ) : null}
              </View>
              {hasSubs ? (
                <PressableScale
                  onPress={() => setOpen(open === ing.id ? null : ing.id)}
                  hitSlop={8}
                  accessibilityLabel={t('recipe.ingredients.substitutesFor', { name: ing.name })}
                  style={[styles.swap, { backgroundColor: colors.accentSoft }]}
                >
                  <Icon name="swap-horizontal" size={14} color={colors.accent} />
                </PressableScale>
              ) : null}
            </PressableScale>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 13 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginStart: 34 },
  struck: { textDecorationLine: 'line-through' },
  swap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
