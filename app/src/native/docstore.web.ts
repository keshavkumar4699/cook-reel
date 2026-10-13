import { kv } from './kv';

/** Web preview: same document-store contract, persisted to localStorage. */
export type CollectionName = 'recipes' | 'collections' | 'plan' | 'shopping';

const cache = new Map<CollectionName, Record<string, unknown>>();

async function load(collection: CollectionName): Promise<Record<string, unknown>> {
  const hit = cache.get(collection);
  if (hit) return hit;
  let docs: Record<string, unknown> = {};
  try {
    docs = JSON.parse((await kv.getItem(`docs:${collection}`)) ?? '{}') as Record<string, unknown>;
  } catch {
    docs = {};
  }
  cache.set(collection, docs);
  return docs;
}

const save = (collection: CollectionName, docs: Record<string, unknown>) => kv.setItem(`docs:${collection}`, JSON.stringify(docs));

export const docstore = {
  async all<T>(collection: CollectionName): Promise<T[]> {
    return Object.values(await load(collection)) as T[];
  },
  async put<T extends { id: string }>(collection: CollectionName, doc: T): Promise<void> {
    const docs = await load(collection);
    docs[doc.id] = doc;
    await save(collection, docs);
  },
  async putMany<T extends { id: string }>(collection: CollectionName, list: T[]): Promise<void> {
    const docs = await load(collection);
    for (const doc of list) docs[doc.id] = doc;
    await save(collection, docs);
  },
  async remove(collection: CollectionName, id: string): Promise<void> {
    const docs = await load(collection);
    delete docs[id];
    await save(collection, docs);
  },
  async removeMany(collection: CollectionName, ids: string[]): Promise<void> {
    const docs = await load(collection);
    for (const id of ids) delete docs[id];
    await save(collection, docs);
  },
};
