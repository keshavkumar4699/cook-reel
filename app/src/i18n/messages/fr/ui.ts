import { plural } from '../../catalog';

/** Éléments partagés : la feuille « Ajouter une recette », la pastille de crédits, le stepper et l’illustration d’accueil. */
export default {
  createSheet: {
    title: 'Ajouter une recette',
    subtitleSignedIn: 'Les options IA utilisent des crédits',
    subtitleGuest: 'Les options IA nécessitent un compte gratuit',
    aiBadge: 'IA',
    youtubeTitle: 'Depuis une vidéo YouTube',
    youtubeBody: 'Collez un lien, obtenez des extraits pas à pas',
    chefTitle: 'Créer avec Chef',
    chefBody: 'Décrivez une envie, répondez à quelques questions',
    fridgeTitle: 'Recette vide-frigo',
    fridgeBody: 'Dites à Chef ce que vous avez, recevez une recette',
    manualTitle: 'Écrire ma recette',
    manualBody: 'Une recette de famille ou votre propre création',
  },
  creditsPill: {
    a11y: plural({ one: '{count} crédit. En obtenir plus', other: '{count} crédits. En obtenir plus' }),
  },
  stepper: {
    decrease: 'Diminuer',
    increase: 'Augmenter',
  },
  hero: {
    sideStep: 'ÉTAPE {n}',
    stepOf: 'ÉTAPE {current} SUR {total} · {range}',
    stepTitle: 'Faire sauter les nouilles',
    sayNext: 'Dites « suivant »',
  },
} as const;
