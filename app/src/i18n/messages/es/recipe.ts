import { plural } from '../../catalog';

export default {
  notFound: {
    title: 'Receta no encontrada',
    body: 'Puede que se haya eliminado.',
    action: 'Volver al recetario',
  },
  youtubeShort: 'Short',
  variationOf: 'Variación de {title}',
  stats: {
    totalTime: 'Tiempo total',
    kcalPerServing: 'kcal / porción',
    protein: 'Proteína',
  },
  badges: {
    mealPrep: 'Para la semana',
    costPerServing: '{price} / porción',
  },
  changes: {
    title: 'Cambios',
  },
  servings: {
    title: 'Porciones',
    asWritten: 'Como en la receta',
    scaled: 'Cantidades ajustadas ×{factor}',
  },
  sections: {
    equipment: 'Necesitarás',
    ingredients: 'Ingredientes',
    addToList: 'Añadir a la lista',
    ingredientsHint: 'Toca para marcar lo que ya tienes.',
    method: 'Preparación',
    storage: 'Cómo guardar las sobras',
  },
  experiment: {
    title: 'Experimentar',
    variations: plural({ one: '{count} variación', other: '{count} variaciones' }),
    create: 'Crear una variación',
    headline: 'Dale tu toque',
    body: 'Vegana, con más proteína, en freidora de aire, más barata… Chef la reescribe.',
    variation: 'Variación',
  },
  notes: {
    title: 'Tus notas',
    placeholder: 'La próxima vez, menos chile y un chorrito de lima…',
  },
  rating: {
    title: '¿Qué tal te quedó?',
    rate: plural({ one: 'Dar {count} estrella de 5', other: 'Dar {count} estrellas de 5' }),
    timesCooked: plural({ one: 'Cocinada {count} vez', other: 'Cocinada {count} veces' }),
  },
  cookLater: {
    save: 'Guardar en «Por cocinar»',
    add: 'Por cocinar',
    remove: 'Quitar de «Por cocinar»',
    saved: 'Guardada en «Por cocinar»',
    removed: 'Quitada de «Por cocinar»',
  },
  menu: {
    more: 'Más',
    edit: 'Editar receta',
    addToCollection: 'Añadir a una colección',
    addToPlan: 'Añadir al menú semanal',
    addToShopping: 'Añadir ingredientes a la lista de compras',
    share: 'Compartir receta',
    delete: 'Eliminar receta',
  },
  deleteConfirm: {
    title: '¿Eliminar esta receta?',
    message: 'Se borrará de este teléfono.',
  },
  toasts: {
    addedToShopping: plural({ one: '{count} producto añadido a tu lista de compras', other: '{count} productos añadidos a tu lista de compras' }),
    shoppingUpdated: 'Lista de compras actualizada',
    view: 'Ver',
    deleted: 'Receta eliminada',
  },
  cta: {
    experiment: 'Experimentar',
    startCooking: 'Empezar a cocinar',
    narratedClips: 'Clips narrados',
    videoClips: 'Clips de video',
    voiceGuided: 'Guiado por voz',
  },

  facts: {
    kcal: '{n} kcal',
    protein: '{n} g de proteína',
  },

  nutrition: {
    title: 'Nutrición',
    kcalUnit: 'kcal',
    serving: 'Porción',
    allServings: plural({ one: 'Total ({count})', other: 'Total ({count})' }),
    barLabel: 'Calorías por macronutriente',
    protein: 'Proteína',
    carbs: 'Carbohid.',
    fat: 'Grasa',
    fibre: 'Fibra',
    disclaimer: 'Estimación basada en datos nutricionales estándar. Los valores varían según la marca y el tamaño de la porción.',
  },

  ingredients: {
    line: '{quantity} {name}',
    optional: 'opcional',
    toTaste: 'al gusto',
    swapWith: 'Cámbialo por: {items}',
    substitutesFor: 'Sustitutos de {name}',
  },

  steps: {
    doneWhen: 'En su punto:',
    clipRange: '{start}–{end}',
    glossaryTerm: '{term}:',
  },
} as const;
