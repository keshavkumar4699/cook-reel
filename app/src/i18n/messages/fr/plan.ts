import { plural } from '../../catalog';

/** Onglet Planning (menus et liste de courses) et la feuille d’ajout au planning. */
export default {
  header: {
    planSubtitle: 'Vos repas de la semaine',
    toBuy: plural({ one: '{count} article à acheter', other: '{count} articles à acheter' }),
    allSet: 'C’est tout bon pour l’instant',
    mealPlanTab: 'Menus',
    shoppingTab: 'Courses',
    shoppingTabCount: 'Courses · {count}',
  },
  week: {
    previous: 'Semaine précédente',
    next: 'Semaine suivante',
  },
  summary: {
    kcalGoal: '/ {target} kcal',
    proteinGoal: '/ {target} de protéines',
  },
  addToSlot: {
    breakfast: 'Ajouter un petit-déjeuner',
    lunch: 'Ajouter un déjeuner',
    dinner: 'Ajouter un dîner',
    snack: 'Ajouter un en-cas',
  },
  removeFromPlan: 'Retirer du planning',
  shopWeek: {
    button: 'Préparer les courses de la semaine',
    empty: 'Planifiez d’abord quelques repas, puis préparez vos courses en un geste.',
    added: plural({ one: '{count} nouvel article ajouté pour cette semaine', other: '{count} nouveaux articles ajoutés pour cette semaine' }),
  },
  picker: {
    title: 'Choisir une recette',
    searchPlaceholder: 'Rechercher dans vos recettes',
    cookLater: 'À cuisiner',
  },
  shopping: {
    addPlaceholder: 'Ajouter un article…',
    progress: plural({ one: '{done} sur {count} article', other: '{done} sur {count} articles' }),
    clearTicked: 'Retirer les cochés',
    removeItem: 'Retirer {name}',
    emptyTitle: 'Votre liste est vide',
    emptyBody: 'Ajoutez les ingrédients d’une recette, ou planifiez votre semaine et préparez vos courses en un geste.',
  },
  addSheet: {
    title: 'Ajouter au planning',
    servings: 'Portions',
    add: 'Ajouter au planning',
    plannedToday: 'Prévu aujourd’hui · {slot}',
    plannedOn: 'Prévu {day} · {slot}',
  },
} as const;
