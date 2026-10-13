import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

/** Full-bleed themed background. Screens handle their own safe-area padding. */
export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[styles.root, { backgroundColor: colors.bg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
