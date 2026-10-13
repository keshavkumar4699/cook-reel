import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Txt } from './ui/Text';

function Dot({ delay, color }: { delay: number; color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-4, { duration: 260 }), withTiming(0, { duration: 260 })), -1));
  }, [delay, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: 0.5 + (-y.value / 4) * 0.5 }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

/** Bouncing dots plus a status line that changes on long waits (recipes can take ~30s). */
export function TypingIndicator({ phrases }: { phrases: string[] }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => Math.min(i + 1, phrases.length - 1)), 4500);
    return () => clearInterval(id);
  }, [phrases.length]);
  return (
    <View style={styles.row} accessibilityLabel={phrases[index]} accessibilityLiveRegion="polite">
      <View style={styles.dots}>
        <Dot delay={0} color={colors.ai} />
        <Dot delay={130} color={colors.ai} />
        <Dot delay={260} color={colors.ai} />
      </View>
      <Txt variant="footnote" color="textMuted">
        {phrases[index]}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dots: { flexDirection: 'row', gap: 4, height: 14, alignItems: 'flex-end' },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
