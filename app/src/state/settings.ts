import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { kv } from '@/native/kv';

export type Appearance = 'system' | 'light' | 'dark';

interface SettingsState {
  appearance: Appearance;
  /** Listen for "next", "back", "stop"… in cooking mode. */
  voiceControl: boolean;
  /** Read each step aloud when it appears (always on for Shorts). */
  autoNarrate: boolean;
  speechRate: number;
  /** Narrate with the server's natural voices when signed in (falls back to the phone's voice). */
  naturalVoice: boolean;
  /** Natural voice id, e.g. "warm"; the server's default when it doesn't know it. */
  voice: string;
  dismissedTips: string[];
  set(patch: Partial<Omit<SettingsState, 'set' | 'dismissTip'>>): void;
  dismissTip(id: string): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'system',
      voiceControl: true,
      autoNarrate: false,
      speechRate: 1,
      naturalVoice: true,
      voice: 'warm',
      dismissedTips: [],
      set: (patch) => set(patch),
      dismissTip: (id) => set((s) => ({ dismissedTips: [...new Set([...s.dismissedTips, id])] })),
    }),
    { name: 'cookreel.settings', storage: createJSONStorage(() => kv), version: 1 },
  ),
);
