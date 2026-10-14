import { getLanguage, t, type AppLanguage } from '@/i18n';

export type VoiceCommand =
  | 'next'
  | 'previous'
  | 'pause'
  | 'play'
  | 'repeat'
  | 'read'
  | 'ingredients'
  | 'timer'
  | 'stopTimer'
  | 'exit'
  | 'help';

type HelpRow = 'move' | 'playPause' | 'repeat' | 'read' | 'timer' | 'ingredients' | 'wake';
const HELP_ROWS: HelpRow[] = ['move', 'playPause', 'repeat', 'read', 'timer', 'ingredients', 'wake'];

interface Lexicon {
  /** Words that wake Chef up so longer phrases are accepted ("chef", "シェフ", "شيف"). */
  wake: string[];
  /** Greetings that may come before the wake word ("hey chef", "oye chef"). */
  greetings: string[];
  /**
   * Command phrases in priority order, most specific first ("stop the timer" before "stop"). Written
   * as regex sources over normalized text: lower case, no accents, Arabic letters folded.
   */
  rules: [VoiceCommand, string[]][];
  /** Words too common in speech to match inside a sentence: they only count said on their own. */
  exact?: Partial<Record<VoiceCommand, string[]>>;
  /** The words shown in the help sheet and offered to the recognizer as hints. */
  help: Record<HelpRow, string[]>;
  /** Japanese has no spaces: match anywhere and measure utterances in characters. */
  script: 'words' | 'chars';
  /** Longest utterance accepted without the wake word: words, or characters for Japanese. */
  maxPlain: number;
  /** Also understand the English commands (people often say "next" or "stop" whatever the language). */
  english?: boolean;
}

const EN: Lexicon = {
  wake: ['chef', 'cookreel', 'cook reel'],
  greetings: ['hey', 'ok', 'okay', 'hi'],
  // Hindi/Hinglish words that recognisers commonly transcribe in Latin script are included for Indian cooks.
  rules: [
    ['stopTimer', ['(?:stop|cancel|end|reset) (?:the )?timer']],
    ['timer', ['(?:start|set) (?:a |the )?timer', 'timer']],
    ['ingredients', ['ingredients?', 'what do i need', 'saamaan', 'samaan']],
    ['help', ['help', 'commands', 'what can i say']],
    ['exit', ['exit', 'close', 'quit', "i'?m done", 'finish(?:ed)?', 'band karo']],
    ['repeat', ['repeat', 'again', 'replay', 'one more time', 'phir se', 'fir se', 'dobara']],
    ['previous', ['previous', 'prev', 'back', 'go back', 'last step', 'before', 'peeche', 'pichhe', 'pichla', 'piche']],
    ['next', ['next', 'skip', 'forward', 'go on', 'move on', 'aage', 'agla', 'agle']],
    ['pause', ['stop', 'pause', 'hold on', 'wait', 'ruko', 'ruk jao', 'rukh', 'ruk']],
    ['play', ['play', 'resume', 'continue', 'start', 'chalao', 'chalu', 'shuru']],
    ['read', ['read', 'explain', 'what do i do', 'say it', 'tell me', 'bolo', 'batao', 'samjhao']],
  ],
  help: {
    move: ['Next', 'Back'],
    playPause: ['Stop', 'Play'],
    repeat: ['Repeat'],
    read: ['Read'],
    timer: ['Start timer'],
    ingredients: ['Ingredients'],
    wake: ['Chef, …'],
  },
  script: 'words',
  maxPlain: 4,
};

