import { GoogleGenAI, MediaResolution } from '@google/genai';
import type { Logger } from 'pino';
import { z } from 'zod';
import { EMBEDDING_DIMENSIONS } from '../db/schema.js';
import type { ParsedYouTubeUrl } from '../domain/youtube.js';
import { AIError } from '../lib/errors.js';
import { VIDEO_ANALYSIS_PROMPT } from './prompts.js';

export const VideoBreakdownSchema = z.object({
  isCookingVideo: z.boolean(),
  dishName: z.string(),
  language: z.string(),
  durationSec: z.number(),
  servingsMentioned: z.number(),
  ingredients: z.array(z.object({ name: z.string(), quantityText: z.string(), estimated: z.boolean() })),
  steps: z.array(z.object({ startSec: z.number(), endSec: z.number(), action: z.string(), spokenTips: z.string() })),
  notes: z.string(),
});
export type VideoBreakdown = z.infer<typeof VideoBreakdownSchema>;

/** Hand-written (rather than generated) to stay inside the JSON-schema subset Gemini accepts. */
const BREAKDOWN_JSON_SCHEMA = {
  type: 'object',
  properties: {
    isCookingVideo: { type: 'boolean' },
    dishName: { type: 'string' },
    language: { type: 'string' },
    durationSec: { type: 'number', description: 'Total video length in seconds' },
    servingsMentioned: { type: 'number', description: '0 when not mentioned' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantityText: { type: 'string' },
          estimated: { type: 'boolean' },
        },
        required: ['name', 'quantityText', 'estimated'],
      },
    },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          startSec: { type: 'number' },
          endSec: { type: 'number' },
          action: { type: 'string' },
          spokenTips: { type: 'string' },
        },
        required: ['startSec', 'endSec', 'action', 'spokenTips'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['isCookingVideo', 'dishName', 'language', 'durationSec', 'servingsMentioned', 'ingredients', 'steps', 'notes'],
} as const;

export interface VideoAnalyzer {
  readonly model: string;
  analyze(video: ParsedYouTubeUrl): Promise<VideoBreakdown>;
}

export interface Embedder {
  embed(text: string, kind: 'document' | 'query'): Promise<number[]>;
}

function unitLength(values: number[]): number[] {
  const norm = Math.hypot(...values);
  return norm > 0 ? values.map((v) => v / norm) : values;
}

export function createGemini(config: { apiKey: string; model: string; embeddingModel: string }, logger: Logger) {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  const analyzer: VideoAnalyzer = {
    model: config.model,
    async analyze(video) {
      const started = Date.now();
      let text: string | undefined;
      try {
        const response = await ai.models.generateContent({
          model: config.model,
          contents: [
            {
              role: 'user',
              parts: [
                // Shorts are brief: sample more frames for tighter step timestamps.
                { fileData: { fileUri: video.canonicalUrl }, ...(video.isShort ? { videoMetadata: { fps: 2 } } : {}) },
                { text: VIDEO_ANALYSIS_PROMPT },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: BREAKDOWN_JSON_SCHEMA,
            // Low resolution keeps long videos affordable; steps are about actions, not fine detail.
            mediaResolution: video.isShort ? MediaResolution.MEDIA_RESOLUTION_MEDIUM : MediaResolution.MEDIA_RESOLUTION_LOW,
            abortSignal: AbortSignal.timeout(5 * 60 * 1000),
          },
        });
        if (response.promptFeedback?.blockReason) {
          throw new AIError('refused', `video analysis blocked: ${response.promptFeedback.blockReason}`);
        }
        text = response.text;
        logger.info(
          {
            label: 'video-analysis',
            model: config.model,
            ms: Date.now() - started,
            promptTokens: response.usageMetadata?.promptTokenCount,
            outputTokens: response.usageMetadata?.candidatesTokenCount,
          },
          'gemini call',
        );
      } catch (error) {
        if (error instanceof AIError) throw error;
        logger.warn({ err: error, videoId: video.videoId }, 'gemini video analysis failed');
        throw new AIError('upstream', 'Video analysis failed', { cause: error });
      }

      try {
        return VideoBreakdownSchema.parse(JSON.parse(text ?? ''));
      } catch (error) {
        throw new AIError('invalid_output', 'Video analysis returned malformed JSON', { cause: error });
      }
    },
  };

  const embedder: Embedder = {
    async embed(text, kind) {
      const response = await ai.models.embedContent({
        model: config.embeddingModel,
        contents: text,
        config: {
          taskType: kind === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT',
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      });
      const values = response.embeddings?.[0]?.values;
      if (!values || values.length !== EMBEDDING_DIMENSIONS) throw new Error('embedding has unexpected shape');
      // Truncated (Matryoshka) embeddings aren't unit length; normalise for cosine search.
      return unitLength(values);
    },
  };

  return { analyzer, embedder };
}
