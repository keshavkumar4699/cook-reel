import { plural } from '../../catalog';

/** Écran des recettes et collections. */
export default {
  subtitle: plural({ one: '{count} recette enregistrée sur ce téléphone', other: '{count} recettes enregistrées sur ce téléphone' }),
  newRecipe: 'Nouvelle recette',
  search: {
    placeholder: 'Rechercher recettes, ingrédients, tags',
    clear: 'Effacer la recherche',
  },
  filters: {
    all: 'Toutes',
    cookLater: 'À cuisiner',
    mine: 'Les miennes',
    variations: 'Variantes',
    quick: '≤ {duration}',
    protein: 'Riche en protéines',
    light: 'Moins de {kcal} kcal',
    mealPrep: 'Batch cooking',
  },
  collections: {
    new: 'Nouvelle collection',
    delete: 'Supprimer la collection',
  },
  newCollection: {
    title: 'Nouvelle collection',
    subtitle: 'Regroupez vos recettes à votre façon : « Week-end », « Enfants », « Fêtes »…',
    namePlaceholder: 'Nom de la collection',
    create: 'Créer la collection',
    hint: 'Ajoutez-y des recettes depuis le menu ••• de n’importe quelle recette.',
  },
  noResults: {
    title: 'Aucun résultat',
    body: 'Essayez une autre recherche ou un autre filtre.',
  },
  emptyLibrary: {
    title: 'Votre carnet de recettes commence ici',
    body: 'Enregistrez des recettes depuis YouTube, créez-les avec Chef ou écrivez les vôtres.',
    action: 'Ajouter une recette',
  },
  collectionSheet: {
    title: 'Collections',
    subtitle: 'Touchez pour ajouter ou retirer',
    empty: 'Aucune collection pour l’instant : créez la première.',
    newPlaceholder: 'Nouvelle collection',
  },
} as const;
