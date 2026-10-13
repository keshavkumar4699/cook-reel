/**
 * Text spoken aloud in cooking mode (text-to-speech), never shown on screen. Write it the way it
 * should sound; the placeholders hold recipe text.
 */
export default {
  /** A step read aloud when it has no narration of its own: the step title, then the instruction. */
  titleAndInstruction: '{title}. {instruction}',
  /** "Read" voice command: the step's instruction followed by its tip. */
  instructionWithTip: '{instruction} Tip: {tip}',
  /** Spoken when a kitchen timer ends; {label} is the step title. */
  timerDone: 'Timer done. {label}.',
  /** The ingredient list read aloud; {list} is the ingredients, separated by commas. */
  youNeed: 'You’ll need: {list}.',
  /** One ingredient in that list, e.g. "2 cups rice"; {amount} is the formatted quantity and unit. */
  ingredientAmount: '{amount} {name}',
} as const;
