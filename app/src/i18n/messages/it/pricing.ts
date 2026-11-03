import { plural } from '../../catalog';

export default {
  hero: {
    title: 'Cucina di più con Chef',
    notEnough: 'Crediti insufficienti',
    outOfCredits: 'Hai finito i crediti',
    body: 'Ogni mese nuovi crediti per ricette IA, esperimenti e reel passo passo da YouTube.',
    bodyOut: 'Scegli un piano per continuare a creare ricette e trasformare i video in reel passo passo. Le ricette salvate restano sempre gratis.',
  },
  creditsLeft: plural({ one: '{count} credito rimasto', other: '{count} crediti rimasti' }),
  period: {
    monthly: 'Mensile',
    yearly: 'Annuale',
    yearlySave: 'Annuale · −{percent}%',
  },
  plans: {
    basic: {
      name: 'Basic',
      tagline: 'Per qualche piatto nuovo ogni settimana',
      perks: {
        ai: 'Ricette IA, svuotafrigo e varianti',
        youtube: 'Reel passo passo da video YouTube e Shorts',
        topups: 'Pacchetti di ricarica quando finisci i crediti',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'Per chi cucina quasi tutti i giorni',
      perks: {
        everything: 'Tutto quello che c’è in Basic',
        credits: 'Più del triplo dei crediti di Basic',
      },
    },
    max: {
      name: 'Max',
      tagline: 'Per chi fa meal prep e crea ricette',
      perks: {
        everything: 'Tutto quello che c’è in Pro',
        value: 'Il miglior prezzo per credito',
      },
    },
  },
  planA11y: {
    monthly: '{name}, {price} al mese',
    yearly: '{name}, {price} all’anno',
  },
  badges: {
    current: 'Attuale',
    mostPopular: 'Il più scelto',
  },
  perMonth: 'al mese',
  perMonthApprox: '≈ {price}/mese',
  monthlyCredits: plural({ one: '{count} credito ogni mese', other: '{count} crediti ogni mese' }),
  approxRecipes: plural({ one: '≈ {count} ricetta', other: '≈ {count} ricette' }),
  costs: {
    title: 'Cosa consuma crediti',
    recipe: 'Ricetta IA di Chef',
    experiment: 'Variante di una ricetta',
    youtube: 'Analisi di un video YouTube',
    youtubeShort: 'Analisi di uno Short di YouTube',
    free: 'Salvataggio, pianificazione e modalità cucina',
    freeValue: 'Gratis',
    note: 'Le domande di Chef sono gratis. Le importazioni non riuscite vengono rimborsate in automatico. I crediti mensili si rinnovano a ogni mese di fatturazione; i crediti di ricarica non scadono mai.',
  },
  topups: {
    title: 'Ti serve una ricarica?',
    unit: plural({ one: 'credito', other: 'crediti' }),
    a11y: plural({ one: '{count} credito a {price}', other: '{count} crediti a {price}' }),
  },
  links: {
    restore: 'Ripristina acquisti',
    terms: 'Termini',
    privacy: 'Privacy',
  },
  renewal: 'Gli abbonamenti si rinnovano automaticamente finché non li disdici dalle impostazioni del tuo account {store}, almeno 24 ore prima della fine del periodo.',
  genericStore: 'store',
  cta: {
    signUp: 'Registrati per abbonarti',
    current: 'Hai il piano {plan}',
    continue: 'Continua con {plan}',
    perMonth: '{price}/mese',
    perYear: '{price}/anno',
  },
  toasts: {
    unavailable: 'Questo prodotto non è ancora disponibile nel tuo store.',
    appsOnly: 'Gli acquisti sono disponibili nelle app per iOS e Android.',
    done: plural({ one: 'Tutto pronto: hai {count} credito disponibile.', other: 'Tutto pronto: hai {count} crediti disponibili.' }),
    restored: 'Acquisti ripristinati',
  },
  errors: {
    purchaseFailed: 'L’acquisto non è andato a buon fine.',
    restoreFailed: 'Impossibile ripristinare gli acquisti.',
  },
} as const;
