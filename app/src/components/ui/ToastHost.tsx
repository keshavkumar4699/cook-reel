import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/state/toast';
import { radius, shadow, useTheme } from '@/theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Text';

export function ToastHost() {
  const current = useToast((s) => s.current);
  const hide = useToast((s) => s.hide);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  if (!current) return null;
  const icon = current.tone === 'success' ? 'checkmark-circle' : current.tone === 'error' ? 'alert-circle' : 'information-circle';
  const tint = current.tone === 'success' ? colors.accent : current.tone === 'error' ? colors.danger : colors.textMuted;
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { paddingTop: insets.top + 8 }]}>
      <Animated.View
        key={current.id}
        entering={FadeInUp.springify().damping(18)}
        exiting={FadeOutUp.duration(150)}
        style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border }, shadow(colors, 3)]}
        accessibilityLiveRegion="polite"
      >
        <Icon name={icon} size={20} color={tint} />
        <Txt variant="subheadStrong" style={{ flex: 1 }} numberOfLines={3}>
          {current.message}
        </Txt>
        {current.action ? (
          <PressableScale
            onPress={() => {
              current.action?.onPress();
              hide();
            }}
            hitSlop={8}
          >
            <Txt variant="subheadStrong" color="primary">
              {current.action.label}
            </Txt>
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
