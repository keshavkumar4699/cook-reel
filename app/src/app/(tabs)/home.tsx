import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditsPill } from '@/components/CreditsPill';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Txt } from '@/components/ui/Text';
import type { Persona, Recipe } from '@/data/types';
import { firstName, greeting } from '@/lib/format';
import { withAccount } from '@/lib/gates';
import { isHighProtein, isQuick } from '@/lib/recipes';
import { useTabBarSpace } from '@/lib/useBottomSpace';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';
import { fonts, GUTTER, radius, shadow, useTheme } from '@/theme';

const PROMPTS = [
  { label: 'High-protein dinner', emoji: '💪' },
  { label: '15-min breakfast', emoji: '⚡' },
  { label: 'Cosy dal for one', emoji: '🍲' },
  { label: 'Use up leftovers', emoji: '♻️' },
  { label: 'Cheap & filling', emoji: '💸' },
  { label: 'Impress a date', emoji: '🕯️' },
];

type ActionKey = 'youtube' | 'builder' | 'fridge' | 'manual';
type SectionKey = 'cookLater' | 'quick' | 'experiments' | 'recent';

function ordered<T extends string>(base: T[], personas: Persona[], boosts: Partial<Record<Persona, T>>): T[] {
  const boosted = personas.map((p) => boosts[p]).filter((k): k is T => !!k);
  return [...new Set([...boosted, ...base])];
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { colors, isDark } = useTheme();
  const [prompt, setPrompt] = useState('');
  const user = useSession((s) => s.user);
  const signedIn = useSession((s) => s.status === 'signedIn');
  const guestName = useProfile((s) => s.guestName);
  const personas = useProfile((s) => s.personas);
  const recipesMap = useLibrary((s) => s.recipes);
  const dismissedTips = useSettings((s) => s.dismissedTips);
  const dismissTip = useSettings((s) => s.dismissTip);

  const recipes = useMemo(() => Object.values(recipesMap).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [recipesMap]);
  const name = firstName(user?.name ?? guestName);

  const sections = useMemo(() => {
    const data: Record<SectionKey, { title: string; subtitle: string; items: Recipe[] }> = {
      cookLater: { title: 'Cook later', subtitle: 'Saved for when you’re hungry', items: recipes.filter((r) => r.cookLater) },
      quick: {
        title: 'Quick & high-protein',
        subtitle: 'Fast plates that keep you full',
        items: recipes.filter((r) => isQuick(r) || isHighProtein(r)),
      },
      experiments: { title: 'Your experiments', subtitle: 'Twists you created with Chef', items: recipes.filter((r) => !!r.parentId) },
      recent: { title: 'Recently added', subtitle: 'Fresh in your library', items: recipes.slice(0, 10) },
    };
    const order = ordered<SectionKey>(['cookLater', 'quick', 'experiments', 'recent'], personas, {
      saver: 'cookLater',
      quick: 'quick',
      fitness: 'quick',
      creator: 'experiments',
    });
    return order.map((key) => ({ key, ...data[key] })).filter((s) => s.items.length > 0);
  }, [recipes, personas]);

  const actions = useMemo(() => {
    const all: Record<ActionKey, { title: string; body: string; icon: IconName; tint: string; bg: string; go: () => void }> = {
      youtube: {
        title: 'From YouTube',
        body: 'Video → step reels',
        icon: 'logo-youtube',
        tint: colors.youtube,
        bg: colors.primarySoft,
        go: () => withAccount('/youtube'),
      },
      builder: { title: 'Create with Chef', body: 'Describe any dish', icon: 'sparkles', tint: colors.ai, bg: colors.aiSoft, go: () => withAccount('/builder') },
      fridge: {
        title: 'From my fridge',
        body: 'Use what you have',
        icon: 'mci:fridge-outline',
        tint: colors.accent,
        bg: colors.accentSoft,
        go: () => withAccount('/builder?mode=fridge'),
      },
      manual: { title: 'Write my own', body: 'Family favourites', icon: 'create-outline', tint: colors.saffron, bg: colors.saffronSoft, go: () => router.push('/edit-recipe') },
    };
    return ordered<ActionKey>(['youtube', 'builder', 'fridge', 'manual'], personas, {
      saver: 'youtube',
      fridge: 'fridge',
      creator: 'builder',
    }).map((key) => ({ key, ...all[key] }));
  }, [colors, personas]);

  const ask = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setPrompt('');
    withAccount(`/builder?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: bottom }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Txt variant="subhead" color="textMuted">
              {greeting()}
              {name ? ',' : ''}
            </Txt>
            <Txt variant="title1">{name ? `${name} 👋` : 'What’s cooking? 👋'}</Txt>
          </View>
          <CreditsPill />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(18)} style={styles.gutter}>
          <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark ? shadow(colors, 2) : null]}>
            <View style={styles.composerHead}>
              <View style={[styles.sparkle, { backgroundColor: colors.aiSoft }]}>
                <Icon name="sparkles" size={16} color={colors.ai} />
              </View>
              <Txt variant="headline">What are we cooking today?</Txt>
            </View>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceMuted }]}>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="e.g. spicy paneer, 20 minutes, no oven"
                placeholderTextColor={colors.textFaint}
                style={[styles.input, { color: colors.text, fontFamily: fonts.medium }]}
                returnKeyType="send"
                onSubmitEditing={() => ask(prompt)}
                accessibilityLabel="Describe what you want to cook"
              />
              <IconButton icon="arrow-up" label="Ask Chef" variant="primary" size={36} iconSize={18} onPress={() => ask(prompt)} disabled={!prompt.trim()} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prompts} keyboardShouldPersistTaps="handled">
              {PROMPTS.map((p) => (
                <Chip key={p.label} label={p.label} emoji={p.emoji} size="sm" onPress={() => ask(p.label)} />
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(18)} style={[styles.gutter, styles.grid]}>
          {actions.map((a) => (
            <PressableScale
              key={a.key}
              onPress={a.go}
              haptic="press"
              accessibilityLabel={a.title}
              style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <Icon name={a.icon} size={22} color={a.tint} />
              </View>
              <Txt variant="headline" numberOfLines={1}>
                {a.title}
              </Txt>
              <Txt variant="footnote" color="textMuted" numberOfLines={1}>
                {a.body}
              </Txt>
            </PressableScale>
          ))}
        </Animated.View>

        {!signedIn ? (
          <Animated.View entering={FadeInDown.delay(160).springify().damping(18)} style={styles.gutter}>
            <Card tone="ai" style={styles.unlock}>
              <View style={{ flex: 1, gap: 4 }}>
                <Badge label="Free credits" icon="flash" tone="ai" />
                <Txt variant="title3">Unlock Chef & YouTube reels</Txt>
                <Txt variant="footnote" color="textMuted">
                  Create a free account to use AI — your first recipes are on us.
                </Txt>
              </View>
              <Button label="Sign up" variant="ai" size="sm" onPress={() => router.push('/sign-in')} />
            </Card>
          </Animated.View>
        ) : null}

        {sections.map((section, index) => (
          <Animated.View key={section.key} entering={FadeInDown.delay(200 + index * 60).springify().damping(18)} style={styles.section}>
            <SectionHeader
              title={section.title}
              subtitle={section.subtitle}
              action={section.items.length > 3 ? 'See all' : undefined}
              onAction={() => router.push({ pathname: '/library', params: { filter: section.key } })}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel} decelerationRate="fast" snapToInterval={188}>
              {section.items.slice(0, 12).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} width={176} />
              ))}
            </ScrollView>
          </Animated.View>
        ))}

        {!dismissedTips.includes('voice') ? (
          <View style={[styles.gutter, { marginTop: 28 }]}>
            <Card tone="saffron" style={styles.tip}>
              <Txt style={{ fontSize: 28, lineHeight: 34 }}>🎙️</Txt>
              <View style={{ flex: 1 }}>
                <Txt variant="headline">Cook hands-free</Txt>
                <Txt variant="footnote" color="textMuted">
                  In cooking mode, say “next”, “back” or “stop” — no more tapping with messy hands.
                </Txt>
              </View>
              <IconButton icon="close" label="Dismiss tip" variant="ghost" size={30} iconSize={16} onPress={() => dismissTip('voice')} />
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER, marginBottom: 18, gap: 12 },
  gutter: { paddingHorizontal: GUTTER },
  composer: { borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12 },
  composerHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sparkle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, paddingLeft: 14, paddingRight: 6, height: 50, gap: 8 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  prompts: { gap: 8, paddingRight: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  action: { width: '48%', flexGrow: 1, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 2 },
  actionIcon: { width: 42, height: 42, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  unlock: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  section: { marginTop: 30 },
  carousel: { paddingHorizontal: GUTTER, gap: 12, paddingBottom: 6 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
