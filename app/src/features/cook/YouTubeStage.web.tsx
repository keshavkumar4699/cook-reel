import { createElement, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n';
import type { YouTubeStageProps } from './YouTubeStage';

export type { YouTubeStageProps };

/** Web preview: a plain embed that plays the current clip range. */
export function YouTubeStage({ videoId, clip, playing, muted, width, height, restartToken }: YouTubeStageProps) {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: playing ? '1' : '0',
      mute: muted ? '1' : '0',
      controls: '0',
      rel: '0',
      playsinline: '1',
      modestbranding: '1',
      ...(clip ? { start: String(Math.floor(clip.startSec)), end: String(Math.ceil(clip.endSec)) } : {}),
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}&r=${restartToken}`;
  }, [videoId, clip, playing, muted, restartToken]);
  return (
    <View style={[styles.frame, { width, height }]}>
      {createElement('iframe', {
        src,
        width,
        height,
        title: t('cook.video.playerTitle'),
        allow: 'autoplay; encrypted-media; picture-in-picture',
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#000000' },
});
