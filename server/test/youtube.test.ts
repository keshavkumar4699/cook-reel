import { describe, expect, it } from 'vitest';
import { isShortForm, parseYouTubeUrl } from '../src/domain/youtube.js';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTubeUrl', () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`, false],
    [`https://www.youtube.com/watch?v=${ID}&t=42s&list=PL123`, false],
    [`https://m.youtube.com/watch?v=${ID}`, false],
    [`https://youtu.be/${ID}?si=abc123`, false],
    [`youtu.be/${ID}`, false],
    [`https://www.youtube.com/shorts/${ID}?feature=share`, true],
    [`youtube.com/shorts/${ID}`, true],
    [`https://www.youtube.com/embed/${ID}`, false],
    [`https://www.youtube-nocookie.com/embed/${ID}`, false],
    [`https://www.youtube.com/live/${ID}`, false],
    [`https://music.youtube.com/watch?v=${ID}`, false],
    [`  https://www.youtube.com/watch?v=${ID}  `, false],
    [ID, false],
  ])('accepts %s', (input, isShort) => {
    const parsed = parseYouTubeUrl(input);
    expect(parsed).not.toBeNull();
    expect(parsed!.videoId).toBe(ID);
    expect(parsed!.isShort).toBe(isShort);
    expect(parsed!.canonicalUrl).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });

  it.each([
    '',
    'not a url',
    'https://vimeo.com/12345',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/UC123',
    `https://evil.com/watch?v=${ID}`,
    `https://youtube.com.evil.com/watch?v=${ID}`,
    `javascript:alert(1)//youtube.com/watch?v=${ID}`,
    'https://www.youtube.com/shorts/',
  ])('rejects %s', (input) => {
    expect(parseYouTubeUrl(input)).toBeNull();
  });

  it('treats videos of a minute or less as short-form', () => {
    const watch = parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}`)!;
    expect(isShortForm(watch, 45)).toBe(true);
    expect(isShortForm(watch, 600)).toBe(false);
    expect(isShortForm(watch, null)).toBe(false);
    expect(isShortForm(parseYouTubeUrl(`https://youtube.com/shorts/${ID}`)!, 170)).toBe(true);
  });
});
