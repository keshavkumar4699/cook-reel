import { plural } from '../../catalog';

/** Éditeur de recette. */
export default {
  titleEdit: 'Modifier la recette',
  titleNew: 'Nouvelle recette',
  fields: {
    name: 'Nom de la recette',
    namePlaceholder: 'Le gratin dauphinois de mamie',
    description: 'Description',
    descriptionPlaceholder: 'Qu’est-ce qui la rend unique ?',
    servings: 'Portions',
    prep: 'Prépa (min)',
    cook: 'Cuisson (min)',
    difficulty: 'Difficulté',
    tags: 'Tags',
    tagsPlaceholder: 'rapide, protéiné, réconfortant',
  },
  ingredients: {
    title: 'Ingrédients',
    quantity: 'Qté',
    unit: 'Unité',
    name: 'Ingrédient',
    remove: 'Retirer l’ingrédient',
    add: 'Ajouter un ingrédient',
  },
  steps: {
    title: 'Étapes',
    placeholder: 'Que faut-il faire à cette étape ?',
    timer: 'Minuteur (min)',
    keepsClip: 'Garde son extrait vidéo',
    remove: 'Supprimer l’étape',
    add: 'Ajouter une étape',
  },
  defaultStepTitle: 'Étape {n}',
  nutrition: {
    title: 'Valeurs nutritionnelles par portion',
    hint: 'Facultatif : indiquez ce que vous savez.',
    kcal: 'kcal',
    protein: 'Protéines (g)',
    carbs: 'Glucides (g)',
    fat: 'Lipides (g)',
  },
  errors: {
    noTitle: 'Donnez un nom à votre recette.',
    noIngredients: 'Ajoutez au moins un ingrédient.',
    noSteps: 'Ajoutez au moins une étape.',
  },
  saveChanges: 'Enregistrer les modifications',
  saveRecipe: 'Enregistrer la recette',
  toasts: {
    updated: 'Recette mise à jour',
    saved: 'Recette enregistrée',
  },
  // Feuille « Coller une liste »
  paste: {
    open: 'Coller une liste',
    title: 'Coller des ingrédients',
    subtitle: 'Un par ligne : « 2 c. à s. d’huile », « ½ c. à c. de sel », « 200 g de paneer, en dés »',
    placeholder: '300 g de riz basmati\n1 c. à s. de ghee\n½ c. à c. de curcuma',
    add: 'Les ajouter',
    added: plural({ one: '{count} ingrédient ajouté', other: '{count} ingrédients ajoutés' }),
  },
} as const;
