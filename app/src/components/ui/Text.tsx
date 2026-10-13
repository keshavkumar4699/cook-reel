import { Text as RNText, type TextProps } from 'react-native';
import { type ColorName, type TypeVariant, type as typeScale, useTheme } from '@/theme';

export interface TxtProps extends TextProps {
  variant?: TypeVariant;
  color?: ColorName | (string & {});
  align?: 'left' | 'center' | 'right';
}

/** Themed text. `color` accepts a token name ("textMuted") or a raw colour. */
export function Txt({ variant = 'body', color = 'text', align, style, ...rest }: TxtProps) {
  const { colors } = useTheme();
  const resolved = color in colors ? colors[color as ColorName] : color;
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[typeScale[variant], { color: resolved }, align ? { textAlign: align } : null, style]}
    />
  );
}
