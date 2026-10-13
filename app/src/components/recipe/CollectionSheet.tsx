import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Recipe } from '@/data/types';
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
    <Sheet visible={visible} onClose={onClose} title="Collections" subtitle="Tap to add or remove">
      <View style={styles.body}>
        {collections.length ? (
          <View style={styles.wrap}>
            {collections.map((c) => (
              <Chip key={c.id} label={c.name} emoji={c.emoji} tone="primary" selected={recipe.collections.includes(c.id)} onPress={() => toggle(recipe.id, c.id)} />
            ))}
          </View>
        ) : (
          <Txt variant="subhead" color="textMuted">
            No collections yet — create your first one.
          </Txt>
        )}
        <View style={styles.newRow}>
          <TextField placeholder="New collection" value={name} onChangeText={setName} containerStyle={{ flex: 1 }} maxLength={40} />
          <Button
            label="Add"
            size="md"
            disabled={!name.trim()}
            onPress={() => {
              const created = addCollection(name, '📁');
              toggle(recipe.id, created.id);
              setName('');
            }}
          />
        </View>
        <Button label="Done" variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: GUTTER, gap: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  newRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