const ES: Lexicon = {
  wake: ['chef'],
  greetings: ['oye', 'hola', 'ey', 'hey', 'ok', 'okay'],
  rules: [
    ['stopTimer', ['(?:para|parar|deten|detener|apaga|apagar|cancela|cancelar|quita|quitar) (?:el )?(?:temporizador|cronometro|timer)']],
    ['timer', ['(?:pon|poner|inicia|iniciar|empieza|empezar|activa|activar|arranca) (?:el |un )?(?:temporizador|cronometro|timer)', 'temporizador', 'cronometro']],
    ['ingredients', ['ingredientes', 'que necesito', 'que me hace falta']],
    ['help', ['ayuda', 'comandos', 'que puedo decir']],
    ['exit', ['salir', 'cerrar', 'cierra', 'termine', 'he terminado', 'ya termine']],
    ['repeat', ['repite', 'repetir', 'repitelo', 'otra vez', 'de nuevo']],
    ['previous', ['anterior', 'atras', 'vuelve', 'volver', 'regresa', 'regresar', 'paso anterior']],
    ['next', ['siguiente', 'proximo', 'adelante', 'avanza', 'avanzar']],
    ['pause', ['pausa', 'pausar', 'espera', 'esperar', 'detente', 'deten', 'alto', 'stop']],
    ['play', ['reproduce', 'reproducir', 'reanuda', 'reanudar', 'continua', 'continuar', 'sigue', 'dale', 'play']],
    ['read', ['lee', 'leer', 'leelo', 'explica', 'explicame', 'que hago', 'dime']],
  ],
  // "para" is mostly "for"/"so that": only a command on its own.
  exact: { pause: ['para'] },
  help: {
    move: ['Siguiente', 'Atrás'],
    playPause: ['Pausa', 'Sigue'],
    repeat: ['Repite'],
    read: ['Lee'],
    timer: ['Pon el temporizador'],
    ingredients: ['Ingredientes'],
    wake: ['Chef, …'],
  },
  script: 'words',
  maxPlain: 4,
  english: true,
};

const FR: Lexicon = {
  wake: ['chef'],
  greetings: ['dis', 'he', 'hey', 'ok', 'okay', 'salut'],
  rules: [
    ['stopTimer', ['(?:arrete|arreter|stop|stoppe|annule|annuler|coupe|couper) (?:le )?(?:minuteur|minuterie|chrono|timer)']],
    ['timer', ['(?:lance|lancer|demarre|demarrer|mets|mettre|regle|regler|active) (?:le |un )?(?:minuteur|minuterie|chrono|timer)', 'minuteur', 'minuterie']],
    ['ingredients', ['ingredients', "de quoi j'ai besoin", "qu'est ce qu'il faut"]],
    ['help', ['aide', 'commandes', "qu'est ce que je peux dire"]],
    ['exit', ['quitter', 'quitte', 'fermer', 'ferme', "j'ai fini", "c'est fini"]],
    ['repeat', ['repete', 'repeter', 'recommence', 'recommencer', 'une autre fois', 'encore une fois']],
    ['previous', ['precedent', 'precedente', 'retour', 'reviens', 'revenir', 'en arriere', 'etape precedente']],
    ['next', ['suivant', 'suivante', 'etape suivante', 'avance', 'avancer']],
    ['pause', ['pause', 'attends', 'attendez', 'stop', 'arrete', 'arretez']],
    ['play', ['lecture', 'reprends', 'reprendre', 'continue', 'continuer', 'vas y', 'joue']],
    ['read', ['lis', 'lire', 'explique', 'expliquer', "qu'est ce que je fais", 'dis moi']],
  ],
  // "encore" and "passe" are everyday words ("encore un peu de sel").
  exact: { repeat: ['encore'], next: ['passe'] },
  help: {
    move: ['Suivant', 'Retour'],
    playPause: ['Pause', 'Reprends'],
    repeat: ['Répète'],
    read: ['Lis'],
    timer: ['Lance le minuteur'],
    ingredients: ['Ingrédients'],
    wake: ['Chef, …'],
  },
  script: 'words',
  maxPlain: 4,
  english: true,
};

