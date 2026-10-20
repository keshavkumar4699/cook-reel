import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { font, inputReset, radius, useTheme } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  hint?: string;
  error?: string | null;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, icon, trailing, containerStyle, hint, error, style, multiline, ...rest },
  ref,
) {
  const { colors } = useTheme();
  return (
    <View style={containerStyle}>
      {label ? (
        <Txt variant="footnote" color="textMuted" style={styles.label}>
          {label}
        </Txt>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            minHeight: multiline ? 96 : 52,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon ? <Icon name={icon} size={18} color="textFaint" /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.primary}
          multiline={multiline}
          {...rest}
          style={[
            styles.input,
            inputReset,
            { color: colors.text, ...font('medium'), paddingTop: multiline ? 14 : 0, textAlignVertical: multiline ? 'top' : 'center' },
            style,
          ]}
        />
        {trailing}
      </View>
      {error || hint ? (
        <Txt variant="caption" color={error ? 'danger' : 'textFaint'} style={styles.hint}>
          {error ?? hint}
        </Txt>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: 6, marginStart: 4 },
  field: { flexDirection: 'row', borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth * 2, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, fontSize: 16, minHeight: 50, paddingVertical: 0 },
  hint: { marginTop: 6, marginStart: 4 },
});
