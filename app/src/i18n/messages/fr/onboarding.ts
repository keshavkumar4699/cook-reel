import { plural } from '../../catalog';

/** Premier lancement et profil culinaire (les deux partagent les mêmes champs). */
export default {
  steps: {
    personas: { title: 'Qu’est-ce qui vous amène\nsur CookReel ?', subtitle: 'Choisissez tout ce qui vous correspond : on adapte votre écran d’accueil en fonction.' },
    diet: { title: 'Comment mangez-vous ?', subtitle: 'Chef ne vous proposera jamais rien que vous ne puissiez pas manger.' },
    kitchen: { title: 'Votre cuisine', subtitle: 'Les recettes n’utiliseront que ce que vous avez vraiment.' },
    goals: { title: 'Vous et vos objectifs', subtitle: 'Pour ajuster les portions, les macros et le budget courses.' },
  },
  hello: 'Bonjour {name} 👋',
  skipSetup: 'Passer la configuration',
  start: 'C’est parti !',

  personas: {
    saver: { title: 'Enregistrer des recettes YouTube', body: 'Garder ce que je trouve pour le cuisiner plus tard' },
    quick: { title: 'Des repas rapides au quotidien', body: 'Entre le boulot, les études ou la salle de sport' },
    fridge: { title: 'Cuisiner avec ce que j’ai', body: 'Vider le frigo, moins gaspiller' },
    creator: { title: 'Créer et expérimenter', body: 'Inventer de nouveaux plats et des variantes' },
    fitness: { title: 'Manger selon mes objectifs', body: 'Protéines, calories et macros' },
    learner: { title: 'Apprendre à cuisiner', body: 'Pas à pas, en partant des bases' },
  },
  groups: {
    diet: 'Alimentation',
    allergies: 'Allergies',
    spice: 'Niveau de piquant',
    equipment: 'J’ai…',
    time: 'Temps que j’ai d’habitude pour cuisiner',
    skill: 'Niveau en cuisine',
    household: 'Je cuisine d’habitude pour',
    goal: 'Objectif',
    protein: 'Objectif de protéines par jour',
    budget: 'Budget courses',
  },
  diets: {
    vegetarian: 'Végétarien',
    eggetarian: 'Ovo-végétarien',
    'non-vegetarian': 'Omnivore',
    vegan: 'Végan',
    pescatarian: 'Pescétarien',
  },
  allergies: {
    peanuts: 'Arachides',
    treeNuts: 'Fruits à coque',
    dairy: 'Produits laitiers',
    gluten: 'Gluten',
    eggs: 'Œufs',
    soy: 'Soja',
    shellfish: 'Fruits de mer',
    sesame: 'Sésame',
  },
  spice: {
    mild: 'Doux',
    medium: 'Moyen',
    hot: 'Fort',
  },
  equipment: {
    gasStove: 'Gazinière',
    induction: 'Plaque induction',
    microwave: 'Micro-ondes',
    oven: 'Four',
    airFryer: 'Air fryer',
    pressureCooker: 'Autocuiseur',
    riceCooker: 'Cuiseur à riz',
    kettle: 'Bouilloire',
    blender: 'Blender',
    toaster: 'Grille-pain',
  },
  time: {
    minutes: '{n} min',
    orMore: '{n} min et +',
  },
  skills: {
    new: { title: 'Je débute', body: 'Expliquez-moi tout, s’il vous plaît' },
    basic: { title: 'Je connais les bases', body: 'Pâtes, omelette, riz… ce niveau-là' },
    confident: { title: 'Je me débrouille bien', body: 'Pas besoin de me tenir la main' },
  },
  household: {
    justMe: 'Juste moi',
    people: plural({ one: '{count} personne', other: '{count} personnes' }),
  },
  goals: {
    build_muscle: 'Prendre du muscle',
    lose_fat: 'Perdre du gras',
    maintain: 'Maintenir mon poids',
    eat_healthy: 'Manger plus sain',
    none: 'Pas d’objectif',
  },
  proteinGrams: '{n} g',
  budgets: {
    tight: 'Serré',
    moderate: 'Modéré',
    flexible: 'Souple',
  },

  // Profil culinaire (Profil → Profil culinaire)
  profile: {
    title: 'Profil culinaire',
    intro: 'Chef s’en sert pour chaque recette : ce que vous mangez, ce que vous avez comme matériel et vos objectifs.',
    sections: {
      personas: 'Ce qui vous amène',
      diet: 'Votre alimentation',
      kitchen: 'Votre cuisine',
      goals: 'Vous et vos objectifs',
    },
    save: 'Enregistrer le profil',
    saved: 'Profil culinaire enregistré',
  },
} as const;
