import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { radius, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

/** A titled card of settings rows (the Me tab). */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 28 }}>
      <Txt variant="overline" color="textMuted" style={styles.title}>
        {title}
      </Txt>
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

export function SettingsRow({
  icon,
  label,
  detail,
  onPress,
  right,
  danger,
  last,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const body = (
    <View style={[styles.row, !last ? { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border } : null]}>
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.dangerSoft : colors.surfaceMuted }]}>
        <Icon name={icon} size={17} color={danger ? colors.danger : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" color={danger ? 'danger' : 'text'}>
          {label}
        </Txt>
        {detail ? (
          <Txt variant="footnote" color="textMuted">
            {detail}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color="textFaint" /> : null)}
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} scaleTo={0.99} accessibilityLabel={label}>
      {body}
    </PressableScale>
  ) : (
    body
  );
}

/** The app's switch colours on every platform. */
export function SettingsSwitch({ value, onValueChange, label }: { value: boolean; onValueChange: (value: boolean) => void; label?: string }) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={label}
      trackColor={{ true: colors.primary, false: colors.borderStrong }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.borderStrong}
      // react-native-web reads these instead of thumbColor/trackColor.
      {...({ activeThumbColor: '#FFFFFF', activeTrackColor: colors.primary } as object)}
    />
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 8, marginLeft: 4 },
  group: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 58 },
  rowIcon: { width: 32, height: 32, borderRadius: radius.xs, alignItems: 'center', justifyContent: 'center' },
});
