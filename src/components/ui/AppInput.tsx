import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export function AppInput({ label, error, helperText, isPassword, style, ...props }: AppInputProps) {
  const { colors, radii, spacing, fontSize } = useTheme();
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <AppText variant="label" style={{ marginBottom: spacing.xs }}>
          {label}
        </AppText>
      ) : null}

      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={colors.textFaint}
          secureTextEntry={isSecure}
          style={[
            {
              minHeight: 48,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.borderStrong,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingRight: isPassword ? spacing.xxl + spacing.md : spacing.md,
              color: colors.text,
              backgroundColor: colors.surface,
              fontSize: fontSize.md,
            },
            style,
          ]}
          accessibilityLabel={label}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={12}
            style={{ position: 'absolute', right: spacing.md }}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
          >
            <AppText variant="caption" color={colors.primary}>
              {isSecure ? 'Show' : 'Hide'}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" color={colors.danger} style={{ marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" muted style={{ marginTop: spacing.xs }}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
