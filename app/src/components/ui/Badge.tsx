import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'saffron' | 'ai' | 'dark' | 'youtube';

export function Badge({ label, icon, tone = 'neutral', style }: { label: string; icon?: IconName; tone?: BadgeTone; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primary },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    saffron: { bg: colors.saffronSoft, fg: colors.saffron },
    ai: { bg: colors.aiSoft, fg: colors.ai },
    dark: { bg: 'rgba(17,14,12,0.72)', fg: '#FFFFFF' },
    youtube: { bg: colors.youtube, fg: '#FFFFFF' },
  };
  const t = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      {icon ? <Icon name={icon} size={12} color={t.fg} /> : null}
      <Txt variant="caption" color={t.fg} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 24, borderRadius: radius.pill, alignSelf: 'flex-start' },
});
