import { plural } from '../../catalog';

/** Formules et crédits. Les crédits servent aux fonctions IA ; enregistrer et cuisiner reste gratuit. */
export default {
  hero: {
    title: 'Cuisinez plus avec Chef',
    notEnough: 'Pas assez de crédits',
    outOfCredits: 'Vous n’avez plus de crédits',
    body: 'Des crédits tout neufs chaque mois pour les recettes IA, les variantes et les reels YouTube pas à pas.',
    bodyOut: 'Choisissez une formule pour continuer à créer des recettes et à transformer des vidéos en reels pas à pas. Vos recettes enregistrées restent toujours gratuites.',
  },
  creditsLeft: plural({ one: '{count} crédit restant', other: '{count} crédits restants' }),
  period: {
    monthly: 'Mensuel',
    yearly: 'Annuel',
    yearlySave: 'Annuel · −{percent} %',
  },
  plans: {
    basic: {
      name: 'Basic',
      tagline: 'Pour quelques nouveaux plats chaque semaine',
      perks: {
        ai: 'Recettes IA, vide-frigo et variantes',
        youtube: 'Reels pas à pas depuis YouTube et les Shorts',
        topups: 'Packs de recharge si vous êtes à court',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'Pour celles et ceux qui cuisinent presque tous les jours',
      perks: {
        everything: 'Tout ce qu’offre Basic',
        credits: 'Plus du triple des crédits de Basic',
      },
    },
    max: {
      name: 'Max',
      tagline: 'Batch cooking et création de recettes',
      perks: {
        everything: 'Tout ce qu’offre Pro',
        value: 'Le meilleur prix par crédit',
      },
    },
  },
  planA11y: {
    monthly: '{name}, {price} par mois',
    yearly: '{name}, {price} par an',
  },
  badges: {
    current: 'Actuelle',
    mostPopular: 'La plus populaire',
  },
  perMonth: 'par mois',
  perMonthApprox: '≈ {price}/mois',
  monthlyCredits: plural({ one: '{count} crédit par mois', other: '{count} crédits par mois' }),
  approxRecipes: plural({ one: '≈ {count} recette', other: '≈ {count} recettes' }),
  costs: {
    title: 'Ce qui utilise des crédits',
    recipe: 'Recette IA de Chef',
    experiment: 'Variante de recette',
    youtube: 'Découpage d’une vidéo YouTube',
    youtubeShort: 'Découpage d’un Short YouTube',
    free: 'Enregistrement, planning et mode cuisine',
    freeValue: 'Gratuit',
    note: 'Les questions de Chef sont gratuites. Les imports qui échouent sont remboursés automatiquement. Les crédits mensuels se renouvellent à chaque mois de facturation ; les crédits de recharge n’expirent jamais.',
  },
  topups: {
    title: 'Besoin d’une recharge ?',
    unit: plural({ one: 'crédit', other: 'crédits' }),
    a11y: plural({ one: '{count} crédit pour {price}', other: '{count} crédits pour {price}' }),
  },
  links: {
    restore: 'Restaurer les achats',
    terms: 'Conditions',
    privacy: 'Confidentialité',
  },
  renewal: 'Les abonnements se renouvellent automatiquement jusqu’à leur résiliation dans les réglages de votre {store}, au moins 24 heures avant la fin de la période.',
  genericStore: 'boutique d’applications',
  cta: {
    signUp: 'Inscrivez-vous pour vous abonner',
    current: 'Formule actuelle : {plan}',
    continue: 'Continuer avec {plan}',
    perMonth: '{price}/mois',
    perYear: '{price}/an',
  },
  toasts: {
    unavailable: 'Ce produit n’est pas encore disponible dans votre boutique.',
    appsOnly: 'Les achats sont disponibles dans les applis iOS et Android.',
    done: plural({ one: 'C’est tout bon : {count} crédit vous attend.', other: 'C’est tout bon : {count} crédits vous attendent.' }),
    restored: 'Achats restaurés',
  },
  errors: {
    purchaseFailed: 'L’achat n’a pas abouti.',
    restoreFailed: 'Impossible de restaurer les achats.',
  },
} as const;
