import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema.js';

export type Schema = typeof schema;
/** Driver-agnostic database handle (node-postgres in production, PGlite in dev/tests). */
export type Db = PgDatabase<PgQueryResultHKT, Schema>;

export type DatabaseTarget = { kind: 'postgres'; url: string } | { kind: 'pglite'; dir: string | null };

export interface Database {
  db: Db;
  close(): Promise<void>;
}

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

/**
 * Opens the database and applies pending migrations.
 * - `postgres`: any Postgres 15+ with the pgvector extension available (Neon, Supabase, RDS, Railway…).
 * - `pglite`: embedded WASM Postgres for local development; `dir: null` keeps it in memory (tests).
 */
export async function openDatabase(target: DatabaseTarget): Promise<Database> {
  if (target.kind === 'postgres') {
    const [{ default: pg }, { drizzle }, { migrate }] = await Promise.all([
      import('pg'),
      import('drizzle-orm/node-postgres'),
      import('drizzle-orm/node-postgres/migrator'),
    ]);
    const pool = new pg.Pool({ connectionString: target.url, max: 10 });
    const db = drizzle({ client: pool, schema });
    await migrate(db, { migrationsFolder });
    return { db: db as unknown as Db, close: () => pool.end() };
  }

  const [{ PGlite }, { vector }, { drizzle }, { migrate }] = await Promise.all([
    import('@electric-sql/pglite'),
    import('@electric-sql/pglite-pgvector'),
    import('drizzle-orm/pglite'),
    import('drizzle-orm/pglite/migrator'),
  ]);
  if (target.dir) mkdirSync(target.dir, { recursive: true });
  const client = new PGlite({ dataDir: target.dir ?? undefined, extensions: { vector } });
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder });
  return { db: db as unknown as Db, close: () => client.close() };
}
