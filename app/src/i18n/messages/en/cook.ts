import { plural } from '../../catalog';

/** Cooking mode: the full-screen, step-by-step player (cook/[id], StepCard, YouTubeStage). */
export default {
  notFound: 'Recipe not found',
  /** Voice-control pill in the top bar. Keep these very short (one or two words). */
  voiceState: {
    off: 'Voice off',
    starting: 'Starting…',
    listening: 'Listening',
    paused: 'Paused',
    denied: 'Mic blocked',
    unavailable: 'No voice',
  },
  top: {
    /** Screen-reader label of the close (X) button. */
    close: 'Close cooking mode',
    /** Screen-reader label of the step progress bar. */
    stepOf: 'Step {current} of {total}',
    /** Screen-reader label of the voice pill; {state} is one of the voice-pill texts above. */
    voiceControl: 'Voice control: {state}. Tap to toggle, long-press for commands.',
    /** Screen-reader label of the button that opens the ingredients sheet. */
    ingredients: 'Ingredients',
  },
  /** The voice command we just heard, in quotation marks, e.g. “next”. */
  heard: '“{text}”',
  video: {
    /** Shown over the video thumbnail after the last step. */
    allDone: 'All steps done',
    noClip: 'No clip for this step — follow the text below',
    /** Caption under the video: the part being replayed in a loop, e.g. "▶ Looping 1:05–1:40". */
    looping: '▶ Looping {start}–{end}',
    /** Small tag on YouTube Shorts, whose steps are read out by an AI voice. */
    aiNarration: 'AI narration',
    embedBlocked: 'The creator has turned off playback in other apps.',
    unavailable: 'This video can’t be played right now.',
    /** Screen-reader title of the embedded video player (web). */
    playerTitle: 'Recipe video',
  },
  /** The page after the last step. */
  done: {
    title: 'You did it!',
    subtitle: '{title} is ready. How did it turn out?',
    /** Screen-reader label of each rating star. */
    stars: plural({ one: '{count} star', other: '{count} stars' }),
    finish: 'Finish cooking',
    /** Toast after finishing; "chef" is the cook here, not the AI Chef. */
    toast: 'Nice work, chef! 🎉',
  },
  /** The kitchen timer pill above the controls. */
  timer: {
    /** Toast; {time} is the timer length, e.g. "5:00". */
    started: 'Timer started · {time}',
    /** Toast when a timer ends; {label} is the step title. */
    doneToast: '⏰ Timer done — {label}',
    noTimer: 'This step has no timer',
    timesUp: 'Time’s up!',
    pause: 'Pause timer',
    resume: 'Resume timer',
    cancel: 'Cancel timer',
  },
  /** Screen-reader labels of the round playback buttons at the bottom. */
  controls: {
    previous: 'Previous step',
    replay: 'Replay this step',
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute video',
    unmute: 'Unmute video',
    readAloud: 'Read step aloud',
    stopReading: 'Stop reading',
    next: 'Next step',
  },
  ingredients: {
    title: 'Ingredients',
    forServings: plural({ one: 'For {count} serving', other: 'For {count} servings' }),
    readAloud: 'Read them to me',
  },
  /** Sheet listing the voice commands (long-press the voice pill). */
  help: {
    title: 'Voice commands',
    subtitle: 'Speak normally — short phrases work best',
    micBlocked: 'Microphone access is off. Enable it in Settings to use voice control.',
  },
  /** One step page. */
  step: {
    /** Screen-reader label of the timer chip; {count} is the number of minutes. */
    startTimerLabel: plural({ one: 'Start a {count} minute timer', other: 'Start a {count} minute timer' }),
    /** Timer chip, e.g. "Start 5:00 timer". */
    startTimer: 'Start {time} timer',
    /** Timer chip while it runs, e.g. "4:12 left". */
    timeLeft: '{time} left',
    timerDone: 'Timer done',
    /** Screen-reader label of a glossary chip; {term} is a cooking term from the recipe. */
    whatDoesTermMean: 'What does {term} mean?',
    /** Bold lead-in before a glossary term's meaning, e.g. "Tadka:" followed by "tempering spices in hot oil". */
    glossaryTerm: '{term}:',
    /** Bold label before the step's "done" cue, which follows as the recipe wrote it, e.g. "Done when" + "The onions turn golden." */
    doneWhen: 'Done when',
  },
} as const;
