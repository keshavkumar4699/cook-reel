import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { radius, shadow, useTheme } from '@/theme';
import { CreateSheet } from './CreateSheet';
import { Icon, type IconName } from './ui/Icon';
import { PressableScale } from './ui/PressableScale';
import { Txt } from './ui/Text';

const ICONS: Record<string, { on: IconName; off: IconName; label: string }> = {
  home: { on: 'home', off: 'home-outline', label: 'Home' },
  library: { on: 'bookmarks', off: 'bookmarks-outline', label: 'Library' },
  plan: { on: 'calendar', off: 'calendar-outline', label: 'Plan' },
  me: { on: 'person-circle', off: 'person-circle-outline', label: 'Me' },
};

/** Space screens should leave at the bottom so content clears the floating bar. */
export const TAB_BAR_HEIGHT = 64;

export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const [creating, setCreating] = useState(false);

  const renderTab = (index: number) => {
    const route = state.routes[index];
    if (!route) return null;
    const meta = ICONS[route.name];
    if (!meta) return null;
    const focused = state.index === index;
    return (
      <PressableScale
        key={route.key}
        haptic="select"
        scaleTo={0.9}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={meta.label}
        style={styles.tab}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
      >
        <Icon name={focused ? meta.on : meta.off} size={23} color={focused ? colors.text : colors.textFaint} />
        <Txt variant="caption" color={focused ? 'text' : 'textFaint'} style={styles.label}>
          {meta.label}
        </Txt>
      </PressableScale>
    );
  };

  return (
    <>
      <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.bar, { borderColor: colors.border }, shadow(colors, isDark ? 2 : 3)]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint={isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(28,25,23,0.97)' : 'rgba(255,255,255,0.97)' }]} />
          )}
          {renderTab(0)}
          {renderTab(1)}
          <View style={styles.tab}>
            <PressableScale
              haptic="press"
              scaleTo={0.9}
              accessibilityLabel="Add a recipe"
              onPress={() => setCreating(true)}
              style={[styles.fab, { backgroundColor: colors.primary }, shadow(colors, 2)]}
            >
              <Icon name="add" size={30} color="#FFFFFF" />
            </PressableScale>
          </View>
          {renderTab(2)}
          {renderTab(3)}
        </View>
      </View>
      <CreateSheet visible={creating} onClose={() => setCreating(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 },
  label: { fontSize: 11 },
  fab: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});
