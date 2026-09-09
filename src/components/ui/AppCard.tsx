import { View, type ViewProps } from 'react-native';
import { useTheme } from '../../theme';

export function AppCard({ style, ...props }: ViewProps) {
  const { colors, radii, spacing, shadows } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadows.xs,
        style,
      ]}
      {...props}
    />
  );
}
