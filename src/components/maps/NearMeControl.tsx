import { View } from 'react-native';
import { AppButton, AppText } from '../ui';
import { useTheme } from '../../theme';

interface NearMeControlProps {
  active: boolean;
  loading: boolean;
  error: string | null;
  onActivate: () => void;
  onClear: () => void;
}

export function NearMeControl({ active, loading, error, onActivate, onClear }: NearMeControlProps) {
  const { colors, spacing } = useTheme();

  if (active) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: colors.surfaceAlt,
        }}
      >
        <AppText variant="label" color={colors.primary}>
          📍 Showing results near you
        </AppText>
        <AppButton title="Clear" variant="ghost" fullWidth={false} onPress={onClear} />
      </View>
    );
  }

  return (
    <View>
      <AppButton
        title={loading ? 'Locating…' : '📍 Near me'}
        variant="outline"
        fullWidth={false}
        loading={loading}
        onPress={onActivate}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} style={{ marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
