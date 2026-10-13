import type { ReactNode } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Txt } from '@/components/ui/Text';
import { api } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import { handleApiError } from '@/lib/gates';
import { useTabBarSpace } from '@/lib/useBottomSpace';
import { purchases } from '@/native/purchases';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { useSettings, type Appearance } from '@/state/settings';
import { toast } from '@/state/toast';
import { GUTTER, radius, useTheme } from '@/theme';

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 28 }}>
      <Txt variant="overline" color="textMuted" style={{ marginBottom: 8, marginLeft: 4 }}>
        {title}
      </Txt>
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

function Row({ icon, label, detail, onPress, right, danger, last }: { icon: IconName; label: string; detail?: string; onPress?: () => void; right?: ReactNode; danger?: boolean; last?: boolean }) {
  const { colors } = useTheme();
  const body = (
    <View style={[styles.row, !last ? { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border } : null]}>
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.dangerSoft : colors.surfaceMuted }]}>
        <Icon name={icon} size={17} color={danger ? colors.danger : colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" color={danger ? 'danger' : 'text'}>
          {label}
        </Txt>
        {detail ? (
          <Txt variant="footnote" color="textMuted">
            {detail}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color="textFaint" /> : null)}
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} scaleTo={0.99} accessibilityLabel={label}>
      {body}
    </PressableScale>
  ) : (
    body
  );
}

