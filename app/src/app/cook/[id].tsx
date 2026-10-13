import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent, type ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet } from '@/components/ui/Sheet';
import { Txt } from '@/components/ui/Text';
import type { Step } from '@/data/types';
import { StepCard } from '@/features/cook/StepCard';
import { useNarrator } from '@/features/cook/useNarrator';
import { useStepTimer, type StepTimer } from '@/features/cook/useStepTimer';
import { useVoiceCommands, type VoiceState } from '@/features/cook/useVoiceCommands';
import { YouTubeStage } from '@/features/cook/YouTubeStage';
import { t } from '@/i18n';
import { joinList } from '@/i18n/format';
import { formatClock, formatQuantity } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { VOICE_HELP, type VoiceCommand } from '@/lib/voice';
import { useLibrary, useRecipe } from '@/state/library';
import { useSettings } from '@/state/settings';
import { toast } from '@/state/toast';
import { GUTTER, radius, stage } from '@/theme';

const VOICE_LABEL: Record<VoiceState, string> = {
  off: t('cook.voiceState.off'),
  starting: t('cook.voiceState.starting'),
  listening: t('cook.voiceState.listening'),
  paused: t('cook.voiceState.paused'),
  denied: t('cook.voiceState.denied'),
  unavailable: t('cook.voiceState.unavailable'),
};

function narrationFor(step: Step) {
  return step.narration ?? t('speech.titleAndInstruction', { title: step.title, instruction: step.instruction });
}

function PulseDot({ active }: { active: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = active ? withRepeat(withTiming(1.8, { duration: 900 }), -1, true) : 1;
  }, [active, scale]);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: active ? 2 - scale.value : 0 }));
  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.pulseRing, ring]} />
      <View style={[styles.pulseDot, { backgroundColor: active ? stage.accent : stage.textFaint }]} />
    </View>
  );
}

function Control({ icon, label, onPress, size = 52, primary }: { icon: IconName; label: string; onPress: () => void; size?: number; primary?: boolean }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="tap"
      scaleTo={0.9}
      accessibilityLabel={label}
      style={[styles.control, { width: size, height: size, borderRadius: size / 2, backgroundColor: primary ? stage.primary : stage.surface }]}
    >
      <Icon name={icon} size={Math.round(size * 0.44)} color="#FFFFFF" />
    </PressableScale>
  );
}

const NO_STEPS: Step[] = [];

