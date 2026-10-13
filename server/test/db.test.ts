import { cosineDistance, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openDatabase, type Database } from '../src/db/client.js';
import { EMBEDDING_DIMENSIONS, recipeKnowledge, users } from '../src/db/schema.js';

describe('database', () => {
  let database: Database;
  beforeAll(async () => {
    database = await openDatabase({ kind: 'pglite', dir: null });
  });
  afterAll(async () => {
    await database.close();
  });

  it('applies migrations and supports pgvector similarity search', async () => {
    const { db } = database;
    const [user] = await db.insert(users).values({ name: 'Test' }).returning();
    expect(user?.planCredits).toBe(0);

    const unit = (axis: number) => Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => (i === axis ? 1 : 0));
    await db.insert(recipeKnowledge).values([
      { userId: user!.id, title: 'near', summary: 's', embedding: unit(0) },
      { userId: user!.id, videoId: 'v2', title: 'far', summary: 's', embedding: unit(1) },
    ]);
    const distance = cosineDistance(recipeKnowledge.embedding, unit(0));
    const rows = await db
      .select({ title: recipeKnowledge.title, distance })
      .from(recipeKnowledge)
      .where(eq(recipeKnowledge.userId, user!.id))
      .orderBy(distance);
    expect(rows.map((r) => r.title)).toEqual(['near', 'far']);
    expect(Number(rows[0]!.distance)).toBeCloseTo(0);
  });
});
