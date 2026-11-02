/** Écran d’accueil. */
export default {
  nameTitle: '{name} 👋',
  guestTitle: 'Bienvenue 👋',
  composer: {
    title: 'Qu’est-ce qu’on cuisine aujourd’hui ?',
    placeholder: 'ex. : paneer épicé en 20 min',
    inputLabel: 'Décrivez ce que vous voulez cuisiner',
    send: 'Demander à Chef',
  },
  prompts: {
    highProteinDinner: 'Dîner protéiné',
    quickBreakfast: 'Petit-déj en 15 min',
    cosyDal: 'Dal réconfortant pour 1',
    useLeftovers: 'Finir les restes',
    cheapFilling: 'Pas cher et rassasiant',
    impressDate: 'Dîner en amoureux',
  },
  actions: {
    youtube: { title: 'Depuis YouTube', body: 'Vidéo → reels pas à pas' },
    builder: { title: 'Créer avec Chef', body: 'Décrivez n’importe quel plat' },
    fridge: { title: 'Vide-frigo', body: 'Cuisinez ce que vous avez' },
    manual: { title: 'Écrire ma recette', body: 'Vos recettes de famille' },
  },
  upsell: {
    badge: 'Crédits offerts',
    title: 'Débloquez Chef et les reels YouTube',
    body: 'Créez un compte gratuit pour utiliser l’IA : vos premières recettes sont offertes.',
  },
  sections: {
    cookLater: { title: 'À cuisiner', subtitle: 'Mises de côté pour quand la faim se fera sentir' },
    quick: { title: 'Rapide et protéiné', subtitle: 'Des assiettes express qui calent bien' },
    experiments: { title: 'Vos variantes', subtitle: 'Les recettes revisitées avec Chef' },
    recent: { title: 'Ajoutées récemment', subtitle: 'Les dernières arrivées dans vos recettes' },
  },
  voiceTip: {
    title: 'Cuisinez mains libres',
    body: 'En mode cuisine, dites « suivant », « retour » ou « pause » : plus besoin de toucher l’écran avec les mains pleines de farine.',
    dismiss: 'Masquer l’astuce',
  },
} as const;
