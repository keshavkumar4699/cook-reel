import { StyleSheet, View } from 'react-native';
import type { Step } from '@/data/types';
import { t } from '@/i18n';
import { formatClock, formatDuration } from '@/lib/format';
import { font, radius, useTheme } from '@/theme';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { Txt } from '../ui/Text';

export function StepList({ steps }: { steps: Step[] }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.row}>
          <View style={styles.rail}>
            <View style={[styles.num, { backgroundColor: colors.ink }]}>
              <Txt variant="caption" color={colors.onInk}>
                {index + 1}
              </Txt>
            </View>
            {index < steps.length - 1 ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}
          </View>
          <View style={styles.body}>
            <Txt variant="headline">{step.title}</Txt>
            <Txt variant="body" color="textMuted" style={{ marginTop: 4 }}>
              {step.instruction}
            </Txt>
            {step.durationSec || step.clip ? (
              <View style={styles.badges}>
                {step.durationSec ? <Badge label={formatDuration(step.durationSec)} icon="timer-outline" tone="saffron" /> : null}
                {step.clip ? (
                  <Badge label={t('recipe.steps.clipRange', { start: formatClock(step.clip.startSec), end: formatClock(step.clip.endSec) })} icon="play" tone="primary" />
                ) : null}
              </View>
            ) : null}
            {step.tip ? (
              <View style={[styles.note, { backgroundColor: colors.saffronSoft }]}>
                <Icon name="bulb-outline" size={16} color={colors.saffron} />
                <Txt variant="footnote" style={{ flex: 1 }}>
                  {step.tip}
                </Txt>
              </View>
            ) : null}
            {step.doneCue ? (
              <View style={[styles.note, { backgroundColor: colors.accentSoft }]}>
                <Icon name="checkmark-circle-outline" size={16} color={colors.accent} />
                <Txt variant="footnote" style={{ flex: 1 }}>
                  <Txt variant="footnote" color="accent" style={font('bold')}>
                    {t('recipe.steps.doneWhen')}{' '}
                  </Txt>
                  {step.doneCue}
                </Txt>
              </View>
            ) : null}
            {step.glossary.map((g) => (
              <Txt key={g.term} variant="footnote" color="textMuted" style={{ marginTop: 6 }}>
                <Txt variant="footnote" color="ai" style={font('bold')}>
                  {t('recipe.steps.glossaryTerm', { term: g.term })}{' '}
                </Txt>
                {g.meaning}
              </Txt>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: 28 },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 4, borderRadius: 1 },
  body: { flex: 1, paddingBottom: 22 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 10 },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 10, borderRadius: radius.sm, marginTop: 10 },
});
