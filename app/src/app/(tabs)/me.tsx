import { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSheet } from '@/components/LanguageSheet';
import { VoiceSettings } from '@/components/VoiceSettings';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { SettingsGroup, SettingsRow, SettingsSwitch } from '@/components/ui/Settings';
import { Txt } from '@/components/ui/Text';
import { getLanguageSetting, LANGUAGE_INFO, getLanguage, t } from '@/i18n';
import { joinFacts } from '@/i18n/format';
import { api } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import { formatDate } from '@/lib/dates';
import { handleApiError } from '@/lib/gates';
import { planNameFor } from '@/lib/pricing';
import { useTabBarSpace } from '@/lib/useBottomSpace';
import { purchases } from '@/native/purchases';
import { useLibrary } from '@/state/library';
import { useProfile } from '@/state/profile';
import { useSession } from '@/state/session';
import { useSettings, type Appearance } from '@/state/settings';
import { toast } from '@/state/toast';
import { GUTTER, useTheme } from '@/theme';

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
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageSetting = getLanguageSetting();
  const planName = planNameFor(balance?.planId ?? null, balance?.planName ?? null);

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
      toast(t('pricing.toasts.restored'), { tone: 'success' });
    } catch (error) {
      handleApiError(error, 'pricing.errors.restoreFailed');
    }
  };

  const deleteAccount = async () => {
    const ok = await confirm({
      title: t('me.deleteConfirm.title'),
      message: t('me.deleteConfirm.message'),
      confirmLabel: t('me.deleteConfirm.confirm'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.deleteAccount();
      await session.signOut();
      toast(t('me.toasts.deleted'));
    } catch (error) {
      handleApiError(error);
    }
  };

  const profileSummary = joinFacts([
    profile.diet ? t(`onboarding.diets.${profile.diet}`) : null,
    profile.householdSize ? t('me.profileSummary.household', { count: profile.householdSize }) : null,
    profile.equipment?.length ? t('me.profileSummary.appliances', { count: profile.equipment.length }) : null,
  ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={session.user?.name ?? null} uri={session.user?.avatarUrl} size={60} />
          <View style={{ flex: 1 }}>
            <Txt variant="title2" numberOfLines={1}>
              {session.user?.name ?? (signedIn ? t('me.cook') : t('me.guest'))}
            </Txt>
            <Txt variant="subhead" color="textMuted" numberOfLines={1}>
              {signedIn ? (session.user?.email ?? t('me.signedIn')) : t('me.recipesOnPhone', { count: recipeCount })}
            </Txt>
          </View>
        </View>

        {signedIn ? (
          <Card style={styles.credits}>
            <View style={styles.creditsTop}>
              <View>
                <Txt variant="overline" color="textMuted">
                  {t('me.credits.title')}
                </Txt>
                <View style={styles.creditsValue}>
                  <Icon name="flash" size={22} color={colors.saffron} />
                  <Txt variant="hero" style={{ fontSize: 36, lineHeight: 42 }}>
                    {balance?.total ?? '–'}
                  </Txt>
                </View>
              </View>
              {planName ? <Badge label={planName} icon="star" tone="primary" /> : <Badge label={t('me.credits.starter')} tone="saffron" />}
            </View>
            <Txt variant="footnote" color="textMuted">
              {balance?.planName && balance.nextRefillAt
                ? joinFacts([
                    t('me.credits.refill', { allowance: balance.monthlyAllowance ?? balance.plan, date: formatDate(new Date(balance.nextRefillAt)) }),
                    balance.bonus ? t('me.credits.extra', { count: balance.bonus }) : null,
                  ])
                : t('me.credits.starterNote')}
            </Txt>
            <Button label={balance?.planName ? t('me.credits.more') : t('me.credits.plans')} icon="flash" size="md" onPress={() => router.push('/pricing')} style={{ marginTop: 14 }} />
          </Card>
        ) : (
          <Card tone="ai" style={styles.credits}>
            <Txt variant="title3">{t('me.guestCard.title')}</Txt>
            <Txt variant="subhead" color="textMuted" style={{ marginTop: 4 }}>
              {t('me.guestCard.body')}
            </Txt>
            <Button label={t('me.guestCard.cta')} variant="ai" size="md" icon="sparkles" onPress={() => router.push('/sign-in')} style={{ marginTop: 14 }} />
          </Card>
        )}

        <SettingsGroup title={t('me.groups.cooking')}>
          <SettingsRow icon="person-outline" label={t('me.rows.profile')} detail={profileSummary || t('me.rows.profileEmpty')} onPress={() => router.push('/profile')} />
          <SettingsRow
            icon="language-outline"
            label={t('me.rows.language')}
            detail={languageSetting === 'system' ? t('common.language.systemDetail', { language: LANGUAGE_INFO[getLanguage()].nativeName }) : LANGUAGE_INFO[languageSetting].nativeName}
            onPress={() => setLanguageOpen(true)}
            last
          />
        </SettingsGroup>

        <VoiceSettings />

        <SettingsGroup title={t('me.groups.appearance')}>
          <View style={styles.inlineSetting}>
            <Segmented<Appearance>
              value={settings.appearance}
              onChange={(v) => settings.set({ appearance: v })}
              options={[
                { value: 'system', label: t('me.appearance.system') },
                { value: 'light', label: t('me.appearance.light') },
                { value: 'dark', label: t('me.appearance.dark') },
              ]}
            />
          </View>
        </SettingsGroup>

        {signedIn ? (
          <SettingsGroup title={t('me.groups.privacy')}>
            <SettingsRow
              icon="people-outline"
              label={t('me.rows.sharing')}
              detail={t('me.rows.sharingDetail')}
              right={<SettingsSwitch value={session.user?.sharingOptIn ?? true} onValueChange={(v) => void toggleSharing(v)} label={t('me.rows.sharing')} />}
              last
            />
          </SettingsGroup>
        ) : null}

        <SettingsGroup title={t('me.groups.purchases')}>
          <SettingsRow icon="pricetags-outline" label={t('me.rows.plans')} onPress={() => router.push('/pricing')} />
          {Platform.OS !== 'web' ? <SettingsRow icon="refresh-outline" label={t('me.rows.restore')} onPress={() => void restore()} /> : null}
          <SettingsRow
            icon="card-outline"
            label={t('me.rows.manage')}
            last
            onPress={() =>
              void Linking.openURL(
                Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions' : 'https://play.google.com/store/account/subscriptions',
              )
            }
          />
        </SettingsGroup>

        {signedIn ? (
          <SettingsGroup title={t('me.groups.account')}>
            <SettingsRow icon="log-out-outline" label={t('me.rows.signOut')} onPress={() => void session.signOut()} />
            <SettingsRow icon="trash-outline" label={t('me.rows.deleteAccount')} danger last onPress={() => void deleteAccount()} />
          </SettingsGroup>
        ) : null}

        <Txt variant="caption" color="textFaint" align="center" style={{ marginTop: 28 }}>
          {t('me.footer', { version: Constants.expoConfig?.version ?? '' })}
        </Txt>
      </ScrollView>
      <LanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  credits: { padding: 18 },
  creditsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  creditsValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inlineSetting: { paddingHorizontal: 14, paddingVertical: 12 },
});
