import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ApiRecipe } from '@/data/types';
import { hashIndex } from '@/lib/recipes';
import { coverGradients, useTheme } from '@/theme';
import { Badge } from '../ui/Badge';
import { Txt } from '../ui/Text';

type CoverRecipe = Pick<ApiRecipe, 'id' | 'title' | 'emoji' | 'youtube' | 'source'>;

export interface RecipeCoverProps {
  recipe: CoverRecipe;
  style?: StyleProp<ViewStyle>;
  emojiSize?: number;
  /** Show source/short badges in the corner. */
  badges?: boolean;
  rounded?: number;
}

/** YouTube thumbnail for imported recipes; a warm gradient with the dish emoji otherwise. */
export function RecipeCover({ recipe, style, emojiSize = 56, badges = true, rounded = 0 }: RecipeCoverProps) {
  const { scheme } = useTheme();
  const gradients = coverGradients[scheme];
  const [from, to] = gradients[hashIndex(recipe.id + recipe.title, gradients.length)]!;
  const yt = recipe.youtube;

  return (
    <View style={[styles.cover, { borderRadius: rounded }, style]}>
      {yt ? (
        <>
          <Image
            source={{ uri: yt.thumbnailUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
            accessibilityIgnoresInvertColors
          />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']} style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <LinearGradient colors={[from, to]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={[styles.glow, { width: emojiSize * 1.9, height: emojiSize * 1.9, borderRadius: emojiSize }]} />
          <Txt style={{ fontSize: emojiSize, lineHeight: emojiSize * 1.2 }} accessibilityElementsHidden importantForAccessibility="no">
            {recipe.emoji}
          </Txt>
        </LinearGradient>
      )}
      {badges ? (
        <View style={styles.badges}>
          {yt ? <Badge label={yt.isShort ? 'Short' : 'YouTube'} icon="logo-youtube" tone="youtube" /> : null}
          {recipe.source === 'ai' ? <Badge label="Chef" icon="sparkles" tone="ai" /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden', backgroundColor: '#E9E1D6' },
  center: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.35)' },
  badges: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 },
});
