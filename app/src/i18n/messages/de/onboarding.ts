import { plural } from '../../catalog';

/** First-run setup and the cooking profile (both use the same fields). */
export default {
  steps: {
    personas: { title: 'Was führt dich\nzu CookReel?', subtitle: 'Wähl alles, was passt – danach richten wir deinen Startbildschirm aus.' },
    diet: { title: 'Wie ernährst du dich?', subtitle: 'Chef schlägt dir nie etwas vor, das für dich nicht infrage kommt.' },
    kitchen: { title: 'Deine Küche', subtitle: 'Rezepte nutzen nur, was du wirklich hast.' },
    goals: { title: 'Du und deine Ziele', subtitle: 'Für Portionen, Makros und dein Einkaufsbudget.' },
  },
  hello: 'Hallo {name} 👋',
  skipSetup: 'Einrichtung überspringen',
  start: 'Loskochen',

  personas: {
    saver: { title: 'YouTube-Rezepte speichern', body: 'Aufheben, was ich finde, und später kochen' },
    quick: { title: 'Schnelle Gerichte im Alltag', body: 'Viel los mit Job, Studium oder Training' },
    fridge: { title: 'Mit dem kochen, was da ist', body: 'Kühlschrank leeren, weniger wegwerfen' },
    creator: { title: 'Kreieren und experimentieren', body: 'Neue Gerichte und Varianten erfinden' },
    fitness: { title: 'Passend zu meinen Zielen essen', body: 'Protein, Kalorien und Makros' },
    learner: { title: 'Kochen lernen', body: 'Schritt für Schritt, von den Grundlagen an' },
  },
  groups: {
    diet: 'Ernährung',
    allergies: 'Allergien',
    spice: 'Schärfe',
    equipment: 'Ich habe …',
    time: 'So viel Zeit habe ich meist zum Kochen',
    skill: 'Kochkenntnisse',
    household: 'Ich koche meist für',
    goal: 'Ziel',
    protein: 'Tägliches Proteinziel',
    budget: 'Einkaufsbudget',
  },
  diets: {
    vegetarian: 'Vegetarisch',
    eggetarian: 'Vegetarisch + Ei',
    'non-vegetarian': 'Mit Fleisch',
    vegan: 'Vegan',
    pescatarian: 'Pescetarisch',
  },
  allergies: {
    peanuts: 'Erdnüsse',
    treeNuts: 'Nüsse',
    dairy: 'Milchprodukte',
    gluten: 'Gluten',
    eggs: 'Eier',
    soy: 'Soja',
    shellfish: 'Schalentiere',
    sesame: 'Sesam',
  },
  spice: {
    mild: 'Mild',
    medium: 'Mittel',
    hot: 'Scharf',
  },
  equipment: {
    gasStove: 'Gasherd',
    induction: 'Induktionsherd',
    microwave: 'Mikrowelle',
    oven: 'Backofen',
    airFryer: 'Airfryer',
    pressureCooker: 'Schnellkochtopf',
    riceCooker: 'Reiskocher',
    kettle: 'Wasserkocher',
    blender: 'Mixer',
    toaster: 'Toaster',
  },
  time: {
    minutes: '{n} Min.',
    orMore: '{n}+ Min.',
  },
  skills: {
    new: { title: 'Neu in der Küche', body: 'Bitte alles erklären' },
    basic: { title: 'Ich kann die Basics', body: 'Spiegelei, Nudeln, Pfannkuchen – so etwa' },
    confident: { title: 'Sicher am Herd', body: 'Kein Händchenhalten nötig' },
  },
  household: {
    justMe: 'Nur mich',
    people: plural({ one: '{count} Person', other: '{count} Personen' }),
  },
  goals: {
    build_muscle: 'Muskeln aufbauen',
    lose_fat: 'Fett verlieren',
    maintain: 'Gewicht halten',
    eat_healthy: 'Gesünder essen',
    none: 'Kein Ziel',
  },
  proteinGrams: '{n} g',
  budgets: {
    tight: 'Knapp',
    moderate: 'Mittel',
    flexible: 'Flexibel',
  },

  // Cooking profile screen (Me → Cooking profile)
  profile: {
    title: 'Kochprofil',
    intro: 'Chef nutzt das für jedes Rezept: was du isst, was du in der Küche hast und worauf du hinarbeitest.',
    sections: {
      personas: 'Was dich herführt',
      diet: 'Wie du dich ernährst',
      kitchen: 'Deine Küche',
      goals: 'Du und deine Ziele',
    },
    save: 'Profil speichern',
    saved: 'Kochprofil gespeichert',
  },
} as const;
