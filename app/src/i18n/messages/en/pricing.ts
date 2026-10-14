import { plural } from '../../catalog';

/** Plans and credits screen. Credits are what AI features spend; saving and cooking are always free. */
export default {
  hero: {
    title: 'Cook more with Chef',
    /** Title when the cook has a few credits left, but not enough for what they tried. */
    notEnough: 'Not enough credits',
    outOfCredits: 'You’re out of credits',
    body: 'A fresh batch of credits every month for AI recipes, experiments and YouTube step reels.',
    /** Body when the cook ran out of credits. */
    bodyOut: 'Pick a plan to keep creating recipes and turning videos into step reels. Your saved recipes always stay free.',
  },
  /** Badge with the cook's remaining credits. */
  creditsLeft: plural({ one: '{count} credit left', other: '{count} credits left' }),
  period: {
    monthly: 'Monthly',
    yearly: 'Yearly',
    /** Yearly option with its saving; {percent} is a whole number. Keep short: two options share a control. */
    yearlySave: 'Yearly · save {percent}%',
  },
  /** Plan copy, by plan. The names can stay as they are if that reads naturally. */
  plans: {
    basic: {
      name: 'Basic',
      tagline: 'For a few new dishes every week',
      perks: {
        ai: 'AI recipes, fridge mode and twists',
        youtube: 'YouTube and Shorts step reels',
        topups: 'Top-up packs when you run out',
      },
    },
    pro: {
      name: 'Pro',
      tagline: 'For people who cook most days',
      perks: {
        everything: 'Everything in Basic',
        credits: 'Over 3× the credits of Basic',
      },
    },
    max: {
      name: 'Max',
      tagline: 'Meal-preppers and recipe creators',
      perks: {
        everything: 'Everything in Pro',
        value: 'Best price per credit',
      },
    },
  },
  /** Accessibility label of a plan card. */
  planA11y: {
    monthly: '{name}, {price} per month',
    yearly: '{name}, {price} per year',
  },
  badges: {
    /** The cook's current plan. */
    current: 'Current',
    mostPopular: 'Most popular',
  },
  /** Under a monthly price. */
  perMonth: 'per month',
  /** Under a yearly price: what it works out to per month. */
  perMonthApprox: '≈ {price}/mo',
  monthlyCredits: plural({ one: '{count} credit every month', other: '{count} credits every month' }),
  /** How many AI recipes the monthly credits buy. */
  approxRecipes: plural({ one: '≈ {count} recipe', other: '≈ {count} recipes' }),
  costs: {
    title: 'What uses credits',
    recipe: 'AI recipe from Chef',
    experiment: 'Recipe variation',
    youtube: 'YouTube video breakdown',
    youtubeShort: 'YouTube Short breakdown',
    free: 'Saving, planning and cooking mode',
    /** Price of the features above that cost nothing. */
    freeValue: 'Free',
    note: 'Questions Chef asks are free. Failed imports are refunded automatically. Monthly credits reset each billing month; top-up credits never expire.',
  },
  topups: {
    title: 'Need a top-up?',
    /** Under the big number of credits in a pack. */
    unit: plural({ one: 'credit', other: 'credits' }),
    /** Accessibility label of a top-up pack. */
    a11y: plural({ one: '{count} credit for {price}', other: '{count} credits for {price}' }),
  },
  links: {
    restore: 'Restore purchases',
    terms: 'Terms',
    privacy: 'Privacy',
  },
  /** {store} is "App Store", "Google Play" or the generic name below. */
  renewal: 'Subscriptions renew automatically until cancelled in your {store} settings, at least 24 hours before the period ends.',
  genericStore: 'app store',
  cta: {
    signUp: 'Sign up to subscribe',
    /** {plan} is a plan name. */
    current: 'You’re on {plan}',
    /** {plan} is a plan name. */
    continue: 'Continue with {plan}',
    /** Price next to the button. Very short. */
    perMonth: '{price}/mo',
    perYear: '{price}/yr',
  },
  toasts: {
    unavailable: 'This product isn’t available in your store yet.',
    appsOnly: 'Purchases are available in the iOS and Android apps.',
    done: plural({ one: 'You’re all set — {count} credit ready.', other: 'You’re all set — {count} credits ready.' }),
    restored: 'Purchases restored',
  },
  errors: {
    purchaseFailed: 'The purchase didn’t go through.',
    restoreFailed: 'Could not restore purchases.',
  },
} as const;
