import { plural } from '../../catalog';

export default {
  createSheet: {
    title: 'Aggiungi una ricetta',
    subtitleSignedIn: 'Le opzioni IA usano crediti',
    subtitleGuest: 'Le opzioni IA richiedono un account gratuito',
    aiBadge: 'IA',
    youtubeTitle: 'Da un video YouTube',
    youtubeBody: 'Incolla un link e ottieni clip passo passo',
    chefTitle: 'Crea con Chef',
    chefBody: 'Descrivi una voglia, rispondi a qualche domanda',
    fridgeTitle: 'Cucina svuotafrigo',
    fridgeBody: 'Di’ a Chef cosa hai e ricevi una ricetta',
    manualTitle: 'Scrivi la tua',
    manualBody: 'Salva una ricetta di famiglia o una tua creazione',
  },
  creditsPill: {
    a11y: plural({ one: '{count} credito. Ottienine altri', other: '{count} crediti. Ottienine altri' }),
  },
  stepper: {
    decrease: 'Diminuisci',
    increase: 'Aumenta',
  },
  hero: {
    sideStep: 'PASSO {n}',
    stepOf: 'PASSO {current} DI {total} · {range}',
    stepTitle: 'Salta i noodles',
    sayNext: 'Di’ «avanti»',
  },
} as const;
