import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { Recipe } from '@/data/types';
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
        <RecipeCover recipe={recipe} style={{ height: coverHeight ?? width * 0.9 }} emojiSize={Math.round(width * 0.26)} />
        <IconButton
          icon={recipe.cookLater ? 'bookmark' : 'bookmark-outline'}
          label={recipe.cookLater ? 'Remove from cook later' : 'Cook later'}
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
        <RecipeMeta recipe={recipe} compact={width < 170} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  bookmark: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(17,14,12,0.28)' },
  body: { padding: 12, gap: 6 },
  title: { minHeight: 44 },
});
