import { plural } from '../../catalog';

/** Plans and credits screen. Credits are what AI features spend; saving and cooking are always free. */
export default {
  hero: {
    title: 'Mehr kochen mit Chef',
    notEnough: 'Nicht genug Credits',
    outOfCredits: 'Deine Credits sind aufgebraucht',
    body: 'Jeden Monat frische Credits für KI-Rezepte, Experimente und Schritt-Reels aus YouTube-Videos.',
    bodyOut: 'Wähle einen Plan, um weiter Rezepte zu erstellen und Videos in Schritt-Reels zu verwandeln. Deine gespeicherten Rezepte bleiben immer kostenlos.',
  },
  creditsLeft: plural({ one: 'Noch {count} Credit', other: 'Noch {count} Credits' }),
  period: {
    monthly: 'Monatlich',
    yearly: 'Jährlich',
    yearlySave: 'Jährlich · {percent} % sparen',
  },
  plans: {
    basic: {
      name: 'Basic',
      tagline: 'Für ein paar neue Gerichte pro Woche',
      perks: {
        ai: 'KI-Rezepte, Kühlschrank-Modus und Varianten',
        youtube: 'Schritt-Reels aus YouTube-Videos und Shorts',
        topups: 'Credit-Pakete, wenn du mehr brauchst',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'Für alle, die fast täglich kochen',
      perks: {
        everything: 'Alles aus Basic',
        credits: 'Mehr als 3× so viele Credits wie Basic',
      },
    },
    max: {
      name: 'Max',
      tagline: 'Für Meal-Prep-Fans und Rezeptkreative',
      perks: {
        everything: 'Alles aus Pro',
        value: 'Bester Preis pro Credit',
      },
    },
  },
  planA11y: {
    monthly: '{name}, {price} pro Monat',
    yearly: '{name}, {price} pro Jahr',
  },
  badges: {
    current: 'Aktuell',
    mostPopular: 'Am beliebtesten',
  },
  perMonth: 'pro Monat',
  perMonthApprox: '≈ {price}/Monat',
  monthlyCredits: plural({ one: '{count} Credit pro Monat', other: '{count} Credits pro Monat' }),
  approxRecipes: plural({ one: '≈ {count} Rezept', other: '≈ {count} Rezepte' }),
  costs: {
    title: 'Was Credits kostet',
    recipe: 'KI-Rezept von Chef',
    experiment: 'Rezeptvariante',
    youtube: 'YouTube-Video aufteilen',
    youtubeShort: 'YouTube-Short aufteilen',
    free: 'Speichern, Planen und Kochmodus',
    freeValue: 'Gratis',
    note: 'Rückfragen von Chef sind gratis. Fehlgeschlagene Importe werden automatisch erstattet. Monatliche Credits werden mit jedem Abrechnungsmonat zurückgesetzt, nachgekaufte Credits verfallen nie.',
  },
  topups: {
    title: 'Credits nachkaufen?',
    unit: plural({ one: 'Credit', other: 'Credits' }),
    a11y: plural({ one: '{count} Credit für {price}', other: '{count} Credits für {price}' }),
  },
  links: {
    restore: 'Käufe wiederherstellen',
    terms: 'AGB',
    privacy: 'Datenschutz',
  },
  renewal: 'Abos verlängern sich automatisch, bis du sie spätestens 24 Stunden vor Ende des Zeitraums in deinen {store}-Einstellungen kündigst.',
  genericStore: 'App-Store',
  cta: {
    signUp: 'Registrieren und abonnieren',
    current: 'Du hast {plan}',
    continue: 'Weiter mit {plan}',
    perMonth: '{price}/Monat',
    perYear: '{price}/Jahr',
  },
  toasts: {
    unavailable: 'Dieses Produkt ist in deinem Store noch nicht verfügbar.',
    appsOnly: 'Käufe sind in den Apps für iOS und Android möglich.',
    done: plural({ one: 'Alles bereit – {count} Credit wartet auf dich.', other: 'Alles bereit – {count} Credits warten auf dich.' }),
    restored: 'Käufe wiederhergestellt',
  },
  errors: {
    purchaseFailed: 'Der Kauf hat nicht geklappt.',
    restoreFailed: 'Die Käufe konnten nicht wiederhergestellt werden.',
  },
} as const;
