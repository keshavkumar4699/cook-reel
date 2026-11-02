import { plural } from '../../catalog';

export default {
  header: {
    planSubtitle: 'Tus comidas de la semana',
    toBuy: plural({ one: '{count} producto por comprar', other: '{count} productos por comprar' }),
    allSet: 'Todo listo por ahora',
    mealPlanTab: 'Menú',
    shoppingTab: 'Compras',
    shoppingTabCount: 'Compras · {count}',
  },
  week: {
    previous: 'Semana anterior',
    next: 'Semana siguiente',
  },
  summary: {
    kcalGoal: '/ {target} kcal',
    proteinGoal: '/ {target} de proteína',
  },
  addToSlot: {
    breakfast: 'Añadir desayuno',
    lunch: 'Añadir almuerzo',
    dinner: 'Añadir cena',
    snack: 'Añadir snack',
  },
  removeFromPlan: 'Quitar del menú',
  shopWeek: {
    button: 'Comprar para esta semana',
    empty: 'Planifica primero algunas comidas y luego cómpralo todo con un solo toque.',
    added: plural({ one: '{count} producto nuevo añadido para esta semana', other: '{count} productos nuevos añadidos para esta semana' }),
  },
  picker: {
    title: 'Elige una receta',
    searchPlaceholder: 'Busca en tu recetario',
    cookLater: 'Por cocinar',
  },
  shopping: {
    addPlaceholder: 'Añade un producto…',
    progress: plural({ one: '{done} de {count} producto', other: '{done} de {count} productos' }),
    clearTicked: 'Quitar marcados',
    removeItem: 'Quitar {name}',
    emptyTitle: 'Tu lista está vacía',
    emptyBody: 'Añade ingredientes desde cualquier receta, o planifica tu semana y cómpralo todo con un solo toque.',
  },
  addSheet: {
    title: 'Añadir al menú semanal',
    servings: 'Porciones',
    add: 'Añadir al menú',
    plannedToday: 'En tu menú: hoy · {slot}',
    plannedOn: 'En tu menú: {day} · {slot}',
  },
} as const;
