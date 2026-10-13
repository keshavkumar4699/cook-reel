import { StyleSheet, View } from 'react-native';
import { GUTTER } from '@/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export function SectionHeader({ title, subtitle, action, onAction, inset = true }: { title: string; subtitle?: string; action?: string; onAction?: () => void; inset?: boolean }) {
  return (
    <View style={[styles.row, inset ? { paddingHorizontal: GUTTER } : null]}>
      <View style={{ flex: 1 }}>
        <Txt variant="title3">{title}</Txt>
        {subtitle ? (
          <Txt variant="footnote" color="textMuted">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {action && onAction ? (
        <PressableScale onPress={onAction} hitSlop={10} accessibilityLabel={action}>
          <Txt variant="subheadStrong" color="primary">
            {action}
          </Txt>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 12 },
});
