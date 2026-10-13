import common from './common';
import ui from './ui';
import home from './home';
import library from './library';
import plan from './plan';
import recipe from './recipe';
import edit from './edit';
import cook from './cook';
import voice from './voice';
import builder from './builder';
import youtube from './youtube';
import experiment from './experiment';
import pricing from './pricing';
import me from './me';
import auth from './auth';
import onboarding from './onboarding';
import speech from './speech';

/** English — the source of truth every other catalog is checked against. */
const en = {
  common,
  ui,
  home,
  library,
  plan,
  recipe,
  edit,
  cook,
  voice,
  builder,
  youtube,
  experiment,
  pricing,
  me,
  auth,
  onboarding,
  speech,
} as const;

export default en;
