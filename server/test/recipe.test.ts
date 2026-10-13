import { describe, expect, it } from 'vitest';
import {
  describeProfile,
  knowledgeSummary,
  normalizeClip,
  normalizeRecipe,
  reconcileCalories,
  RecipeDraftSchema,
} from '../src/domain/recipe.js';
import { sampleDraft } from './helpers.js';

describe('normalizeRecipe', () => {
  it('sums ingredient nutrition into totals and per-serving values', () => {
    const recipe = normalizeRecipe(sampleDraft(), { source: 'ai' });
    expect(recipe.nutrition.total).toEqual({ kcal: 450, proteinG: 26.2, carbsG: 11.5, fatG: 33.1, fiberG: 1.9 });
    expect(recipe.nutrition.perServing).toEqual({ kcal: 225, proteinG: 13.1, carbsG: 5.8, fatG: 16.6, fiberG: 1 });
    expect(recipe.totalMinutes).toBe(12);
    expect(recipe.estCost).toEqual({ perServing: 45, currency: 'INR' });
  });

  it('cleans tags, emoji and ids', () => {
    const recipe = normalizeRecipe(sampleDraft({ emoji: 'Egg 🍳 dish', tags: ['High Protein', '#15-min', 'high protein', ''] }), {
      source: 'ai',
    });
    expect(recipe.emoji).toBe('🍳');
    expect(recipe.tags).toEqual(['high-protein', '15-min']);
    expect(new Set(recipe.ingredients.map((i) => i.id)).size).toBe(recipe.ingredients.length);
    expect(normalizeRecipe(sampleDraft({ emoji: 'none' }), { source: 'ai' }).emoji).toBe('🍽️');
  });

  it('drops clips for non-video recipes and clamps them for video recipes', () => {
    const draft = sampleDraft({
      steps: sampleDraft().steps.map((s, i) => ({ ...s, clipStartSec: i === 0 ? 10 : 55, clipEndSec: i === 0 ? 11 : 90 })),
    });
    expect(normalizeRecipe(draft, { source: 'ai' }).steps.every((s) => s.clip === null)).toBe(true);
    const video = normalizeRecipe(draft, { source: 'youtube', durationSec: 60 });
    expect(video.steps[0]!.clip).toEqual({ startSec: 10, endSec: 13 });
    expect(video.steps[1]!.clip).toEqual({ startSec: 55, endSec: 60 });
  });

  it('clamps servings and ignores nonsense numbers', () => {
    const recipe = normalizeRecipe(sampleDraft({ servings: 0, prepMinutes: -5, cookMinutes: Number.NaN }), { source: 'ai' });
    expect(recipe.servings).toBe(1);
    expect(recipe.prepMinutes).toBe(0);
    expect(recipe.cookMinutes).toBe(0);
  });

  it('produces a draft schema that structured outputs can accept', () => {
    expect(() => RecipeDraftSchema.parse(sampleDraft())).not.toThrow();
  });
});

describe('normalizeClip', () => {
  it('handles swapped, short, out-of-range and missing values', () => {
    expect(normalizeClip(20, 10, 100)).toEqual({ startSec: 10, endSec: 20 });
    expect(normalizeClip(5, 6, 100)).toEqual({ startSec: 5, endSec: 8 });
    expect(normalizeClip(99, 120, 100)).toEqual({ startSec: 97, endSec: 100 });
    expect(normalizeClip(150, 160, 100)).toBeNull();
    expect(normalizeClip(null, 10, 100)).toBeNull();
    expect(normalizeClip(-4, 6, null)).toEqual({ startSec: 0, endSec: 6 });
  });
});

describe('reconcileCalories', () => {
  it('trusts macros when stated calories are far off', () => {
    expect(reconcileCalories({ kcal: 900, proteinG: 10, carbsG: 10, fatG: 10, fiberG: 0 }).kcal).toBe(170);
    expect(reconcileCalories({ kcal: 180, proteinG: 10, carbsG: 10, fatG: 10, fiberG: 0 }).kcal).toBe(180);
  });
});

describe('prompt helpers', () => {
  it('renders the cook profile as plain lines', () => {
    const text = describeProfile({ householdSize: 1, diet: 'eggetarian', goal: 'build_muscle', equipment: ['Induction', 'Kettle'] });
    expect(text).toContain('Usually cooks for: 1 person');
    expect(text).toContain('Diet: eggetarian');
    expect(text).toContain('protein-forward');
    expect(text).toContain('Induction, Kettle');
    expect(describeProfile(undefined)).toBe('');
  });

  it('summarises a recipe for the knowledge base', () => {
    const summary = knowledgeSummary(normalizeRecipe(sampleDraft(), { source: 'ai' }));
    expect(summary).toMatch(/^Masala Egg Bhurji \(Indian\) — serves 2, 12 min, easy\./);
    expect(summary).toContain('Eggs 4');
    expect(summary).toContain('soften the onion → scramble the eggs');
  });
});
