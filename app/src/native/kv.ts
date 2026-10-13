import Storage from 'expo-sqlite/kv-store';

/** Small key-value store for preferences (SQLite-backed on device). */
export const kv = {
  getItem: (key: string) => Storage.getItem(key),
  setItem: (key: string, value: string) => Storage.setItem(key, value),
  removeItem: async (key: string) => {
    await Storage.removeItem(key);
  },
  /** Synchronous access for values needed before the first render (the app language). */
  getItemSync: (key: string): string | null => Storage.getItemSync(key),
  setItemSync: (key: string, value: string) => Storage.setItemSync(key, value),
};
