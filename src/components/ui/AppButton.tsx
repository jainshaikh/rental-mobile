import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle, type PressableProps } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Minimum comfortable touch target per mobile UX guidance in the implementation reference.
const MIN_HEIGHT = 48;

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const { colors, radii, spacing, shadows } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundByVariant: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.surfaceAlt,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.danger,
  };

  const textColorByVariant: Record<Variant, string> = {
    primary: colors.primaryText,
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
    danger: colors.primaryText,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: backgroundByVariant[variant],
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          minHeight: MIN_HEIGHT,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.primary,
        },
        variant === 'primary' && !isDisabled ? shadows.coral : null,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColorByVariant[variant]} />
      ) : (
        <AppText variant="label" color={textColorByVariant[variant]}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
