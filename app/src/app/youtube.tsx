import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditsPill } from '@/components/CreditsPill';
import { RecipePreviewCard } from '@/components/recipe/RecipePreviewCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { Txt } from '@/components/ui/Text';
import type { ApiRecipe } from '@/data/types';
import { t } from '@/i18n';
import { api, ApiError, type ImportStatus } from '@/lib/api';
import { importErrorMessage, LocalizedError } from '@/lib/errors';
import { formatClock } from '@/lib/format';
import { handleApiError } from '@/lib/gates';
import { haptics } from '@/lib/haptics';
import { usePricing } from '@/lib/pricing';
import { fromApiRecipe } from '@/lib/recipes';
import { fetchVideoPreview, findYouTubeUrl, parseYouTubeUrl, type VideoPreview } from '@/lib/youtube';
import { useImports } from '@/state/imports';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';

type Phase = { kind: 'idle' } | { kind: 'working'; status: ImportStatus } | { kind: 'done'; recipe: ApiRecipe; cached: boolean } | { kind: 'failed'; message: string };

const STAGES: { status: ImportStatus[]; icon: IconName; title: string; body: string }[] = [
  { status: ['queued', 'watching'], icon: 'eye-outline', title: t('youtube.stages.watching.title'), body: t('youtube.stages.watching.body') },
  { status: ['writing'], icon: 'create-outline', title: t('youtube.stages.writing.title'), body: t('youtube.stages.writing.body') },
  { status: ['done'], icon: 'checkmark-done', title: t('youtube.stages.nutrition.title'), body: t('youtube.stages.nutrition.body') },
];

const stageIndex = (status: ImportStatus) => (status === 'done' ? 3 : status === 'writing' ? 1 : 0);

