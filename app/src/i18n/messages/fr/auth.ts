import { plural } from '../../catalog';

/** Écran d’accueil, connexion et création de compte. */
export default {
  welcome: {
    heroLine1: 'Cuisinez de tout,',
    heroLine2: 'une étape à la fois.',
    body: 'Transformez les recettes YouTube en reels pas à pas à suivre mains libres, ou laissez Chef créer des plats adaptés à votre cuisine, vos objectifs et votre budget.',
    guest: 'Continuer sans compte',
    note: 'Enregistrer et cuisiner des recettes est gratuit. Les fonctions IA nécessitent un compte : les nouveaux comptes reçoivent des crédits offerts pour démarrer.',
    language: 'Langue : {language}',
  },
  signIn: {
    title: 'Inscrivez-vous pour cuisiner avec l’IA',
    body: 'Un seul geste suffit. Vos recettes, menus et listes restent sur cet appareil.',
    perks: {
      chef: { title: 'Chef, votre cuistot IA', body: 'Décrivez une envie, recevez une recette adaptée à votre cuisine et à vos objectifs.' },
      youtube: { title: 'De YouTube aux reels pas à pas', body: 'N’importe quelle vidéo de recette devient une série de courts extraits à suivre à la voix.' },
      credits: { title: 'Des crédits offerts pour commencer', body: 'Essayez toutes les fonctions IA, c’est offert. Vos recettes enregistrées restent sur votre téléphone.' },
    },
    legal: 'En continuant, vous acceptez les Conditions d’utilisation et la Politique de confidentialité.',
  },
  buttons: {
    google: 'Continuer avec Google',
    devTitle: 'Connexion de développement',
    devName: 'Votre nom',
    devButton: 'Se connecter pour tester',
  },
  welcomeCredits: plural({
    one: 'Bienvenue ! {count} crédit offert vous attend sur votre compte.',
    other: 'Bienvenue ! {count} crédits offerts vous attendent sur votre compte.',
  }),
  errors: {
    generic: 'Connexion impossible. Réessayez.',
    appleNoToken: 'Apple n’a pas confirmé votre connexion. Réessayez.',
    appleIosOnly: 'Se connecter avec Apple est disponible dans l’appli iOS.',
    googleNeedsBuild: 'La connexion Google nécessite la version complète de l’appli CookReel (elle n’est pas disponible dans Expo Go).',
    googleNoToken: 'Google n’a pas confirmé votre connexion. Réessayez.',
    googleNoPlayServices: 'Les services Google Play ne sont pas disponibles sur cet appareil.',
    googleAppsOnly: 'La connexion Google est disponible dans les applis iOS et Android.',
    purchasesAppsOnly: 'Les achats sont disponibles dans les applis iOS et Android.',
  },
} as const;
