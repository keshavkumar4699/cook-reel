import { StyleSheet, View } from 'react-native';
import { radius, shadow, useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={o.value}
            haptic="select"
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active ? [{ backgroundColor: colors.surface }, !isDark ? shadow(colors, 1) : null] : null]}
          >
            <Txt variant="subheadStrong" color={active ? 'text' : 'textMuted'}>
              {o.label}
            </Txt>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: radius.md, gap: 4 },
  item: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
