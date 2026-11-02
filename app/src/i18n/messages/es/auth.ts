import { plural } from '../../catalog';

export default {
  welcome: {
    heroLine1: 'Cocina lo que quieras,',
    heroLine2: 'paso a paso.',
    body: 'Convierte recetas de YouTube en reels paso a paso que sigues con las manos libres, o deja que Chef cree platos a la medida de tu cocina, tus objetivos y tu presupuesto.',
    guest: 'Continuar sin cuenta',
    note: 'Guardar y cocinar recetas es gratis. Las funciones de IA necesitan una cuenta, y las cuentas nuevas reciben créditos gratis para empezar.',
    language: 'Idioma: {language}',
  },
  signIn: {
    title: 'Regístrate para cocinar con IA',
    body: 'Solo hace falta un toque. Tus recetas, planes y listas se quedan en este dispositivo.',
    perks: {
      chef: { title: 'Chef, tu asistente de cocina con IA', body: 'Describe un antojo y recibe una receta para tu cocina y tus objetivos.' },
      youtube: { title: 'De YouTube a reels paso a paso', body: 'Cualquier video de recetas se convierte en clips cortos que puedes seguir con la voz.' },
      credits: { title: 'Créditos gratis para empezar', body: 'Prueba todas las funciones de IA: invitamos nosotros. Tus recetas guardadas se quedan en tu teléfono.' },
    },
    legal: 'Al continuar, aceptas los Términos y la Política de privacidad.',
  },
  buttons: {
    google: 'Continuar con Google',
    devTitle: 'Inicio de sesión de desarrollo',
    devName: 'Tu nombre',
    devButton: 'Iniciar sesión para pruebas',
  },
  welcomeCredits: plural({
    one: '¡Te damos la bienvenida! Tienes {count} crédito gratis en tu cuenta.',
    other: '¡Te damos la bienvenida! Tienes {count} créditos gratis en tu cuenta.',
  }),
  errors: {
    generic: 'No pudimos iniciar tu sesión. Vuelve a intentarlo.',
    appleNoToken: 'Apple no confirmó tu inicio de sesión. Vuelve a intentarlo.',
    appleIosOnly: 'Iniciar sesión con Apple solo está disponible en la app de iOS.',
    googleNeedsBuild: 'El inicio de sesión con Google necesita la app de CookReel (no está disponible en Expo Go).',
    googleNoToken: 'Google no confirmó tu inicio de sesión. Vuelve a intentarlo.',
    googleNoPlayServices: 'Los servicios de Google Play no están disponibles en este dispositivo.',
    googleAppsOnly: 'El inicio de sesión con Google está disponible en las apps de iOS y Android.',
    purchasesAppsOnly: 'Las compras están disponibles en las apps de iOS y Android.',
  },
} as const;
