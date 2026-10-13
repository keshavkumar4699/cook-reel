/** Voice control in cooking mode. */
export default {
  /**
   * Rows of the "Voice commands" help sheet. `say` is what the cook says, in quotation marks: use the
   * words the voice control understands in your language. `does` explains what the command does.
   */
  help: {
    move: { say: '“Next” · “Back”', does: 'Move between steps' },
    playPause: { say: '“Stop” · “Play”', does: 'Pause or resume the clip' },
    repeat: { say: '“Repeat”', does: 'Replay this step from the start' },
    read: { say: '“Read”', does: 'Read the step out loud' },
    timer: { say: '“Start timer”', does: 'Start this step’s timer' },
    ingredients: { say: '“Ingredients”', does: 'Hear what you need' },
    /** "Hey Chef" is the wake phrase that lets longer sentences through. */
    wake: { say: '“Hey Chef, …”', does: 'Use for longer phrases' },
  },
} as const;
