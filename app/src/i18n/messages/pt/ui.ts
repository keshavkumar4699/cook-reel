import { plural } from '../../catalog';

/** Elementos compartilhados: a folha "adicionar receita", o selo de créditos, o seletor numérico e a ilustração de boas-vindas. */
export default {
  createSheet: {
    title: 'Adicionar receita',
    subtitleSignedIn: 'Opções com IA usam créditos',
    subtitleGuest: 'Opções com IA precisam de uma conta grátis',
    aiBadge: 'IA',
    youtubeTitle: 'De um vídeo do YouTube',
    youtubeBody: 'Cole um link e receba clipes passo a passo',
    chefTitle: 'Criar com o Chef',
    chefBody: 'Conte sua vontade e responda a algumas perguntas',
    fridgeTitle: 'Cozinhar com o que tenho',
    fridgeBody: 'Diga ao Chef o que você tem e receba uma receita',
    manualTitle: 'Escrever minha receita',
    manualBody: 'Salve uma receita de família ou uma criação sua',
  },
  creditsPill: {
    a11y: plural({ one: '{count} crédito. Obter mais', other: '{count} créditos. Obter mais' }),
  },
  stepper: {
    decrease: 'Diminuir',
    increase: 'Aumentar',
  },
  hero: {
    sideStep: 'PASSO {n}',
    stepOf: 'PASSO {current} DE {total} · {range}',
    stepTitle: 'Misture os noodles',
    sayNext: 'Diga “próximo”',
  },
} as const;