const DE: Lexicon = {
  wake: ['chef'],
  greetings: ['hey', 'hallo', 'ok', 'okay'],
  rules: [
    ['stopTimer', ['(?:stopp|stoppe|stop|beende|beenden|abbrechen|brich ab) (?:den )?(?:timer|wecker|kurzzeitwecker)', 'timer (?:stoppen|stopp|aus|beenden|abbrechen)']],
    ['timer', ['(?:starte|start|stell|stelle|setz|setze) (?:den |einen )?(?:timer|wecker)', 'timer (?:starten|an)', 'timer']],
    ['ingredients', ['zutaten', 'was brauche ich']],
    ['help', ['hilfe', 'befehle', 'was kann ich sagen']],
    ['exit', ['beenden', 'schliessen', 'ich bin fertig', 'fertig']],
    ['repeat', ['wiederhole', 'wiederholen', 'nochmal', 'noch mal', 'noch einmal']],
    ['previous', ['zuruck', 'vorheriger schritt', 'vorherige', 'vorheriger']],
    ['next', ['weiter', 'nachster', 'nachste', 'vorwarts']],
    ['pause', ['pause', 'stopp', 'stop', 'warte', 'warten', 'anhalten']],
    ['play', ['abspielen', 'fortsetzen', 'spiel ab', 'mach weiter', 'play']],
    ['read', ['lies vor', 'lies', 'vorlesen', 'erklare', 'erklar', 'was muss ich tun', 'sag es']],
  ],
  // "halt" is a filler word ("das ist halt so"); "los" is part of many phrases.
  exact: { pause: ['halt'], play: ['los'] },
  help: {
    move: ['Weiter', 'Zurück'],
    playPause: ['Pause', 'Fortsetzen'],
    repeat: ['Nochmal'],
    read: ['Vorlesen'],
    timer: ['Timer starten'],
    ingredients: ['Zutaten'],
    wake: ['Chef, …'],
  },
  script: 'words',
  maxPlain: 4,
  english: true,
};

const PT: Lexicon = {
  wake: ['chef'],
  greetings: ['oi', 'ei', 'hey', 'ok', 'okay', 'ola'],
  rules: [
    ['stopTimer', ['(?:para|parar|pare|cancela|cancelar|desliga|desligar) (?:o )?(?:timer|temporizador|cronometro)']],
    ['timer', ['(?:inicia|iniciar|inicie|comeca|comecar|liga|ligar|coloca|colocar|poe) (?:o |um )?(?:timer|temporizador|cronometro)', 'temporizador', 'cronometro', 'timer']],
    ['ingredients', ['ingredientes', 'do que eu preciso', 'o que eu preciso']],
    ['help', ['ajuda', 'comandos', 'o que eu posso dizer']],
    ['exit', ['sair', 'fechar', 'fecha', 'terminei', 'acabei']],
    ['repeat', ['repete', 'repetir', 'repita', 'de novo', 'outra vez', 'novamente']],
    ['previous', ['anterior', 'volta', 'voltar', 'volte', 'passo anterior']],
    ['next', ['proximo', 'proxima', 'seguinte', 'avanca', 'avancar']],
    ['pause', ['pausa', 'pausar', 'espera', 'esperar', 'pare', 'parar']],
    ['play', ['continua', 'continuar', 'continue', 'retoma', 'retomar', 'toca', 'tocar', 'play']],
    ['read', ['ler', 'leia', 'explica', 'explicar', 'o que eu faco', 'me diz', 'me fala']],
  ],
  // "para" is mostly "for"; "lê" folds to "le".
  exact: { pause: ['para'], read: ['le'] },
  help: {
    move: ['Próximo', 'Voltar'],
    playPause: ['Pausa', 'Continua'],
    repeat: ['Repete'],
    read: ['Lê'],
    timer: ['Inicia o timer'],
    ingredients: ['Ingredientes'],
    wake: ['Chef, …'],
  },
  script: 'words',
  maxPlain: 4,
  english: true,
};

