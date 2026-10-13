import { plural } from '../../catalog';

/** Shared chrome: the "add a recipe" sheet, credits pill, stepper and the welcome hero illustration. */
export default {
  createSheet: {
    title: 'Add a recipe',
    subtitleSignedIn: 'AI options use credits',
    subtitleGuest: 'AI options need a free account',
    /** Tiny badge on AI-powered options. Keep it to 2–3 characters if possible. */
    aiBadge: 'AI',
    youtubeTitle: 'From a YouTube video',
    youtubeBody: 'Paste a link — get step-by-step clips',
    chefTitle: 'Create with Chef',
    chefBody: 'Describe a craving, answer a few questions',
    fridgeTitle: 'Cook from my fridge',
    fridgeBody: 'Tell Chef what you have, get a recipe',
    manualTitle: 'Write my own',
    manualBody: 'Save a family recipe or your own creation',
  },
  creditsPill: {
    /** Screen-reader label of the credits pill in the header. */
    a11y: plural({ one: '{count} credit. Get more', other: '{count} credits. Get more' }),
  },
  stepper: {
    decrease: 'Decrease',
    increase: 'Increase',
  },
  /** The illustrated phone on the welcome screen (a sample cooking reel). */
  hero: {
    /** Small uppercase label on the tilted side cards. */
    sideStep: 'STEP {n}',
    stepOf: 'STEP {current} OF {total} · {range}',
    stepTitle: 'Toss the noodles',
    sayNext: 'Say “next”',
  },
} as const;
