import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { getLanguage, LANGUAGE_INFO } from '@/i18n';

/**
 * CookReel design tokens.
 *
 * Warm "paper and paprika" palette: appetising, calm surfaces with a single confident accent.
 * Violet is reserved for anything AI so the cook always knows when Chef is involved.
 */
export const palette = {
  light: {
    bg: '#FBF7F2',
    surface: '#FFFFFF',
    surfaceMuted: '#F5EFE7',
    surfaceSunken: '#EFE7DC',
    border: '#ECE3D8',
    borderStrong: '#DDD0C1',
    text: '#1D1A17',
    textMuted: '#6E655D',
    textFaint: '#A39A90',
    primary: '#E2552D',
    primaryPressed: '#C8441E',
    primarySoft: '#FCE9E1',
    onPrimary: '#FFFFFF',
    accent: '#2F7A57',
    accentSoft: '#E3F2E9',
    saffron: '#E89A1C',
    saffronSoft: '#FDF1DC',
    ai: '#6C5CE7',
    aiSoft: '#EFECFE',
    danger: '#D14343',
    dangerSoft: '#FCE8E8',
    youtube: '#FF2D2D',
    ink: '#1D1A17',
    onInk: '#FFFFFF',
    overlay: 'rgba(29, 26, 23, 0.45)',
    shadow: '#3B2A1A',
    protein: '#2F7A57',
    carbs: '#E89A1C',
    fat: '#E2552D',
    fiber: '#8B6B4E',
  },
  dark: {
    bg: '#121010',
    surface: '#1C1917',
    surfaceMuted: '#24201C',
    surfaceSunken: '#0C0A09',
    border: '#2E2925',
    borderStrong: '#3D3631',
    text: '#F7F2EC',
    textMuted: '#B5ABA1',
    textFaint: '#7D736B',
    primary: '#FF6B3D',
    primaryPressed: '#E85A2E',
    primarySoft: '#3A1E14',
    onPrimary: '#FFFFFF',
    accent: '#52B788',
    accentSoft: '#15281E',
    saffron: '#F5B54F',
    saffronSoft: '#33260E',
    ai: '#9B8CFF',
    aiSoft: '#231F3F',
    danger: '#FF6B6B',
    dangerSoft: '#3A1515',
    youtube: '#FF4D4D',
    ink: '#F7F2EC',
    onInk: '#1D1A17',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    protein: '#52B788',
    carbs: '#F5B54F',
    fat: '#FF6B3D',
    fiber: '#C4A07E',
  },
} as const;

export type ColorName = keyof (typeof palette)['light'];
export type Colors = Record<ColorName, string>;

/** The cook-along player is always dark — it's a stage for the food. */
export const stage = {
  bg: '#0B0908',
  surface: 'rgba(255,255,255,0.08)',
  surfaceStrong: 'rgba(255,255,255,0.14)',
  border: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.72)',
  textFaint: 'rgba(255,255,255,0.45)',
  primary: '#FF6B3D',
  saffron: '#F5B54F',
  accent: '#52B788',
  ai: '#9B8CFF',
} as const;

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40, huge: 56 } as const;
export const radius = { xs: 8, sm: 12, md: 16, lg: 20, xl: 28, pill: 999 } as const;
export const GUTTER = 20;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/*
 * Our fonts (Fraunces, Plus Jakarta Sans) only cover Latin script. Arabic and Japanese use the
 * phone's own fonts at matching weights, without letter-spacing (it breaks Arabic joining) and
 * with taller lines for their taller glyphs. The language is fixed for the life of the app, so this
 * is decided once.
 */
const script = LANGUAGE_INFO[getLanguage()].script;
const systemFonts = script !== 'latin';
const LINE_HEIGHT_FACTOR = script === 'arabic' ? 1.2 : script === 'cjk' ? 1.12 : 1;

export type FontWeight = keyof typeof fonts;
const WEIGHTS: Record<FontWeight, NonNullable<TextStyle['fontWeight']>> = {
  display: '700',
  displayBold: '800',
  displayItalic: '700',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};
const WEIGHT_OF_FAMILY = Object.fromEntries(Object.entries(fonts).map(([weight, family]) => [family, WEIGHTS[weight as FontWeight]]));

/** Text style for a weight: our font in Latin scripts, the system font at that weight otherwise. */
export function font(weight: FontWeight): TextStyle {
  return systemFonts ? { fontWeight: WEIGHTS[weight] } : { fontFamily: fonts[weight] };
}

/** A line height adjusted for the app's script (taller for Arabic and Japanese). */
export const lineHeight = (value: number) => Math.round(value * LINE_HEIGHT_FACTOR);

function forScript<T extends Record<string, TextStyle>>(scale: T): T {
  if (!systemFonts) return scale;
  const adjusted: Record<string, TextStyle> = {};
  for (const [name, style] of Object.entries(scale)) {
    const { fontFamily, letterSpacing: _letterSpacing, ...rest } = style;
    adjusted[name] = {
      ...rest,
      fontWeight: WEIGHT_OF_FAMILY[fontFamily ?? ''] ?? '400',
      letterSpacing: 0,
      lineHeight: style.lineHeight ? lineHeight(style.lineHeight) : undefined,
    };
  }
  return adjusted as T;
}

export const type = forScript({
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  title1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  title2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  title3: { fontFamily: fonts.display, fontSize: 19, lineHeight: 25, letterSpacing: -0.2 },
  headline: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  callout: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  subhead: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  subheadStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  footnote: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  stat: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 26, letterSpacing: -0.4 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20, letterSpacing: -0.1 },
} satisfies Record<string, TextStyle>);
export type TypeVariant = keyof typeof type;

/** Removes the browser focus ring on web text inputs (our fields draw their own frame). */
export const inputReset: TextStyle = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};

export function shadow(colors: Colors, level: 1 | 2 | 3 = 1): ViewStyle {
  const presets = {
    1: { opacity: 0.06, radius: 10, y: 4, elevation: 2 },
    2: { opacity: 0.1, radius: 18, y: 8, elevation: 5 },
    3: { opacity: 0.16, radius: 28, y: 14, elevation: 10 },
  } as const;
  const p = presets[level];
  return Platform.select<ViewStyle>({
    web: { boxShadow: `0px ${p.y}px ${p.radius}px rgba(59, 42, 26, ${p.opacity})` } as ViewStyle,
    default: {
      shadowColor: colors.shadow,
      shadowOpacity: p.opacity,
      shadowRadius: p.radius,
      shadowOffset: { width: 0, height: p.y },
      elevation: p.elevation,
    },
  })!;
}

/** Hand-picked gradient pairs for recipe covers (deterministic per recipe). */
export const coverGradients = {
  light: [
    ['#FFE3D5', '#FFC5A6'],
    ['#E3F2E8', '#BFE3CD'],
    ['#FFF1D6', '#FFDA9E'],
    ['#ECE8FF', '#D2C9FF'],
    ['#FDE3E6', '#F9C2CA'],
    ['#E0EEF9', '#BBD8F0'],
    ['#F3EADF', '#E3CFB8'],
  ],
  dark: [
    ['#3A2218', '#5C2E1C'],
    ['#16291F', '#1F4231'],
    ['#33270F', '#4E3A12'],
    ['#221E3D', '#352D63'],
    ['#3A1C22', '#5A2833'],
    ['#14242F', '#1C3A4F'],
    ['#2B241D', '#43372B'],
  ],
} as const;