const IT: Lexicon = {
  wake: ['chef'],
  greetings: ['ehi', 'hey', 'ok', 'okay', 'ciao'],
  rules: [
    ['stopTimer', ['(?:ferma|fermare|stop|annulla|annullare|spegni|spegnere) (?:il )?(?:timer|contaminuti)']],
    ['timer', ['(?:avvia|avviare|imposta|impostare|metti|mettere|fai partire) (?:il |un )?(?:timer|contaminuti)', 'timer', 'contaminuti']],
    ['ingredients', ['ingredienti', 'cosa mi serve', 'di cosa ho bisogno']],
    ['help', ['aiuto', 'comandi', 'cosa posso dire']],
    ['exit', ['esci', 'uscire', 'chiudi', 'chiudere', 'ho finito']],
    ['repeat', ['ripeti', 'ripetere', 'di nuovo', "un'altra volta", 'ancora una volta']],
    ['previous', ['precedente', 'indietro', 'torna indietro', 'passo precedente']],
    ['next', ['avanti', 'successivo', 'prossimo', 'vai avanti', 'passo successivo']],
    ['pause', ['pausa', 'ferma', 'fermati', 'aspetta', 'stop']],
    ['play', ['riprendi', 'riprendere', 'continua', 'continuare', 'play']],
    ['read', ['leggi', 'leggere', 'spiega', 'spiegami', 'cosa devo fare', 'dimmi']],
  ],
  exact: { play: ['vai'] },
  help: {
    move: ['Avanti', 'Indietro'],
    playPause: ['Pausa', 'Riprendi'],
    repeat: ['Ripeti'],
    read: ['Leggi'],
    timer: ['Avvia il timer'],
    ingredients: ['Ingredienti'],
    wake: ['Chef, …'],
  },
  script: 'words',
  maxPlain: 4,
  english: true,
};

// Arabic is matched after folding: no diacritics, alef forms to ا, ى to ي, ة to ه, ؤ to و, ئ to ي.
// Feminine imperatives are included so every cook is understood.
const AR: Lexicon = {
  wake: ['شيف', 'الشيف'],
  greetings: ['يا', 'هاي', 'مرحبا'],
  rules: [
    ['stopTimer', ['(?:اوقف|اوقفي|الغ|الغي|اطفي) (?:ال)?موقت', 'ايقاف (?:ال)?موقت']],
    ['timer', ['(?:شغل|شغلي|ابدا|ابدئي|اضبط|اضبطي) (?:ال)?موقت', '(?:ال)?موقت']],
    ['ingredients', ['(?:ال)?مكونات', 'ماذا احتاج', 'ماذا يلزمني']],
    ['help', ['مساعده', 'ساعدني', 'ساعديني', 'الاوامر', 'ماذا اقول']],
    ['exit', ['خروج', 'اخرج', 'اخرجي', 'اغلق', 'اغلقي', 'انتهيت', 'خلصت']],
    ['repeat', ['اعد', 'اعيدي', 'كرر', 'كرري', 'مره اخري', 'من جديد']],
    ['previous', ['السابق', 'السابقه', 'ارجع', 'ارجعي', 'رجوع', 'للخلف']],
    ['next', ['التالي', 'التاليه', 'الخطوه التاليه', 'بعده']],
    ['pause', ['توقف', 'توقفي', 'قف', 'قفي', 'انتظر', 'انتظري', 'ايقاف']],
    ['play', ['شغل', 'شغلي', 'تشغيل', 'استمر', 'استمري', 'كمل', 'كملي', 'تابع', 'تابعي']],
    ['read', ['اقرا', 'اقراي', 'اشرح', 'اشرحي', 'ماذا افعل', 'قل لي', 'قولي لي']],
  ],
  help: {
    move: ['التالي', 'السابق'],
    playPause: ['توقف', 'تابع'],
    repeat: ['أعد'],
    read: ['اقرأ'],
    timer: ['شغّل المؤقت'],
    ingredients: ['المكونات'],
    wake: ['شيف، …'],
  },
  script: 'words',
  maxPlain: 4,
};

