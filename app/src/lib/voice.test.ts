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

describe('voice commands in every language', () => {
  it.each([
    ['es', 'siguiente', 'next'],
    ['es', 'atrás', 'previous'],
    ['es', 'pausa', 'pause'],
    ['es', 'para', 'pause'],
    ['es', 'sigue', 'play'],
    ['es', 'repítelo', 'repeat'],
    ['es', 'léelo', 'read'],
    ['es', 'pon el temporizador', 'timer'],
    ['es', 'para el temporizador', 'stopTimer'],
    ['es', '¿qué necesito?', 'ingredients'],
    ['es', 'next', 'next'],
    ['fr', 'suivant', 'next'],
    ['fr', 'étape précédente', 'previous'],
    ['fr', 'reprends', 'play'],
    ['fr', 'répète', 'repeat'],
    ['fr', 'arrête le minuteur', 'stopTimer'],
    ['fr', 'lance le minuteur', 'timer'],
    ['fr', 'encore', 'repeat'],
    ['de', 'weiter', 'next'],
    ['de', 'zurück', 'previous'],
    ['de', 'nochmal', 'repeat'],
    ['de', 'Timer starten', 'timer'],
    ['de', 'stopp den Timer', 'stopTimer'],
    ['de', 'lies vor', 'read'],
    ['de', 'halt', 'pause'],
    ['pt', 'próximo', 'next'],
    ['pt', 'volta', 'previous'],
    ['pt', 'para o timer', 'stopTimer'],
    ['pt', 'lê', 'read'],
    ['pt', 'de novo', 'repeat'],
    ['it', 'avanti', 'next'],
    ['it', 'indietro', 'previous'],
    ['it', 'ripeti', 'repeat'],
    ['it', 'avvia il timer', 'timer'],
    ['it', 'leggi', 'read'],
    ['ar', 'التالي', 'next'],
    ['ar', 'السابق', 'previous'],
    ['ar', 'توقّف', 'pause'],
    ['ar', 'أعد', 'repeat'],
    ['ar', 'اقرأ', 'read'],
    ['ar', 'شغّل المؤقت', 'timer'],
    ['ar', 'أوقف المؤقت', 'stopTimer'],
    ['ar', 'المكوّنات', 'ingredients'],
    ['ja', '次へ', 'next'],
    ['ja', '次', 'next'],
    ['ja', '戻って', 'previous'],
    ['ja', 'ストップ', 'pause'],
    ['ja', 'もう一回', 'repeat'],
    ['ja', '読んで', 'read'],
    ['ja', 'タイマーをスタート', 'timer'],
    ['ja', 'タイマーを止めて', 'stopTimer'],
    ['ja', '材料', 'ingredients'],
  ] as const)('%s: "%s" → %s', (language, input, expected) => {
    expect(parseCommand(input, language)).toBe(expected);
  });

  it.each([
    ['es', 'para la salsa añade ajo'],
    ['es', 'sal al gusto'],
    ['fr', 'encore un peu de sel'],
    ['de', 'das ist halt so lecker'],
    ['pt', 'para o molho use alho'],
    ['ja', '次に玉ねぎを入れます'],
    ['ja', '弱火で五分ほど煮込みます'],
    ['ar', 'أضف الملح ثم قلّب جيدا لمدة دقيقتين'],
  ] as const)('%s: ignores everyday cooking talk "%s"', (language, input) => {
    expect(parseCommand(input, language)).toBeNull();
  });

  it('accepts longer phrases after the wake word in each language', () => {
    expect(parseCommand('oye chef, pasa al paso siguiente por favor', 'es')).toBe('next');
    expect(parseCommand('ねえシェフ、次のステップに進んでください', 'ja')).toBe('next');
    expect(parseCommand('يا شيف من فضلك الخطوة التالية', 'ar')).toBe('next');
    expect(commandFromTranscript('y ahora añadimos la sal y removemos chef siguiente', 'es')).toBe('next');
  });
});
