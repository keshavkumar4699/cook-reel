import { plural } from '../../catalog';

export default {
  welcome: {
    heroLine1: 'Cucina di tutto,',
    heroLine2: 'un passo alla volta.',
    body: 'Trasforma le ricette di YouTube in reel passo passo da seguire a mani libere, oppure lascia che Chef crei piatti su misura per la tua cucina, i tuoi obiettivi e il tuo budget.',
    guest: 'Continua senza account',
    note: 'Salvare e cucinare le ricette è gratis. Le funzioni IA richiedono un account: i nuovi account ricevono crediti gratuiti per iniziare.',
    language: 'Lingua: {language}',
  },
  signIn: {
    title: 'Registrati per cucinare con l’IA',
    body: 'Basta un tocco. Ricette, piani e liste restano su questo dispositivo.',
    perks: {
      chef: { title: 'Chef, il tuo cuoco IA', body: 'Descrivi una voglia e ricevi una ricetta per la tua cucina e i tuoi obiettivi.' },
      youtube: { title: 'Da YouTube a reel passo passo', body: 'Ogni video di ricette diventa una serie di brevi clip da seguire con la voce.' },
      credits: { title: 'Crediti gratis per iniziare', body: 'Prova tutte le funzioni IA: offriamo noi. Le ricette salvate restano sul tuo telefono.' },
    },
    legal: 'Continuando accetti i Termini e l’Informativa sulla privacy.',
  },
  buttons: {
    google: 'Continua con Google',
    devTitle: 'Accesso di sviluppo',
    devName: 'Il tuo nome',
    devButton: 'Accedi per i test',
  },
  welcomeCredits: plural({
    one: 'Ti diamo il benvenuto! Hai {count} credito gratuito nel tuo account.',
    other: 'Ti diamo il benvenuto! Hai {count} crediti gratuiti nel tuo account.',
  }),
  errors: {
    generic: 'Non siamo riusciti a farti accedere. Riprova.',
    appleNoToken: 'Apple non ha confermato l’accesso. Riprova.',
    appleIosOnly: 'Accedi con Apple è disponibile nell’app per iOS.',
    googleNeedsBuild: 'L’accesso con Google richiede la build dell’app CookReel (non è disponibile in Expo Go).',
    googleNoToken: 'Google non ha confermato l’accesso. Riprova.',
    googleNoPlayServices: 'Google Play Services non è disponibile su questo dispositivo.',
    googleAppsOnly: 'L’accesso con Google è disponibile nelle app per iOS e Android.',
    purchasesAppsOnly: 'Gli acquisti sono disponibili nelle app per iOS e Android.',
  },
} as const;
