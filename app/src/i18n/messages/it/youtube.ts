import { plural } from '../../catalog';

export default {
  title: 'Da YouTube',
  intro: {
    title: 'Trasforma un video\nin reel passo passo',
    body: 'Incolla qualsiasi video di ricette o Short. Chef lo guarda, scrive i passaggi e manda in loop la clip giusta per ognuno; negli Short c’è anche una voce che spiega ogni passaggio.',
    placeholder: 'Link di YouTube o Shorts',
    invalidLink: 'Non sembra un link di YouTube',
    paste: 'Incolla',
    noLinkOnClipboard: 'Nessun link di YouTube negli appunti',
  },
  how: {
    copyLink: 'Copia il link dall’app YouTube (Condividi → Copia link)',
    chefBreaksItDown: 'Chef lo divide in passaggi con clip, consigli e valori nutrizionali',
    handsFree: 'Cucina a mani libere: di’ «avanti», «indietro», «pausa»',
  },
  preview: {
    short: 'Short',
    video: 'Video',
    usesCredits: plural({ one: 'Usa {count} credito', other: 'Usa {count} crediti' }),
    loading: 'Carico i dettagli del video…',
    breakItDown: 'Dividi in passaggi',
    notCharged: 'Non è un video di ricette? Non ti addebitiamo nulla.',
  },
  stages: {
    watching: {
      title: 'Guardo il video',
      body: 'Individuo ogni ingrediente e ogni azione',
    },
    writing: {
      title: 'Scrivo i passaggi',
      body: 'Ritaglio una clip per ogni passaggio e aggiungo consigli per principianti',
    },
    nutrition: {
      title: 'Valori nutrizionali e voce',
      body: 'Calorie, macro e testi da leggere ad alta voce',
    },
  },
  working: {
    title: 'Analisi in corso…',
    body: 'Di solito ci vuole meno di un minuto. Puoi uscire da questa schermata: noi continuiamo a lavorare.',
    tip: '💡 Mentre aspetti: in modalità cucina, di’ «ripeti» per rivedere la clip di un passaggio o «avvia il timer» per i passaggi a tempo.',
  },
  done: {
    title: 'Pronta da cucinare 🎉',
    cached: 'Qualcuno aveva già analizzato questo video: nessun credito usato.',
    stepsWithClips: plural({ one: '{count} passaggio, con la sua clip.', other: '{count} passaggi, ognuno con la sua clip.' }),
    stepsAndClips: 'Passaggi e clip',
    cookNow: 'Salva e inizia a cucinare',
    saveForLater: 'Salva per dopo',
    savedCookNow: 'Salvata: si cucina!',
    savedForLater: 'Salvata in «Da cucinare»',
  },
  failed: {
    title: 'Non ha funzionato',
    refunded: '✓ Ti abbiamo rimborsato i crediti.',
    tryAnother: 'Prova un altro video',
  },
  errors: {
    notStarted: 'L’importazione non è partita. Riprova.',
    expired: 'Questa importazione è scaduta. Avviala di nuovo.',
  },
} as const;
