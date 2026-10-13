import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, shadow, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ink' | 'ai' | 'danger' | 'soft';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Small trailing note, e.g. "1 credit". */
  meta?: string;
  accessibilityHint?: string;
}

const HEIGHT = { lg: 56, md: 48, sm: 38 } as const;

export function Button({ label, onPress, variant = 'primary', size = 'lg', icon, iconRight, loading, disabled, style, meta, accessibilityHint }: ButtonProps) {
  const { colors, isDark } = useTheme();
  const palettes: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.text },
    ink: { bg: colors.ink, fg: colors.onInk },
    ai: { bg: colors.ai, fg: '#FFFFFF' },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    soft: { bg: colors.primarySoft, fg: colors.primary },
  };
  const p = palettes[variant];
  const textVariant = size === 'sm' ? 'subheadStrong' : 'button';
  const iconSize = size === 'sm' ? 16 : 19;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={iconSize} color={p.fg} /> : null}
          <Txt variant={textVariant} color={p.fg} numberOfLines={1}>
            {label}
          </Txt>
          {meta ? (
            <View style={[styles.meta, { backgroundColor: variant === 'secondary' || variant === 'ghost' ? colors.surfaceMuted : 'rgba(255,255,255,0.2)' }]}>
              <Txt variant="caption" color={p.fg}>
                {meta}
              </Txt>
            </View>
          ) : null}
          {iconRight ? <Icon name={iconRight} size={iconSize} color={p.fg} /> : null}
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      haptic={variant === 'primary' || variant === 'ai' ? 'press' : 'tap'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={[
        styles.base,
        {
          height: HEIGHT[size],
          borderRadius: size === 'sm' ? radius.sm : radius.md,
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? StyleSheet.hairlineWidth * 2 : 0,
          paddingHorizontal: size === 'sm' ? 14 : 20,
        },
        variant === 'primary' && !isDark ? shadow(colors, 2) : null,
        style,
      ]}
    >
      {variant === 'ai' ? (
        <LinearGradient
          colors={['#7B61FF', '#5B4BDB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size === 'sm' ? radius.sm : radius.md }]}
        />
      ) : null}
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
});
