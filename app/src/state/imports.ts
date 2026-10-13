import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { kv } from '@/native/kv';

/** The YouTube import in progress, so leaving and reopening the screen resumes it. */
interface ImportsState {
  active: { jobId: string; url: string; isShort: boolean; startedAt: number } | null;
  setActive(active: ImportsState['active']): void;
}

export const useImports = create<ImportsState>()(
  persist((set) => ({ active: null, setActive: (active) => set({ active }) }), {
    name: 'cookreel.imports',
    storage: createJSONStorage(() => kv),
  }),
);
