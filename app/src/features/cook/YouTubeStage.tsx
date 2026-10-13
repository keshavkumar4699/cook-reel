import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import YoutubePlayer, { type YoutubeIframeRef } from 'react-native-youtube-iframe';
import { t } from '@/i18n';

export interface YouTubeStageProps {
  videoId: string;
  clip: { startSec: number; endSec: number } | null;
  playing: boolean;
  muted: boolean;
  width: number;
  height: number;
  /** Increment to replay the current clip from its start ("repeat"). */
  restartToken: number;
  onProgress?: (fraction: number) => void;
  onLoop?: () => void;
  onError?: (message: string) => void;
}

/**
 * The official YouTube player, used as a clip looper: seeks to the step's start, and when playback
 * reaches the end of the clip it jumps back. Nothing is drawn over the player (YouTube's terms).
 */
export function YouTubeStage({ videoId, clip, playing, muted, width, height, restartToken, onProgress, onLoop, onError }: YouTubeStageProps) {
  const ref = useRef<YoutubeIframeRef | null>(null);
  const [ready, setReady] = useState(false);
  const emitProgress = useEffectEvent((fraction: number) => onProgress?.(fraction));
  const emitLoop = useEffectEvent(() => onLoop?.());

  useEffect(() => {
    if (ready && clip) ref.current?.seekTo(clip.startSec, true);
  }, [ready, clip?.startSec, clip?.endSec, restartToken, clip]);

  useEffect(() => {
    if (!ready || !clip || !playing) return;
    const id = setInterval(async () => {
      const time = await ref.current?.getCurrentTime().catch(() => null);
      if (typeof time !== 'number') return;
      const span = Math.max(1, clip.endSec - clip.startSec);
      emitProgress(Math.min(1, Math.max(0, (time - clip.startSec) / span)));
      if (time >= clip.endSec - 0.15) {
        ref.current?.seekTo(clip.startSec, true);
        emitLoop();
      } else if (time < clip.startSec - 1.5) {
        ref.current?.seekTo(clip.startSec, true);
      }
    }, 250);
    return () => clearInterval(id);
  }, [ready, clip, playing]);

  return (
    <View style={[styles.frame, { width, height }]}>
      <YoutubePlayer
        ref={ref}
        videoId={videoId}
        width={width}
        height={height}
        play={playing && !!clip}
        mute={muted}
        forceAndroidAutoplay
        initialPlayerParams={{ controls: false, rel: false, iv_load_policy: 3, preventFullScreen: true, start: Math.floor(clip?.startSec ?? 0) }}
        onReady={() => setReady(true)}
        onError={(error: string) => onError?.(error === 'embed_not_allowed' ? t('cook.video.embedBlocked') : t('cook.video.unavailable'))}
        webViewProps={{ allowsInlineMediaPlayback: true, mediaPlaybackRequiresUserAction: false }}
        webViewStyle={{ backgroundColor: '#000000' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#000000' },
});
