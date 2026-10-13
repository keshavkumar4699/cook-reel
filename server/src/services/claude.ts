import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { Logger } from 'pino';
import { z } from 'zod';
import {
  RecipeDraftSchema,
  describeProfile,
  recipeToPromptText,
  type CookProfile,
  type RecipeDraft,
  type RecipeInput,
} from '../domain/recipe.js';
import type { VideoMeta } from '../domain/youtube.js';
import { AIError } from '../lib/errors.js';
import type { VideoBreakdown } from './gemini.js';
import type { KnowledgeReference } from './knowledge.js';
import { BUILDER_SYSTEM_PROMPT, EXPERIMENT_SYSTEM_PROMPT, FRIDGE_MODE_NOTE, VIDEO_SYSTEM_PROMPT } from './prompts.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const BuilderTurnSchema = z.object({
  kind: z.enum(['question', 'recipe']).describe('"question" to ask the cook something, "recipe" to deliver the recipe'),
  message: z.string().describe('What Chef says to the cook in this turn'),
  suggestions: z.array(z.string()).describe('Tap-to-answer quick replies for a question turn; empty for a recipe turn'),
  recipe: RecipeDraftSchema.nullable().describe('The recipe when kind is "recipe", otherwise null'),
});
export type BuilderTurn = z.infer<typeof BuilderTurnSchema>;

export const ExperimentResultSchema = z.object({
  message: z.string(),
  changes: z.array(z.string()),
  recipe: RecipeDraftSchema,
});
export type ExperimentResult = z.infer<typeof ExperimentResultSchema>;

export interface BuilderTurnInput {
  messages: ChatMessage[];
  mode: 'describe' | 'fridge';
  pantry: string[];
  profile?: CookProfile;
  references: KnowledgeReference[];
  /** Set once enough questions were asked: the model must deliver the recipe now. */
  forceRecipe: boolean;
}

export interface VideoRecipeInput {
  url: string;
  meta: VideoMeta;
  breakdown: VideoBreakdown;
  isShort: boolean;
  durationSec: number | null;
  profile?: CookProfile;
}

/** Everything the API needs from a text model. Implemented by Claude; faked in tests. */
export interface RecipeAI {
  readonly model: string;
  builderTurn(input: BuilderTurnInput): Promise<BuilderTurn>;
  experiment(input: { recipe: RecipeInput; instruction: string; profile?: CookProfile }): Promise<ExperimentResult>;
  recipeFromVideo(input: VideoRecipeInput): Promise<RecipeDraft>;
}

/* ---------------------------------------------------------------------------------------------- */

function contextBlock(input: Pick<BuilderTurnInput, 'profile' | 'mode' | 'pantry' | 'references'>): string {
  const profile = describeProfile(input.profile);
  const parts = [`<cook_profile>\n${profile || 'Not provided — ask what matters.'}\n</cook_profile>`];
  if (input.mode === 'fridge') {
    parts.push(`<mode>\n${FRIDGE_MODE_NOTE}\n</mode>`);
    parts.push(`<ingredients_on_hand>\n${input.pantry.length ? input.pantry.join(', ') : 'Not listed yet — ask.'}\n</ingredients_on_hand>`);
  }
  if (input.references.length) {
    const refs = input.references.map((ref, i) => `${i + 1}. ${ref.summary}`).join('\n');
    parts.push(`<reference_recipes>\n${refs}\n</reference_recipes>`);
  }
  return parts.join('\n\n');
}

export function buildBuilderMessages(input: BuilderTurnInput): Anthropic.Beta.BetaMessageParam[] {
  const [first, ...rest] = input.messages;
  if (!first || first.role !== 'user') throw new Error('conversation must start with the cook');
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: contextBlock(input) },
        { type: 'text', text: first.content },
      ],
    },
    ...rest.map((m) => ({ role: m.role, content: m.content })),
  ];
  if (input.forceRecipe) {
    const last = messages[messages.length - 1];
    if (last?.role === 'user') {
      const content = typeof last.content === 'string' ? [{ type: 'text' as const, text: last.content }] : last.content;
      last.content = [
        ...content,
        {
          type: 'text',
          text: '(Note from the CookReel app: you have asked enough questions. Deliver the recipe now, choosing sensible defaults for anything still unknown.)',
        },
      ];
    }
  }
  return messages;
}

