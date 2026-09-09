import { useColorScheme } from 'react-native';
import { darkColors, lightColors, radii, spacing, fontSize, shadows, statusToneColors, type ThemeColors } from './tokens';

export { spacing, radii, fontSize, shadows };
export type { ThemeColors };

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const tones = isDark ? statusToneColors.dark : statusToneColors.light;

  return { colors, tones, isDark, spacing, radii, fontSize, shadows };
}
