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
import { api, ApiError, type ImportStatus } from '@/lib/api';
import { formatClock, plural } from '@/lib/format';
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
  { status: ['queued', 'watching'], icon: 'eye-outline', title: 'Watching the video', body: 'Spotting every ingredient and action' },
  { status: ['writing'], icon: 'create-outline', title: 'Writing your steps', body: 'Timing a clip for each step, adding beginner tips' },
  { status: ['done'], icon: 'checkmark-done', title: 'Nutrition & narration', body: 'Calories, macros and read-aloud lines' },
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
          setPhase({ kind: 'failed', message: job.error ?? 'We couldn’t break this video down.' });
          return;
        }
        setPhase({ kind: 'working', status: job.status });
        poll(jobId, attempt + 1);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setActive(null);
          setPhase({ kind: 'failed', message: 'This import expired. Please start it again.' });
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
      if (!res.id) throw new Error('The import did not start. Please try again.');
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
    toast(cookNow ? 'Saved — let’s cook!' : 'Saved to Cook later', { tone: 'success' });
    if (cookNow) router.replace(`/cook/${saved.id}`);
    else router.replace(`/recipe/${saved.id}`);
  };

  const paste = async () => {
    const text = await Clipboard.getStringAsync().catch(() => '');
    const found = findYouTubeUrl(text);
    if (found) setUrl(found.isShort ? `https://youtube.com/shorts/${found.videoId}` : found.url);
    else toast('No YouTube link on your clipboard');
  };

  return (
    <Screen>
      <TopBar title="From YouTube" right={<CreditsPill />} leading="close" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          {phase.kind === 'idle' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <Txt variant="title1">Turn a video into{'\n'}step-by-step reels</Txt>
              <Txt variant="body" color="textMuted" style={{ marginTop: 8 }}>
                Paste any recipe video or Short. Chef watches it, writes the steps and loops the exact clip for each one — Shorts get a voice that explains every step.
              </Txt>

              <TextField
                containerStyle={{ marginTop: 22 }}
                icon="link"
                placeholder="YouTube or Shorts link"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={() => void start()}
                error={url.trim() && !video ? 'That doesn’t look like a YouTube link' : null}
                trailing={!url ? <Button label="Paste" size="sm" variant="soft" onPress={() => void paste()} /> : null}
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
                        <Badge label={video.isShort ? 'Short' : 'Video'} icon="logo-youtube" tone="youtube" />
                        <Badge label={`Uses ${plural(cost, 'credit')}`} icon="flash" tone="saffron" />
                      </View>
                      <Txt variant="headline" numberOfLines={2}>
                        {preview?.title ?? 'Loading video details…'}
                      </Txt>
                      {preview?.channel ? (
                        <Txt variant="footnote" color="textMuted">
                          {preview.channel}
                        </Txt>
                      ) : null}
                    </View>
                  </Card>
                  <Button label="Break it down" icon="sparkles" variant="ai" loading={starting} style={{ marginTop: 16 }} onPress={() => void start()} meta={plural(cost, 'credit')} />
                  <Txt variant="caption" color="textFaint" align="center" style={{ marginTop: 10 }}>
                    Not a recipe video? You won’t be charged.
                  </Txt>
                </Animated.View>
              ) : (
                <View style={styles.how}>
                  {[
                    { icon: 'link-outline' as IconName, text: 'Copy the link from the YouTube app (Share → Copy link)' },
                    { icon: 'sparkles-outline' as IconName, text: 'Chef breaks it into steps with clips, tips and nutrition' },
                    { icon: 'mic-outline' as IconName, text: 'Cook along hands-free: say “next”, “back”, “stop”' },
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
              <Txt variant="title1">Breaking it down…</Txt>
              <Txt variant="body" color="textMuted" style={{ marginTop: 6 }}>
                This usually takes under a minute. You can leave this screen — we’ll keep going.
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
                <Txt variant="footnote">
                  💡 While you wait: in cooking mode, say “repeat” to replay a step’s clip, or “start timer” for timed steps.
                </Txt>
              </Card>
            </Animated.View>
          ) : null}

          {phase.kind === 'done' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 16 }}>
              <View>
                <Txt variant="title1">Ready to cook 🎉</Txt>
                <Txt variant="body" color="textMuted" style={{ marginTop: 6 }}>
                  {phase.cached ? 'Someone already broke this video down — no credits used.' : `${plural(phase.recipe.steps.length, 'step')}, each with its own clip.`}
                </Txt>
              </View>
              <RecipePreviewCard recipe={phase.recipe} />
              <Card>
                <Txt variant="overline" color="textMuted" style={{ marginBottom: 8 }}>
                  Steps & clips
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
              <Button label="Save & start cooking" icon="play" onPress={() => keep(phase.recipe, true)} />
              <Button label="Save for later" icon="bookmark-outline" variant="secondary" onPress={() => keep(phase.recipe, false)} />
            </Animated.View>
          ) : null}

          {phase.kind === 'failed' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 16 }}>
              <Card tone="primary">
                <Txt style={{ fontSize: 30, lineHeight: 38 }}>😕</Txt>
                <Txt variant="title3" style={{ marginTop: 6 }}>
                  That didn’t work
                </Txt>
                <Txt variant="subhead" color="textMuted" style={{ marginTop: 4 }}>
                  {phase.message}
                </Txt>
                <Txt variant="footnote" color="accent" style={{ marginTop: 10 }}>
                  ✓ Your credits were refunded.
                </Txt>
              </Card>
              <Button label="Try another video" icon="refresh" onPress={() => setPhase({ kind: 'idle' })} />
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
