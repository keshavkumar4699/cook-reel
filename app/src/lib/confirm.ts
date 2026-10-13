import { Alert, Platform } from 'react-native';
import { t } from '@/i18n';

/** Cross-platform confirmation dialog (react-native-web has no Alert). */
export function confirm(options: { title: string; message?: string; confirmLabel?: string; destructive?: boolean }): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.([options.title, options.message].filter(Boolean).join('\n\n')) ?? true);
  }
  return new Promise((resolve) => {
    Alert.alert(options.title, options.message, [
      { text: t('common.actions.cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: options.confirmLabel ?? t('common.actions.ok'), style: options.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}
