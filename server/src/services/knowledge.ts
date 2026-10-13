import { and, cosineDistance, eq, isNotNull, or } from 'drizzle-orm';
import type { Logger } from 'pino';
import type { Db } from '../db/client.js';
import { recipeKnowledge } from '../db/schema.js';
import { knowledgeSummary, type Recipe } from '../domain/recipe.js';
import type { Embedder } from './gemini.js';

export interface KnowledgeReference {
  title: string;
  summary: string;
  similarity: number;
}

/**
 * Retrieval-augmented memory. Every analysed video recipe becomes a compact, embedded summary; when a
 * cook asks Chef for something new, the closest summaries (their own plus the opted-in community
 * pool) are handed to the model as reference recipes. The model itself is never retrained, so a
 * cook's data can be withdrawn instantly (opt-out or account deletion).
 */
export interface KnowledgeBase {
  remember(entry: { userId: string; videoId: string; shared: boolean; recipe: Recipe }): Promise<void>;
  search(query: { userId: string; text: string; limit?: number }): Promise<KnowledgeReference[]>;
}

export function createKnowledgeBase(
  db: Db,
  embedder: Embedder | null,
  logger: Logger,
  options: { minSimilarity?: number } = {},
): KnowledgeBase {
  /** Cosine similarity below which a stored recipe is considered unrelated to the request. */
  const minSimilarity = options.minSimilarity ?? 0.55;
  const cache = new Map<string, number[]>();
  const embed = async (text: string, kind: 'document' | 'query') => {
    const key = `${kind}:${text}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const vector = await embedder!.embed(text, kind);
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    cache.set(key, vector);
    return vector;
  };

  return {
    async remember({ userId, videoId, shared, recipe }) {
      if (!embedder) return;
      try {
        const summary = knowledgeSummary(recipe);
        const embedding = await embed(summary, 'document');
        await db
          .insert(recipeKnowledge)
          .values({ userId, videoId, shared, title: recipe.title, summary, embedding })
          .onConflictDoNothing();
      } catch (error) {
        logger.warn({ err: error, videoId }, 'failed to store recipe knowledge');
      }
    },

    async search({ userId, text, limit = 4 }) {
      if (!embedder || !text.trim()) return [];
      try {
        const vector = await embed(text.slice(0, 2000), 'query');
        const distance = cosineDistance(recipeKnowledge.embedding, vector);
        const rows = await db
          .select({ title: recipeKnowledge.title, summary: recipeKnowledge.summary, videoId: recipeKnowledge.videoId, distance })
          .from(recipeKnowledge)
          .where(and(isNotNull(recipeKnowledge.embedding), or(eq(recipeKnowledge.shared, true), eq(recipeKnowledge.userId, userId))))
          .orderBy(distance)
          .limit(limit * 3);

        const seen = new Set<string>();
        const references: KnowledgeReference[] = [];
        for (const row of rows) {
          const similarity = 1 - Number(row.distance);
          const key = row.videoId ?? row.title.toLowerCase();
          if (similarity < minSimilarity || seen.has(key)) continue;
          seen.add(key);
          references.push({ title: row.title, summary: row.summary, similarity: Math.round(similarity * 1000) / 1000 });
          if (references.length >= limit) break;
        }
        return references;
      } catch (error) {
        // Retrieval only improves answers; never fail a request because of it.
        logger.warn({ err: error }, 'knowledge search failed');
        return [];
      }
    },
  };
}
