/** Textos da tela inicial. */
export default {
  nameTitle: '{name} 👋',
  guestTitle: 'Olá! 👋',
  composer: {
    title: 'O que vamos cozinhar hoje?',
    placeholder: 'ex.: frango picante em 20 min',
    inputLabel: 'Descreva o que você quer cozinhar',
    send: 'Perguntar ao Chef',
  },
  prompts: {
    highProteinDinner: 'Jantar rico em proteína',
    quickBreakfast: 'Café da manhã em 15 min',
    cosyDal: 'Um dal quentinho só para mim',
    useLeftovers: 'Aproveitar as sobras',
    cheapFilling: 'Barato e que sustenta',
    impressDate: 'Impressionar o crush',
  },
  actions: {
    youtube: { title: 'Do YouTube', body: 'Vídeo → reels de passos' },
    builder: { title: 'Criar com o Chef', body: 'Descreva qualquer prato' },
    fridge: { title: 'Na geladeira', body: 'Use o que você tem' },
    manual: { title: 'Minha receita', body: 'Receitas de família' },
  },
  upsell: {
    badge: 'Créditos grátis',
    title: 'Desbloqueie o Chef e os reels do YouTube',
    body: 'Crie uma conta grátis para usar a IA — as primeiras receitas são por nossa conta.',
  },
  sections: {
    cookLater: { title: 'Cozinhar depois', subtitle: 'Guardadas para quando bater a fome' },
    quick: { title: 'Rápidas e proteicas', subtitle: 'Pratos rápidos que matam a fome' },
    experiments: { title: 'Seus experimentos', subtitle: 'Versões que você criou com o Chef' },
    recent: { title: 'Adicionadas recentemente', subtitle: 'Novidades nas suas receitas' },
  },
  voiceTip: {
    title: 'Cozinhe sem usar as mãos',
    body: 'No modo cozinha, diga “próximo”, “voltar” ou “pausa” — nada de tocar na tela com as mãos sujas.',
    dismiss: 'Dispensar dica',
  },
} as const;
