import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { Recipe } from '@/data/types';
import { sourceLabel } from '@/lib/recipes';
import { radius, useTheme } from '@/theme';
import { PressableScale } from '../ui/PressableScale';
import { Txt } from '../ui/Text';
import { RecipeCover } from './RecipeCover';
import { RecipeMeta } from './RecipeMeta';

export function RecipeRow({ recipe, onPress, trailing, subtitle }: { recipe: Recipe; onPress?: () => void; trailing?: ReactNode; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress ?? (() => router.push(`/recipe/${recipe.id}`))}
      scaleTo={0.98}
      accessibilityLabel={recipe.title}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <RecipeCover recipe={recipe} style={styles.cover} emojiSize={28} badges={false} rounded={radius.sm} />
      <View style={styles.body}>
        <Txt variant="caption" color="textFaint" numberOfLines={1}>
          {subtitle ?? sourceLabel(recipe)}
        </Txt>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {recipe.title}
        </Txt>
        <RecipeMeta recipe={recipe} />
      </View>
      {trailing}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  cover: { width: 64, height: 64 },
  body: { flex: 1, gap: 2 },
});
