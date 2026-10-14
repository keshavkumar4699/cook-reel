import { sentences, speechChunks, toSpeakable } from './text';

const FSI = '\u2068';
const PDI = '\u2069';

describe('toSpeakable', () => {
  it('drops emoji, direction marks and symbols a voice would read out', () => {
    expect(toSpeakable(`🔥 Heat the ${FSI}oil${PDI} · then add onions → stir 🙂`)).toBe('Heat the oil, then add onions, stir');
  });

  it('turns a spaced dash into a pause but keeps hyphenated words', () => {
    expect(toSpeakable('Simmer — don’t boil the stock-pot')).toBe('Simmer, don’t boil the stock-pot');
  });

  it('returns nothing for text with nothing to say', () => {
    expect(toSpeakable(' 🍳 · ')).toBe('');
  });
});

describe('sentences', () => {
  it('splits after sentence ends but not inside numbers or abbreviations', () => {
    expect(sentences('Heat 1.5 tbsp oil. Add spices, e.g. cumin. Stir well!')).toEqual(['Heat 1.5 tbsp oil.', 'Add spices, e.g. cumin.', 'Stir well!']);
  });

  it('keeps "..." and "?!" together', () => {
    expect(sentences('Wait... then stir?! Done.')).toEqual(['Wait... then stir?!', 'Done.']);
  });

  it('splits Japanese at 。 without spaces', () => {
    expect(sentences('油を熱します。玉ねぎを加えます。')).toEqual(['油を熱します。', '玉ねぎを加えます。']);
  });

  it('splits Arabic at its question mark', () => {
    expect(sentences('هل الزيت ساخن؟ أضف البصل.')).toEqual(['هل الزيت ساخن؟', 'أضف البصل.']);
  });
});

describe('speechChunks', () => {
  const sentence = (n: number) => `Step part ${n} keeps going with plenty of detail about the pan and the heat.`;

  it('keeps short text in one piece so it sounds like one breath', () => {
    expect(speechChunks('Heat the oil. Add the onions.')).toEqual(['Heat the oil. Add the onions.']);
  });

  it('puts the first sentence alone and packs the rest under the limit', () => {
    const text = Array.from({ length: 12 }, (_, i) => sentence(i + 1)).join(' ');
    const chunks = speechChunks(text, { max: 300 });
    expect(chunks[0]).toBe(sentence(1));
    expect(chunks.every((chunk) => chunk.length <= 300)).toBe(true);
    expect(chunks.join(' ')).toBe(text);
  });

  it('does not start with a tiny fragment', () => {
    const text = `Okay. ${Array.from({ length: 6 }, (_, i) => sentence(i + 1)).join(' ')}`;
    expect(speechChunks(text)[0]).toBe(`Okay. ${sentence(1)}`);
  });

  it('cuts an endless sentence at a comma or space', () => {
    const text = Array.from({ length: 60 }, (_, i) => `item ${i}`).join(', ');
    const chunks = speechChunks(text, { max: 120 });
    expect(chunks.every((chunk) => chunk.length <= 120)).toBe(true);
    expect(chunks.join(' ')).toBe(text);
  });

  it('joins Japanese sentences without spaces', () => {
    const text = '油を熱します。'.repeat(60);
    const chunks = speechChunks(text, { max: 200 });
    expect(chunks.join('')).toBe(text);
    expect(chunks[0]).toBe('油を熱します。'.repeat(6));
  });
});
