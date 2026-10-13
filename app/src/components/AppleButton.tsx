import * as AppleAuthentication from 'expo-apple-authentication';
import { radius, useTheme } from '@/theme';

/** Apple's own button, as App Review expects for Sign in with Apple. */
export function AppleButton({ onPress }: { onPress: () => void }) {
  const { isDark } = useTheme();
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={isDark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={radius.md}
      style={{ height: 56, width: '100%' }}
      onPress={onPress}
    />
  );
}
