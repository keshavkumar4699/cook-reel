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
import { t } from '@/i18n';

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
      title: t('ui.createSheet.youtubeTitle'),
      body: t('ui.createSheet.youtubeBody'),
      icon: 'logo-youtube',
      tint: colors.youtube,
      bg: colors.primarySoft,
      ai: true,
      go: () => withAccount('/youtube'),
    },
    {
      key: 'builder',
      title: t('ui.createSheet.chefTitle'),
      body: t('ui.createSheet.chefBody'),
      icon: 'sparkles',
      tint: colors.ai,
      bg: colors.aiSoft,
      ai: true,
      go: () => withAccount('/builder'),
    },
    {
      key: 'fridge',
      title: t('ui.createSheet.fridgeTitle'),
      body: t('ui.createSheet.fridgeBody'),
      icon: 'mci:fridge-outline',
      tint: colors.accent,
      bg: colors.accentSoft,
      ai: true,
      go: () => withAccount('/builder?mode=fridge'),
    },
    {
      key: 'manual',
      title: t('ui.createSheet.manualTitle'),
      body: t('ui.createSheet.manualBody'),
      icon: 'create-outline',
      tint: colors.saffron,
      bg: colors.saffronSoft,
      ai: false,
      go: () => router.push('/edit-recipe'),
    },
  ];

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('ui.createSheet.title')}
      subtitle={signedIn ? t('ui.createSheet.subtitleSignedIn') : t('ui.createSheet.subtitleGuest')}
    >
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
                {o.ai ? <Badge label={t('ui.createSheet.aiBadge')} tone="ai" /> : null}
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
