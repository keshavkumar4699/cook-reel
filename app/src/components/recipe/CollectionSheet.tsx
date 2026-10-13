import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Recipe } from '@/data/types';
import { t } from '@/i18n';
import { useLibrary } from '@/state/library';
import { GUTTER } from '@/theme';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Sheet } from '../ui/Sheet';
import { TextField } from '../ui/TextField';
import { Txt } from '../ui/Text';

export function CollectionSheet({ recipe, visible, onClose }: { recipe: Recipe; visible: boolean; onClose: () => void }) {
  const collectionsMap = useLibrary((s) => s.collections);
  const toggle = useLibrary((s) => s.toggleInCollection);
  const addCollection = useLibrary((s) => s.addCollection);
  const [name, setName] = useState('');
  const collections = useMemo(() => Object.values(collectionsMap).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [collectionsMap]);

  return (
    <Sheet visible={visible} onClose={onClose} title={t('library.collectionSheet.title')} subtitle={t('library.collectionSheet.subtitle')}>
      <View style={styles.body}>
        {collections.length ? (
          <View style={styles.wrap}>
            {collections.map((c) => (
              <Chip key={c.id} label={c.name} emoji={c.emoji} tone="primary" selected={recipe.collections.includes(c.id)} onPress={() => toggle(recipe.id, c.id)} />
            ))}
          </View>
        ) : (
          <Txt variant="subhead" color="textMuted">
            {t('library.collectionSheet.empty')}
          </Txt>
        )}
        <View style={styles.newRow}>
          <TextField placeholder={t('library.collectionSheet.newPlaceholder')} value={name} onChangeText={setName} containerStyle={{ flex: 1 }} maxLength={40} />
          <Button
            label={t('common.actions.add')}
            size="md"
            disabled={!name.trim()}
            onPress={() => {
              const created = addCollection(name, '📁');
              toggle(recipe.id, created.id);
              setName('');
            }}
          />
        </View>
        <Button label={t('common.actions.done')} variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: GUTTER, gap: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  newRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
