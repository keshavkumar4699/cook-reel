import { plural } from '../../catalog';

/** Shared chrome: the "add a recipe" sheet, credits pill, stepper and the welcome hero illustration. */
export default {
  createSheet: {
    title: 'Rezept hinzufügen',
    subtitleSignedIn: 'KI-Optionen kosten Credits',
    subtitleGuest: 'Für KI-Optionen brauchst du ein kostenloses Konto',
    aiBadge: 'KI',
    youtubeTitle: 'Aus einem YouTube-Video',
    youtubeBody: 'Link einfügen – Clips für jeden Schritt bekommen',
    chefTitle: 'Mit Chef erstellen',
    chefBody: 'Sag, worauf du Lust hast, und beantworte ein paar Fragen',
    fridgeTitle: 'Aus dem Kühlschrank kochen',
    fridgeBody: 'Sag Chef, was du da hast, und bekomm ein Rezept',
    manualTitle: 'Eigenes Rezept schreiben',
    manualBody: 'Halte ein Familienrezept oder deine eigene Kreation fest',
  },
  creditsPill: {
    a11y: plural({ one: '{count} Credit. Mehr holen', other: '{count} Credits. Mehr holen' }),
  },
  stepper: {
    decrease: 'Verringern',
    increase: 'Erhöhen',
  },
  hero: {
    sideStep: 'SCHRITT {n}',
    stepOf: 'SCHRITT {current} VON {total} · {range}',
    stepTitle: 'Nudeln schwenken',
    sayNext: 'Sag „weiter“',
  },
} as const;