export default function Me() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { colors } = useTheme();
  const session = useSession();
  const settings = useSettings();
  const profile = useProfile((s) => s.profile);
  const recipeCount = useLibrary((s) => Object.keys(s.recipes).length);
  const signedIn = session.status === 'signedIn';
  const balance = session.balance;

  const switchProps = (value: boolean, onValueChange: (v: boolean) => void) => ({
    value,
    onValueChange,
    trackColor: { true: colors.primary, false: colors.borderStrong },
    thumbColor: '#FFFFFF',
    ios_backgroundColor: colors.borderStrong,
    // react-native-web reads these instead of thumbColor/trackColor.
    ...({ activeThumbColor: '#FFFFFF', activeTrackColor: colors.primary } as object),
  });

  const toggleSharing = async (sharingOptIn: boolean) => {
    try {
      const { user } = await api.updateMe({ sharingOptIn });
      session.setUser(user);
    } catch (error) {
      handleApiError(error);
    }
  };

  const restore = async () => {
    try {
      await purchases.restore();
      const { balance: fresh } = await api.syncBilling();
      session.setBalance(fresh);
      toast('Purchases restored', { tone: 'success' });
    } catch (error) {
      handleApiError(error, 'Could not restore purchases.');
    }
  };

  const deleteAccount = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      message: 'Your credits, subscription link and contributions are removed permanently. Recipes on this phone stay. Cancel any subscription in your app store settings too.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.deleteAccount();
      await session.signOut();
      toast('Your account has been deleted');
    } catch (error) {
      handleApiError(error);
    }
  };

  const profileSummary = [
    profile.diet ? profile.diet.replace('-', ' ') : null,
    profile.householdSize ? `cooks for ${profile.householdSize}` : null,
    profile.equipment?.length ? `${profile.equipment.length} appliances` : null,
  ]
    .filter(Boolean)
    .join(' · ')
    .replace(/^./, (c) => c.toUpperCase());

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={session.user?.name ?? null} uri={session.user?.avatarUrl} size={60} />
          <View style={{ flex: 1 }}>
            <Txt variant="title2" numberOfLines={1}>
              {session.user?.name ?? (signedIn ? 'Cook' : 'Guest cook')}
            </Txt>
            <Txt variant="subhead" color="textMuted" numberOfLines={1}>
              {signedIn ? (session.user?.email ?? 'Signed in') : `${recipeCount} recipes on this phone`}
            </Txt>
          </View>
        </View>

        {signedIn ? (
          <Card style={styles.credits}>
            <View style={styles.creditsTop}>
              <View>
                <Txt variant="overline" color="textMuted">
                  Credits
                </Txt>
                <View style={styles.creditsValue}>
                  <Icon name="flash" size={22} color={colors.saffron} />
                  <Txt variant="hero" style={{ fontSize: 36, lineHeight: 42 }}>
                    {balance?.total ?? '–'}
                  </Txt>
                </View>
              </View>
              {balance?.planName ? <Badge label={balance.planName} icon="star" tone="primary" /> : <Badge label="Starter" tone="saffron" />}
            </View>
            <Txt variant="footnote" color="textMuted">
              {balance?.planName && balance.nextRefillAt
                ? `${balance.plan} plan credits refill to ${balance.monthlyAllowance} on ${new Date(balance.nextRefillAt).toLocaleDateString()}${balance.bonus ? ` · ${balance.bonus} extra` : ''}`
                : 'One-time starter credits. Subscribe for a fresh batch every month.'}
            </Txt>
            <Button label={balance?.planName ? 'Get more credits' : 'See plans'} icon="flash" size="md" onPress={() => router.push('/pricing')} style={{ marginTop: 14 }} />
          </Card>
        ) : (
          <Card tone="ai" style={styles.credits}>
            <Txt variant="title3">Unlock Chef & YouTube reels</Txt>
            <Txt variant="subhead" color="textMuted" style={{ marginTop: 4 }}>
              Create a free account to use AI features. Your recipes stay on this phone either way.
            </Txt>
            <Button label="Create free account" variant="ai" size="md" icon="sparkles" onPress={() => router.push('/sign-in')} style={{ marginTop: 14 }} />
          </Card>
        )}

        <Group title="Cooking">
          <Row icon="person-outline" label="Cooking profile" detail={profileSummary || 'Diet, kitchen, goals'} onPress={() => router.push('/profile')} />
          <Row icon="mic-outline" label="Voice control" detail="Say “next”, “back”, “stop” while cooking" right={<Switch {...switchProps(settings.voiceControl, (v) => settings.set({ voiceControl: v }))} />} />
          <Row icon="volume-high-outline" label="Read steps aloud" detail="Always on for YouTube Shorts" right={<Switch {...switchProps(settings.autoNarrate, (v) => settings.set({ autoNarrate: v }))} />} />
          <View style={styles.inlineSetting}>
            <Txt variant="footnote" color="textMuted" style={{ marginBottom: 8 }}>
              Narration speed
            </Txt>
            <Segmented
              value={String(settings.speechRate)}
              onChange={(v) => settings.set({ speechRate: Number(v) })}
              options={[
                { value: '0.85', label: 'Relaxed' },
                { value: '1', label: 'Normal' },
                { value: '1.15', label: 'Brisk' },
              ]}
            />
          </View>
        </Group>

        <Group title="Appearance">
          <View style={styles.inlineSetting}>
            <Segmented<Appearance>
              value={settings.appearance}
              onChange={(v) => settings.set({ appearance: v })}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </View>
        </Group>

        {signedIn ? (
          <Group title="Privacy">
            <Row
              icon="people-outline"
              label="Help Chef learn from my imports"
              detail="Recipes from videos you import improve suggestions for everyone. Turning this off withdraws them."
              right={<Switch {...switchProps(session.user?.sharingOptIn ?? true, (v) => void toggleSharing(v))} />}
              last
            />
          </Group>
        ) : null}

        <Group title="Purchases">
          <Row icon="pricetags-outline" label="Plans & credits" onPress={() => router.push('/pricing')} />
          {Platform.OS !== 'web' ? <Row icon="refresh-outline" label="Restore purchases" onPress={() => void restore()} /> : null}
          <Row
            icon="card-outline"
            label="Manage subscription"
            last
            onPress={() =>
              void Linking.openURL(
                Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions' : 'https://play.google.com/store/account/subscriptions',
              )
            }
          />
        </Group>

        {signedIn ? (
          <Group title="Account">
            <Row icon="log-out-outline" label="Sign out" onPress={() => void session.signOut()} />
            <Row icon="trash-outline" label="Delete account" danger last onPress={() => void deleteAccount()} />
          </Group>
        ) : null}

        <Txt variant="caption" color="textFaint" align="center" style={{ marginTop: 28 }}>
          CookReel {Constants.expoConfig?.version ?? ''} · Made for hungry people
        </Txt>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  credits: { padding: 18 },
  creditsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  creditsValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  group: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 58 },
  rowIcon: { width: 32, height: 32, borderRadius: radius.xs, alignItems: 'center', justifyContent: 'center' },
  inlineSetting: { paddingHorizontal: 14, paddingVertical: 12 },
});
