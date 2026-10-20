import type { PluralCategory, PluralForms } from './plural';
import type { AppLanguage } from './languages';
import en from './messages/en';
import es from './messages/es';
import fr from './messages/fr';
import de from './messages/de';
import pt from './messages/pt';
import it_ from './messages/it';
import ar from './messages/ar';
import ja from './messages/ja';

const CATALOGS: Record<Exclude<AppLanguage, 'en'>, unknown> = { es, fr, de, pt, it: it_, ar, ja };

/** CLDR categories each language must fill for a plural message. */
const REQUIRED: Record<AppLanguage, PluralCategory[]> = {
  en: ['one', 'other'],
  es: ['one', 'other'],
  fr: ['one', 'other'],
  de: ['one', 'other'],
  pt: ['one', 'other'],
  it: ['one', 'other'],
  ar: ['zero', 'one', 'two', 'few', 'many', 'other'],
  ja: ['other'],
};

type Leaf = string | PluralForms;
const CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'];
/** Plural messages are objects whose keys are all CLDR categories (common.categories has an "other" key too). */
const isPlural = (value: unknown): value is PluralForms =>
  typeof value === 'object' && value !== null && 'other' in value && Object.keys(value).every((key) => CATEGORIES.includes(key));

function leaves(node: unknown, path: string[] = []): [string, Leaf][] {
  if (typeof node === 'string' || isPlural(node)) return [[path.join('.'), node]];
  if (typeof node !== 'object' || node === null) return [[path.join('.'), String(node)]];
  return Object.entries(node).flatMap(([key, child]) => leaves(child, [...path, key]));
}

const params = (text: string) => new Set(text.match(/\{\w+\}/g) ?? []);
const sorted = (set: Set<string>) => [...set].sort();
const english = new Map(leaves(en));

describe.each(Object.entries(CATALOGS))('%s catalog', (language, catalog) => {
  const entries = leaves(catalog);
  // A language still waiting for its translation re-exports English; there's nothing to check yet.
  const check = catalog === en ? it.skip : it;

  check('has exactly the English keys', () => {
    expect(entries.map(([key]) => key).sort()).toEqual([...english.keys()].sort());
  });

  check('keeps every placeholder and fills the plural forms the language needs', () => {
    const problems: string[] = [];
    for (const [key, value] of entries) {
      const source = english.get(key);
      if (source === undefined) continue;
      if (isPlural(source)) {
        if (!isPlural(value)) {
          problems.push(`${key}: should be plural({...})`);
          continue;
        }
        const allowed = params(source.other);
        const used = new Set<string>();
        for (const category of REQUIRED[language as AppLanguage]) {
          const form = value[category];
          if (!form?.trim()) problems.push(`${key}: missing "${category}"`);
          for (const p of params(form ?? '')) {
            if (!allowed.has(p)) problems.push(`${key}.${category}: unknown placeholder ${p}`);
            used.add(p);
          }
        }
        for (const p of allowed) if (p !== '{count}' && !used.has(p)) problems.push(`${key}: never uses ${p}`);
      } else {
        if (typeof value !== 'string' || !value.trim()) {
          problems.push(`${key}: empty`);
          continue;
        }
        if (sorted(params(value)).join() !== sorted(params(source)).join()) problems.push(`${key}: placeholders ${sorted(params(value))} ≠ ${sorted(params(source))}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
