import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Txt } from '@/components/ui/Text';
import type { Step } from '@/data/types';
import { t } from '@/i18n';
import { formatClock } from '@/lib/format';
import { font, lineHeight, radius, stage } from '@/theme';
import type { StepTimer } from './useStepTimer';

export interface StepCardProps {
  step: Step;
  index: number;
  total: number;
  height: number;
  compact: boolean;
  emoji: string;
  timer: StepTimer | null;
  onStartTimer: (step: Step) => void;
}

/** One "reel" page: the instruction set large and calm, readable from arm's length. */
export function StepCard({ step, index, total, height, compact, emoji, timer, onStartTimer }: StepCardProps) {
  const [term, setTerm] = useState<string | null>(null);
  const meaning = step.glossary.find((g) => g.term === term)?.meaning;
  const timerHere = timer?.stepId === step.id;

  return (
    <View style={[styles.page, { height }]}>
      {!compact ? (
        <Txt style={styles.watermark} accessibilityElementsHidden importantForAccessibility="no">
          {emoji}
        </Txt>
      ) : null}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={styles.counter}>
          <Txt variant="hero" color={stage.primary} style={styles.number}>
            {String(index + 1).padStart(2, '0')}
          </Txt>
          <Txt variant="headline" color={stage.textFaint}>
            / {String(total).padStart(2, '0')}
          </Txt>
        </View>
        <Txt variant={compact ? 'title2' : 'title1'} color={stage.text}>
          {step.title}
        </Txt>
        <Txt style={[styles.instruction, compact ? styles.instructionCompact : null]} color={stage.text}>
          {step.instruction}
        </Txt>

        <View style={styles.chips}>
          {step.durationSec ? (
            <PressableScale
              onPress={() => onStartTimer(step)}
              haptic="press"
              accessibilityLabel={t('cook.step.startTimerLabel', { count: Math.round(step.durationSec / 60) })}
              style={[styles.chip, { backgroundColor: 'rgba(245,181,79,0.18)', borderColor: 'rgba(245,181,79,0.5)' }]}
            >
              <Icon name="timer-outline" size={16} color={stage.saffron} />
              <Txt variant="subheadStrong" color={stage.saffron}>
                {timerHere
                  ? timer!.done
                    ? t('cook.step.timerDone')
                    : t('cook.step.timeLeft', { time: formatClock(timer!.remaining) })
                  : t('cook.step.startTimer', { time: formatClock(step.durationSec) })}
              </Txt>
            </PressableScale>
          ) : null}
          {step.glossary.map((g) => (
            <PressableScale
              key={g.term}
              onPress={() => setTerm(term === g.term ? null : g.term)}
              style={[styles.chip, { backgroundColor: term === g.term ? 'rgba(155,140,255,0.25)' : stage.surface, borderColor: 'rgba(155,140,255,0.45)' }]}
              accessibilityLabel={t('cook.step.whatDoesTermMean', { term: g.term })}
            >
              <Icon name="help-circle-outline" size={16} color={stage.ai} />
              <Txt variant="subheadStrong" color={stage.text}>
                {g.term}
              </Txt>
            </PressableScale>
          ))}
        </View>
        {meaning ? (
          <Animated.View entering={FadeIn} style={[styles.box, { backgroundColor: 'rgba(155,140,255,0.14)' }]}>
            <Txt variant="callout" color={stage.text}>
              <Txt variant="callout" color={stage.ai} style={font('bold')}>
                {t('cook.step.glossaryTerm', { term: term ?? '' })}{' '}
              </Txt>
              {meaning}
            </Txt>
          </Animated.View>
        ) : null}

        {step.tip ? (
          <View style={[styles.box, { backgroundColor: 'rgba(245,181,79,0.12)' }]}>
            <Icon name="bulb-outline" size={18} color={stage.saffron} />
            <Txt variant="callout" color={stage.textMuted} style={{ flex: 1 }}>
              {step.tip}
            </Txt>
          </View>
        ) : null}
        {step.doneCue ? (
          <View style={[styles.box, { backgroundColor: 'rgba(82,183,136,0.12)' }]}>
            <Icon name="checkmark-circle-outline" size={18} color={stage.accent} />
            <Txt variant="callout" color={stage.textMuted} style={{ flex: 1 }}>
              <Txt variant="callout" color={stage.accent} style={font('bold')}>
                {t('cook.step.doneWhen')}{' '}
              </Txt>
              {step.doneCue}
            </Txt>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { overflow: 'hidden' },
  watermark: { position: 'absolute', end: -30, bottom: -20, fontSize: 220, lineHeight: 260, opacity: 0.08 },
  scroll: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 24 },
  counter: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 2 },
  number: { fontSize: 52, lineHeight: 58 },
  instruction: { ...font('medium'), fontSize: 21, lineHeight: lineHeight(31), marginTop: 12 },
  instructionCompact: { fontSize: 18, lineHeight: 27, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
  box: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: radius.md, marginTop: 12 },
});
