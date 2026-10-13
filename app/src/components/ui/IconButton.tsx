import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { radius, shadow, stage, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  label: string;
  variant?: 'surface' | 'ghost' | 'glass' | 'stage' | 'primary' | 'soft';
  size?: number;
  iconSize?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function IconButton({ icon, onPress, label, variant = 'surface', size = 40, iconSize, color, style, disabled }: IconButtonProps) {
  const { colors, isDark } = useTheme();
  const bg = {
    surface: colors.surface,
    ghost: 'transparent',
    glass: 'transparent',
    stage: stage.surface,
    primary: colors.primary,
    soft: colors.surfaceMuted,
  }[variant];
  const fg = color ?? (variant === 'stage' || variant === 'primary' ? '#FFFFFF' : colors.text);
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      hitSlop={8}
      scaleTo={0.9}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: bg },
        variant === 'surface' && !isDark ? shadow(colors, 1) : null,
        variant === 'surface' ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border } : null,
        style,
      ]}
    >
      {variant === 'glass' ? (
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { borderRadius: radius.pill, overflow: 'hidden' }]} />
      ) : null}
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} color={fg} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
