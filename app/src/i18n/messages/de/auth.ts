import { plural } from '../../catalog';

/** Welcome screen, sign-in and account creation. */
export default {
  welcome: {
    heroLine1: 'Koch einfach alles,',
    heroLine2: 'Schritt für Schritt.',
    body: 'Mach aus YouTube-Rezepten Schritt-Reels zum freihändigen Mitkochen oder lass Chef Gerichte kreieren, die zu deiner Küche, deinen Zielen und deinem Budget passen.',
    guest: 'Ohne Konto fortfahren',
    note: 'Rezepte speichern und kochen ist kostenlos. Für KI-Funktionen brauchst du ein Konto – neue Konten bekommen zum Start Gratis-Credits.',
    language: 'Sprache: {language}',
  },
  signIn: {
    title: 'Registrieren und mit KI kochen',
    body: 'Ein Tipp genügt. Deine Rezepte, Pläne und Listen bleiben auf diesem Gerät.',
    perks: {
      chef: { title: 'Chef, dein KI-Koch', body: 'Sag, worauf du Lust hast – und bekomm ein Rezept für deine Küche und deine Ziele.' },
      youtube: { title: 'Von YouTube zu Schritt-Reels', body: 'Jedes Rezeptvideo wird zu kurzen Clips, denen du per Sprache folgen kannst.' },
      credits: { title: 'Gratis-Credits zum Start', body: 'Probier jede KI-Funktion auf unsere Kosten. Deine gespeicherten Rezepte bleiben auf deinem Handy.' },
    },
    legal: 'Wenn du fortfährst, stimmst du den Nutzungsbedingungen und der Datenschutzerklärung zu.',
  },
  buttons: {
    google: 'Weiter mit Google',
    devTitle: 'Entwickler-Anmeldung',
    devName: 'Dein Name',
    devButton: 'Zum Testen anmelden',
  },
  welcomeCredits: plural({
    one: 'Willkommen! {count} Gratis-Credit liegt auf deinem Konto.',
    other: 'Willkommen! {count} Gratis-Credits liegen auf deinem Konto.',
  }),
  errors: {
    generic: 'Die Anmeldung hat nicht geklappt. Bitte versuch es noch einmal.',
    appleNoToken: 'Apple hat deine Anmeldung nicht bestätigt. Bitte versuch es noch einmal.',
    appleIosOnly: 'Die Anmeldung mit Apple ist in der iOS-App verfügbar.',
    googleNeedsBuild: 'Die Anmeldung mit Google braucht den CookReel-App-Build (in Expo Go ist sie nicht verfügbar).',
    googleNoToken: 'Google hat deine Anmeldung nicht bestätigt. Bitte versuch es noch einmal.',
    googleNoPlayServices: 'Die Google Play-Dienste sind auf diesem Gerät nicht verfügbar.',
    googleAppsOnly: 'Die Anmeldung mit Google ist in den Apps für iOS und Android verfügbar.',
    purchasesAppsOnly: 'Käufe sind in den Apps für iOS und Android möglich.',
  },
} as const;
