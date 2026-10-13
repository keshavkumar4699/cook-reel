import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadow, useTheme } from '@/theme';
import { PressableScale } from './PressableScale';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
  tone?: 'surface' | 'muted' | 'primary' | 'ai' | 'accent' | 'saffron';
  elevated?: boolean;
  accessibilityLabel?: string;
}

export function Card({ children, style, onPress, padded = true, tone = 'surface', elevated = true, accessibilityLabel }: CardProps) {
  const { colors, isDark } = useTheme();
  const bg = {
    surface: colors.surface,
    muted: colors.surfaceMuted,
    primary: colors.primarySoft,
    ai: colors.aiSoft,
    accent: colors.accentSoft,
    saffron: colors.saffronSoft,
  }[tone];
  const cardStyle = [
    styles.card,
    { backgroundColor: bg, borderColor: tone === 'surface' ? colors.border : 'transparent' },
    padded ? styles.padded : null,
    elevated && tone === 'surface' && !isDark ? shadow(colors, 1) : null,
    style,
  ];
  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={cardStyle} scaleTo={0.98} accessibilityLabel={accessibilityLabel}>
        {children}
      </PressableScale>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  padded: { padding: 16 },
});
