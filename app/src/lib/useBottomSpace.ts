import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '@/components/TabBar';

/** Bottom padding for scroll views inside tabs so the last item clears the floating tab bar. */
export function useTabBarSpace(extra = 24) {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + TAB_BAR_HEIGHT + extra;
}
