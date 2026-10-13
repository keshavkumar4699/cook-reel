import { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Txt } from '@/components/ui/Text';
import { api, type Plan } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { handleApiError } from '@/lib/gates';
import { haptics } from '@/lib/haptics';
import { usePricing } from '@/lib/pricing';
import { purchases, type StorePackage } from '@/native/purchases';
import { useSession } from '@/state/session';
import { toast } from '@/state/toast';
import { GUTTER, radius, shadow, useTheme } from '@/theme';

type Period = 'monthly' | 'yearly';

function perMonth(pkg: StorePackage | undefined, display: string): string | null {
  if (pkg) return formatCurrency(pkg.price / 12, pkg.currency);
  const amount = Number(display.replace(/[^0-9.]/g, ''));
  const symbol = display.replace(/[0-9.,\s]/g, '');
  return amount ? `${symbol}${(amount / 12).toFixed(2)}` : null;
}

function storePackageFor(plan: Plan, period: Period, packages: StorePackage[]) {
  return packages.find((p) => plan.productIds.includes(p.productId) && (p.period === period || p.productId.includes(period === 'monthly' ? 'month' : 'year')));
}

export default function Pricing() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const pricing = usePricing();
  const status = useSession((s) => s.status);
  const balance = useSession((s) => s.balance);
  const setBalance = useSession((s) => s.setBalance);
  const [period, setPeriod] = useState<Period>('yearly');
  const [selected, setSelected] = useState<string>(() => pricing.plans.find((p) => p.highlight)?.id ?? pricing.plans[0]!.id);
  const [packages, setPackages] = useState<StorePackage[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const storeReady = purchases.isSupported();

  useEffect(() => {
    if (!storeReady) return;
    void purchases.packages().then(setPackages).catch(() => setPackages([]));
  }, [storeReady]);

  const plan = pricing.plans.find((p) => p.id === selected) ?? pricing.plans[0]!;
  const pkg = storePackageFor(plan, period, packages);
  const price = pkg?.priceString ?? plan.displayPrice[period];
  const subscribed = !!balance?.planId;

  const savings = useMemo(() => {
    const monthly = storePackageFor(plan, 'monthly', packages)?.price;
    const yearly = storePackageFor(plan, 'yearly', packages)?.price;
    if (monthly && yearly) return Math.round((1 - yearly / (monthly * 12)) * 100);
    const parse = (s: string) => Number(s.replace(/[^0-9.]/g, ''));
    const m = parse(plan.displayPrice.monthly);
    const y = parse(plan.displayPrice.yearly);
    return m && y ? Math.round((1 - y / (m * 12)) * 100) : 0;
  }, [plan, packages]);

  const buy = async (target: StorePackage | undefined, id: string) => {
    if (status !== 'signedIn') {
      router.push({ pathname: '/sign-in', params: { next: '/pricing' } });
      return;
    }
    if (!target) {
      toast(storeReady ? 'This product isn’t available in your store yet.' : 'Purchases are available in the iOS and Android apps.', { tone: 'error' });
      return;
    }
    setBuying(id);
    try {
      const outcome = await purchases.purchase(target);
      if (outcome === 'cancelled') return;
      const { balance: fresh } = await api.syncBilling();
      setBalance(fresh);
      haptics.success();
      toast(`You’re all set — ${fresh.total} credits ready.`, { tone: 'success' });
      if (router.canGoBack()) router.back();
    } catch (error) {
      handleApiError(error, 'The purchase didn’t go through.');
    } finally {
      setBuying(null);
    }
  };

  const restore = async () => {
    try {
      await purchases.restore();
      const { balance: fresh } = await api.syncBilling();
      setBalance(fresh);
      toast('Purchases restored', { tone: 'success' });
    } catch (error) {
      handleApiError(error, 'Could not restore purchases.');
    }
  };

  const costs = [
    { emoji: '✨', label: 'AI recipe from Chef', value: pricing.costs.recipe },
    { emoji: '🧪', label: 'Recipe variation', value: pricing.costs.experiment },
    { emoji: '▶️', label: 'YouTube video breakdown', value: pricing.costs.youtube },
    { emoji: '📱', label: 'YouTube Short breakdown', value: pricing.costs.youtubeShort },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 140 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={isDark ? ['#3A1E14', colors.bg] : ['#FFE3D5', colors.bg]} style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroTop}>
            <IconButton icon="close" label="Close" onPress={() => router.back()} />
            {balance && status === 'signedIn' ? <Badge label={`${balance.total} credits left`} icon="flash" tone="saffron" /> : null}
          </View>
          <Animated.View entering={FadeInDown.springify().damping(18)}>
            <Txt style={{ fontSize: 44, lineHeight: 52, marginTop: 8 }}>👩‍🍳</Txt>
            <Txt variant="title1" style={{ marginTop: 6 }}>
              {reason !== 'credits' ? 'Cook more with Chef' : (balance?.total ?? 0) > 0 ? 'Not enough credits' : 'You’re out of credits'}
            </Txt>
            <Txt variant="body" color="textMuted" style={{ marginTop: 8 }}>
              {reason === 'credits'
                ? 'Pick a plan to keep creating recipes and turning videos into step reels. Your saved recipes always stay free.'
                : 'A fresh batch of credits every month for AI recipes, experiments and YouTube step reels.'}
            </Txt>
          </Animated.View>
        </LinearGradient>

        <View style={styles.body}>
          <Segmented<Period>
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: savings > 0 ? `Yearly · save ${savings}%` : 'Yearly' },
            ]}
          />

          <View style={{ gap: 12, marginTop: 16 }}>
            {pricing.plans.map((p, i) => {
              const active = p.id === selected;
              const planPkg = storePackageFor(p, period, packages);
              const planPrice = planPkg?.priceString ?? p.displayPrice[period];
              const current = balance?.planId === p.id;
              return (
                <Animated.View key={p.id} entering={FadeInDown.delay(80 * i).springify().damping(18)}>
                  <PressableScale
                    haptic="select"
                    scaleTo={0.98}
                    onPress={() => setSelected(p.id)}
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${p.name}, ${planPrice} per ${period === 'monthly' ? 'month' : 'year'}`}
                    style={[
                      styles.plan,
                      { backgroundColor: colors.surface, borderColor: active ? colors.primary : colors.border },
                      active && !isDark ? shadow(colors, 2) : null,
                    ]}
                  >
                    <View style={styles.planHead}>
                      <View style={[styles.radio, { borderColor: active ? colors.primary : colors.borderStrong }]}>
                        {active ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Txt variant="title3">{p.name}</Txt>
                          {current ? <Badge label="Current" tone="accent" /> : p.highlight ? <Badge label="Most popular" icon="star" tone="primary" /> : null}
                        </View>
                        <Txt variant="footnote" color="textMuted">
                          {p.tagline}
                        </Txt>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Txt variant="headline">{planPrice}</Txt>
                        <Txt variant="caption" color="textMuted">
                          {period === 'monthly' ? 'per month' : `≈ ${perMonth(planPkg, planPrice) ?? ''}/mo`}
                        </Txt>
                      </View>
                    </View>
                    <View style={[styles.credits, { backgroundColor: colors.saffronSoft }]}>
                      <Icon name="flash" size={14} color={colors.saffron} />
                      <Txt variant="subheadStrong">{p.monthlyCredits} credits every month</Txt>
                      <Txt variant="caption" color="textMuted">
                        ≈ {Math.floor(p.monthlyCredits / pricing.costs.recipe)} recipes
                      </Txt>
                    </View>
                    {active ? (
                      <View style={{ gap: 6, marginTop: 10 }}>
                        {p.perks.map((perk) => (
                          <View key={perk} style={styles.perk}>
                            <Icon name="checkmark-circle" size={16} color={colors.accent} />
                            <Txt variant="subhead">{perk}</Txt>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>

          <Card style={{ marginTop: 24 }}>
            <Txt variant="headline">What uses credits</Txt>
            <View style={{ marginTop: 10, gap: 10 }}>
              {costs.map((c) => (
                <View key={c.label} style={styles.costRow}>
                  <Txt style={{ width: 26 }}>{c.emoji}</Txt>
                  <Txt variant="subhead" style={{ flex: 1 }}>
                    {c.label}
                  </Txt>
                  <Txt variant="subheadStrong">{c.value === 1 ? '1 credit' : `${c.value} credits`}</Txt>
                </View>
              ))}
              <View style={styles.costRow}>
                <Txt style={{ width: 26 }}>🍳</Txt>
                <Txt variant="subhead" style={{ flex: 1 }}>
                  Saving, planning & cooking mode
                </Txt>
                <Txt variant="subheadStrong" color="accent">
                  Free
                </Txt>
              </View>
            </View>
            <Txt variant="caption" color="textFaint" style={{ marginTop: 12 }}>
              Questions Chef asks are free. Failed imports are refunded automatically. Monthly credits reset each billing month; top-up credits never expire.
            </Txt>
          </Card>

          {subscribed ? (
            <View style={{ marginTop: 24 }}>
              <Txt variant="title3">Need a top-up?</Txt>
              <View style={styles.topups}>
                {pricing.topups.map((t) => {
                  const topupPkg = packages.find((p) => p.productId === t.productId);
                  return (
                    <PressableScale
                      key={t.productId}
                      onPress={() => void buy(topupPkg, t.productId)}
                      style={[styles.topup, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      accessibilityLabel={`${t.credits} credits for ${topupPkg?.priceString ?? t.displayPrice}`}
                    >
                      <Icon name="flash" size={18} color={colors.saffron} />
                      <Txt variant="title3">{t.credits}</Txt>
                      <Txt variant="caption" color="textMuted">
                        credits
                      </Txt>
                      <Txt variant="subheadStrong" style={{ marginTop: 6 }}>
                        {buying === t.productId ? '…' : (topupPkg?.priceString ?? t.displayPrice)}
                      </Txt>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.links}>
            {Platform.OS !== 'web' ? (
              <PressableScale onPress={() => void restore()} hitSlop={8}>
                <Txt variant="footnote" color="textMuted">
                  Restore purchases
                </Txt>
              </PressableScale>
            ) : null}
            <PressableScale onPress={() => void Linking.openURL('https://cookreel.app/terms')} hitSlop={8}>
              <Txt variant="footnote" color="textMuted">
                Terms
              </Txt>
            </PressableScale>
            <PressableScale onPress={() => void Linking.openURL('https://cookreel.app/privacy')} hitSlop={8}>
              <Txt variant="footnote" color="textMuted">
                Privacy
              </Txt>
            </PressableScale>
          </View>
          <Txt variant="caption" color="textFaint" align="center" style={{ marginTop: 8 }}>
            Subscriptions renew automatically until cancelled in your {Platform.OS === 'ios' ? 'App Store' : Platform.OS === 'android' ? 'Google Play' : 'app store'} settings, at least 24 hours before the period ends.
          </Txt>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Button
          label={status !== 'signedIn' ? 'Sign up to subscribe' : balance?.planId === plan.id ? `You’re on ${plan.name}` : `Continue with ${plan.name}`}
          meta={status === 'signedIn' && balance?.planId !== plan.id ? `${price}/${period === 'monthly' ? 'mo' : 'yr'}` : undefined}
          disabled={status === 'signedIn' && balance?.planId === plan.id}
          loading={buying === plan.id}
          onPress={() => void buy(pkg, plan.id)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: GUTTER, paddingBottom: 24 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  body: { paddingHorizontal: GUTTER },
  plan: { borderRadius: radius.lg, borderWidth: 2, padding: 16, overflow: 'hidden' },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  credits: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.sm },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topups: { flexDirection: 'row', gap: 10, marginTop: 12 },
  topup: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: 2 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 28 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