export default function Cook() {
  useKeepAwake();
  const { id, servings: servingsParam } = useLocalSearchParams<{ id: string; servings?: string }>();
  const recipe = useRecipe(id);
  const update = useLibrary((s) => s.update);
  const markCooked = useLibrary((s) => s.markCooked);
  const insets = useSafeAreaInsets();
  const { width, height: screenHeight } = useWindowDimensions();
  const settings = useSettings();

  const steps = recipe?.steps ?? NO_STEPS;
  const total = steps.length;
  const yt = recipe?.youtube ?? null;
  const isShort = !!yt?.isShort;
  const autoNarrate = isShort || settings.autoNarrate;
  const servings = Number(servingsParam) || recipe?.servings || 1;
  const factor = recipe ? servings / Math.max(1, recipe.servings) : 1;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [userMuted, setUserMuted] = useState(false);
  const [restart, setRestart] = useState(0);
  const [clipProgress, setClipProgress] = useState(0);
  const [pagerHeight, setPagerHeight] = useState(0);
  const [voiceOn, setVoiceOn] = useState(settings.voiceControl);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(recipe?.rating ?? null);
  const listRef = useRef<FlatList<Step | 'done'>>(null);

  const narrator = useNarrator(settings.speechRate);
  const onTimerDone = useCallback(
    (timer: StepTimer) => {
      haptics.warning();
      narrator.speak(t('speech.timerDone', { label: timer.label }));
      toast(t('cook.timer.doneToast', { label: timer.label }), { tone: 'success', durationMs: 5000 });
    },
    [narrator],
  );
  const timers = useStepTimer(onTimerDone);

  const step = index < total ? steps[index] : undefined;
  const pages = useMemo<(Step | 'done')[]>(() => [...steps, 'done'], [steps]);

  // Video sizing: Shorts are tall and centred; regular videos span the width at 16:9.
  const videoWidth = isShort ? Math.round(Math.min(screenHeight * 0.44, (width - 48) * (16 / 9)) * (9 / 16)) : width - 32;
  const videoHeight = isShort ? Math.round((videoWidth * 16) / 9) : Math.round((videoWidth * 9) / 16);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total, next));
      if (clamped === index) return;
      haptics.select();
      setIndex(clamped);
      setClipProgress(0);
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
    },
    [index, total],
  );

  // Speak each step as it arrives (always for Shorts — their clips are muted under the voice).
  useEffect(() => {
    if (!step) {
      narrator.stop();
      return;
    }
    if (autoNarrate) narrator.speak(narrationFor(step));
    // Narrate on step change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const readIngredients = useCallback(() => {
    if (!recipe) return;
    const list = joinList(
      recipe.ingredients
        .filter((i) => !i.optional)
        .map((i) => {
          const amount = formatQuantity(i.quantity === null ? null : i.quantity * factor, i.unit);
          return amount ? t('speech.ingredientAmount', { amount, name: i.name }) : i.name;
        }),
    );
    narrator.speak(t('speech.youNeed', { list }));
    setShowIngredients(true);
  }, [recipe, factor, narrator]);

  const startTimer = useCallback(
    (s: Step) => {
      if (!s.durationSec) return;
      if (timers.timer?.stepId === s.id && !timers.timer.done) {
        if (timers.timer.running) timers.pause();
        else timers.resume();
        return;
      }
      haptics.press();
      timers.start(s.id, s.title, s.durationSec);
      toast(t('cook.timer.started', { time: formatClock(s.durationSec) }));
    },
    [timers],
  );

  const onCommand = useCallback(
    (command: VoiceCommand) => {
      switch (command) {
        case 'next':
          go(index + 1);
          break;
        case 'previous':
          go(index - 1);
          break;
        case 'pause':
          setPlaying(false);
          narrator.stop();
          break;
        case 'play':
          setPlaying(true);
          break;
        case 'repeat':
          setPlaying(true);
          setRestart((r) => r + 1);
          if (step && autoNarrate) narrator.speak(narrationFor(step));
          break;
        case 'read':
          if (step) narrator.speak(step.tip ? t('speech.instructionWithTip', { instruction: step.instruction, tip: step.tip }) : step.instruction);
          break;
        case 'ingredients':
          readIngredients();
          break;
        case 'timer':
          if (step?.durationSec) startTimer(step);
          else toast(t('cook.timer.noTimer'));
          break;
        case 'stopTimer':
          timers.cancel();
          break;
        case 'exit':
          router.back();
          break;
        case 'help':
          setShowHelp(true);
          break;
      }
    },
    [go, index, narrator, step, autoNarrate, readIngredients, startTimer, timers],
  );

  const voice = useVoiceCommands({ enabled: voiceOn, paused: narrator.speaking, onCommand });

  // FlatList requires a stable onViewableItemsChanged.
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index !== null && first?.index !== undefined) setIndex((current) => (current === first.index ? current : first.index!));
  }, []);

  if (!recipe) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 80, alignItems: 'center' }]}>
        <Txt variant="title2" color={stage.text}>
          {t('cook.notFound')}
        </Txt>
        <Button label={t('common.actions.close')} variant="secondary" style={{ marginTop: 20 }} onPress={() => router.back()} />
      </View>
    );
  }

  const muted = userMuted || narrator.speaking;
  const finished = index >= total;

  const finish = () => {
    markCooked(recipe.id);
    if (rating !== null) update(recipe.id, { rating });
    haptics.success();
    toast(t('cook.done.toast'), { tone: 'success' });
    router.back();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <IconButton icon="close" label={t('cook.top.close')} variant="stage" onPress={() => router.back()} />
        <View style={styles.segments} accessibilityLabel={t('cook.top.stepOf', { current: Math.min(index + 1, total), total })}>
          {steps.map((s, i) => {
            const fill = i < index ? 1 : i === index ? (yt && s.clip ? clipProgress : 1) : 0;
            return (
              <View key={s.id} style={styles.segment}>
                <View style={[styles.segmentFill, { width: `${fill * 100}%`, backgroundColor: i === index ? stage.primary : '#FFFFFF' }]} />
              </View>
            );
          })}
        </View>
        <PressableScale
          onPress={() => (voice.state === 'off' || voice.state === 'denied' ? setVoiceOn(true) : setVoiceOn(false))}
          onLongPress={() => setShowHelp(true)}
          style={styles.voicePill}
          accessibilityLabel={t('cook.top.voiceControl', { state: VOICE_LABEL[voice.state] })}
        >
          {voice.state === 'off' || voice.state === 'denied' || voice.state === 'unavailable' ? (
            <Icon name="mic-off-outline" size={15} color={stage.textMuted} />
          ) : (
            <PulseDot active={voice.state === 'listening'} />
          )}
          <Txt variant="caption" color={stage.text}>
            {VOICE_LABEL[voice.state]}
          </Txt>
        </PressableScale>
        <IconButton icon="list" label={t('cook.top.ingredients')} variant="stage" onPress={() => setShowIngredients(true)} />
      </View>

      {voice.heard ? (
        <Animated.View key={voice.heard.at} entering={FadeIn.duration(120)} exiting={FadeOut.duration(300)} style={styles.heard}>
          <Icon name="mic" size={13} color={stage.accent} />
          <Txt variant="caption" color={stage.text}>
            {t('cook.heard', { text: voice.heard.text.trim() })}
          </Txt>
        </Animated.View>
      ) : null}

      {yt ? (
        <View style={styles.stageArea}>
          {step?.clip && !videoError ? (
            <YouTubeStage
              videoId={yt.videoId}
              clip={step.clip}
              playing={playing && !finished}
              muted={muted}
              width={videoWidth}
              height={videoHeight}
              restartToken={restart}
              onProgress={setClipProgress}
              onError={setVideoError}
            />
          ) : (
            <View style={[styles.poster, { width: videoWidth, height: videoHeight }]}>
              <Image source={{ uri: yt.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={[StyleSheet.absoluteFill, styles.posterShade]}>
                <Txt variant="footnote" color={stage.text} align="center">
                  {videoError ?? (finished ? t('cook.video.allDone') : t('cook.video.noClip'))}
                </Txt>
              </View>
            </View>
          )}
          <View style={styles.clipRow}>
            <Txt variant="caption" color={stage.textFaint}>
              {step?.clip ? t('cook.video.looping', { start: formatClock(step.clip.startSec), end: formatClock(step.clip.endSec) }) : yt.channel ?? 'YouTube'}
            </Txt>
            {isShort ? (
              <View style={styles.narrationTag}>
                <Icon name="volume-high" size={12} color={stage.ai} />
                <Txt variant="caption" color={stage.ai}>
                  {t('cook.video.aiNarration')}
                </Txt>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={{ flex: 1 }} onLayout={(e: LayoutChangeEvent) => setPagerHeight(Math.round(e.nativeEvent.layout.height))}>
        {pagerHeight > 0 ? (
          <FlatList
            ref={listRef}
            data={pages}
            keyExtractor={(item) => (item === 'done' ? 'done' : item.id)}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            getItemLayout={(_, i) => ({ length: pagerHeight, offset: pagerHeight * i, index: i })}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item, index: i }) =>
              item === 'done' ? (
                <View style={[styles.done, { height: pagerHeight }]}>
                  <Animated.View entering={FadeInDown.springify().damping(16)} style={{ alignItems: 'center' }}>
                    <Txt style={{ fontSize: 64, lineHeight: 76 }}>🎉</Txt>
                    <Txt variant="title1" color={stage.text} align="center">
                      {t('cook.done.title')}
                    </Txt>
                    <Txt variant="body" color={stage.textMuted} align="center" style={{ marginTop: 6, maxWidth: 300 }}>
                      {t('cook.done.subtitle', { title: recipe.title })}
                    </Txt>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <PressableScale key={n} haptic="select" scaleTo={0.85} onPress={() => setRating(rating === n ? null : n)} accessibilityLabel={t('cook.done.stars', { count: n })}>
                          <Icon name={(rating ?? 0) >= n ? 'star' : 'star-outline'} size={36} color={(rating ?? 0) >= n ? stage.saffron : stage.textFaint} />
                        </PressableScale>
                      ))}
                    </View>
                    <Button label={t('cook.done.finish')} icon="checkmark" onPress={finish} style={{ marginTop: 26, minWidth: 220 }} />
                  </Animated.View>
                </View>
              ) : (
                <StepCard
                  step={item}
                  index={i}
                  total={total}
                  height={pagerHeight}
                  compact={!!yt}
                  emoji={recipe.emoji}
                  timer={timers.timer}
                  onStartTimer={startTimer}
                />
              )
            }
          />
        ) : null}
      </View>

      {timers.timer ? (
        <Animated.View entering={FadeInDown} style={styles.timerPill}>
          <Icon name={timers.timer.done ? 'alarm' : 'timer-outline'} size={18} color={timers.timer.done ? stage.primary : stage.saffron} />
          <View style={{ flex: 1 }}>
            <Txt variant="headline" color={stage.text}>
              {timers.timer.done ? t('cook.timer.timesUp') : formatClock(timers.timer.remaining)}
            </Txt>
            <Txt variant="caption" color={stage.textMuted} numberOfLines={1}>
              {timers.timer.label}
            </Txt>
          </View>
          {!timers.timer.done ? (
            <IconButton
              icon={timers.timer.running ? 'pause' : 'play'}
              label={timers.timer.running ? t('cook.timer.pause') : t('cook.timer.resume')}
              variant="stage"
              size={36}
              onPress={timers.timer.running ? timers.pause : timers.resume}
            />
          ) : null}
          <IconButton icon="close" label={t('cook.timer.cancel')} variant="stage" size={36} onPress={timers.cancel} />
        </Animated.View>
      ) : null}

      <View style={[styles.controls, { paddingBottom: insets.bottom + 12 }]}>
        <Control icon="chevron-up" label={t('cook.controls.previous')} onPress={() => go(index - 1)} />
        <Control icon="refresh" label={t('cook.controls.replay')} onPress={() => onCommand('repeat')} />
        <Control
          icon={playing ? 'pause' : 'play'}
          label={playing ? t('cook.controls.pause') : t('cook.controls.play')}
          size={68}
          primary
          onPress={() => {
            if (playing) narrator.stop();
            setPlaying(!playing);
          }}
        />
        {yt ? (
          <Control icon={userMuted ? 'volume-mute' : 'volume-high'} label={userMuted ? t('cook.controls.unmute') : t('cook.controls.mute')} onPress={() => setUserMuted(!userMuted)} />
        ) : (
          <Control
            icon={narrator.speaking ? 'stop' : 'volume-high'}
            label={narrator.speaking ? t('cook.controls.stopReading') : t('cook.controls.readAloud')}
            onPress={() => (narrator.speaking ? narrator.stop() : onCommand('read'))}
          />
        )}
        <Control icon="chevron-down" label={t('cook.controls.next')} onPress={() => go(index + 1)} />
      </View>

      <Sheet visible={showIngredients} onClose={() => setShowIngredients(false)} title={t('cook.ingredients.title')} subtitle={t('cook.ingredients.forServings', { count: servings })}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 12 }} style={{ maxHeight: 460 }}>
          {recipe.ingredients.map((ing) => (
            <View key={ing.id} style={styles.ingRow}>
              <Txt variant="bodyStrong" style={{ width: 96 }}>
                {formatQuantity(ing.quantity === null ? null : ing.quantity * factor, ing.unit) || '—'}
              </Txt>
              <Txt variant="body" style={{ flex: 1 }}>
                {ing.name}
                {ing.note ? <Txt variant="footnote" color="textMuted">{`  ${ing.note}`}</Txt> : null}
              </Txt>
            </View>
          ))}
          <Button label={t('cook.ingredients.readAloud')} icon="volume-high-outline" variant="secondary" size="md" style={{ marginTop: 14 }} onPress={readIngredients} />
        </ScrollView>
      </Sheet>

      <Sheet visible={showHelp} onClose={() => setShowHelp(false)} title={t('cook.help.title')} subtitle={t('cook.help.subtitle')}>
        <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
          {VOICE_HELP.map((h) => (
            <View key={h.say} style={styles.helpRow}>
              <Txt variant="bodyStrong" style={{ width: 150 }}>
                {h.say}
              </Txt>
              <Txt variant="subhead" color="textMuted" style={{ flex: 1 }}>
                {h.does}
              </Txt>
            </View>
          ))}
          {voice.state === 'denied' ? (
            <Txt variant="footnote" color="danger">
              {t('cook.help.micBlocked')}
            </Txt>
          ) : null}
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: stage.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 10 },
  segments: { flex: 1, flexDirection: 'row', gap: 3 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  segmentFill: { height: '100%', borderRadius: 2 },
  voicePill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: stage.surface },
  pulseWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: stage.accent },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  heard: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(82,183,136,0.2)',
  },
  stageArea: { alignItems: 'center', paddingTop: 4 },
  poster: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  posterShade: { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  clipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 4 },
  narrationTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 22, borderRadius: radius.pill, backgroundColor: 'rgba(155,140,255,0.15)' },
  done: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  stars: { flexDirection: 'row', gap: 10, marginTop: 20 },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: stage.border,
  },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingTop: 10, paddingHorizontal: 12 },
  control: { alignItems: 'center', justifyContent: 'center' },
  ingRow: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  helpRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
