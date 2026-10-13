/** Home screen strings. */
export default {
  /** Big line under the time-of-day greeting; {name} is the cook's first name. */
  nameTitle: '{name} 👋',
  /** Big line under the time-of-day greeting when we don't know the cook's name. */
  guestTitle: 'Hey there 👋',
  composer: {
    title: 'What are we cooking today?',
    placeholder: 'e.g. spicy paneer in 20 min',
    /** Accessibility label of the text field. */
    inputLabel: 'Describe what you want to cook',
    /** Accessibility label of the send button. */
    send: 'Ask Chef',
  },
  /** Idea chips under the text field. Tapping one sends its text to Chef as the request, so keep each a short, natural request. */
  prompts: {
    highProteinDinner: 'High-protein dinner',
    quickBreakfast: '15-min breakfast',
    cosyDal: 'Cosy dal for one',
    useLeftovers: 'Use up leftovers',
    cheapFilling: 'Cheap & filling',
    impressDate: 'Impress a date',
  },
  /** Shortcut cards in a two-column grid: a short title and a one-line description. */
  actions: {
    youtube: { title: 'From YouTube', body: 'Video → step reels' },
    builder: { title: 'Create with Chef', body: 'Describe any dish' },
    fridge: { title: 'From my fridge', body: 'Use what you have' },
    manual: { title: 'Write my own', body: 'Family favourites' },
  },
  /** Card shown to guests. */
  upsell: {
    /** Small badge above the title. */
    badge: 'Free credits',
    title: 'Unlock Chef & YouTube reels',
    body: 'Create a free account to use AI — your first recipes are on us.',
  },
  /** Recipe carousels: a title and a one-line subtitle. */
  sections: {
    cookLater: { title: 'Cook later', subtitle: 'Saved for when you’re hungry' },
    quick: { title: 'Quick & high-protein', subtitle: 'Fast plates that keep you full' },
    experiments: { title: 'Your experiments', subtitle: 'Twists you created with Chef' },
    recent: { title: 'Recently added', subtitle: 'Fresh in your library' },
  },
  voiceTip: {
    title: 'Cook hands-free',
    /** The quoted words are spoken commands: use the words cooking mode listens for in your language. */
    body: 'In cooking mode, say “next”, “back” or “stop” — no more tapping with messy hands.',
    /** Accessibility label of the × button that hides the tip. */
    dismiss: 'Dismiss tip',
  },
} as const;
