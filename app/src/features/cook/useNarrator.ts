import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';

/** Text-to-speech for step narration (Shorts) and "read it to me". */
export function useNarrator(rate: number) {
  const [speaking, setSpeaking] = useState(false);
  const token = useRef(0);

  const stop = useCallback(() => {
    token.current++;
    void Speech.stop();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      const mine = ++token.current;
      void Speech.stop();
      if (!text.trim()) return;
      setSpeaking(true);
      const finish = () => {
        if (mine !== token.current) return;
        setSpeaking(false);
        onDone?.();
      };
      Speech.speak(text, { rate, pitch: 1, onDone: finish, onStopped: finish, onError: finish });
    },
    [rate],
  );

  useEffect(() => () => void Speech.stop(), []);
  return { speaking, speak, stop };
}
