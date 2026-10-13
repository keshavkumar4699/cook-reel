import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '@/state/settings';
import { palette, type Colors } from './tokens';

export * from './tokens';

export type Scheme = 'light' | 'dark';

export function useTheme() {
  const system = useColorScheme();
  const appearance = useSettings((s) => s.appearance);
  const scheme: Scheme = appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;
  return useMemo(() => ({ scheme, isDark: scheme === 'dark', colors: palette[scheme] as Colors }), [scheme]);
}
