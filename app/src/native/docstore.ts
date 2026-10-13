import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

/**
 * Minimal document store on SQLite: every entity is a JSON document addressed by
 * (collection, id). The library is small (hundreds of recipes), so stores load everything into
 * memory at launch and write through on change.
 */
export type CollectionName = 'recipes' | 'collections' | 'plan' | 'shopping';

let dbPromise: Promise<SQLiteDatabase> | null = null;

function db() {
  dbPromise ??= openDatabaseAsync('cookreel.db').then(async (database) => {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS docs (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (collection, id)
      );
    `);
    return database;
  });
  return dbPromise;
}

export const docstore = {
  async all<T>(collection: CollectionName): Promise<T[]> {
    const rows = await (await db()).getAllAsync<{ data: string }>(
      'SELECT data FROM docs WHERE collection = ? ORDER BY updated_at DESC',
      [collection],
    );
    const out: T[] = [];
    for (const row of rows) {
      try {
        out.push(JSON.parse(row.data) as T);
      } catch {
        // Skip a corrupt row rather than failing the whole library.
      }
    }
    return out;
  },
  async put<T extends { id: string }>(collection: CollectionName, doc: T): Promise<void> {
    await (await db()).runAsync(
      'INSERT OR REPLACE INTO docs (collection, id, data, updated_at) VALUES (?, ?, ?, ?)',
      [collection, doc.id, JSON.stringify(doc), Date.now()],
    );
  },
  async putMany<T extends { id: string }>(collection: CollectionName, docs: T[]): Promise<void> {
    const database = await db();
    await database.withTransactionAsync(async () => {
      for (const doc of docs) {
        await database.runAsync(
          'INSERT OR REPLACE INTO docs (collection, id, data, updated_at) VALUES (?, ?, ?, ?)',
          [collection, doc.id, JSON.stringify(doc), Date.now()],
        );
      }
    });
  },
  async remove(collection: CollectionName, id: string): Promise<void> {
    await (await db()).runAsync('DELETE FROM docs WHERE collection = ? AND id = ?', [collection, id]);
  },
  async removeMany(collection: CollectionName, ids: string[]): Promise<void> {
    if (!ids.length) return;
    const database = await db();
    await database.withTransactionAsync(async () => {
      for (const id of ids) await database.runAsync('DELETE FROM docs WHERE collection = ? AND id = ?', [collection, id]);
    });
  },
};
