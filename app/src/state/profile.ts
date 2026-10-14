import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CookProfile, Persona } from '@/data/types';
import { migrateProfileLabels } from '@/lib/profileOptions';
import { kv } from '@/native/kv';

interface ProfileState {
  onboarded: boolean;
  personas: Persona[];
  profile: CookProfile;
  /** Name shown on Home for cooks without an account. */
  guestName: string | null;
  setPersonas(personas: Persona[]): void;
  updateProfile(patch: Partial<CookProfile>): void;
  completeOnboarding(): void;
  setGuestName(name: string | null): void;
  reset(): void;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      onboarded: false,
      personas: [],
      profile: {},
      guestName: null,
      setPersonas: (personas) => set({ personas }),
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      completeOnboarding: () => set({ onboarded: true }),
      setGuestName: (guestName) => set({ guestName }),
      reset: () => set({ onboarded: false, personas: [], profile: {}, guestName: null }),
    }),
    {
      name: 'cookreel.profile',
      storage: createJSONStorage(() => kv),
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as ProfileState;
        // v2: allergy and appliance choices are ids instead of English labels.
        if (version < 2 && state?.profile) state.profile = migrateProfileLabels(state.profile);
        return state;
      },
    },
  ),
);
