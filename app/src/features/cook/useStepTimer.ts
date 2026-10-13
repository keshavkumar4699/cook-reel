import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';

export interface StepTimer {
  stepId: string;
  label: string;
  total: number;
  remaining: number;
  running: boolean;
  done: boolean;
}

/** One kitchen timer that keeps counting while you move between steps. */
export function useStepTimer(onDone: (timer: StepTimer) => void) {
  const [timer, setTimer] = useState<StepTimer | null>(null);
  const endsAt = useRef<number | null>(null);
  const emitDone = useEffectEvent(onDone);

  useEffect(() => {
    if (!timer?.running) return;
    const id = setInterval(() => {
      if (!endsAt.current) return;
      const remaining = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      if (remaining === 0) endsAt.current = null;
      setTimer((t) => {
        if (!t || !t.running) return t;
        if (remaining === 0) return { ...t, remaining: 0, running: false, done: true };
        return t.remaining === remaining ? t : { ...t, remaining };
      });
    }, 250);
    return () => clearInterval(id);
  }, [timer?.running]);

  // A finished timer object stays the same until the next start/cancel, so this fires once per timer.
  useEffect(() => {
    if (timer?.done) emitDone(timer);
  }, [timer]);

  const start = useCallback((stepId: string, label: string, seconds: number) => {
    endsAt.current = Date.now() + seconds * 1000;
    setTimer({ stepId, label, total: seconds, remaining: seconds, running: true, done: false });
  }, []);

  const pause = useCallback(() => {
    endsAt.current = null;
    setTimer((t) => (t && t.running ? { ...t, running: false } : t));
  }, []);

  const resume = useCallback(() => {
    if (!timer || timer.running || timer.done) return;
    endsAt.current = Date.now() + timer.remaining * 1000;
    setTimer({ ...timer, running: true });
  }, [timer]);

  const cancel = useCallback(() => {
    endsAt.current = null;
    setTimer(null);
  }, []);

  return { timer, start, pause, resume, cancel };
}
