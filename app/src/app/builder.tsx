import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChefAvatar } from '@/components/ChefAvatar';
import { CreditsPill } from '@/components/CreditsPill';
import { RecipePreviewCard } from '@/components/recipe/RecipePreviewCard';
import { TypingIndicator } from '@/components/TypingIndicator';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { Txt } from '@/components/ui/Text';
import type { ApiRecipe } from '@/data/types';
import { t } from '@/i18n';
import { joinFacts, joinList } from '@/i18n/format';
import { api, type ChatMessage } from '@/lib/api';
import { handleApiError } from '@/lib/gates';
import { haptics } from '@/lib/haptics';
import { newId } from '@/lib/id';
import { usePricing } from '@/lib/pricing';
import { fromApiRecipe, profileForAI } from '@/lib/recipes';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';
import { font, GUTTER, inputReset, radius, useTheme } from '@/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  recipe?: ApiRecipe;
  savedId?: string;
}

const IDEAS = [
  { emoji: '💪', text: t('builder.ideas.quickProtein') },
  { emoji: '🍲', text: t('builder.ideas.cosyDal') },
  { emoji: '💸', text: t('builder.ideas.mealPrep') },
  { emoji: '🕯️', text: t('builder.ideas.dateNight') },
];

const PANTRY_GROUPS: { label: string; items: string[] }[] = [
  {
    label: t('builder.fridge.groups.protein'),
    items: [
      t('builder.fridge.items.eggs'),
      t('builder.fridge.items.paneer'),
      t('builder.fridge.items.chicken'),
      t('builder.fridge.items.tofu'),
      t('builder.fridge.items.chickpeas'),
      t('builder.fridge.items.dal'),
      t('builder.fridge.items.tuna'),
      t('builder.fridge.items.soyaChunks'),
    ],
  },
  {
    label: t('builder.fridge.groups.veg'),
    items: [
      t('builder.fridge.items.onion'),
      t('builder.fridge.items.tomato'),
      t('builder.fridge.items.potato'),
      t('builder.fridge.items.spinach'),
      t('builder.fridge.items.capsicum'),
      t('builder.fridge.items.carrot'),
      t('builder.fridge.items.peas'),
      t('builder.fridge.items.mushroom'),
    ],
  },
  {
    label: t('builder.fridge.groups.carbs'),
    items: [
      t('builder.fridge.items.rice'),
      t('builder.fridge.items.bread'),
      t('builder.fridge.items.pasta'),
      t('builder.fridge.items.oats'),
      t('builder.fridge.items.noodles'),
      t('builder.fridge.items.roti'),
      t('builder.fridge.items.poha'),
    ],
  },
  {
    label: t('builder.fridge.groups.dairy'),
    items: [
      t('builder.fridge.items.milk'),
      t('builder.fridge.items.curd'),
      t('builder.fridge.items.cheese'),
      t('builder.fridge.items.butter'),
      t('builder.fridge.items.peanutButter'),
      t('builder.fridge.items.coconutMilk'),
    ],
  },
];

const THINKING = [t('builder.thinking.start'), t('builder.thinking.balancing'), t('builder.thinking.checking'), t('builder.thinking.writing'), t('builder.thinking.almostReady')];

/** Fewest pantry items fridge mode will send to Chef. */
const MIN_PANTRY_ITEMS = 2;

/** Keeps the request small: the first message plus the most recent turns. */
function toApiMessages(messages: Message[]): ChatMessage[] {
  const list: ChatMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.recipe ? `${m.text}\n\n(Recipe delivered: ${m.recipe.title})` : m.text,
  }));
  if (list.length <= 15) return list;
  const [first, ...rest] = list;
  const tail = rest.slice(-14);
  return tail[0]?.role === 'assistant' ? [first!, ...tail] : [first!, ...tail.slice(1)];
}

