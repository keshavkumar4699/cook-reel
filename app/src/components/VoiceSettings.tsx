import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useNarrator } from '@/features/cook/useNarrator';
import { useNaturalVoiceInfo } from '@/features/speech/useNaturalVoiceInfo';
import { getLanguage, t, type MessageKey } from '@/i18n';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';
import { radius, useTheme } from '@/theme';
import { ActivityLine } from './ui/ActivityLine';
import { IconButton } from './ui/IconButton';
import { PressableScale } from './ui/PressableScale';
import { Segmented } from './ui/Segmented';
import { SettingsGroup, SettingsRow, SettingsSwitch } from './ui/Settings';
import { Txt } from './ui/Text';

const NAMED_VOICES = ['warm', 'friendly', 'gentle', 'easygoing'];

function voiceName(id: string): string {
  return NAMED_VOICES.includes(id) ? t(`me.voice.voices.${id}` as MessageKey) : id.charAt(0).toUpperCase() + id.slice(1);
}

/** Me → Voice and narration: natural voice, which voice, pace, read-aloud and voice control. */
export function VoiceSettings() {
  const { colors } = useTheme();
  const settings = useSettings();
  const signedIn = useSession((s) => s.status === 'signedIn');
  const info = useNaturalVoiceInfo();
  const narrator = useNarrator({ rate: settings.speechRate, language: getLanguage() });
  const [sampling, setSampling] = useState<string | null>(null);
  const showVoices = signedIn && !!info && settings.naturalVoice;
  const selected = info?.voices.includes(settings.voice) ? settings.voice : info?.defaultVoice;

  const toggleSample = (id: string) => {
    if (sampling === id && narrator.busy) {
      narrator.stop();
      setSampling(null);
      return;
    }
    setSampling(id);
    narrator.speak(t('me.voice.sample'), { voice: id, onDone: () => setSampling(null) });
  };

  return (
    <SettingsGroup title={t('me.groups.voice')}>
      {!signedIn ? (
        <SettingsRow icon="sparkles-outline" label={t('me.voice.natural')} detail={t('me.voice.naturalGuest')} onPress={() => router.push('/sign-in')} />
      ) : info ? (
        <SettingsRow
          icon="sparkles-outline"
          label={t('me.voice.natural')}
          detail={t('me.voice.naturalDetail')}
          right={<SettingsSwitch value={settings.naturalVoice} onValueChange={(v) => settings.set({ naturalVoice: v })} label={t('me.voice.natural')} />}
        />
      ) : null}

      {showVoices ? (
        <View style={[styles.voices, { borderColor: colors.border }]}>
          <Txt variant="footnote" color="textMuted" style={styles.caption}>
            {t('me.voice.choose')}
          </Txt>
          <View style={styles.voiceGrid}>
            {info.voices.map((id) => {
              const active = id === selected;
              const playing = sampling === id && narrator.busy;
              return (
                <PressableScale
                  key={id}
                  haptic="select"
                  scaleTo={0.97}
                  onPress={() => settings.set({ voice: id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={voiceName(id)}
                  style={[styles.voice, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primarySoft : colors.surface }]}
                >
                  <View style={[styles.radio, { borderColor: active ? colors.primary : colors.borderStrong }]}>
                    {active ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
                  </View>
                  <Txt variant="subheadStrong" style={{ flex: 1 }} numberOfLines={1}>
                    {voiceName(id)}
                  </Txt>
                  <IconButton
                    icon={playing ? 'stop' : 'play'}
                    label={playing ? t('me.voice.stopSample') : t('me.voice.playSample', { voice: voiceName(id) })}
                    variant="soft"
                    size={32}
                    iconSize={15}
                    onPress={() => toggleSample(id)}
                  />
                </PressableScale>
              );
            })}
          </View>
          <ActivityLine
            active={narrator.preparing && sampling !== null}
            label={t('me.voice.preparing')}
            caption={t('me.voice.preparing')}
            color={colors.ai}
            trackColor={colors.surfaceMuted}
            captionColor={colors.textMuted}
            style={styles.activity}
          />
        </View>
      ) : null}

      <View style={[styles.inline, { borderColor: colors.border }]}>
        <Txt variant="footnote" color="textMuted" style={{ marginBottom: 8 }}>
          {t('me.voice.pace')}
        </Txt>
        <Segmented
          value={String(settings.speechRate)}
          onChange={(v) => settings.set({ speechRate: Number(v) })}
          options={[
            { value: '0.85', label: t('me.voice.paces.relaxed') },
            { value: '1', label: t('me.voice.paces.normal') },
            { value: '1.15', label: t('me.voice.paces.brisk') },
          ]}
        />
      </View>
      <SettingsRow
        icon="volume-high-outline"
        label={t('me.rows.readAloud')}
        detail={t('me.rows.readAloudDetail')}
        right={<SettingsSwitch value={settings.autoNarrate} onValueChange={(v) => settings.set({ autoNarrate: v })} label={t('me.rows.readAloud')} />}
      />
      <SettingsRow
        icon="mic-outline"
        label={t('me.rows.voiceControl')}
        detail={t('me.rows.voiceControlDetail')}
        right={<SettingsSwitch value={settings.voiceControl} onValueChange={(v) => settings.set({ voiceControl: v })} label={t('me.rows.voiceControl')} />}
        last
      />
    </SettingsGroup>
  );
}

const styles = StyleSheet.create({
  voices: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  caption: { marginBottom: 8 },
  voiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  voice: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingStart: 10,
    paddingEnd: 4,
    paddingVertical: 4,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  activity: { marginTop: 12 },
  inline: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
