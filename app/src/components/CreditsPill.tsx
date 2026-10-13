import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '@/state/session';
import { radius, useTheme } from '@/theme';
import { Icon } from './ui/Icon';
import { PressableScale } from './ui/PressableScale';
import { Txt } from './ui/Text';

/** Credit balance for signed-in cooks; a sign-in prompt for guests. */
export function CreditsPill() {
  const { colors } = useTheme();
  const status = useSession((s) => s.status);
  const balance = useSession((s) => s.balance);
  if (status !== 'signedIn') {
    return (
      <PressableScale onPress={() => router.push('/sign-in')} style={[styles.pill, { backgroundColor: colors.ink }]} accessibilityLabel="Sign in">
        <Icon name="person-circle-outline" size={16} color={colors.onInk} />
        <Txt variant="subheadStrong" color={colors.onInk}>
          Sign in
        </Txt>
      </PressableScale>
    );
  }
  const low = (balance?.total ?? 0) <= 3;
  return (
    <PressableScale
      onPress={() => router.push('/pricing')}
      style={[styles.pill, { backgroundColor: low ? colors.primarySoft : colors.saffronSoft }]}
      accessibilityLabel={`${balance?.total ?? 0} credits. Get more`}
    >
      <Icon name="flash" size={14} color={low ? colors.primary : colors.saffron} />
      <Txt variant="subheadStrong" color={low ? colors.primary : colors.text}>
        {balance?.total ?? '–'}
      </Txt>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 12, borderRadius: radius.pill },
});
