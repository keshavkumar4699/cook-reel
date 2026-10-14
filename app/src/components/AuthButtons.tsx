import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { SessionResponse } from '@/lib/api';
import { t } from '@/i18n';
import { useSignIn } from '@/lib/useSignIn';
import { radius, useTheme } from '@/theme';
import { AppleButton } from './AppleButton';
import { GoogleLogo } from './GoogleLogo';
import { Button } from './ui/Button';
import { PressableScale } from './ui/PressableScale';
import { TextField } from './ui/TextField';
import { Txt } from './ui/Text';

export function AuthButtons({ onSuccess }: { onSuccess: (session: SessionResponse) => void }) {
  const { colors } = useTheme();
  const auth = useSignIn(onSuccess);
  const [devName, setDevName] = useState('');

  return (
    <View style={styles.stack}>
      {auth.appleAvailable ? (
        <View style={{ opacity: auth.busy && auth.busy !== 'apple' ? 0.5 : 1 }}>
          <AppleButton onPress={auth.signInWithApple} />
        </View>
      ) : null}
      <PressableScale
        onPress={auth.signInWithGoogle}
        disabled={!!auth.busy}
        haptic="press"
        accessibilityLabel={t('auth.buttons.google')}
        style={[styles.google, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
      >
        {auth.busy === 'google' ? <ActivityIndicator color={colors.text} /> : <GoogleLogo size={20} />}
        <Txt variant="button">{t('auth.buttons.google')}</Txt>
      </PressableScale>
      {auth.devAvailable ? (
        <View style={[styles.dev, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
          <Txt variant="overline" color="textMuted">
            {t('auth.buttons.devTitle')}
          </Txt>
          <TextField placeholder={t('auth.buttons.devName')} value={devName} onChangeText={setDevName} autoCapitalize="words" returnKeyType="go" onSubmitEditing={() => auth.signInDev(devName)} />
          <Button label={t('auth.buttons.devButton')} variant="ink" size="md" loading={auth.busy === 'dev'} onPress={() => auth.signInDev(devName)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  google: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dev: { gap: 10, padding: 14, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
});
