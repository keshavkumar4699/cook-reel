import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { radius } from '@/theme';
import { Txt } from './Text';

export function Avatar({ name, uri, size = 44 }: { name: string | null; uri?: string | null; size?: number }) {
  const initial = (name ?? '').trim().charAt(0).toUpperCase() || '🙂';
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius.pill }} contentFit="cover" />;
  return (
    <View style={{ width: size, height: size, borderRadius: radius.pill, overflow: 'hidden' }}>
      <LinearGradient colors={['#FF8A5B', '#E2552D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
        <Txt variant="headline" color="#FFFFFF" style={{ fontSize: size * 0.42, lineHeight: size * 0.5 }}>
          {initial}
        </Txt>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
