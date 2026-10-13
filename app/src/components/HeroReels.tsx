import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { radius, stage } from '@/theme';
import { Icon } from './ui/Icon';
import { Txt } from './ui/Text';
import { t } from '@/i18n';

function useFloat(delay: number, distance = 6) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, [delay, distance, y]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

function SideCard({ emoji, colors, step, rotate, side }: { emoji: string; colors: [string, string]; step: string; rotate: string; side: 'left' | 'right' }) {
  const float = useFloat(side === 'left' ? 300 : 900, 5);
  return (
    <Animated.View
      entering={FadeInDown.delay(side === 'left' ? 120 : 220).springify().damping(16)}
      style={[styles.side, side === 'left' ? styles.left : styles.right, { transform: [{ rotate }] }]}
    >
      <Animated.View style={[styles.sideInner, float]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sideCover, side === 'left' ? styles.alignStart : styles.alignEnd]}
        >
          <Txt style={{ fontSize: 40, lineHeight: 48 }}>{emoji}</Txt>
        </LinearGradient>
        <View style={[styles.sideBody, side === 'left' ? styles.alignStart : styles.alignEnd]}>
          <Txt variant="caption" color="#8A7F75">
            {step}
          </Txt>
          <View style={styles.sideBar} />
          <View style={[styles.sideBar, { width: 34 }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

/** A fanned stack of cook-along "reels" — the product in one picture. */
export function HeroReels() {
  const float = useFloat(0, 7);
  return (
    <View style={styles.stage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SideCard side="left" emoji="🍳" colors={['#FFE3D5', '#FFC5A6']} step={t('ui.hero.sideStep', { n: '2' })} rotate="-10deg" />
      <SideCard side="right" emoji="🥗" colors={['#E3F2E8', '#BFE3CD']} step={t('ui.hero.sideStep', { n: '4' })} rotate="10deg" />
      <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.mainWrap}>
        <Animated.View style={[styles.main, float]}>
          <View style={styles.segments}>
            {[1, 1, 0.45, 0, 0].map((fill, i) => (
              <View key={i} style={styles.segment}>
                <View style={[styles.segmentFill, { width: `${fill * 100}%` }]} />
              </View>
            ))}
          </View>
          <LinearGradient colors={['#FF8A5B', '#E2552D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.video}>
            <Txt style={{ fontSize: 64, lineHeight: 76 }}>🍜</Txt>
            <View style={styles.play}>
              <Icon name="play" size={14} color="#FFFFFF" />
            </View>
          </LinearGradient>
          <Txt variant="caption" color={stage.textFaint} style={{ marginTop: 10 }}>
            {t('ui.hero.stepOf', { current: '3', total: '5', range: '0:42–0:58' })}
          </Txt>
          <Txt variant="title3" color="#FFFFFF" style={{ marginTop: 2 }}>
            {t('ui.hero.stepTitle')}
          </Txt>
          <View style={styles.voice}>
            <View style={styles.liveDot} />
            <Txt variant="caption" color="#FFFFFF">
              {t('ui.hero.sayNext')}
            </Txt>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const CARD_W = 182;
const styles = StyleSheet.create({
  stage: { height: 330, alignItems: 'center', justifyContent: 'center' },
  side: { position: 'absolute', top: 62 },
  left: { left: '2%' },
  right: { right: '2%' },
  sideInner: {
    width: 138,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#3B2A1A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sideCover: { height: 120, justifyContent: 'center', paddingHorizontal: 18 },
  sideBody: { paddingHorizontal: 14, paddingVertical: 12, gap: 6 },
  sideBar: { height: 6, width: 48, borderRadius: 3, backgroundColor: '#EFE7DC' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  mainWrap: { zIndex: 2 },
  main: {
    width: CARD_W,
    padding: 12,
    borderRadius: 26,
    backgroundColor: '#1D1A17',
    shadowColor: '#3B2A1A',
    shadowOpacity: 0.3,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  segments: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  segmentFill: { height: '100%', backgroundColor: '#FFFFFF' },
  video: { height: 150, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  play: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#52B788' },
});
