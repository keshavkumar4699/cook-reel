import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { type ColorName, useTheme } from '@/theme';

type IonName = ComponentProps<typeof Ionicons>['name'];
type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type IconName = IonName | `mci:${MciName}`;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorName | (string & {});
}

/** Ionicons by default; prefix with "mci:" for MaterialCommunityIcons (food-specific glyphs). */
export function Icon({ name, size = 20, color = 'text' }: IconProps) {
  const { colors } = useTheme();
  const resolved = color in colors ? colors[color as ColorName] : color;
  if (name.startsWith('mci:')) {
    return <MaterialCommunityIcons name={name.slice(4) as MciName} size={size} color={resolved} />;
  }
  return <Ionicons name={name as IonName} size={size} color={resolved} />;
}
