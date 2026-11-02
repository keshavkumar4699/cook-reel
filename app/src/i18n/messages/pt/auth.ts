import { plural } from '../../catalog';

/** Tela de boas-vindas, login e criação de conta. */
export default {
  welcome: {
    heroLine1: 'Cozinhe de tudo,',
    heroLine2: 'um passo de cada vez.',
    body: 'Transforme receitas do YouTube em reels de passos para cozinhar sem usar as mãos, ou deixe o Chef criar pratos que combinam com a sua cozinha, seus objetivos e seu bolso.',
    guest: 'Continuar sem conta',
    note: 'Salvar receitas e cozinhar é grátis. Os recursos de IA precisam de uma conta — contas novas ganham créditos grátis para começar.',
    language: 'Idioma: {language}',
  },
  signIn: {
    title: 'Crie sua conta para cozinhar com IA',
    body: 'É só um toque. Suas receitas, cardápios e listas ficam neste aparelho.',
    perks: {
      chef: { title: 'Chef, seu cozinheiro com IA', body: 'Conte sua vontade e receba uma receita feita para a sua cozinha e seus objetivos.' },
      youtube: { title: 'Do YouTube para reels de passos', body: 'Qualquer vídeo de receita vira clipes curtos que você segue por voz.' },
      credits: { title: 'Créditos grátis para começar', body: 'Experimente todos os recursos de IA por nossa conta. Suas receitas salvas ficam no seu celular.' },
    },
    legal: 'Ao continuar, você concorda com os Termos e a Política de Privacidade.',
  },
  buttons: {
    google: 'Continuar com o Google',
    devTitle: 'Login de desenvolvimento',
    devName: 'Seu nome',
    devButton: 'Entrar para testes',
  },
  welcomeCredits: plural({
    one: 'Boas-vindas! Você tem {count} crédito grátis na sua conta.',
    other: 'Boas-vindas! Você tem {count} créditos grátis na sua conta.',
  }),
  errors: {
    generic: 'Não foi possível fazer seu login. Tente de novo.',
    appleNoToken: 'A Apple não confirmou seu login. Tente de novo.',
    appleIosOnly: 'O login com a Apple está disponível no app para iOS.',
    googleNeedsBuild: 'O login com o Google precisa da versão instalável do app CookReel (não funciona no Expo Go).',
    googleNoToken: 'O Google não confirmou seu login. Tente de novo.',
    googleNoPlayServices: 'O Google Play Services não está disponível neste aparelho.',
    googleAppsOnly: 'O login com o Google está disponível nos apps para iOS e Android.',
    purchasesAppsOnly: 'As compras estão disponíveis nos apps para iOS e Android.',
  },
} as const;
