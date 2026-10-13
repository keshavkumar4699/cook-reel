import { StyleSheet, View } from 'react-native';
import { radius, useTheme } from '@/theme';
import { IconButton } from './IconButton';
import { Txt } from './Text';
import { t } from '@/i18n';

export function Stepper({ value, onChange, min = 1, max = 20, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceMuted }]}>
      <IconButton icon="remove" label={t('ui.stepper.decrease')} variant="surface" size={34} disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} />
      <Txt variant="headline" style={styles.value} accessibilityLiveRegion="polite">
        {value}
        {suffix ? <Txt variant="footnote" color="textMuted">{` ${suffix}`}</Txt> : null}
      </Txt>
      <IconButton icon="add" label={t('ui.stepper.increase')} variant="surface" size={34} disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, padding: 4, gap: 4 },
  value: { minWidth: 44, textAlign: 'center' },
});
