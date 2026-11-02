import { plural } from '../../catalog';

/** Écran recette. */
export default {
  // Fiche recette (app/recipe/[id])
  notFound: {
    title: 'Recette introuvable',
    body: 'Elle a peut-être été supprimée.',
    action: 'Retour aux recettes',
  },
  youtubeShort: 'Short',
  variationOf: 'Variante de {title}',
  stats: {
    totalTime: 'Temps total',
    kcalPerServing: 'kcal / portion',
    protein: 'Protéines',
  },
  badges: {
    mealPrep: 'Batch cooking',
    costPerServing: '{price} / portion',
  },
  changes: {
    title: 'Ce qui a changé',
  },
  servings: {
    title: 'Portions',
    asWritten: 'Quantités d’origine',
    scaled: 'Quantités ajustées ×{factor}',
  },
  sections: {
    equipment: 'Matériel',
    ingredients: 'Ingrédients',
    addToList: 'Ajouter à la liste',
    ingredientsHint: 'Touchez pour cocher ce que vous avez déjà.',
    method: 'Préparation',
    storage: 'Conservation',
  },
  experiment: {
    title: 'Expérimenter',
    variations: plural({ one: '{count} variante', other: '{count} variantes' }),
    create: 'Créer une variante',
    headline: 'Faites-la à votre façon',
    body: 'Végane, plus protéinée, version air fryer, moins chère… Chef la réécrit pour vous.',
    variation: 'Variante',
  },
  notes: {
    title: 'Vos notes',
    placeholder: 'Moins de piment la prochaine fois, un filet de citron vert…',
  },
  rating: {
    title: 'Alors, c’était bon ?',
    rate: plural({ one: 'Noter {count} sur 5', other: 'Noter {count} sur 5' }),
    timesCooked: plural({ one: 'Cuisinée {count} fois', other: 'Cuisinée {count} fois' }),
  },
  cookLater: {
    save: 'Garder pour cuisiner plus tard',
    add: 'Cuisiner plus tard',
    remove: 'Retirer de « À cuisiner »',
    saved: 'Enregistrée dans « À cuisiner »',
    removed: 'Retirée de « À cuisiner »',
  },
  menu: {
    more: 'Plus d’options',
    edit: 'Modifier la recette',
    addToCollection: 'Ajouter à une collection',
    addToPlan: 'Ajouter au planning',
    addToShopping: 'Ajouter les ingrédients aux courses',
    share: 'Partager la recette',
    delete: 'Supprimer la recette',
  },
  deleteConfirm: {
    title: 'Supprimer cette recette ?',
    message: 'Elle sera supprimée de ce téléphone.',
  },
  toasts: {
    addedToShopping: plural({ one: '{count} article ajouté à votre liste de courses', other: '{count} articles ajoutés à votre liste de courses' }),
    shoppingUpdated: 'Liste de courses mise à jour',
    view: 'Voir',
    deleted: 'Recette supprimée',
  },
  cta: {
    experiment: 'Expérimenter',
    startCooking: 'En cuisine !',
    narratedClips: 'Extraits commentés',
    videoClips: 'Extraits vidéo',
    voiceGuided: 'Guidage vocal',
  },

  // Cartes, lignes et aperçus de recettes
  facts: {
    kcal: '{n} kcal',
    protein: '{n} g de protéines',
  },

  // Carte nutrition
  nutrition: {
    title: 'Nutrition',
    kcalUnit: 'kcal',
    serving: 'Portion',
    allServings: plural({ one: 'Pour {count}', other: 'Pour {count}' }),
    barLabel: 'Calories par macronutriment',
    protein: 'Protéines',
    carbs: 'Glucides',
    fat: 'Lipides',
    fibre: 'Fibres',
    disclaimer: 'Estimation d’après des données nutritionnelles de référence. Les valeurs varient selon les marques et les portions.',
  },

  // Liste d’ingrédients
  ingredients: {
    line: '{quantity} {name}',
    optional: 'facultatif',
    toTaste: 'selon votre goût',
    swapWith: 'Remplacer par : {items}',
    substitutesFor: 'Alternatives à {name}',
  },

  // Liste des étapes
  steps: {
    doneWhen: 'Signe que c’est prêt :',
    clipRange: '{start}–{end}',
    glossaryTerm: '{term} :',
  },
} as const;
