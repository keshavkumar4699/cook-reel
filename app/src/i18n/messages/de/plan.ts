import { plural } from '../../catalog';

/** Plan tab (meal plan and shopping list) and the add-to-plan sheet. */
export default {
  header: {
    planSubtitle: 'Deine Mahlzeiten für die Woche',
    toBuy: plural({ one: 'Noch {count} Artikel zu kaufen', other: 'Noch {count} Artikel zu kaufen' }),
    allSet: 'Fürs Erste alles erledigt',
    mealPlanTab: 'Essensplan',
    shoppingTab: 'Einkauf',
    shoppingTabCount: 'Einkauf · {count}',
  },
  week: {
    previous: 'Vorherige Woche',
    next: 'Nächste Woche',
  },
  summary: {
    kcalGoal: '/ {target} kcal',
    proteinGoal: '/ {target} Protein',
  },
  addToSlot: {
    breakfast: 'Frühstück hinzufügen',
    lunch: 'Mittagessen hinzufügen',
    dinner: 'Abendessen hinzufügen',
    snack: 'Snack hinzufügen',
  },
  removeFromPlan: 'Aus dem Plan entfernen',
  shopWeek: {
    button: 'Für diese Woche einkaufen',
    empty: 'Plane zuerst ein paar Mahlzeiten – dann kaufst du mit einem Tipp für alle ein.',
    added: plural({ one: '{count} neuer Artikel für diese Woche hinzugefügt', other: '{count} neue Artikel für diese Woche hinzugefügt' }),
  },
  picker: {
    title: 'Rezept auswählen',
    searchPlaceholder: 'Kochbuch durchsuchen',
    cookLater: 'Später kochen',
  },
  shopping: {
    addPlaceholder: 'Artikel hinzufügen …',
    progress: plural({ one: '{done} von {count} Artikel', other: '{done} von {count} Artikeln' }),
    clearTicked: 'Abgehakte entfernen',
    removeItem: '{name} entfernen',
    emptyTitle: 'Deine Liste ist leer',
    emptyBody: 'Füge Zutaten aus einem Rezept hinzu – oder plane deine Woche und kauf mit einem Tipp für alles ein.',
  },
  addSheet: {
    title: 'Zum Essensplan hinzufügen',
    servings: 'Portionen',
    add: 'Zum Plan hinzufügen',
    plannedToday: 'Für heute geplant · {slot}',
    plannedOn: 'Für {day} geplant · {slot}',
  },
} as const;