/** Only the parts of the profile that affect how a video recipe is written up (units, currency). */
function videoProfile(profile?: CookProfile): CookProfile | undefined {
  if (!profile) return undefined;
  const { region, currency, units, skill } = profile;
  return { region, currency, units, skill };
}

export function createClaudeRecipeAI(
  config: { apiKey: string; model: string; effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'; fallbacks: boolean },
  logger: Logger,
): RecipeAI {
  const client = new Anthropic({ apiKey: config.apiKey, maxRetries: 2, timeout: 5 * 60 * 1000 });

  async function generate<T>(
    label: string,
    schema: z.ZodType<T>,
    system: string,
    messages: Anthropic.Beta.BetaMessageParam[],
  ): Promise<T> {
    const started = Date.now();
    try {
      const stream = client.beta.messages.stream({
        model: config.model,
        max_tokens: 32_000,
        // Refusal fallbacks: if a safety classifier declines, the API re-runs the request on a
        // fallback model chosen by refusal category instead of returning a refusal.
        ...(config.fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages,
        output_config: { effort: config.effort, format: betaZodOutputFormat(schema) },
      });
      const message = await stream.finalMessage();

      if (message.stop_reason === 'refusal') throw new AIError('refused', `${label}: model declined the request`);
      if (message.stop_reason === 'max_tokens') throw new AIError('truncated', `${label}: output hit max_tokens`);
      const parsed = message.parsed_output as T | null | undefined;
      if (!parsed) throw new AIError('invalid_output', `${label}: no structured output`);

      logger.info(
        {
          label,
          model: message.model,
          ms: Date.now() - started,
          inputTokens: message.usage.input_tokens,
          cacheReadTokens: message.usage.cache_read_input_tokens,
          outputTokens: message.usage.output_tokens,
        },
        'claude call',
      );
      return parsed;
    } catch (error) {
      if (error instanceof AIError) throw error;
      if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
        logger.error({ err: error, label }, 'claude credentials rejected');
        throw new AIError('unavailable', 'Claude credentials rejected', { cause: error });
      }
      if (error instanceof Anthropic.APIError) {
        logger.warn({ err: error, status: error.status, label }, 'claude api error');
        throw new AIError('upstream', `Claude API error ${error.status ?? ''}`.trim(), { cause: error });
      }
      logger.warn({ err: error, label }, 'claude call failed');
      throw new AIError('invalid_output', `${label}: could not read the model output`, { cause: error });
    }
  }

  return {
    model: config.model,

    builderTurn(input) {
      return generate('builder', BuilderTurnSchema, BUILDER_SYSTEM_PROMPT, buildBuilderMessages(input));
    },

    experiment({ recipe, instruction, profile }) {
      const profileText = describeProfile(profile);
      return generate('experiment', ExperimentResultSchema, EXPERIMENT_SYSTEM_PROMPT, [
        {
          role: 'user',
          content: [
            { type: 'text', text: `<cook_profile>\n${profileText || 'Not provided.'}\n</cook_profile>` },
            { type: 'text', text: `<original_recipe>\n${recipeToPromptText(recipe)}\n</original_recipe>` },
            { type: 'text', text: `Make this variation: ${instruction}` },
          ],
        },
      ]);
    },

    recipeFromVideo({ url, meta, breakdown, isShort, durationSec, profile }) {
      const profileText = describeProfile(videoProfile(profile));
      return generate('video-recipe', RecipeDraftSchema, VIDEO_SYSTEM_PROMPT, [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                '<video>',
                `url: ${url}`,
                `title: ${meta.title}`,
                `channel: ${meta.channel ?? 'unknown'}`,
                `isShort: ${isShort}`,
                `durationSec: ${durationSec ?? 'unknown'}`,
                '</video>',
              ].join('\n'),
            },
            { type: 'text', text: `<breakdown>\n${JSON.stringify(breakdown, null, 1)}\n</breakdown>` },
            ...(profileText ? [{ type: 'text' as const, text: `<cook_profile>\n${profileText}\n</cook_profile>` }] : []),
            { type: 'text', text: 'Write the CookReel recipe for this video.' },
          ],
        },
      ]);
    },
  };
}
