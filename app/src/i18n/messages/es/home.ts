export default {
  nameTitle: '{name} 👋',
  guestTitle: '¡Hola! 👋',
  composer: {
    title: '¿Qué cocinamos hoy?',
    placeholder: 'Ej.: paneer picante en 20 min',
    inputLabel: 'Describe lo que quieres cocinar',
    send: 'Preguntar a Chef',
  },
  prompts: {
    highProteinDinner: 'Cena rica en proteína',
    quickBreakfast: 'Desayuno en 15 min',
    cosyDal: 'Un dal calentito para uno',
    useLeftovers: 'Aprovechar las sobras',
    cheapFilling: 'Barato y que llene',
    impressDate: 'Para lucirme en una cita',
  },
  actions: {
    youtube: { title: 'Desde YouTube', body: 'Video → reels por pasos' },
    builder: { title: 'Crear con Chef', body: 'Describe cualquier plato' },
    fridge: { title: 'Con lo que tengo', body: 'Aprovecha lo que hay' },
    manual: { title: 'Escribir mi receta', body: 'Las favoritas de casa' },
  },
  upsell: {
    badge: 'Créditos gratis',
    title: 'Desbloquea Chef y los reels de YouTube',
    body: 'Crea una cuenta gratis para usar la IA: tus primeras recetas te las regalamos.',
  },
  sections: {
    cookLater: { title: 'Por cocinar', subtitle: 'Guardadas para cuando tengas hambre' },
    quick: { title: 'Rápidas y proteicas', subtitle: 'Platos rápidos que sacian' },
    experiments: { title: 'Tus experimentos', subtitle: 'Versiones que creaste con Chef' },
    recent: { title: 'Añadidas hace poco', subtitle: 'Lo último en tu recetario' },
  },
  voiceTip: {
    title: 'Cocina con las manos libres',
    body: 'En el modo cocina, di «siguiente», «atrás» o «pausa»: se acabó tocar la pantalla con las manos sucias.',
    dismiss: 'Ocultar consejo',
  },
} as const;
