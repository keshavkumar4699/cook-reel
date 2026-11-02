import { plural } from '../../catalog';

/** Cooking mode: the full-screen, step-by-step player (cook/[id], StepCard, YouTubeStage). */
export default {
  notFound: 'Rezept nicht gefunden',
  voiceState: {
    off: 'Sprache aus',
    starting: 'Startet …',
    listening: 'Hört zu',
    paused: 'Pausiert',
    denied: 'Mikro gesperrt',
    unavailable: 'Nicht verfügbar',
  },
  top: {
    close: 'Kochmodus schließen',
    stepOf: 'Schritt {current} von {total}',
    voiceControl: 'Sprachsteuerung: {state}. Tippen zum Ein- oder Ausschalten, lange drücken für die Befehle.',
    ingredients: 'Zutaten',
  },
  heard: '„{text}“',
  video: {
    allDone: 'Alle Schritte erledigt',
    noClip: 'Kein Clip für diesen Schritt – folge dem Text unten',
    looping: '▶ In Schleife {start}–{end}',
    aiNarration: 'KI-Stimme',
    embedBlocked: 'Der Kanal hat die Wiedergabe in anderen Apps deaktiviert.',
    unavailable: 'Dieses Video kann gerade nicht abgespielt werden.',
    playerTitle: 'Rezeptvideo',
  },
  done: {
    title: 'Geschafft!',
    subtitle: '{title} ist fertig. Wie ist es geworden?',
    stars: plural({ one: '{count} Stern', other: '{count} Sterne' }),
    finish: 'Kochen beenden',
    toast: 'Super gemacht, Küchenprofi! 🎉',
  },
  timer: {
    started: 'Timer gestartet · {time}',
    doneToast: '⏰ Timer abgelaufen – {label}',
    noTimer: 'Dieser Schritt hat keinen Timer',
    timesUp: 'Die Zeit ist um!',
    pause: 'Timer pausieren',
    resume: 'Timer fortsetzen',
    cancel: 'Timer abbrechen',
  },
  controls: {
    previous: 'Vorheriger Schritt',
    replay: 'Schritt erneut abspielen',
    play: 'Abspielen',
    pause: 'Pause',
    mute: 'Video stummschalten',
    unmute: 'Ton einschalten',
    readAloud: 'Schritt vorlesen',
    stopReading: 'Vorlesen beenden',
    next: 'Nächster Schritt',
  },
  ingredients: {
    title: 'Zutaten',
    forServings: plural({ one: 'Für {count} Portion', other: 'Für {count} Portionen' }),
    readAloud: 'Lies sie mir vor',
  },
  narration: {
    preparing: 'Die Stimme von Chef wird vorbereitet …',
  },
  help: {
    title: 'Sprachbefehle',
    subtitle: 'Sprich ganz normal – kurze Sätze klappen am besten',
    micBlocked: 'Der Mikrofonzugriff ist aus. Erlaube ihn in den Einstellungen, um die Sprachsteuerung zu nutzen.',
  },
  step: {
    startTimerLabel: plural({ one: 'Timer für {count} Minute starten', other: 'Timer für {count} Minuten starten' }),
    startTimer: '{time}-Timer starten',
    timeLeft: 'Noch {time}',
    timerDone: 'Timer abgelaufen',
    whatDoesTermMean: 'Was bedeutet {term}?',
    glossaryTerm: '{term}:',
    doneWhen: 'So erkennst du’s:',
  },
} as const;
