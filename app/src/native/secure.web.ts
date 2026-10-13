import { kv } from './kv';

/** Web preview only — browsers have no keychain. */
export const secure = {
  get: (key: string) => kv.getItem(`secure:${key}`),
  set: (key: string, value: string) => kv.setItem(`secure:${key}`, value),
  remove: (key: string) => kv.removeItem(`secure:${key}`),
};
