import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Text';
import type { Recipe } from '@/data/types';
import { t } from '@/i18n';
import { formatInteger } from '@/i18n/format';
import { formatMinutes } from '@/lib/format';
import { isHighProtein, isLight, isQuick } from '@/lib/recipes';
import { useTabBarSpace } from '@/lib/useBottomSpace';
import { useLibrary } from '@/state/library';
import { GUTTER, radius, useTheme } from '@/theme';

type Filter = 'all' | 'cookLater' | 'youtube' | 'ai' | 'mine' | 'variations' | 'quick' | 'protein' | 'light' | 'mealprep';

const FILTERS: { id: Filter; label: string; emoji?: string; test: (r: Recipe) => boolean }[] = [
  { id: 'all', label: t('library.filters.all'), test: () => true },
  { id: 'cookLater', label: t('library.filters.cookLater'), emoji: '🔖', test: (r) => r.cookLater },
  { id: 'youtube', label: t('common.sources.youtube'), emoji: '▶️', test: (r) => r.source === 'youtube' },
  { id: 'ai', label: t('common.chefName'), emoji: '✨', test: (r) => r.source === 'ai' },
  { id: 'mine', label: t('library.filters.mine'), emoji: '✍️', test: (r) => r.source === 'manual' && !r.starter },
  { id: 'variations', label: t('library.filters.variations'), emoji: '🧪', test: (r) => !!r.parentId },
  { id: 'quick', label: t('library.filters.quick', { duration: formatMinutes(20) }), emoji: '⚡', test: isQuick },
  { id: 'protein', label: t('library.filters.protein'), emoji: '💪', test: isHighProtein },
  { id: 'light', label: t('library.filters.light', { kcal: formatInteger(500) }), emoji: '🥗', test: isLight },
  { id: 'mealprep', label: t('library.filters.mealPrep'), emoji: '🥡', test: (r) => r.mealPrepFriendly },
];

const COLLECTION_EMOJI = ['📁', '🌶️', '🥗', '🍰', '🎉', '🍱', '🌙', '☀️', '👨‍👩‍👧', '💪'];

const FROM_HOME: Record<string, Filter> = { cookLater: 'cookLater', quick: 'quick', experiments: 'variations', recent: 'all' };

export default function Library() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ filter?: string }>();
  const recipesMap = useLibrary((s) => s.recipes);
  const collectionsMap = useLibrary((s) => s.collections);
  const addCollection = useLibrary((s) => s.addCollection);
  const removeCollection = useLibrary((s) => s.removeCollection);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(() => (params.filter ? FROM_HOME[params.filter] : undefined) ?? 'all');
  const [filterParam, setFilterParam] = useState(params.filter);
  const [collection, setCollection] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');

  if (params.filter !== filterParam) {
    // The tab stays mounted, so a later "See all" from Home arrives as a new param.
    setFilterParam(params.filter);
    const mapped = params.filter ? FROM_HOME[params.filter] : undefined;
    if (mapped) setFilter(mapped);
  }

  const recipes = useMemo(() => Object.values(recipesMap).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [recipesMap]);
  const collections = useMemo(() => Object.values(collectionsMap).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [collectionsMap]);
  const visible = useMemo(() => {
    const test = FILTERS.find((f) => f.id === filter)?.test ?? (() => true);
    const q = query.trim().toLowerCase();
    return recipes.filter(
      (r) =>
        test(r) &&
        (!collection || r.collections.includes(collection)) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.tags.some((tag) => tag.includes(q)) ||
          (r.cuisine ?? '').toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))),
    );
  }, [recipes, filter, collection, query]);

  const cardWidth = (width - GUTTER * 2 - 12) / 2;

  const header = (
    <View>
      <View style={[styles.titleRow, { paddingTop: insets.top + 8 }]}>
        <View style={{ flex: 1 }}>
          <Txt variant="title1">{t('common.tabs.library')}</Txt>
          <Txt variant="subhead" color="textMuted">
            {t('library.subtitle', { count: recipes.length })}
          </Txt>
        </View>
        <IconButton icon="add" label={t('library.newRecipe')} onPress={() => router.push('/edit-recipe')} />
      </View>
      <View style={styles.gutter}>
        <TextField
          icon="search"
          placeholder={t('library.search.placeholder')}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          trailing={query ? <IconButton icon="close-circle" label={t('library.search.clear')} variant="ghost" size={28} onPress={() => setQuery('')} /> : null}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} emoji={f.emoji} size="sm" selected={filter === f.id} onPress={() => setFilter(f.id)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
        <Chip label={t('library.collections.new')} icon="add" size="sm" tone="primary" onPress={() => setCreating(true)} />
        {collections.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            emoji={c.emoji}
            size="sm"
            tone="primary"
            selected={collection === c.id}
            trailing={String(recipes.filter((r) => r.collections.includes(c.id)).length)}
            onPress={() => setCollection(collection === c.id ? null : c.id)}
          />
        ))}
      </ScrollView>
      {collection ? (
        <View style={[styles.gutter, styles.collectionBar]}>
          <Txt variant="subheadStrong" color="textMuted">
            {collectionsMap[collection]?.emoji} {collectionsMap[collection]?.name}
          </Txt>
          <Button
            label={t('library.collections.delete')}
            variant="ghost"
            size="sm"
            icon="trash-outline"
            onPress={() => {
              removeCollection(collection);
              setCollection(null);
            }}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={visible}
        key="grid"
        numColumns={2}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.column}
        contentContainerStyle={{ paddingBottom: bottom }}
        renderItem={({ item }) => <RecipeCard recipe={item} width={cardWidth} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query || filter !== 'all' || collection ? (
            <EmptyState emoji="🔍" title={t('library.noResults.title')} body={t('library.noResults.body')} />
          ) : (
            <EmptyState
              emoji="📚"
              title={t('library.emptyLibrary.title')}
              body={t('library.emptyLibrary.body')}
              action={t('library.emptyLibrary.action')}
              onAction={() => router.push('/edit-recipe')}
            />
          )
        }
      />

      <Sheet visible={creating} onClose={() => setCreating(false)} title={t('library.newCollection.title')} subtitle={t('library.newCollection.subtitle')}>
        <View style={[styles.gutter, { gap: 16 }]}>
          <TextField placeholder={t('library.newCollection.namePlaceholder')} value={newName} onChangeText={setNewName} autoFocus maxLength={40} />
          <View style={styles.emojiRow}>
            {COLLECTION_EMOJI.map((e) => (
              <Chip key={e} label={e} selected={newEmoji === e} onPress={() => setNewEmoji(e)} style={{ paddingHorizontal: 10 }} />
            ))}
          </View>
          <Button
            label={t('library.newCollection.create')}
            disabled={!newName.trim()}
            onPress={() => {
              const created = addCollection(newName, newEmoji);
              setCreating(false);
              setNewName('');
              setCollection(created.id);
            }}
          />
          <View style={[styles.hint, { backgroundColor: colors.surfaceMuted }]}>
            <Icon name="information-circle-outline" size={16} color="textMuted" />
            <Txt variant="footnote" color="textMuted" style={{ flex: 1 }}>
              {t('library.newCollection.hint')}
            </Txt>
          </View>
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER, marginBottom: 16, gap: 12 },
  gutter: { paddingHorizontal: GUTTER },
  chips: { paddingHorizontal: GUTTER, paddingVertical: 12, gap: 8 },
  column: { paddingHorizontal: GUTTER, gap: 12, marginBottom: 12 },
  collectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md },
});
