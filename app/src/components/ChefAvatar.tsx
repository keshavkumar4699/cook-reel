import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt } from './ui/Text';

export function ChefAvatar({ size = 32 }: { size?: number }) {
  return (
    <LinearGradient colors={['#8E7BFF', '#5B4BDB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Txt style={{ fontSize: size * 0.52, lineHeight: size * 0.66 }}>👩‍🍳</Txt>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ avatar: { alignItems: 'center', justifyContent: 'center' } });
