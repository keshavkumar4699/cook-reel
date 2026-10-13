import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { withAccount } from '@/lib/gates';
import { useSession } from '@/state/session';
import { GUTTER, radius, useTheme } from '@/theme';
import { Badge } from './ui/Badge';
import { Icon, type IconName } from './ui/Icon';
import { PressableScale } from './ui/PressableScale';
import { Sheet } from './ui/Sheet';
import { Txt } from './ui/Text';

interface Option {
  key: string;
  title: string;
  body: string;
  icon: IconName;
  tint: string;
  bg: string;
  ai: boolean;
  go: () => void;
}

export function CreateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const signedIn = useSession((s) => s.status === 'signedIn');
  const close = (fn: () => void) => () => {
    onClose();
    setTimeout(fn, 120);
  };
  const options: Option[] = [
    {
      key: 'youtube',
      title: 'From a YouTube video',
      body: 'Paste a link — get step-by-step clips',
      icon: 'logo-youtube',
      tint: colors.youtube,
      bg: colors.primarySoft,
      ai: true,
      go: () => withAccount('/youtube'),
    },
    {
      key: 'builder',
      title: 'Create with Chef',
      body: 'Describe a craving, answer a few questions',
      icon: 'sparkles',
      tint: colors.ai,
      bg: colors.aiSoft,
      ai: true,
      go: () => withAccount('/builder'),
    },
    {
      key: 'fridge',
      title: 'Cook from my fridge',
      body: 'Tell Chef what you have, get a recipe',
      icon: 'mci:fridge-outline',
      tint: colors.accent,
      bg: colors.accentSoft,
      ai: true,
      go: () => withAccount('/builder?mode=fridge'),
    },
    {
      key: 'manual',
      title: 'Write my own',
      body: 'Save a family recipe or your own creation',
      icon: 'create-outline',
      tint: colors.saffron,
      bg: colors.saffronSoft,
      ai: false,
      go: () => router.push('/edit-recipe'),
    },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Add a recipe" subtitle={signedIn ? 'AI options use credits' : 'AI options need a free account'}>
      <View style={styles.list}>
        {options.map((o) => (
          <PressableScale
            key={o.key}
            onPress={close(o.go)}
            haptic="press"
            accessibilityLabel={o.title}
            style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.tile, { backgroundColor: o.bg }]}>
              <Icon name={o.icon} size={24} color={o.tint} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.titleRow}>
                <Txt variant="headline">{o.title}</Txt>
                {o.ai ? <Badge label="AI" tone="ai" /> : null}
              </View>
              <Txt variant="footnote" color="textMuted">
                {o.body}
              </Txt>
            </View>
            <Icon name="chevron-forward" size={18} color="textFaint" />
          </PressableScale>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, gap: 10, paddingBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  tile: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