// Japanese is matched anywhere in the utterance (no spaces). "次に…" ("next, we…") is everyday
// narration, so "次" only counts on its own or as 次へ / 次のステップ / 次に進んで.
const JA: Lexicon = {
  wake: ['シェフ', 'しぇふ'],
  greetings: ['ねえ', 'ねぇ', 'ヘイ', 'オッケー', 'おい'],
  rules: [
    ['stopTimer', ['タイマーを?(?:止め|とめ|停止|キャンセル|消し|けし|ストップ)']],
    ['timer', ['タイマーを?(?:スタート|開始|かけ|セット|始め|はじめ)', 'タイマー']],
    ['ingredients', ['材料', 'ざいりょう', '何が必要', 'なにがひつよう']],
    ['help', ['ヘルプ', '助けて', 'たすけて', 'なんて言えば', '何て言えば', 'コマンド']],
    ['exit', ['終了', 'しゅうりょう', '閉じて', 'とじて', '終わりにする', 'おわりにする', 'やめる']],
    ['repeat', ['もう一回', 'もういっかい', 'もう一度', 'もういちど', '繰り返し', 'くりかえし', 'リピート']],
    ['previous', ['前へ', 'まえへ', '前に戻', '前のステップ', 'まえのステップ', '戻って', 'もどって', '戻る', 'もどる', 'バック']],
    ['next', ['次へ', 'つぎへ', '次のステップ', 'つぎのステップ', '次に進', 'つぎにすす', 'ネクスト', '進んで', 'すすんで']],
    ['pause', ['一時停止', '止めて', 'とめて', '止まって', 'とまって', 'ストップ', '待って', 'まって', 'ポーズ']],
    ['play', ['再生', 'さいせい', '続けて', 'つづけて', '続き', 'つづき', 'プレイ', 'スタート']],
    ['read', ['読んで', 'よんで', '読み上げ', 'よみあげ', '説明して', 'せつめいして', 'どうするの', '何をすれば', 'なにをすれば']],
  ],
  exact: { next: ['次', 'つぎ'] },
  help: {
    move: ['次へ', '戻って'],
    playPause: ['ストップ', '再生'],
    repeat: ['もう一回'],
    read: ['読んで'],
    timer: ['タイマースタート'],
    ingredients: ['材料'],
    wake: ['シェフ、…'],
  },
  script: 'chars',
  maxPlain: 12,
};

const LEXICONS: Record<AppLanguage, Lexicon> = { en: EN, es: ES, fr: FR, de: DE, pt: PT, it: IT, ar: AR, ja: JA };

/* ---------------------------------------------------------------------------------------------- */
/* Normalization. No \p{} classes or String.normalize: Hermes support for them is unreliable.     */

const LATIN_FOLD: Record<string, string> = {};
for (const [plain, accented] of [
  ['a', 'àáâãäåā'],
  ['c', 'çć'],
  ['e', 'èéêëē'],
  ['i', 'ìíîïī'],
  ['n', 'ñ'],
  ['o', 'òóôõöøō'],
  ['u', 'ùúûüū'],
  ['y', 'ýÿ'],
] as const) {
  for (const ch of accented) LATIN_FOLD[ch] = plain;
}

const ARABIC_MARKS = /[\u064B-\u065F\u0670\u0640]/g;

