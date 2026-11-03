/**
 * Text spoken aloud in cooking mode (text-to-speech), never shown on screen. Write it the way it
 * should sound; the placeholders hold recipe text.
 */
export default {
  titleAndInstruction: '{title}。{instruction}',
  instructionWithTip: '{instruction} ワンポイントです。{tip}',
  timerDone: '時間になりました。{label}。',
  youNeed: '用意するものは、{list}です。',
  ingredientAmount: '{name}{amount}',
} as const;
