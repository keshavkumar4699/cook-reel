import { plural } from '../../catalog';

/** Import d’une vidéo YouTube. */
export default {
  title: 'Depuis YouTube',
  intro: {
    title: 'Transformez une vidéo\nen reels pas à pas',
    body: 'Collez n’importe quelle vidéo de recette ou un Short. Chef la regarde, rédige les étapes et met en boucle l’extrait exact de chacune. Pour les Shorts, une voix explique en plus chaque étape.',
    placeholder: 'Lien YouTube ou Shorts',
    invalidLink: 'Ceci ne ressemble pas à un lien YouTube',
    paste: 'Coller',
    noLinkOnClipboard: 'Aucun lien YouTube dans le presse-papiers',
  },
  how: {
    copyLink: 'Copiez le lien depuis l’appli YouTube (Partager → Copier le lien)',
    chefBreaksItDown: 'Chef découpe la vidéo en étapes, avec extraits, astuces et valeurs nutritionnelles',
    handsFree: 'Cuisinez mains libres : dites « suivant », « retour », « pause »',
  },
  preview: {
    short: 'Short',
    video: 'Vidéo',
    usesCredits: plural({ one: 'Utilise {count} crédit', other: 'Utilise {count} crédits' }),
    loading: 'Chargement des infos de la vidéo…',
    breakItDown: 'Découper en étapes',
    notCharged: 'Pas une vidéo de recette ? Rien ne vous sera facturé.',
  },
  stages: {
    watching: {
      title: 'Visionnage de la vidéo',
      body: 'Repérage de chaque ingrédient et de chaque geste',
    },
    writing: {
      title: 'Rédaction de vos étapes',
      body: 'Un extrait calé sur chaque étape, et des astuces pour débutants',
    },
    nutrition: {
      title: 'Nutrition et narration',
      body: 'Calories, macros et textes lus à voix haute',
    },
  },
  working: {
    title: 'Découpage en cours…',
    body: 'Cela prend généralement moins d’une minute. Vous pouvez quitter cet écran, on continue sans vous.',
    tip: '💡 En attendant : en mode cuisine, dites « répète » pour revoir l’extrait d’une étape, ou « lance le minuteur » pour les étapes minutées.',
  },
  done: {
    title: 'Prêt à cuisiner 🎉',
    cached: 'Quelqu’un a déjà découpé cette vidéo : aucun crédit utilisé.',
    stepsWithClips: plural({ one: '{count} étape, avec son propre extrait.', other: '{count} étapes, chacune avec son propre extrait.' }),
    stepsAndClips: 'Étapes et extraits',
    cookNow: 'Enregistrer et cuisiner',
    saveForLater: 'Garder pour plus tard',
    savedCookNow: 'Enregistrée, à vos fourneaux !',
    savedForLater: 'Enregistrée dans « À cuisiner »',
  },
  failed: {
    title: 'Ça n’a pas marché',
    refunded: '✓ Vos crédits ont été remboursés.',
    tryAnother: 'Essayer une autre vidéo',
  },
  errors: {
    notStarted: 'L’import n’a pas démarré. Réessayez.',
    expired: 'Cet import a expiré. Relancez-le.',
  },
} as const;
