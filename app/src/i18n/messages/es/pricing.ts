import { plural } from '../../catalog';

export default {
  hero: {
    title: 'Cocina más con Chef',
    notEnough: 'No tienes créditos suficientes',
    outOfCredits: 'Te has quedado sin créditos',
    body: 'Créditos nuevos cada mes para recetas con IA, experimentos y reels paso a paso de YouTube.',
    bodyOut: 'Elige un plan para seguir creando recetas y convirtiendo videos en reels paso a paso. Tus recetas guardadas siempre son gratis.',
  },
  creditsLeft: plural({ one: 'Te queda {count} crédito', other: 'Te quedan {count} créditos' }),
  period: {
    monthly: 'Mensual',
    yearly: 'Anual',
    yearlySave: 'Anual · ahorra {percent} %',
  },
  plans: {
    basic: {
      name: 'Basic',
      tagline: 'Para unos cuantos platos nuevos cada semana',
      perks: {
        ai: 'Recetas con IA, «Con lo que tengo» y variaciones',
        youtube: 'Reels paso a paso de YouTube y Shorts',
        topups: 'Recargas para cuando te quedes sin créditos',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'Para quien cocina casi a diario',
      perks: {
        everything: 'Todo lo de Basic',
        credits: 'Más del triple de créditos que Basic',
      },
    },
    max: {
      name: 'Max',
      tagline: 'Para quien cocina para toda la semana y crea recetas',
      perks: {
        everything: 'Todo lo de Pro',
        value: 'El mejor precio por crédito',
      },
    },
  },
  planA11y: {
    monthly: '{name}, {price} al mes',
    yearly: '{name}, {price} al año',
  },
  badges: {
    current: 'Actual',
    mostPopular: 'El más popular',
  },
  perMonth: 'al mes',
  perMonthApprox: '≈ {price}/mes',
  monthlyCredits: plural({ one: '{count} crédito al mes', other: '{count} créditos al mes' }),
  approxRecipes: plural({ one: '≈ {count} receta', other: '≈ {count} recetas' }),
  costs: {
    title: 'Qué usa créditos',
    recipe: 'Receta con IA de Chef',
    experiment: 'Variación de una receta',
    youtube: 'Dividir un video de YouTube',
    youtubeShort: 'Dividir un Short de YouTube',
    free: 'Guardar, planificar y el modo cocina',
    freeValue: 'Gratis',
    note: 'Las preguntas de Chef son gratis. Las importaciones fallidas se reembolsan automáticamente. Los créditos mensuales se renuevan en cada ciclo de facturación; los de recarga no caducan nunca.',
  },
  topups: {
    title: '¿Necesitas una recarga?',
    unit: plural({ one: 'crédito', other: 'créditos' }),
    a11y: plural({ one: '{count} crédito por {price}', other: '{count} créditos por {price}' }),
  },
  links: {
    restore: 'Restaurar compras',
    terms: 'Términos',
    privacy: 'Privacidad',
  },
  renewal: 'Las suscripciones se renuevan automáticamente salvo que las canceles en los ajustes de {store} al menos 24 horas antes de que termine el periodo.',
  genericStore: 'tu tienda de apps',
  cta: {
    signUp: 'Regístrate para suscribirte',
    current: 'Tienes el plan {plan}',
    continue: 'Continuar con {plan}',
    perMonth: '{price}/mes',
    perYear: '{price}/año',
  },
  toasts: {
    unavailable: 'Este producto aún no está disponible en tu tienda.',
    appsOnly: 'Las compras están disponibles en las apps de iOS y Android.',
    done: plural({ one: 'Todo listo: tienes {count} crédito disponible.', other: 'Todo listo: tienes {count} créditos disponibles.' }),
    restored: 'Compras restauradas',
  },
  errors: {
    purchaseFailed: 'No se pudo completar la compra.',
    restoreFailed: 'No se pudieron restaurar las compras.',
  },
} as const;
