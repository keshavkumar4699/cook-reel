/** Home screen strings. */
export default {
  nameTitle: '{name} 👋',
  guestTitle: 'Hallo 👋',
  composer: {
    title: 'Was kochen wir heute?',
    placeholder: 'z. B. scharfer Paneer in 20 Minuten',
    inputLabel: 'Beschreib, was du kochen möchtest',
    send: 'Chef fragen',
  },
  prompts: {
    highProteinDinner: 'Proteinreiches Abendessen',
    quickBreakfast: 'Frühstück in 15 Minuten',
    cosyDal: 'Wohlfühl-Dal für mich',
    useLeftovers: 'Reste verwerten',
    cheapFilling: 'Günstig & sättigend',
    impressDate: 'Ein Date beeindrucken',
  },
  actions: {
    youtube: { title: 'Von YouTube', body: 'Video → Schritt-Reels' },
    builder: { title: 'Chef fragen', body: 'Wunschgericht beschreiben' },
    fridge: { title: 'Resteküche', body: 'Nutze, was da ist' },
    manual: { title: 'Selbst schreiben', body: 'Familienlieblinge' },
  },
  upsell: {
    badge: 'Gratis-Credits',
    title: 'Chef & YouTube-Reels freischalten',
    body: 'Erstelle ein kostenloses Konto, um KI zu nutzen – deine ersten Rezepte gehen auf uns.',
  },
  sections: {
    cookLater: { title: 'Später kochen', subtitle: 'Für später, wenn der Hunger kommt' },
    quick: { title: 'Schnell & proteinreich', subtitle: 'Fixe Teller, die lange satt machen' },
    experiments: { title: 'Deine Experimente', subtitle: 'Varianten, die du mit Chef erstellt hast' },
    recent: { title: 'Zuletzt hinzugefügt', subtitle: 'Neu in deinem Kochbuch' },
  },
  voiceTip: {
    title: 'Freihändig kochen',
    body: 'Sag im Kochmodus „weiter“, „zurück“ oder „Pause“ – nie wieder mit klebrigen Fingern aufs Display tippen.',
    dismiss: 'Tipp ausblenden',
  },
} as const;
