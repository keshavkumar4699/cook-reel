/** Voice control in cooking mode. */
export default {
  /**
   * How a spoken command is quoted in the "Voice commands" help sheet, e.g. “next”. Use your
   * language's quotation marks. The command words themselves come from the voice control.
   */
  quote: '“{word}”',
  /** What each command does, in the help sheet next to the words to say. */
  help: {
    move: 'Move between steps',
    playPause: 'Pause or resume the clip',
    repeat: 'Replay this step from the start',
    read: 'Read the step out loud',
    timer: 'Start this step’s timer',
    ingredients: 'Hear what you need',
    /** Saying the wake word ("Chef") first lets longer sentences through. */
    wake: 'Say this first for longer phrases',
  },
} as const;
