import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  emoji?: string;
  icon?: IconName;
  tone?: 'neutral' | 'primary' | 'ai' | 'accent';
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
  trailing?: string;
}

export function Chip({ label, selected, onPress, emoji, icon, tone = 'neutral', size = 'md', style, trailing }: ChipProps) {
  const { colors } = useTheme();
  const selectedBg = { neutral: colors.ink, primary: colors.primary, ai: colors.ai, accent: colors.accent }[tone];
  const selectedFg = tone === 'neutral' ? colors.onInk : '#FFFFFF';
  const bg = selected ? selectedBg : colors.surface;
  const fg = selected ? selectedFg : colors.text;
  const body = (
    <View style={[styles.row, { gap: size === 'sm' ? 4 : 6 }]}>
      {emoji ? <Txt variant={size === 'sm' ? 'footnote' : 'callout'}>{emoji}</Txt> : null}
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} color={fg} /> : null}
      <Txt variant={size === 'sm' ? 'footnote' : 'subheadStrong'} color={fg} numberOfLines={1}>
        {label}
      </Txt>
      {trailing ? (
        <Txt variant="caption" color={selected ? fg : 'textFaint'}>
          {trailing}
        </Txt>
      ) : null}
    </View>
  );
  const chipStyle = [
    styles.base,
    {
      height: size === 'sm' ? 30 : 38,
      paddingHorizontal: size === 'sm' ? 10 : 14,
      backgroundColor: bg,
      borderColor: selected ? bg : colors.border,
    },
    style,
  ];
  if (!onPress) return <View style={chipStyle}>{body}</View>;
  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={chipStyle}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth * 2, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
