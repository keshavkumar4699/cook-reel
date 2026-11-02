import { plural } from '../../catalog';

/** Configuração inicial e perfil culinário (os dois usam os mesmos campos). */
export default {
  steps: {
    personas: { title: 'O que traz você\nao CookReel?', subtitle: 'Escolha tudo o que combina com você — vamos montar sua tela inicial a partir disso.' },
    diet: { title: 'Como você come?', subtitle: 'O Chef nunca vai sugerir nada que você não possa comer.' },
    kitchen: { title: 'Sua cozinha', subtitle: 'As receitas só vão usar o que você realmente tem.' },
    goals: { title: 'Você e seus objetivos', subtitle: 'Para porções, macros e o orçamento do mercado.' },
  },
  hello: 'Oi, {name} 👋',
  skipSetup: 'Pular configuração',
  start: 'Começar a cozinhar',

  personas: {
    saver: { title: 'Salvar receitas do YouTube', body: 'Guardar o que eu acho para cozinhar depois' },
    quick: { title: 'Refeições rápidas na correria', body: 'Entre trabalho, estudos e academia' },
    fridge: { title: 'Cozinhar com o que tenho', body: 'Aproveitar a geladeira e desperdiçar menos' },
    creator: { title: 'Criar e experimentar', body: 'Inventar pratos e versões novas' },
    fitness: { title: 'Comer pelos meus objetivos', body: 'Proteína, calorias e macros' },
    learner: { title: 'Aprender a cozinhar', body: 'Passo a passo, desde o básico' },
  },
  groups: {
    diet: 'Dieta',
    allergies: 'Alergias',
    spice: 'Nível de pimenta',
    equipment: 'Eu tenho…',
    time: 'Tempo que costumo ter para cozinhar',
    skill: 'Experiência na cozinha',
    household: 'Costumo cozinhar para',
    goal: 'Objetivo',
    protein: 'Meta diária de proteína',
    budget: 'Orçamento do mercado',
  },
  diets: {
    vegetarian: 'Vegetariana',
    eggetarian: 'Ovovegetariana',
    'non-vegetarian': 'Onívora',
    vegan: 'Vegana',
    pescatarian: 'Pescetariana',
  },
  allergies: {
    peanuts: 'Amendoim',
    treeNuts: 'Castanhas',
    dairy: 'Laticínios',
    gluten: 'Glúten',
    eggs: 'Ovos',
    soy: 'Soja',
    shellfish: 'Frutos do mar',
    sesame: 'Gergelim',
  },
  spice: {
    mild: 'Suave',
    medium: 'Médio',
    hot: 'Picante',
  },
  equipment: {
    gasStove: 'Fogão a gás',
    induction: 'Cooktop de indução',
    microwave: 'Micro-ondas',
    oven: 'Forno',
    airFryer: 'Air fryer',
    pressureCooker: 'Panela de pressão',
    riceCooker: 'Panela de arroz',
    kettle: 'Chaleira elétrica',
    blender: 'Liquidificador',
    toaster: 'Torradeira',
  },
  time: {
    minutes: '{n} min',
    orMore: '{n}+ min',
  },
  skills: {
    new: { title: 'Iniciante na cozinha', body: 'Explique tudo, por favor' },
    basic: { title: 'Sei o básico', body: 'Arroz, ovo, macarrão — nesse nível' },
    confident: { title: 'Cozinho com confiança', body: 'Pode pular as explicações' },
  },
  household: {
    justMe: 'Só eu',
    people: plural({ one: '{count} pessoa', other: '{count} pessoas' }),
  },
  goals: {
    build_muscle: 'Ganhar massa',
    lose_fat: 'Perder gordura',
    maintain: 'Manter o peso',
    eat_healthy: 'Comer melhor',
    none: 'Sem objetivo',
  },
  proteinGrams: '{n} g',
  budgets: {
    tight: 'Apertado',
    moderate: 'Moderado',
    flexible: 'Flexível',
  },

  profile: {
    title: 'Perfil culinário',
    intro: 'O Chef usa isto em todas as receitas: o que você come, o que você tem e aonde quer chegar.',
    sections: {
      personas: 'O que traz você aqui',
      diet: 'Como você come',
      kitchen: 'Sua cozinha',
      goals: 'Você e seus objetivos',
    },
    save: 'Salvar perfil',
    saved: 'Perfil culinário salvo',
  },
} as const;