function ProgressBar({ status }: { status: ImportStatus }) {
  const { colors } = useTheme();
  const progress = useSharedValue(0.04);
  useEffect(() => {
    const target = status === 'done' ? 1 : status === 'writing' ? 0.82 : 0.55;
    progress.value = withTiming(target, { duration: status === 'done' ? 400 : 22000, easing: Easing.out(Easing.cubic) });
  }, [status, progress]);
  const style = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={[styles.bar, { backgroundColor: colors.surfaceMuted }]}>
      <Animated.View style={[styles.barFill, style]}>
        <LinearGradient colors={['#FF8A5B', '#E2552D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

export default function YouTubeImport() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const pricing = usePricing();
  const profile = useProfile((s) => s.profile);
  const save = useLibrary((s) => s.save);
  const setBalance = useSession((s) => s.setBalance);
  const active = useImports((s) => s.active);
  const setActive = useImports((s) => s.setActive);

  const [url, setUrl] = useState(active?.url ?? '');
  const [fetched, setFetched] = useState<{ videoId: string; preview: VideoPreview | null } | null>(null);
  const [phase, setPhase] = useState<Phase>(active ? { kind: 'working', status: 'queued' } : { kind: 'idle' });
  const [starting, setStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const video = useMemo(() => parseYouTubeUrl(url), [url]);
  const cost = video?.isShort ? pricing.costs.youtubeShort : pricing.costs.youtube;

  // Only show details that belong to the link currently in the box.
  const preview = video && fetched?.videoId === video.videoId ? fetched.preview : null;

  useEffect(() => {
    if (!video) return;
    const controller = new AbortController();
    void fetchVideoPreview(video, controller.signal).then((p) => {
      if (!controller.signal.aborted) setFetched({ videoId: video.videoId, preview: p });
    });
    return () => controller.abort();
  }, [video]);

  useEffect(() => {
    if (active && phase.kind === 'working') poll(active.jobId);
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
    // Resume a job that was running when the screen was last closed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function poll(jobId: string, attempt = 0) {
    pollRef.current = setTimeout(async () => {
      try {
        const job = await api.importStatus(jobId);
        if (job.balance) setBalance(job.balance);
        if (job.status === 'done' && job.recipe) {
          haptics.success();
          setActive(null);
          setPhase({ kind: 'done', recipe: job.recipe, cached: false });
          return;
        }
        if (job.status === 'failed') {
          haptics.error();
          setActive(null);
          setPhase({ kind: 'failed', message: importErrorMessage(job.errorCode) });
          return;
        }
        setPhase({ kind: 'working', status: job.status });
        poll(jobId, attempt + 1);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setActive(null);
          setPhase({ kind: 'failed', message: t('youtube.errors.expired') });
          return;
        }
        // Transient network trouble: back off and keep trying.
        poll(jobId, attempt + 1);
      }
    }, Math.min(2500 + attempt * 250, 6000));
  }

  async function start() {
    if (!video || starting) return;
    setStarting(true);
    try {
      const res = await api.startImport({ url: video.url, profile: { region: profile.region, currency: profile.currency, units: profile.units } });
      if (res.balance) setBalance(res.balance);
      if (res.status === 'done' && res.recipe) {
        haptics.success();
        setPhase({ kind: 'done', recipe: res.recipe, cached: res.cached });
        return;
      }
      if (!res.id) throw new LocalizedError(t('youtube.errors.notStarted'));
      void useSession.getState().refresh();
      setActive({ jobId: res.id, url: video.url, isShort: video.isShort, startedAt: Date.now() });
      setPhase({ kind: 'working', status: res.status });
      poll(res.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      setStarting(false);
    }
  }

  const keep = (recipe: ApiRecipe, cookNow: boolean) => {
    const saved = save(fromApiRecipe(recipe, { cookLater: !cookNow }));
    haptics.success();
    toast(cookNow ? t('youtube.done.savedCookNow') : t('youtube.done.savedForLater'), { tone: 'success' });
    if (cookNow) router.replace(`/cook/${saved.id}`);
    else router.replace(`/recipe/${saved.id}`);
  };

  const paste = async () => {
    const text = await Clipboard.getStringAsync().catch(() => '');
    const found = findYouTubeUrl(text);
    if (found) setUrl(found.isShort ? `https://youtube.com/shorts/${found.videoId}` : found.url);
    else toast(t('youtube.intro.noLinkOnClipboard'));
  };

  return (
    <Screen>
      <TopBar title={t('youtube.title')} right={<CreditsPill />} leading="close" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          {phase.kind === 'idle' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <Txt variant="title1">{t('youtube.intro.title')}</Txt>
              <Txt variant="body" color="textMuted" style={{ marginTop: 8 }}>
                {t('youtube.intro.body')}
              </Txt>

              <TextField
                containerStyle={{ marginTop: 22 }}
                icon="link"
                placeholder={t('youtube.intro.placeholder')}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={() => void start()}
                error={url.trim() && !video ? t('youtube.intro.invalidLink') : null}
                trailing={!url ? <Button label={t('youtube.intro.paste')} size="sm" variant="soft" onPress={() => void paste()} /> : null}
              />

              {video ? (
                <Animated.View entering={FadeIn.duration(250)}>
                  <Card style={styles.preview} padded={false}>
                    <Image
                      source={{ uri: video.thumbnailUrl }}
                      style={[styles.thumb, video.isShort ? styles.thumbShort : null]}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={{ padding: 14, gap: 6 }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Badge label={video.isShort ? t('youtube.preview.short') : t('youtube.preview.video')} icon="logo-youtube" tone="youtube" />
                        <Badge label={t('youtube.preview.usesCredits', { count: cost })} icon="flash" tone="saffron" />
                      </View>
                      <Txt variant="headline" numberOfLines={2}>
                        {preview?.title ?? t('youtube.preview.loading')}
                      </Txt>
                      {preview?.channel ? (
                        <Txt variant="footnote" color="textMuted">
                          {preview.channel}
                        </Txt>
                      ) : null}
                    </View>
                  </Card>
                  <Button
                    label={t('youtube.preview.breakItDown')}
                    icon="sparkles"
                    variant="ai"
                    loading={starting}
                    style={{ marginTop: 16 }}
                    onPress={() => void start()}
                    meta={t('common.counts.credits', { count: cost })}
                  />
                  <Txt variant="caption" color="textFaint" align="center" style={{ marginTop: 10 }}>
                    {t('youtube.preview.notCharged')}
                  </Txt>
                </Animated.View>
              ) : (
                <View style={styles.how}>
                  {[
                    { icon: 'link-outline' as IconName, text: t('youtube.how.copyLink') },
                    { icon: 'sparkles-outline' as IconName, text: t('youtube.how.chefBreaksItDown') },
                    { icon: 'mic-outline' as IconName, text: t('youtube.how.handsFree') },
                  ].map((s, i) => (
                    <View key={s.text} style={styles.howRow}>
                      <View style={[styles.howNum, { backgroundColor: colors.primarySoft }]}>
                        <Txt variant="caption" color="primary">
                          {i + 1}
                        </Txt>
                      </View>
                      <Icon name={s.icon} size={18} color="textMuted" />
                      <Txt variant="subhead" color="textMuted" style={{ flex: 1 }}>
                        {s.text}
                      </Txt>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          ) : null}

          {phase.kind === 'working' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <Txt variant="title1">{t('youtube.working.title')}</Txt>
              <Txt variant="body" color="textMuted" style={{ marginTop: 6 }}>
                {t('youtube.working.body')}
              </Txt>
              <View style={{ marginTop: 22 }}>
                <ProgressBar status={phase.status} />
              </View>
              <View style={{ marginTop: 22, gap: 12 }}>
                {STAGES.map((stage, i) => {
                  const current = stageIndex(phase.status);
                  const state = i < current ? 'done' : i === current ? 'active' : 'todo';
                  return (
                    <View key={stage.title} style={[styles.stage, { backgroundColor: colors.surface, borderColor: state === 'active' ? colors.primary : colors.border }]}>
                      <View style={[styles.stageIcon, { backgroundColor: state === 'todo' ? colors.surfaceMuted : state === 'done' ? colors.accentSoft : colors.primarySoft }]}>
                        <Icon name={state === 'done' ? 'checkmark' : stage.icon} size={18} color={state === 'todo' ? colors.textFaint : state === 'done' ? colors.accent : colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Txt variant="headline" color={state === 'todo' ? 'textFaint' : 'text'}>
                          {stage.title}
                        </Txt>
                        <Txt variant="footnote" color="textMuted">
                          {stage.body}
                        </Txt>
                      </View>
                    </View>
                  );
                })}
              </View>
              <Card tone="saffron" style={{ marginTop: 22 }}>
                <Txt variant="footnote">{t('youtube.working.tip')}</Txt>
              </Card>
            </Animated.View>
          ) : null}

          {phase.kind === 'done' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 16 }}>
              <View>
                <Txt variant="title1">{t('youtube.done.title')}</Txt>
                <Txt variant="body" color="textMuted" style={{ marginTop: 6 }}>
                  {phase.cached ? t('youtube.done.cached') : t('youtube.done.stepsWithClips', { count: phase.recipe.steps.length })}
                </Txt>
              </View>
              <RecipePreviewCard recipe={phase.recipe} />
              <Card>
                <Txt variant="overline" color="textMuted" style={{ marginBottom: 8 }}>
                  {t('youtube.done.stepsAndClips')}
                </Txt>
                {phase.recipe.steps.map((s, i) => (
                  <View key={s.id} style={styles.stepLine}>
                    <Txt variant="subheadStrong" style={{ width: 22 }}>
                      {i + 1}
                    </Txt>
                    <Txt variant="subhead" style={{ flex: 1 }} numberOfLines={1}>
                      {s.title}
                    </Txt>
                    {s.clip ? (
                      <Txt variant="caption" color="primary">
                        {formatClock(s.clip.startSec)}–{formatClock(s.clip.endSec)}
                      </Txt>
                    ) : null}
                  </View>
                ))}
              </Card>
              <Button label={t('youtube.done.cookNow')} icon="play" onPress={() => keep(phase.recipe, true)} />
              <Button label={t('youtube.done.saveForLater')} icon="bookmark-outline" variant="secondary" onPress={() => keep(phase.recipe, false)} />
            </Animated.View>
          ) : null}

          {phase.kind === 'failed' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 16 }}>
              <Card tone="primary">
                <Txt style={{ fontSize: 30, lineHeight: 38 }}>😕</Txt>
                <Txt variant="title3" style={{ marginTop: 6 }}>
                  {t('youtube.failed.title')}
                </Txt>
                <Txt variant="subhead" color="textMuted" style={{ marginTop: 4 }}>
                  {phase.message}
                </Txt>
                <Txt variant="footnote" color="accent" style={{ marginTop: 10 }}>
                  {t('youtube.failed.refunded')}
                </Txt>
              </Card>
              <Button label={t('youtube.failed.tryAnother')} icon="refresh" onPress={() => setPhase({ kind: 'idle' })} />
            </Animated.View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: 6 },
  preview: { marginTop: 18, overflow: 'hidden' },
  thumb: { width: '100%', aspectRatio: 16 / 9 },
  thumbShort: { aspectRatio: 4 / 3 },
  how: { marginTop: 26, gap: 14 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  howNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  bar: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  stage: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1.5 },
  stageIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  stepLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
});