function normalizeFor(text: string, script: 'latin' | 'arabic' | 'cjk'): string {
  const lower = text.toLowerCase().replace(/[\u2018\u2019\u02BC`]/g, "'");
  if (script === 'cjk') {
    // Keep kana, kanji, the long-vowel mark and Latin; drop spaces and punctuation.
    return lower.replace(/[\s\u3000、。，．！？!?,.・「」『』（）()…〜~"]/g, '');
  }
  if (script === 'arabic') {
    return lower
      .replace(ARABIC_MARKS, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\u0621-\u064Aa-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return lower
    .replace(/ß/g, 'ss')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^\x00-\x7F]/g, (ch) => LATIN_FOLD[ch] ?? ' ')
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SCRIPT: Record<AppLanguage, 'latin' | 'arabic' | 'cjk'> = { en: 'latin', es: 'latin', fr: 'latin', de: 'latin', pt: 'latin', it: 'latin', ar: 'arabic', ja: 'cjk' };

/** Lower case, no accents or punctuation; Arabic letters folded; Japanese without spaces. */
export function normalizeTranscript(transcript: string, language: AppLanguage = getLanguage()): string {
  return normalizeFor(transcript, SCRIPT[language]);
}

interface Compiled {
  lexicon: Lexicon;
  wake: RegExp;
  rules: [VoiceCommand, RegExp][];
}

const compiled = new Map<AppLanguage, Compiled>();

function compile(language: AppLanguage): Compiled {
  const cached = compiled.get(language);
  if (cached) return cached;
  const lexicon = LEXICONS[language];
  const words = lexicon.script === 'words';
  const alternatives = (list: string[]) => list.join('|');
  // Whole words for spaced languages ("before" must not match "beforehand"); anywhere for Japanese.
  const wrap = (source: string) => (words ? new RegExp(`(?:^| )(?:${source})(?= |$)`) : new RegExp(`(?:${source})`));
  const wakeWords = lexicon.wake.map((w) => normalizeFor(w, SCRIPT[language]));
  const greetings = lexicon.greetings.map((g) => normalizeFor(g, SCRIPT[language]));
  const wake = words
    ? new RegExp(`^(?:(?:${alternatives(greetings)}) )?(?:${alternatives(wakeWords)})(?: |$)`)
    : new RegExp(`^(?:${alternatives(greetings)})?(?:${alternatives(wakeWords)})`);
  const result: Compiled = { lexicon, wake, rules: lexicon.rules.map(([command, list]) => [command, wrap(alternatives(list))]) };
  compiled.set(language, result);
  return result;
}

function size(text: string, lexicon: Lexicon): number {
  return lexicon.script === 'chars' ? text.length : text.split(' ').filter(Boolean).length;
}

function match(text: string, language: AppLanguage): VoiceCommand | null {
  const { lexicon, rules } = compile(language);
  for (const [command, pattern] of rules) if (pattern.test(text)) return command;
  for (const [command, list] of Object.entries(lexicon.exact ?? {}) as [VoiceCommand, string[]][]) {
    if (list.some((word) => normalizeFor(word, SCRIPT[language]) === text)) return command;
  }
  return null;
}

/** A command in a short utterance, or one addressed to Chef ("hey chef, go to the next step"). */
export function parseCommand(transcript: string, language: AppLanguage = getLanguage()): VoiceCommand | null {
  const { lexicon, wake } = compile(language);
  let text = normalizeTranscript(transcript, language);
  if (!text) return null;
  const woke = wake.test(text);
  if (woke) text = text.replace(wake, '').trim();
  if (!text) return null;
  if (!woke && size(text, lexicon) > lexicon.maxPlain) return null;
  return match(text, language) ?? (lexicon.english ? match(normalizeFor(text, 'latin'), 'en') : null);
}

/**
 * Picks a command out of a recogniser transcript. Short utterances ("next") are matched directly;
 * in longer, noisy transcripts (video audio, chatter) only a phrase after the wake word counts —
 * "…and then we add salt chef next" → next.
 */
export function commandFromTranscript(transcript: string, language: AppLanguage = getLanguage()): VoiceCommand | null {
  const direct = parseCommand(transcript, language);
  if (direct) return direct;
  const { lexicon } = compile(language);
  const text = normalizeTranscript(transcript, language);
  const wakeAt = Math.max(...lexicon.wake.map((w) => text.lastIndexOf(normalizeFor(w, SCRIPT[language]))));
  return wakeAt >= 0 ? parseCommand(text.slice(wakeAt), language) : null;
}

/** True for long stretches of speech (often the video itself), so the recogniser can start afresh. */
export function isLongUtterance(transcript: string, language: AppLanguage = getLanguage()): boolean {
  const { lexicon } = compile(language);
  const text = normalizeTranscript(transcript, language);
  return lexicon.script === 'chars' ? text.length > 40 : size(text, lexicon) > 14;
}

/** Command words to bias the recogniser towards. */
export function contextualStrings(language: AppLanguage = getLanguage()): string[] {
  const lexicon = LEXICONS[language];
  const words = HELP_ROWS.filter((row) => row !== 'wake').flatMap((row) => lexicon.help[row]);
  return [...words.map((w) => w.toLowerCase()), ...lexicon.wake];
}

/** The help sheet rows: the words to say in the app language, and what they do. */
export function voiceHelp(language: AppLanguage = getLanguage()): { say: string; does: string }[] {
  const lexicon = LEXICONS[language];
  return HELP_ROWS.map((row) => ({
    say: lexicon.help[row].map((word) => t('voice.quote', { word })).join(' · '),
    does: t(`voice.help.${row}`),
  }));
}

export const VOICE_HELP = voiceHelp();
