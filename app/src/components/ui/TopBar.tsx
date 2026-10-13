import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GUTTER, useTheme } from '@/theme';
import { IconButton } from './IconButton';
import { Txt } from './Text';

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  /** "back" (chevron) or "close" (x) for modals; false hides it. */
  leading?: 'back' | 'close' | false;
  onLeading?: () => void;
  transparent?: boolean;
}

/** Compact navigation bar used by stack screens (we draw our own headers for full design control). */
export function TopBar({ title, subtitle, left, right, leading = 'back', onLeading, transparent }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const goBack = onLeading ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6, backgroundColor: transparent ? 'transparent' : colors.bg }]}>
      <View style={styles.side}>
        {left ??
          (leading ? (
            <IconButton icon={leading === 'close' ? 'close' : 'chevron-back'} label={leading === 'close' ? 'Close' : 'Back'} onPress={goBack} />
          ) : null)}
      </View>
      <View style={styles.center}>
        {title ? (
          <Txt variant="headline" numberOfLines={1} align="center">
            {title}
          </Txt>
        ) : null}
        {subtitle ? (
          <Txt variant="caption" color="textMuted" numberOfLines={1} align="center">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 4, paddingBottom: 10, zIndex: 10 },
  side: { minWidth: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  right: { justifyContent: 'flex-end' },
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
});
