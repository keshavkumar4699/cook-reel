import { plural } from '../../catalog';

/** Modo cozinha: o player passo a passo em tela cheia. */
export default {
  notFound: 'Receita não encontrada',
  voiceState: {
    off: 'Voz desligada',
    starting: 'Iniciando…',
    listening: 'Ouvindo',
    paused: 'Pausado',
    denied: 'Mic bloqueado',
    unavailable: 'Sem voz',
  },
  top: {
    close: 'Fechar o modo cozinha',
    stepOf: 'Passo {current} de {total}',
    voiceControl: 'Controle por voz: {state}. Toque para ativar ou desativar; toque e segure para ver os comandos.',
    ingredients: 'Ingredientes',
  },
  heard: '“{text}”',
  video: {
    allDone: 'Todos os passos concluídos',
    noClip: 'Sem clipe neste passo — siga o texto abaixo',
    looping: '▶ Repetindo {start}–{end}',
    aiNarration: 'Narração por IA',
    embedBlocked: 'O criador desativou a reprodução em outros apps.',
    unavailable: 'Não é possível reproduzir este vídeo agora.',
    playerTitle: 'Vídeo da receita',
  },
  done: {
    title: 'Você conseguiu!',
    subtitle: '{title}: prontinho! Como ficou?',
    stars: plural({ one: '{count} estrela', other: '{count} estrelas' }),
    finish: 'Concluir',
    toast: 'Mandou bem, chef! 🎉',
  },
  timer: {
    started: 'Timer iniciado · {time}',
    doneToast: '⏰ Acabou o tempo — {label}',
    noTimer: 'Este passo não tem timer',
    timesUp: 'Acabou o tempo!',
    pause: 'Pausar timer',
    resume: 'Retomar timer',
    cancel: 'Cancelar timer',
  },
  controls: {
    previous: 'Passo anterior',
    replay: 'Ver este passo de novo',
    play: 'Reproduzir',
    pause: 'Pausar',
    mute: 'Silenciar vídeo',
    unmute: 'Ativar som do vídeo',
    readAloud: 'Ler o passo em voz alta',
    stopReading: 'Parar a leitura',
    next: 'Próximo passo',
  },
  ingredients: {
    title: 'Ingredientes',
    forServings: plural({ one: 'Para {count} porção', other: 'Para {count} porções' }),
    readAloud: 'Leia para mim',
  },
  narration: {
    preparing: 'Preparando a voz do Chef…',
  },
  help: {
    title: 'Comandos de voz',
    subtitle: 'Fale normalmente — frases curtas funcionam melhor',
    micBlocked: 'O acesso ao microfone está desativado. Ative nas configurações do celular para usar o controle por voz.',
  },
  step: {
    startTimerLabel: plural({ one: 'Iniciar um timer de {count} minuto', other: 'Iniciar um timer de {count} minutos' }),
    startTimer: 'Iniciar timer de {time}',
    timeLeft: 'Faltam {time}',
    timerDone: 'Acabou o tempo',
    whatDoesTermMean: 'O que significa {term}?',
    glossaryTerm: '{term}:',
    doneWhen: 'Pronto quando',
  },
} as const;
