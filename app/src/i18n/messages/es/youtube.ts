import { plural } from '../../catalog';

export default {
  title: 'Desde YouTube',
  intro: {
    title: 'Convierte un video en\nreels paso a paso',
    body: 'Pega cualquier video de receta o Short. Chef lo ve, escribe los pasos y repite en bucle el clip exacto de cada uno; los Shorts llevan además una voz que explica cada paso.',
    placeholder: 'Enlace de YouTube o Shorts',
    invalidLink: 'Eso no parece un enlace de YouTube',
    paste: 'Pegar',
    noLinkOnClipboard: 'No hay ningún enlace de YouTube en el portapapeles',
  },
  how: {
    copyLink: 'Copia el enlace desde la app de YouTube (Compartir → Copiar enlace)',
    chefBreaksItDown: 'Chef lo divide en pasos con clips, consejos e información nutricional',
    handsFree: 'Cocina con las manos libres: di «siguiente», «atrás», «pausa»',
  },
  preview: {
    short: 'Short',
    video: 'Video',
    usesCredits: plural({ one: 'Usa {count} crédito', other: 'Usa {count} créditos' }),
    loading: 'Cargando los datos del video…',
    breakItDown: 'Dividir en pasos',
    notCharged: '¿No es un video de receta? No se te cobrará.',
  },
  stages: {
    watching: {
      title: 'Viendo el video',
      body: 'Detectando cada ingrediente y cada acción',
    },
    writing: {
      title: 'Escribiendo tus pasos',
      body: 'Ajustando un clip para cada paso y añadiendo consejos para principiantes',
    },
    nutrition: {
      title: 'Nutrición y narración',
      body: 'Calorías, macros y textos para leer en voz alta',
    },
  },
  working: {
    title: 'Dividiendo en pasos…',
    body: 'Suele tardar menos de un minuto. Puedes salir de esta pantalla: seguiremos trabajando.',
    tip: '💡 Mientras esperas: en el modo cocina, di «repite» para volver a ver el clip de un paso o «pon el temporizador» en los pasos con tiempo.',
  },
  done: {
    title: 'Lista para cocinar 🎉',
    cached: 'Alguien ya había dividido este video: no se ha usado ningún crédito.',
    stepsWithClips: plural({ one: '{count} paso, con su propio clip.', other: '{count} pasos, cada uno con su propio clip.' }),
    stepsAndClips: 'Pasos y clips',
    cookNow: 'Guardar y empezar a cocinar',
    saveForLater: 'Guardar para después',
    savedCookNow: 'Guardada: ¡a cocinar!',
    savedForLater: 'Guardada en «Por cocinar»',
  },
  failed: {
    title: 'No funcionó',
    refunded: '✓ Te hemos devuelto los créditos.',
    tryAnother: 'Probar con otro video',
  },
  errors: {
    notStarted: 'La importación no se inició. Vuelve a intentarlo.',
    expired: 'Esta importación expiró. Vuelve a empezarla.',
  },
} as const;
