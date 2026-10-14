import type { CookProfile } from '@/data/types';
import { tFor } from '@/i18n';

/** Allergy and appliance choices are stored as ids, so the profile survives a change of app language. */
export const ALLERGY_IDS = ['peanuts', 'treeNuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish', 'sesame'] as const;
export type AllergyId = (typeof ALLERGY_IDS)[number];

export const EQUIPMENT_IDS = ['gasStove', 'induction', 'microwave', 'oven', 'airFryer', 'pressureCooker', 'riceCooker', 'kettle', 'blender', 'toaster'] as const;
export type EquipmentId = (typeof EQUIPMENT_IDS)[number];

const isAllergy = (value: string): value is AllergyId => (ALLERGY_IDS as readonly string[]).includes(value);
const isEquipment = (value: string): value is EquipmentId => (EQUIPMENT_IDS as readonly string[]).includes(value);

/** Profiles saved before the ids existed hold the English chip labels. */
const LEGACY_ALLERGIES: Record<string, AllergyId> = {
  Peanuts: 'peanuts',
  'Tree nuts': 'treeNuts',
  Dairy: 'dairy',
  Gluten: 'gluten',
  Eggs: 'eggs',
  Soy: 'soy',
  Shellfish: 'shellfish',
  Sesame: 'sesame',
};
const LEGACY_EQUIPMENT: Record<string, EquipmentId> = {
  'Gas stove': 'gasStove',
  Induction: 'induction',
  Microwave: 'microwave',
  'Oven / OTG': 'oven',
  'Air fryer': 'airFryer',
  'Pressure cooker': 'pressureCooker',
  'Rice cooker': 'riceCooker',
  'Electric kettle': 'kettle',
  'Mixer / blender': 'blender',
  Toaster: 'toaster',
};

export function migrateProfileLabels(profile: CookProfile): CookProfile {
  const next = { ...profile };
  if (profile.allergies) next.allergies = profile.allergies.map((value) => LEGACY_ALLERGIES[value] ?? value);
  if (profile.equipment) next.equipment = profile.equipment.map((value) => LEGACY_EQUIPMENT[value] ?? value);
  return next;
}

/** Chef reads the profile in English whatever the app language, so ids go out as plain English words. */
export function profileInEnglish(profile: CookProfile): CookProfile {
  const next = { ...profile };
  if (profile.allergies) next.allergies = profile.allergies.map((id) => (isAllergy(id) ? tFor('en', `onboarding.allergies.${id}`) : id));
  if (profile.equipment) next.equipment = profile.equipment.map((id) => (isEquipment(id) ? tFor('en', `onboarding.equipment.${id}`) : id));
  return next;
}
