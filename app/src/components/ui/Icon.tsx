import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { isRTL } from '@/i18n';
import { type ColorName, useTheme } from '@/theme';

type IonName = ComponentProps<typeof Ionicons>['name'];
type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type IconName = IonName | `mci:${MciName}`;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorName | (string & {});
}

/** Arrows and chevrons point the way the cook reads, so they flip in right-to-left languages. */
const DIRECTIONAL = /^(?:chevron|arrow|caret)-(?:back|forward)/;
const MIRROR = [{ scaleX: -1 }];

/** Ionicons by default; prefix with "mci:" for MaterialCommunityIcons (food-specific glyphs). */
export function Icon({ name, size = 20, color = 'text' }: IconProps) {
  const { colors } = useTheme();
  const resolved = color in colors ? colors[color as ColorName] : color;
  if (name.startsWith('mci:')) {
    return <MaterialCommunityIcons name={name.slice(4) as MciName} size={size} color={resolved} />;
  }
  const mirrored = isRTL() && DIRECTIONAL.test(name);
  return <Ionicons name={name as IonName} size={size} color={resolved} style={mirrored ? { transform: MIRROR } : undefined} />;
}
