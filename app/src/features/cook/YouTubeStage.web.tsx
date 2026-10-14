import { createElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n';
import type { YouTubeStageProps } from './YouTubeStage';

export type { YouTubeStageProps };

type PlayerCommand = 'mute' | 'unMute' | 'playVideo' | 'pauseVideo';

/**
 * Web preview: an embed that plays the current clip range. Mute and pause go to the player through
 * the IFrame API's postMessage commands, so narration can quiet the video without reloading it.
 */
export function YouTubeStage({ videoId, clip, playing, muted, width, height, restartToken }: YouTubeStageProps) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const wanted = useRef({ playing, muted });

  // Starts muted (browsers always allow muted autoplay); the real state is applied once the player
  // says it's ready, and every later change is a command.
  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      controls: '0',
      rel: '0',
      playsinline: '1',
      modestbranding: '1',
      enablejsapi: '1',
      ...(typeof window !== 'undefined' ? { origin: window.location.origin } : {}),
      ...(clip ? { start: String(Math.floor(clip.startSec)), end: String(Math.ceil(clip.endSec)) } : {}),
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}&r=${restartToken}`;
  }, [videoId, clip, restartToken]);

  const send = useCallback((func: PlayerCommand) => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  }, []);

  const apply = useCallback(() => {
    send(wanted.current.muted ? 'mute' : 'unMute');
    send(wanted.current.playing ? 'playVideo' : 'pauseVideo');
  }, [send]);

  useEffect(() => {
    wanted.current = { playing, muted };
    apply();
  }, [playing, muted, apply]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      let data: { event?: string } | null = null;
      try {
        data = typeof event.data === 'string' ? (JSON.parse(event.data) as { event?: string }) : (event.data as { event?: string });
      } catch {
        return;
      }
      if (data?.event === 'onReady' || data?.event === 'initialDelivery') apply();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [apply]);

  // Registers for the player's events; it answers with onReady, which applies the wanted state.
  const onLoad = useCallback(() => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: videoId }), '*');
  }, [videoId]);

  return (
    <View style={[styles.frame, { width, height }]}>
      {createElement('iframe', {
        ref: frame,
        src,
        width,
        height,
        title: t('cook.video.playerTitle'),
        allow: 'autoplay; encrypted-media; picture-in-picture',
        onLoad,
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#000000' },
});
