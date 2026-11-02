import { plural } from '../../catalog';

/** Tela de planos e créditos. Os créditos pagam os recursos de IA; salvar e cozinhar é sempre grátis. */
export default {
  hero: {
    title: 'Cozinhe mais com o Chef',
    notEnough: 'Créditos insuficientes',
    outOfCredits: 'Seus créditos acabaram',
    body: 'Créditos novos todo mês para receitas com IA, experimentos e reels de passos do YouTube.',
    bodyOut: 'Escolha um plano para continuar criando receitas e transformando vídeos em reels de passos. Suas receitas salvas continuam sempre grátis.',
  },
  creditsLeft: plural({ one: '{count} crédito restante', other: '{count} créditos restantes' }),
  period: {
    monthly: 'Mensal',
    yearly: 'Anual',
    yearlySave: 'Anual · economize {percent}%',
  },
  plans: {
    basic: {
      name: 'Basic',
      tagline: 'Para alguns pratos novos toda semana',
      perks: {
        ai: 'Receitas com IA, modo geladeira e variações',
        youtube: 'Reels de passos de vídeos e Shorts do YouTube',
        topups: 'Pacotes extras quando os créditos acabarem',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'Para quem cozinha quase todo dia',
      perks: {
        everything: 'Tudo do Basic',
        credits: 'Mais de 3× os créditos do Basic',
      },
    },
    max: {
      name: 'Max',
      tagline: 'Para quem faz marmita e cria receitas',
      perks: {
        everything: 'Tudo do Pro',
        value: 'Melhor preço por crédito',
      },
    },
  },
  planA11y: {
    monthly: '{name}, {price} por mês',
    yearly: '{name}, {price} por ano',
  },
  badges: {
    current: 'Atual',
    mostPopular: 'Mais popular',
  },
  perMonth: 'por mês',
  perMonthApprox: '≈ {price}/mês',
  monthlyCredits: plural({ one: '{count} crédito todo mês', other: '{count} créditos todo mês' }),
  approxRecipes: plural({ one: '≈ {count} receita', other: '≈ {count} receitas' }),
  costs: {
    title: 'O que usa créditos',
    recipe: 'Receita com IA do Chef',
    experiment: 'Variação de receita',
    youtube: 'Vídeo do YouTube em passos',
    youtubeShort: 'Short do YouTube em passos',
    free: 'Salvar, planejar e modo cozinha',
    freeValue: 'Grátis',
    note: 'As perguntas do Chef são grátis. Importações que falham são reembolsadas automaticamente. Os créditos mensais renovam a cada mês de cobrança; os créditos extras nunca expiram.',
  },
  topups: {
    title: 'Precisa de mais créditos?',
    unit: plural({ one: 'crédito', other: 'créditos' }),
    a11y: plural({ one: '{count} crédito por {price}', other: '{count} créditos por {price}' }),
  },
  links: {
    restore: 'Restaurar compras',
    terms: 'Termos',
    privacy: 'Privacidade',
  },
  renewal: 'As assinaturas são renovadas automaticamente até serem canceladas nas configurações da {store}, com pelo menos 24 horas de antecedência do fim do período.',
  genericStore: 'loja de apps',
  cta: {
    signUp: 'Crie uma conta para assinar',
    current: 'Você está no {plan}',
    continue: 'Continuar com o {plan}',
    perMonth: '{price}/mês',
    perYear: '{price}/ano',
  },
  toasts: {
    unavailable: 'Este produto ainda não está disponível na sua loja.',
    appsOnly: 'As compras estão disponíveis nos apps para iOS e Android.',
    done: plural({ one: 'Tudo certo — {count} crédito disponível.', other: 'Tudo certo — {count} créditos disponíveis.' }),
    restored: 'Compras restauradas',
  },
  errors: {
    purchaseFailed: 'A compra não foi concluída.',
    restoreFailed: 'Não foi possível restaurar as compras.',
  },
} as const;
