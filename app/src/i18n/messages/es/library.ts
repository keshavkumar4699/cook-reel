import { plural } from '../../catalog';

export default {
  subtitle: plural({ one: '{count} receta guardada en este teléfono', other: '{count} recetas guardadas en este teléfono' }),
  newRecipe: 'Nueva receta',
  search: {
    placeholder: 'Busca recetas, ingredientes, etiquetas',
    clear: 'Borrar búsqueda',
  },
  filters: {
    all: 'Todas',
    cookLater: 'Por cocinar',
    mine: 'Mías',
    variations: 'Variaciones',
    quick: '≤ {duration}',
    protein: 'Mucha proteína',
    light: 'Menos de {kcal} kcal',
    mealPrep: 'Para la semana',
  },
  collections: {
    new: 'Nueva colección',
    delete: 'Eliminar colección',
  },
  newCollection: {
    title: 'Nueva colección',
    subtitle: 'Agrupa recetas a tu manera: «Fin de semana», «Para niños», «Fiestas»…',
    namePlaceholder: 'Nombre de la colección',
    create: 'Crear colección',
    hint: 'Añade recetas desde el menú ••• de cualquier receta.',
  },
  noResults: {
    title: 'No hay coincidencias',
    body: 'Prueba con otra búsqueda u otro filtro.',
  },
  emptyLibrary: {
    title: 'Tu recetario empieza aquí',
    body: 'Guarda recetas de YouTube, créalas con Chef o escribe las tuyas.',
    action: 'Añadir una receta',
  },
  collectionSheet: {
    title: 'Colecciones',
    subtitle: 'Toca para añadir o quitar',
    empty: 'Aún no tienes colecciones: crea la primera.',
    newPlaceholder: 'Nueva colección',
  },
} as const;
