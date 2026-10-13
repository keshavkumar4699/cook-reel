import { plural } from '../../catalog';

/** youtube screen strings. */
export default {
  /** Screen title in the top bar. */
  title: 'From YouTube',
  intro: {
    /** Hero title; the line break (\n) can move or go. */
    title: 'Turn a video into\nstep-by-step reels',
    body: 'Paste any recipe video or Short. Chef watches it, writes the steps and loops the exact clip for each one — Shorts get a voice that explains every step.',
    /** Placeholder of the link field. */
    placeholder: 'YouTube or Shorts link',
    /** Shown under the link field while the text isn't a YouTube link. */
    invalidLink: 'That doesn’t look like a YouTube link',
    /** Small button inside the link field (one word). */
    paste: 'Paste',
    noLinkOnClipboard: 'No YouTube link on your clipboard',
  },
  /** Numbered "how it works" rows shown before a link is pasted. */
  how: {
    copyLink: 'Copy the link from the YouTube app (Share → Copy link)',
    chefBreaksItDown: 'Chef breaks it into steps with clips, tips and nutrition',
    /** The quoted words are voice commands: use the words the cooking voice understands in your language. */
    handsFree: 'Cook along hands-free: say “next”, “back”, “stop”',
  },
  preview: {
    /** Badge on a YouTube Short (one word). */
    short: 'Short',
    /** Badge on a regular YouTube video (one word). */
    video: 'Video',
    /** Badge with the import's credit cost. */
    usesCredits: plural({ one: 'Uses {count} credit', other: 'Uses {count} credits' }),
    /** Stands in for the video title while it loads. */
    loading: 'Loading video details…',
    /** Main button; the credit cost is shown next to it. */
    breakItDown: 'Break it down',
    notCharged: 'Not a recipe video? You won’t be charged.',
  },
  /** Progress steps shown while Chef works on the video. */
  stages: {
    watching: {
      title: 'Watching the video',
      body: 'Spotting every ingredient and action',
    },
    writing: {
      title: 'Writing your steps',
      body: 'Timing a clip for each step, adding beginner tips',
    },
    nutrition: {
      title: 'Nutrition & narration',
      body: 'Calories, macros and read-aloud lines',
    },
  },
  working: {
    title: 'Breaking it down…',
    body: 'This usually takes under a minute. You can leave this screen — we’ll keep going.',
    /** “repeat” and “start timer” are voice commands: use the words the cooking voice understands in your language. */
    tip: '💡 While you wait: in cooking mode, say “repeat” to replay a step’s clip, or “start timer” for timed steps.',
  },
  done: {
    title: 'Ready to cook 🎉',
    cached: 'Someone already broke this video down — no credits used.',
    stepsWithClips: plural({ one: '{count} step, each with its own clip.', other: '{count} steps, each with its own clip.' }),
    /** Heading above the list of steps with their clip times. */
    stepsAndClips: 'Steps & clips',
    cookNow: 'Save & start cooking',
    saveForLater: 'Save for later',
    savedCookNow: 'Saved — let’s cook!',
    /** “Cook later” is the name of the library list the recipe goes to. */
    savedForLater: 'Saved to Cook later',
  },
  failed: {
    title: 'That didn’t work',
    refunded: '✓ Your credits were refunded.',
    tryAnother: 'Try another video',
  },
  errors: {
    notStarted: 'The import did not start. Please try again.',
    expired: 'This import expired. Please start it again.',
  },
} as const;
