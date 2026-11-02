import { plural } from '../../catalog';

/** Textos da tela do YouTube. */
export default {
  title: 'Do YouTube',
  intro: {
    title: 'Transforme um vídeo\nem reels passo a passo',
    body: 'Cole qualquer vídeo de receita ou Short. O Chef assiste, escreve os passos e repete o trecho exato de cada um — os Shorts ganham uma voz que explica cada passo.',
    placeholder: 'Link do YouTube ou dos Shorts',
    invalidLink: 'Isso não parece um link do YouTube',
    paste: 'Colar',
    noLinkOnClipboard: 'Nenhum link do YouTube na área de transferência',
  },
  how: {
    copyLink: 'Copie o link no app do YouTube (Compartilhar → Copiar link)',
    chefBreaksItDown: 'O Chef divide o vídeo em passos com clipes, dicas e informação nutricional',
    handsFree: 'Cozinhe sem usar as mãos: diga “próximo”, “voltar”, “pausa”',
  },
  preview: {
    short: 'Short',
    video: 'Vídeo',
    usesCredits: plural({ one: 'Usa {count} crédito', other: 'Usa {count} créditos' }),
    loading: 'Carregando os detalhes do vídeo…',
    breakItDown: 'Dividir em passos',
    notCharged: 'Não é um vídeo de receita? Você não paga nada.',
  },
  stages: {
    watching: {
      title: 'Assistindo ao vídeo',
      body: 'Identificando cada ingrediente e cada ação',
    },
    writing: {
      title: 'Escrevendo seus passos',
      body: 'Marcando um clipe para cada passo e incluindo dicas para iniciantes',
    },
    nutrition: {
      title: 'Nutrição e narração',
      body: 'Calorias, macros e falas para ler em voz alta',
    },
  },
  working: {
    title: 'Dividindo em passos…',
    body: 'Isso costuma levar menos de um minuto. Você pode sair desta tela — a gente continua trabalhando.',
    tip: '💡 Enquanto espera: no modo cozinha, diga “repete” para ver o clipe de um passo de novo, ou “inicia o timer” nos passos com tempo marcado.',
  },
  done: {
    title: 'Pronto para cozinhar 🎉',
    cached: 'Alguém já dividiu este vídeo em passos — nenhum crédito usado.',
    stepsWithClips: plural({ one: '{count} passo, com o seu próprio clipe.', other: '{count} passos, cada um com o seu próprio clipe.' }),
    stepsAndClips: 'Passos e clipes',
    cookNow: 'Salvar e começar a cozinhar',
    saveForLater: 'Salvar para depois',
    savedCookNow: 'Salva — bora cozinhar!',
    savedForLater: 'Salva em Cozinhar depois',
  },
  failed: {
    title: 'Não deu certo',
    refunded: '✓ Seus créditos foram devolvidos.',
    tryAnother: 'Tentar outro vídeo',
  },
  errors: {
    notStarted: 'A importação não começou. Tente de novo.',
    expired: 'Esta importação expirou. Comece de novo.',
  },
} as const;
