import { plural } from '../../catalog';

/** Mode cuisine : le lecteur plein écran, étape par étape. */
export default {
  notFound: 'Recette introuvable',
  voiceState: {
    off: 'Micro coupé',
    starting: 'Démarrage…',
    listening: 'À l’écoute',
    paused: 'En pause',
    denied: 'Micro bloqué',
    unavailable: 'Indisponible',
  },
  top: {
    close: 'Fermer le mode cuisine',
    stepOf: 'Étape {current} sur {total}',
    voiceControl: 'Commande vocale : {state}. Touchez pour activer ou désactiver, appui long pour voir les commandes.',
    ingredients: 'Ingrédients',
  },
  heard: '« {text} »',
  video: {
    allDone: 'Toutes les étapes sont terminées',
    noClip: 'Pas d’extrait pour cette étape : suivez le texte ci-dessous',
    looping: '▶ En boucle {start}–{end}',
    aiNarration: 'Narration IA',
    embedBlocked: 'La chaîne a désactivé la lecture dans d’autres applis.',
    unavailable: 'Impossible de lire cette vidéo pour le moment.',
    playerTitle: 'Vidéo de la recette',
  },
  done: {
    title: 'Vous avez réussi !',
    subtitle: '{title} : c’est prêt ! Alors, verdict ?',
    stars: plural({ one: '{count} étoile', other: '{count} étoiles' }),
    finish: 'Terminer la recette',
    toast: 'Bravo, chef ! 🎉',
  },
  timer: {
    started: 'Minuteur lancé · {time}',
    doneToast: '⏰ Minuteur terminé : {label}',
    noTimer: 'Pas de minuteur pour cette étape',
    timesUp: 'Temps écoulé !',
    pause: 'Mettre le minuteur en pause',
    resume: 'Reprendre le minuteur',
    cancel: 'Annuler le minuteur',
  },
  controls: {
    previous: 'Étape précédente',
    replay: 'Rejouer cette étape',
    play: 'Lecture',
    pause: 'Pause',
    mute: 'Couper le son de la vidéo',
    unmute: 'Activer le son de la vidéo',
    readAloud: 'Lire l’étape à voix haute',
    stopReading: 'Arrêter la lecture',
    next: 'Étape suivante',
  },
  ingredients: {
    title: 'Ingrédients',
    forServings: plural({ one: 'Pour {count} portion', other: 'Pour {count} portions' }),
    readAloud: 'Écouter la liste',
  },
  narration: {
    preparing: 'La voix de Chef se prépare…',
  },
  help: {
    title: 'Commandes vocales',
    subtitle: 'Parlez normalement : les phrases courtes fonctionnent le mieux',
    micBlocked: 'L’accès au micro est désactivé. Activez-le dans les réglages pour utiliser la commande vocale.',
  },
  step: {
    startTimerLabel: plural({ one: 'Lancer un minuteur de {count} minute', other: 'Lancer un minuteur de {count} minutes' }),
    startTimer: 'Lancer un minuteur de {time}',
    timeLeft: 'Encore {time}',
    timerDone: 'Minuteur terminé',
    whatDoesTermMean: 'Que veut dire « {term} » ?',
    glossaryTerm: '{term} :',
    doneWhen: 'Signe que c’est prêt :',
  },
} as const;
