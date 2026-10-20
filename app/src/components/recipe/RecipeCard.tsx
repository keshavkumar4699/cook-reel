import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { Recipe } from '@/data/types';
import { t } from '@/i18n';
import { useLibrary } from '@/state/library';
import { radius, shadow, useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { IconButton } from '../ui/IconButton';
import { PressableScale } from '../ui/PressableScale';
import { Txt } from '../ui/Text';
import { RecipeCover } from './RecipeCover';
import { RecipeMeta } from './RecipeMeta';

export function RecipeCard({ recipe, width, coverHeight }: { recipe: Recipe; width: number; coverHeight?: number }) {
  const { colors, isDark } = useTheme();
  const toggleCookLater = useLibrary((s) => s.toggleCookLater);
  return (
    <PressableScale
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      scaleTo={0.97}
      accessibilityLabel={recipe.title}
      style={[styles.card, { width, backgroundColor: colors.surface, borderColor: colors.border }, !isDark ? shadow(colors, 1) : null]}
    >
      <View>
        <RecipeCover recipe={recipe} style={{ height: coverHeight ?? width * 0.86 }} emojiSize={Math.round(width * 0.26)} proteinPill />
        <IconButton
          icon={recipe.cookLater ? 'bookmark' : 'bookmark-outline'}
          label={recipe.cookLater ? t('recipe.cookLater.remove') : t('recipe.cookLater.add')}
          variant="glass"
          size={34}
          iconSize={16}
          color={recipe.cookLater ? colors.primary : '#FFFFFF'}
          style={styles.bookmark}
          onPress={() => {
            haptics.select();
            toggleCookLater(recipe.id);
          }}
        />
      </View>
      <View style={styles.body}>
        <Txt variant="headline" numberOfLines={2} style={styles.title}>
          {recipe.title}
        </Txt>
        <RecipeMeta recipe={recipe} compact />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  bookmark: { position: 'absolute', top: 8, end: 8, backgroundColor: 'rgba(17,14,12,0.28)' },
  body: { padding: 12, gap: 6 },
  title: { minHeight: 44 },
});
