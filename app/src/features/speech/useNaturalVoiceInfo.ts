import { useEffect, useState } from 'react';
import { naturalVoiceInfo, type NaturalVoiceInfo } from './naturalVoice';

/** The server's natural voices: undefined while loading, null when the server has none. */
export function useNaturalVoiceInfo(): NaturalVoiceInfo | null | undefined {
  const [info, setInfo] = useState<NaturalVoiceInfo | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void naturalVoiceInfo().then((value) => {
      if (alive) setInfo(value);
    });
    return () => {
      alive = false;
    };
  }, []);
  return info;
}
