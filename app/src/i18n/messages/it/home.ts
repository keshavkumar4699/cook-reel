export default {
  nameTitle: '{name} 👋',
  guestTitle: 'Ciao! 👋',
  composer: {
    title: 'Cosa cuciniamo oggi?',
    placeholder: 'es. paneer piccante in 20 min',
    inputLabel: 'Descrivi cosa vuoi cucinare',
    send: 'Chiedi a Chef',
  },
  prompts: {
    highProteinDinner: 'Cena ricca di proteine',
    quickBreakfast: 'Colazione in 15 minuti',
    cosyDal: 'Un dal coccola per me',
    useLeftovers: 'Ricicla gli avanzi',
    cheapFilling: 'Economico e saziante',
    impressDate: 'Una cena per fare colpo',
  },
  actions: {
    youtube: { title: 'Da YouTube', body: 'Video → reel passo passo' },
    builder: { title: 'Crea con Chef', body: 'Descrivi qualsiasi piatto' },
    fridge: { title: 'Svuotafrigo', body: 'Usa quello che hai' },
    manual: { title: 'Scrivi la tua', body: 'Le ricette di famiglia' },
  },
  upsell: {
    badge: 'Crediti gratis',
    title: 'Sblocca Chef e i reel di YouTube',
    body: 'Crea un account gratuito per usare l’IA: le prime ricette te le offriamo noi.',
  },
  sections: {
    cookLater: { title: 'Da cucinare', subtitle: 'Salvate per quando avrai fame' },
    quick: { title: 'Veloci e proteiche', subtitle: 'Piatti rapidi che saziano' },
    experiments: { title: 'I tuoi esperimenti', subtitle: 'Varianti create con Chef' },
    recent: { title: 'Aggiunte di recente', subtitle: 'Novità nel tuo ricettario' },
  },
  voiceTip: {
    title: 'Cucina a mani libere',
    body: 'In modalità cucina di’ «avanti», «indietro» o «pausa»: basta toccare lo schermo con le mani sporche.',
    dismiss: 'Chiudi il suggerimento',
  },
} as const;