export default function Builder() {
  const params = useLocalSearchParams<{ mode?: string; prompt?: string }>();
  const mode: 'describe' | 'fridge' = params.mode === 'fridge' ? 'fridge' : 'describe';
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);
  const profile = useProfile((s) => s.profile);
  const recipes = useLibrary((s) => s.recipes);
  const save = useLibrary((s) => s.save);
  const setBalance = useSession((s) => s.setBalance);
  const pricing = usePricing();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pantry, setPantry] = useState<string[]>([]);
  const [pantryInput, setPantryInput] = useState('');
  const started = messages.length > 0;
  const aiProfile = useMemo(() => profileForAI(profile, Object.values(recipes)), [profile, recipes]);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (params.prompt) void send(params.prompt);
    // Only for the initial prompt passed from Home.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [messages.length, loading]);

  async function request(history: Message[]) {
    setLoading(true);
    setFailed(false);
    abortRef.current = new AbortController();
    try {
      const res = await api.builder(
        { messages: toApiMessages(history), mode, pantry: mode === 'fridge' ? pantry : undefined, profile: aiProfile },
        abortRef.current.signal,
      );
      if (res.kind === 'recipe') {
        haptics.success();
        setBalance(res.balance);
        setMessages((m) => [...m, { id: newId(), role: 'assistant', text: res.message, recipe: res.recipe }]);
      } else {
        setMessages((m) => [...m, { id: newId(), role: 'assistant', text: res.message, suggestions: res.suggestions }]);
      }
    } catch (error) {
      if (abortRef.current?.signal.aborted) return;
      setFailed(true);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    haptics.tap();
    const next = [...messages, { id: newId(), role: 'user' as const, text: value }];
    setMessages(next);
    setInput('');
    await request(next);
  }

  const saveRecipe = (message: Message) => {
    if (!message.recipe || message.savedId) return;
    const saved = save(fromApiRecipe(message.recipe));
    setMessages((m) => m.map((x) => (x.id === message.id ? { ...x, savedId: saved.id } : x)));
    haptics.success();
    toast(t('builder.recipe.saved'), { tone: 'success', action: { label: t('builder.recipe.open'), onPress: () => router.push(`/recipe/${saved.id}`) } });
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <Screen>
      <TopBar
        left={<IconButton icon="chevron-back" label={t('common.actions.back')} onPress={() => router.back()} />}
        right={<CreditsPill />}
        title={mode === 'fridge' ? t('builder.fridge.screenTitle') : t('common.chefName')}
        subtitle={joinFacts([t('builder.subtitle.freeQuestions'), t('builder.subtitle.creditsPerRecipe', { count: pricing.costs.recipe })])}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.thread} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!started && mode === 'describe' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <View style={styles.hero}>
                <ChefAvatar size={64} />
                <Txt variant="title1" align="center" style={{ marginTop: 16 }}>
                  {t('builder.describe.heading')}
                </Txt>
                <Txt variant="body" color="textMuted" align="center" style={{ marginTop: 8 }}>
                  {t('builder.describe.intro')}
                </Txt>
              </View>
              <View style={styles.ideas}>
                {IDEAS.map((idea) => (
                  <PressableScale
                    key={idea.text}
                    onPress={() => void send(idea.text)}
                    style={[styles.idea, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    accessibilityLabel={idea.text}
                  >
                    <Txt style={{ fontSize: 22, lineHeight: 28 }}>{idea.emoji}</Txt>
                    <Txt variant="subheadStrong" style={{ flex: 1 }}>
                      {idea.text}
                    </Txt>
                    <Icon name="arrow-forward" size={16} color="textFaint" />
                  </PressableScale>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {!started && mode === 'fridge' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <Txt variant="title1" style={{ marginTop: 8 }}>
                {t('builder.fridge.heading')}
              </Txt>
              <Txt variant="body" color="textMuted" style={{ marginTop: 6 }}>
                {t('builder.fridge.intro')}
              </Txt>
              <View style={[styles.pantryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {pantry.length ? (
                  <View style={styles.wrap}>
                    {pantry.map((p) => (
                      <Chip key={p} label={p} icon="close" size="sm" selected tone="accent" onPress={() => setPantry(pantry.filter((x) => x !== p))} />
                    ))}
                  </View>
                ) : (
                  <Txt variant="subhead" color="textFaint">
                    {t('builder.fridge.empty')}
                  </Txt>
                )}
                <View style={[styles.pantryInput, { backgroundColor: colors.surfaceMuted }]}>
                  <TextInput
                    value={pantryInput}
                    onChangeText={setPantryInput}
                    placeholder={t('builder.fridge.addPlaceholder')}
                    placeholderTextColor={colors.textFaint}
                    style={[styles.inputText, inputReset, { color: colors.text, ...font('medium') }]}
                    onSubmitEditing={() => {
                      const v = pantryInput.trim();
                      if (v && !pantry.includes(v)) setPantry([...pantry, v]);
                      setPantryInput('');
                    }}
                    returnKeyType="done"
                  />
                </View>
              </View>
              {PANTRY_GROUPS.map((group) => (
                <View key={group.label} style={{ marginTop: 18 }}>
                  <Txt variant="overline" color="textMuted" style={{ marginBottom: 8 }}>
                    {group.label}
                  </Txt>
                  <View style={styles.wrap}>
                    {group.items.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="sm"
                        tone="accent"
                        selected={pantry.includes(item)}
                        onPress={() => setPantry(pantry.includes(item) ? pantry.filter((x) => x !== item) : [...pantry, item])}
                      />
                    ))}
                  </View>
                </View>
              ))}
              <Button
                label={
                  pantry.length < MIN_PANTRY_ITEMS
                    ? t('builder.fridge.pickAtLeast', { count: MIN_PANTRY_ITEMS })
                    : t('builder.fridge.findRecipe', { count: pantry.length })
                }
                icon="sparkles"
                variant="ai"
                disabled={pantry.length < MIN_PANTRY_ITEMS}
                style={{ marginTop: 26 }}
                onPress={() => void send(t('builder.fridge.prompt', { list: joinList(pantry) }))}
              />
            </Animated.View>
          ) : null}

          {messages.map((m) =>
            m.role === 'user' ? (
              <Animated.View key={m.id} entering={FadeInUp.springify().damping(18)} style={[styles.userBubble, { backgroundColor: colors.ink }]}>
                <Txt variant="callout" color={colors.onInk}>
                  {m.text}
                </Txt>
              </Animated.View>
            ) : (
              <Animated.View key={m.id} entering={FadeIn.duration(250)} style={styles.assistantRow}>
                <ChefAvatar size={30} />
                <View style={{ flex: 1, gap: 10 }}>
                  <View style={[styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Txt variant="callout">{m.text}</Txt>
                  </View>
                  {m.recipe ? (
                    <RecipePreviewCard
                      recipe={m.recipe}
                      actions={
                        m.savedId ? (
                          <>
                            <Button label={t('builder.recipe.open')} variant="secondary" size="md" style={{ flex: 1 }} onPress={() => router.push(`/recipe/${m.savedId}`)} />
                            <Button label={t('builder.recipe.cookNow')} icon="play" size="md" style={{ flex: 1 }} onPress={() => router.push(`/cook/${m.savedId}`)} />
                          </>
                        ) : (
                          <Button label={t('builder.recipe.save')} icon="bookmark" size="md" style={{ flex: 1 }} onPress={() => saveRecipe(m)} />
                        )
                      }
                    />
                  ) : null}
                  {m.suggestions?.length && m.id === lastAssistant?.id && !loading ? (
                    <View style={styles.wrap}>
                      {m.suggestions.map((s) => (
                        <Chip key={s} label={s} tone="ai" onPress={() => void send(s)} />
                      ))}
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            ),
          )}

          {loading ? (
            <Animated.View entering={FadeIn} style={styles.assistantRow}>
              <ChefAvatar size={30} />
              <View style={[styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TypingIndicator phrases={THINKING} />
              </View>
            </Animated.View>
          ) : null}

          {failed && !loading ? (
            <Button label={t('common.actions.retry')} variant="secondary" icon="refresh" size="md" style={{ alignSelf: 'center' }} onPress={() => void request(messages)} />
          ) : null}
        </ScrollView>

        {started || mode === 'describe' ? (
          <View style={[styles.composer, { paddingBottom: insets.bottom + 10, backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={started ? t('builder.composer.replyPlaceholder') : t('builder.composer.startPlaceholder')}
                placeholderTextColor={colors.textFaint}
                multiline
                numberOfLines={Platform.OS === 'web' ? 1 : undefined}
                style={[styles.inputText, inputReset, { color: colors.text, ...font('medium'), maxHeight: 110 }]}
                editable={!loading}
                accessibilityLabel={t('builder.composer.label')}
              />
              <IconButton icon="arrow-up" label={t('builder.composer.send')} variant="primary" size={38} iconSize={19} disabled={!input.trim() || loading} onPress={() => void send(input)} />
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  thread: { paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 24, gap: 14 },
  hero: { alignItems: 'center', paddingTop: 12, paddingHorizontal: 8 },
  ideas: { gap: 10, marginTop: 24 },
  idea: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pantryBox: { marginTop: 18, padding: 14, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  pantryInput: { borderRadius: radius.md, paddingHorizontal: 12, height: 44, justifyContent: 'center' },
  userBubble: { alignSelf: 'flex-end', maxWidth: '82%', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 20, borderBottomEndRadius: 6 },
  assistantRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', maxWidth: '100%' },
  assistantBubble: { alignSelf: 'flex-start', maxWidth: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderTopStartRadius: 6, borderWidth: StyleSheet.hairlineWidth },
  composer: { paddingHorizontal: GUTTER, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  inputBox: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, paddingStart: 16, paddingEnd: 6, paddingVertical: 6 },
  inputText: { flex: 1, fontSize: 16, paddingTop: 8, paddingBottom: 8, minHeight: 38 },
});
