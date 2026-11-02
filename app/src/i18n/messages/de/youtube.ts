import { plural } from '../../catalog';

/** youtube screen strings. */
export default {
  title: 'Von YouTube',
  intro: {
    title: 'Mach aus einem Video\nSchritt-für-Schritt-Reels',
    body: 'Füge ein beliebiges Rezeptvideo oder einen Short ein. Chef schaut es sich an, schreibt die Schritte auf und spielt für jeden Schritt genau den passenden Clip in Schleife ab – bei Shorts erklärt dir eine Stimme jeden Schritt.',
    placeholder: 'YouTube- oder Shorts-Link',
    invalidLink: 'Das sieht nicht nach einem YouTube-Link aus',
    paste: 'Einfügen',
    noLinkOnClipboard: 'Kein YouTube-Link in der Zwischenablage',
  },
  how: {
    copyLink: 'Kopiere den Link in der YouTube-App (Teilen → Link kopieren)',
    chefBreaksItDown: 'Chef teilt es in Schritte auf – mit Clips, Tipps und Nährwerten',
    handsFree: 'Freihändig mitkochen: Sag „weiter“, „zurück“, „Pause“',
  },
  preview: {
    short: 'Short',
    video: 'Video',
    usesCredits: plural({ one: 'Kostet {count} Credit', other: 'Kostet {count} Credits' }),
    loading: 'Videodetails werden geladen …',
    breakItDown: 'In Schritte teilen',
    notCharged: 'Kein Rezeptvideo? Dann zahlst du nichts.',
  },
  stages: {
    watching: {
      title: 'Video wird angeschaut',
      body: 'Erkennt jede Zutat und jeden Handgriff',
    },
    writing: {
      title: 'Schritte werden geschrieben',
      body: 'Schneidet für jeden Schritt einen Clip zu und ergänzt Tipps für Einsteiger',
    },
    nutrition: {
      title: 'Nährwerte & Sprechtexte',
      body: 'Kalorien, Makros und Texte zum Vorlesen',
    },
  },
  working: {
    title: 'Wird aufgeteilt …',
    body: 'Das dauert meist keine Minute. Du kannst diesen Bildschirm ruhig verlassen – wir machen im Hintergrund weiter.',
    tip: '💡 Kleiner Tipp: Sag im Kochmodus „nochmal“, um den Clip eines Schritts erneut abzuspielen, oder „Timer starten“ bei Schritten mit Zeitangabe.',
  },
  done: {
    title: 'Bereit zum Kochen 🎉',
    cached: 'Jemand hat dieses Video schon aufgeteilt – es wurden keine Credits verbraucht.',
    stepsWithClips: plural({ one: '{count} Schritt mit eigenem Clip.', other: '{count} Schritte, jeder mit eigenem Clip.' }),
    stepsAndClips: 'Schritte & Clips',
    cookNow: 'Speichern & loskochen',
    saveForLater: 'Für später speichern',
    savedCookNow: 'Gespeichert – los geht’s!',
    savedForLater: 'Zu „Später kochen“ hinzugefügt',
  },
  failed: {
    title: 'Das hat nicht geklappt',
    refunded: '✓ Deine Credits wurden erstattet.',
    tryAnother: 'Anderes Video probieren',
  },
  errors: {
    notStarted: 'Der Import ist nicht gestartet. Bitte versuch es noch einmal.',
    expired: 'Dieser Import ist abgelaufen. Bitte starte ihn neu.',
  },
} as const;
