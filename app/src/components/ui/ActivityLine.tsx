import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { isRTL } from '@/i18n';
import { Txt } from './Text';

export interface ActivityLineProps {
  /** Work is in progress. The line only appears if it still is after `delayMs`, so quick work never flashes. */
  active: boolean;
  /** Read by screen readers, e.g. "Getting Chef's voice ready". */
  label: string;
  /** Optional words under the line, shown once the wait passes `captionDelayMs`. */
  caption?: string;
  color: string;
  trackColor?: string;
  captionColor?: string;
  delayMs?: number;
  captionDelayMs?: number;
  style?: StyleProp<ViewStyle>;
}

/** True once `active` has stayed true for `delayMs`; false as soon as it isn't. */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setOn(true), delayMs);
    return () => {
      clearTimeout(timer);
      setOn(false);
    };
  }, [active, delayMs]);
  return on && active;
}

/**
 * A thin indeterminate progress line: a segment sweeping in the reading direction (a gentle pulse
 * when the cook prefers reduced motion).
 */
export function ActivityLine({
  active,
  label,
  caption,
  color,
  trackColor = 'transparent',
  captionColor,
  delayMs = 250,
  captionDelayMs = 700,
  style,
}: ActivityLineProps) {
  const visible = useDelayedFlag(active, delayMs);
  const showCaption = useDelayedFlag(active && !!caption, Math.max(delayMs, captionDelayMs));
  const [width, setWidth] = useState(0);
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const rtl = isRTL();

  useEffect(() => {
    if (!visible) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = reduceMotion
      ? withRepeat(withSequence(withTiming(1, { duration: 750 }), withTiming(0, { duration: 750 })), -1)
      : withRepeat(withTiming(1, { duration: 1250, easing: Easing.inOut(Easing.cubic) }), -1);
    return () => cancelAnimation(progress);
  }, [visible, reduceMotion, progress]);

  const bar = useAnimatedStyle(() => {
    if (reduceMotion) return { width, opacity: 0.35 + progress.value * 0.65, transform: [{ translateX: 0 }] };
    const segment = Math.max(48, width * 0.38);
    // Travels from fully before the start edge to fully past the end edge.
    const travelled = -segment + progress.value * (width + segment);
    const x = rtl ? width - segment - travelled : travelled;
    return { width: segment, opacity: 1, transform: [{ translateX: x }] };
  });

  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(160)}
      style={style}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
    >
      {/* Laid out left-to-right on purpose: the sweep direction is computed above. */}
      <View
        style={[styles.track, { backgroundColor: trackColor }]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.bar, { backgroundColor: color }, bar]} />
      </View>
      {caption && showCaption ? (
        <Animated.View entering={FadeIn.duration(220)}>
          <Txt variant="caption" color={captionColor ?? color} align="center" style={styles.caption} numberOfLines={1}>
            {caption}
          </Txt>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, borderRadius: 1.5, overflow: 'hidden', direction: 'ltr' },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 1.5 },
  caption: { marginTop: 6 },
});
