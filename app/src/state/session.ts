import { create } from 'zustand';
import { api, configureApi, type ApiUser, type Balance, type SessionResponse } from '@/lib/api';
import { kv } from '@/native/kv';
import { purchases } from '@/native/purchases';
import { secure } from '@/native/secure';
import { googleAuth } from '@/native/google';

const TOKEN_KEY = 'cookreel.session';
const CACHE_KEY = 'cookreel.session.cache';

type Status = 'loading' | 'guest' | 'signedIn';

interface SessionState {
  status: Status;
  token: string | null;
  user: ApiUser | null;
  balance: Balance | null;
  hydrate(): Promise<void>;
  setSession(session: SessionResponse): Promise<void>;
  setBalance(balance: Balance): void;
  setUser(user: ApiUser): void;
  refresh(): Promise<void>;
  signOut(): Promise<void>;
}

const persistCache = (user: ApiUser | null, balance: Balance | null) =>
  kv.setItem(CACHE_KEY, JSON.stringify({ user, balance })).catch(() => undefined);

export const useSession = create<SessionState>()((set, get) => ({
  status: 'loading',
  token: null,
  user: null,
  balance: null,

  async hydrate() {
    const token = await secure.get(TOKEN_KEY).catch(() => null);
    if (!token) {
      set({ status: 'guest' });
      void purchases.identify(null).catch(() => undefined);
      return;
    }
    let cached: { user: ApiUser | null; balance: Balance | null } = { user: null, balance: null };
    try {
      cached = JSON.parse((await kv.getItem(CACHE_KEY)) ?? '{}');
    } catch {
      // ignore a corrupt cache
    }
    set({ status: 'signedIn', token, user: cached.user ?? null, balance: cached.balance ?? null });
    if (cached.user) void purchases.identify(cached.user.id).catch(() => undefined);
    void get().refresh();
  },

  async setSession(session) {
    await secure.set(TOKEN_KEY, session.token);
    set({ status: 'signedIn', token: session.token, user: session.user, balance: session.balance });
    void persistCache(session.user, session.balance);
    void purchases.identify(session.user.id).catch(() => undefined);
  },

  setBalance(balance) {
    set({ balance });
    void persistCache(get().user, balance);
  },

  setUser(user) {
    set({ user });
    void persistCache(user, get().balance);
  },

  async refresh() {
    if (!get().token) return;
    try {
      const { user, balance } = await api.me();
      set({ user, balance });
      void persistCache(user, balance);
      void purchases.identify(user.id).catch(() => undefined);
    } catch {
      // Offline is fine — the cached profile stays visible. 401s sign out via the API client.
    }
  },

  async signOut() {
    await secure.remove(TOKEN_KEY).catch(() => undefined);
    await kv.removeItem(CACHE_KEY).catch(() => undefined);
    set({ status: 'guest', token: null, user: null, balance: null });
    void googleAuth.signOut();
    void purchases.identify(null).catch(() => undefined);
  },
}));

configureApi({
  token: () => useSession.getState().token,
  onUnauthorized: () => void useSession.getState().signOut(),
});

export const useIsSignedIn = () => useSession((s) => s.status === 'signedIn');
