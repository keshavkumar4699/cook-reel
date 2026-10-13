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
import { api, type ChatMessage } from '@/lib/api';
import { handleApiError } from '@/lib/gates';
import { haptics } from '@/lib/haptics';
import { newId } from '@/lib/id';
import { fromApiRecipe, profileForAI } from '@/lib/recipes';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';
import { fonts, GUTTER, inputReset, radius, useTheme } from '@/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  recipe?: ApiRecipe;
  savedId?: string;
}

const IDEAS = [
  { emoji: '💪', text: 'Something high-protein for dinner in 20 minutes' },
  { emoji: '🍲', text: 'A cosy dal for a rainy evening' },
  { emoji: '💸', text: 'Cheap, filling lunches I can meal prep for the week' },
  { emoji: '🕯️', text: 'Something impressive but easy for a date night' },
];

const PANTRY_GROUPS: { label: string; items: string[] }[] = [
  { label: 'Protein', items: ['Eggs', 'Paneer', 'Chicken', 'Tofu', 'Chickpeas', 'Dal', 'Tuna', 'Soya chunks'] },
  { label: 'Veg', items: ['Onion', 'Tomato', 'Potato', 'Spinach', 'Capsicum', 'Carrot', 'Peas', 'Mushroom'] },
  { label: 'Carbs', items: ['Rice', 'Bread', 'Pasta', 'Oats', 'Noodles', 'Roti / tortilla', 'Poha'] },
  { label: 'Dairy & more', items: ['Milk', 'Curd / yogurt', 'Cheese', 'Butter', 'Peanut butter', 'Coconut milk'] },
];

const THINKING = ['Chef is thinking…', 'Balancing flavours and macros…', 'Checking it fits your kitchen…', 'Writing it up step by step…', 'Almost ready…'];

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
    toast('Saved to your library', { tone: 'success', action: { label: 'Open', onPress: () => router.push(`/recipe/${saved.id}`) } });
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <Screen>
      <TopBar
        left={<IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />}
        right={<CreditsPill />}
        title={mode === 'fridge' ? 'Cook from my fridge' : 'Chef'}
        subtitle="Free questions · 1 credit per recipe"
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.thread} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!started && mode === 'describe' ? (
            <Animated.View entering={FadeInDown.springify().damping(18)}>
              <View style={styles.hero}>
                <ChefAvatar size={64} />
                <Txt variant="title1" align="center" style={{ marginTop: 16 }}>
                  What are you in the{'\n'}mood for?
                </Txt>
                <Txt variant="body" color="textMuted" align="center" style={{ marginTop: 8 }}>
                  Describe a dish, a craving or a situation. I’ll ask a couple of questions, then write a recipe for your kitchen.
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
                What’s in your kitchen?
              </Txt>
              <Txt variant="body" color="textMuted" style={{ marginTop: 6 }}>
                Tap what you have. Salt, oil and basic spices are assumed.
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
                    Nothing yet — add items below
                  </Txt>
                )}
                <View style={[styles.pantryInput, { backgroundColor: colors.surfaceMuted }]}>
                  <TextInput
                    value={pantryInput}
                    onChangeText={setPantryInput}
                    placeholder="Add something else…"
                    placeholderTextColor={colors.textFaint}
                    style={[styles.inputText, inputReset, { color: colors.text, fontFamily: fonts.medium }]}
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
                label={pantry.length < 2 ? 'Pick at least 2 things' : `Find a recipe with ${pantry.length} items`}
                icon="sparkles"
                variant="ai"
                disabled={pantry.length < 2}
                style={{ marginTop: 26 }}
                onPress={() => void send(`Here’s what I have: ${pantry.join(', ')}. What can I make?`)}
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
                            <Button label="Open" variant="secondary" size="md" style={{ flex: 1 }} onPress={() => router.push(`/recipe/${m.savedId}`)} />
                            <Button label="Cook now" icon="play" size="md" style={{ flex: 1 }} onPress={() => router.push(`/cook/${m.savedId}`)} />
                          </>
                        ) : (
                          <Button label="Save to library" icon="bookmark" size="md" style={{ flex: 1 }} onPress={() => saveRecipe(m)} />
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
            <Button label="Try again" variant="secondary" icon="refresh" size="md" style={{ alignSelf: 'center' }} onPress={() => void request(messages)} />
          ) : null}
        </ScrollView>

        {started || mode === 'describe' ? (
          <View style={[styles.composer, { paddingBottom: insets.bottom + 10, backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={started ? 'Reply to Chef…' : 'e.g. paneer, spicy, 20 minutes'}
                placeholderTextColor={colors.textFaint}
                multiline
                numberOfLines={Platform.OS === 'web' ? 1 : undefined}
                style={[styles.inputText, inputReset, { color: colors.text, fontFamily: fonts.medium, maxHeight: 110 }]}
                editable={!loading}
                accessibilityLabel="Message Chef"
              />
              <IconButton icon="arrow-up" label="Send" variant="primary" size={38} iconSize={19} disabled={!input.trim() || loading} onPress={() => void send(input)} />
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
  userBubble: { alignSelf: 'flex-end', maxWidth: '82%', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: 6 },
  assistantRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', maxWidth: '100%' },
  assistantBubble: { alignSelf: 'flex-start', maxWidth: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderTopLeftRadius: 6, borderWidth: StyleSheet.hairlineWidth },
  composer: { paddingHorizontal: GUTTER, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  inputBox: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 },
  inputText: { flex: 1, fontSize: 16, paddingTop: 8, paddingBottom: 8, minHeight: 38 },
});
