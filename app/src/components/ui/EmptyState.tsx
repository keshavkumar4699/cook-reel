import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { Txt } from './Text';

export function EmptyState({ emoji, title, body, action, onAction }: { emoji: string; title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Txt style={styles.emoji}>{emoji}</Txt>
      <Txt variant="title3" align="center">
        {title}
      </Txt>
      <Txt variant="subhead" color="textMuted" align="center" style={styles.body}>
        {body}
      </Txt>
      {action && onAction ? <Button label={action} onPress={onAction} size="md" style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  emoji: { fontSize: 48, lineHeight: 60, marginBottom: 12 },
  body: { marginTop: 6, maxWidth: 300 },
  button: { marginTop: 20, minWidth: 180 },
});
