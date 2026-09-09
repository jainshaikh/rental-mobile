import { Text, type TextProps } from 'react-native';
import { useTheme } from '../../theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
  color?: string;
}

export function AppText({ variant = 'body', muted, color, style, ...props }: AppTextProps) {
  const { colors, fontSize } = useTheme();
  const textColor = color ?? (muted ? colors.textMuted : colors.text);

  // fontFamily must be the exact loaded static font's PostScript name — RN ignores
  // `fontWeight` for custom (non-variable) fonts, so each variant picks its Outfit
  // weight explicitly. Matches the web app's Outfit font (app/layout.tsx).
  const VARIANT_STYLES: Record<Variant, { fontSize: number; fontFamily: string }> = {
    title: { fontSize: fontSize.xl, fontFamily: 'Outfit_700Bold' },
    subtitle: { fontSize: fontSize.lg, fontFamily: 'Outfit_600SemiBold' },
    body: { fontSize: fontSize.md, fontFamily: 'Outfit_400Regular' },
    caption: { fontSize: fontSize.sm, fontFamily: 'Outfit_400Regular' },
    label: { fontSize: fontSize.sm, fontFamily: 'Outfit_600SemiBold' },
  };

  return <Text {...props} style={[VARIANT_STYLES[variant], { color: textColor }, style]} />;
}
