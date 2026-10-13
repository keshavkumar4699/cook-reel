import { StyleSheet, View } from 'react-native';
import { deviceLanguage, getLanguageSetting, intlLocale, LANGUAGE_INFO, LANGUAGES, setLanguageSetting, t, type AppLanguage, type LanguageSetting } from '@/i18n';
import { GUTTER, radius, useTheme } from '@/theme';
import { Icon } from './ui/Icon';
import { PressableScale } from './ui/PressableScale';
import { Sheet } from './ui/Sheet';
import { Txt } from './ui/Text';

/** The language's name in the current app language ("Spanish", "Spagnolo"…), falling back to English. */
function localName(code: AppLanguage): string {
  try {
    const names = new Intl.DisplayNames([intlLocale()], { type: 'language' });
    const name = names.of(code);
    if (name && name.toLowerCase() !== code) return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    // Intl.DisplayNames isn't available everywhere
  }
  return LANGUAGE_INFO[code].englishName;
}

/** Picks the app language. Choosing one saves it and restarts CookReel in that language. */
export function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const setting = getLanguageSetting();
  const device = deviceLanguage();
  const options: { value: LanguageSetting; label: string; detail: string }[] = [
    { value: 'system', label: t('common.language.system'), detail: t('common.language.systemDetail', { language: LANGUAGE_INFO[device].nativeName }) },
    ...LANGUAGES.map((code) => ({ value: code, label: LANGUAGE_INFO[code].nativeName, detail: localName(code) })),
  ];

  const choose = (value: LanguageSetting) => {
    if (value === setting) {
      onClose();
      return;
    }
    onClose();
    void setLanguageSetting(value);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t('common.language.title')} subtitle={t('common.language.subtitle')}>
      <View style={styles.body}>
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {options.map((option, index) => {
            const selected = option.value === setting;
            return (
              <PressableScale
                key={option.value}
                haptic="select"
                scaleTo={0.99}
                onPress={() => choose(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${option.detail}`}
                style={[styles.row, index < options.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border } : null]}
              >
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong">{option.label}</Txt>
                  <Txt variant="footnote" color="textMuted">
                    {option.detail}
                  </Txt>
                </View>
                {selected ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}
              </PressableScale>
            );
          })}
        </View>
        <Txt variant="caption" color="textFaint" align="center">
          {t('common.language.restartNote')}
        </Txt>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: GUTTER, gap: 12 },
  list: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11, minHeight: 56 },
});
