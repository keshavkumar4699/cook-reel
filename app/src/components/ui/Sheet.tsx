import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GUTTER, radius, useTheme } from '@/theme';
import { IconButton } from './IconButton';
import { Txt } from './Text';
import { t } from '@/i18n';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Max height as a fraction of the screen. */
  maxHeight?: `${number}%`;
}

/** Bottom sheet built on Modal: dimmed backdrop, spring-in panel, tap-outside to dismiss. */
export function Sheet({ visible, onClose, title, subtitle, children, maxHeight = '85%' }: SheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {visible ? (
          <Animated.View entering={FadeIn.duration(180)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.actions.close')} />
          </Animated.View>
        ) : null}
        {visible ? (
          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(180)}
            style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 16, maxHeight }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
            {title ? (
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Txt variant="title2">{title}</Txt>
                  {subtitle ? (
                    <Txt variant="subhead" color="textMuted" style={{ marginTop: 2 }}>
                      {subtitle}
                    </Txt>
                  ) : null}
                </View>
                <IconButton icon="close" label={t('common.actions.close')} variant="soft" size={34} onPress={onClose} />
              </View>
            ) : null}
            {children}
          </Animated.View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 10, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 14, gap: 12 },
});
