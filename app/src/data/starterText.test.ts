import type { AppLanguage } from '@/i18n';
import { parseCommand } from '@/lib/voice';
import { STARTER_RECIPES } from './starterRecipes';
import ar from './starterRecipes.i18n/ar';
import de from './starterRecipes.i18n/de';
import es from './starterRecipes.i18n/es';
import fr from './starterRecipes.i18n/fr';
import it_ from './starterRecipes.i18n/it';
import ja from './starterRecipes.i18n/ja';
import pt from './starterRecipes.i18n/pt';
import type { StarterTranslations } from './starterRecipes.i18n/types';
import { isPristineStarter, localizeStarter } from './starterText';

const TRANSLATIONS: Record<Exclude<AppLanguage, 'en'>, StarterTranslations> = { es, fr, de, pt, it: it_, ar, ja };

describe('starter recipe text', () => {
  it('shows a pristine starter in the app language, keeping amounts and the cook’s own data', () => {
    const base = { ...STARTER_RECIPES[0]!, rating: 5, notes: 'mine', starterText: true };
    const english = localizeStarter({ ...base, title: 'stale' }, 'en');
    expect(english.title).toBe(STARTER_RECIPES[0]!.title);
    expect(english).toMatchObject({ language: 'en', rating: 5, notes: 'mine' });
    expect(english.steps.every((s) => !!s.narration)).toBe(true);
  });

  it('stops following the language once the cook edits it', () => {
    const base = STARTER_RECIPES[0]!;
    expect(isPristineStarter({ ...base })).toBe(true);
    expect(isPristineStarter({ ...base, steps: base.steps.map((s, i) => (i ? s : { ...s, instruction: 'My way' })) })).toBe(false);
    expect(isPristineStarter({ ...base, starterText: false })).toBe(false);
  });
});

describe.each(Object.entries(TRANSLATIONS))('%s starter recipes', (language, translations) => {
  const translated = Object.keys(translations).length > 0;
  (translated ? it : it.skip)('translate every recipe, ingredient and step, with narration', () => {
    const problems: string[] = [];
    for (const recipe of STARTER_RECIPES) {
      const text = translations[recipe.id];
      if (!text) {
        problems.push(`${recipe.id}: missing`);
        continue;
      }
      if (!text.title.trim() || !text.description.trim()) problems.push(`${recipe.id}: empty title or description`);
      const ingredientIds = recipe.ingredients.map((i) => i.id).sort();
      const stepIds = recipe.steps.map((s) => s.id).sort();
      if (Object.keys(text.ingredients).sort().join() !== ingredientIds.join()) problems.push(`${recipe.id}: ingredient ids differ`);
      if (Object.keys(text.steps).sort().join() !== stepIds.join()) problems.push(`${recipe.id}: step ids differ`);
      for (const step of recipe.steps) {
        const t = text.steps[step.id];
        if (!t?.narration?.trim()) problems.push(`${step.id}: no narration`);
        if (step.tip && !t?.tip) problems.push(`${step.id}: tip not translated`);
        if (step.doneCue && !t?.doneCue) problems.push(`${step.id}: done cue not translated`);
        if (step.glossary.length && t?.glossary?.length !== step.glossary.length) problems.push(`${step.id}: glossary not translated`);
      }
      const localized = localizeStarter({ ...recipe, starterText: true }, language as AppLanguage);
      expect(localized.language).toBe(language);
      expect(localized.ingredients.map((i) => [i.quantity, i.unit])).toEqual(recipe.ingredients.map((i) => [i.quantity, i.unit]));
    }
    expect(problems).toEqual([]);
  });

  (translated ? it : it.skip)('never says a voice command while narrating', () => {
    for (const text of Object.values(translations)) {
      for (const step of Object.values(text.steps)) expect([step.narration, parseCommand(step.narration, language as AppLanguage)]).toEqual([step.narration, null]);
    }
  });
});
