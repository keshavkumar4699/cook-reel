import { findYouTubeUrl, parseYouTubeUrl } from './youtube';

describe('parseYouTubeUrl (client)', () => {
  it('matches the server rules', () => {
    expect(parseYouTubeUrl('https://youtube.com/shorts/aBcDeFgHiJk?si=x')).toMatchObject({ videoId: 'aBcDeFgHiJk', isShort: true });
    expect(parseYouTubeUrl('https://youtu.be/aBcDeFgHiJk')).toMatchObject({ isShort: false });
    expect(parseYouTubeUrl('https://example.com/watch?v=aBcDeFgHiJk')).toBeNull();
  });

  it('finds a link inside shared text', () => {
    expect(findYouTubeUrl('Try this!! https://youtu.be/aBcDeFgHiJk.')?.videoId).toBe('aBcDeFgHiJk');
    expect(findYouTubeUrl('no link here')).toBeNull();
  });
});
