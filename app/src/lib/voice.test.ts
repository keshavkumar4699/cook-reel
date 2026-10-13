import { commandFromTranscript, parseCommand } from './voice';

describe('parseCommand', () => {
  it.each([
    ['next', 'next'],
    ['Next!', 'next'],
    ['next step', 'next'],
    ['skip', 'next'],
    ['go back', 'previous'],
    ['previous', 'previous'],
    ['stop', 'pause'],
    ['pause', 'pause'],
    ['wait', 'pause'],
    ['play', 'play'],
    ['continue', 'play'],
    ['repeat', 'repeat'],
    ['one more time', 'repeat'],
    ['read it', 'read'],
    ['start timer', 'timer'],
    ['set a timer', 'timer'],
    ['stop the timer', 'stopTimer'],
    ['ingredients', 'ingredients'],
    ['what can I say', 'help'],
    ['I’m done', 'exit'],
    ['aage', 'next'],
    ['peeche', 'previous'],
    ['ruko', 'pause'],
    ['phir se', 'repeat'],
  ] as const)('"%s" → %s', (input, expected) => {
    expect(parseCommand(input)).toBe(expected);
  });

  it('ignores long sentences unless addressed to Chef', () => {
    expect(parseCommand('next we are going to add the chopped onions')).toBeNull();
    expect(parseCommand('hey chef go to the next step please')).toBe('next');
    expect(parseCommand('okay chef, stop')).toBe('pause');
  });

  it('ignores empty or unrelated speech', () => {
    expect(parseCommand('')).toBeNull();
    expect(parseCommand('hmm')).toBeNull();
    expect(parseCommand('chef')).toBeNull();
  });
});

describe('commandFromTranscript', () => {
  it('finds a wake-word command at the end of a noisy transcript', () => {
    expect(commandFromTranscript('so now we add salt and stir it well chef next')).toBe('next');
    expect(commandFromTranscript('so now we add salt and stir it well')).toBeNull();
  });
});
