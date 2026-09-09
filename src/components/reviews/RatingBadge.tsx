import { View } from 'react-native';
import { AppText } from '../ui';
import { useTheme } from '../../theme';

interface RatingBadgeProps {
  average: number | null;
  count: number;
  size?: 'sm' | 'md';
}

// Compact "★ 4.8 (23)" summary for headers/cards — falls back to "No ratings yet".
export function RatingBadge({ average, count, size = 'md' }: RatingBadgeProps) {
  const { colors, spacing } = useTheme();
  const variant = size === 'sm' ? 'caption' : 'body';

  if (!count || average === null) {
    return (
      <AppText muted variant={variant}>
        No ratings yet
      </AppText>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <AppText style={{ color: colors.warning }}>★</AppText>
      <AppText variant={variant} style={{ fontFamily: 'Outfit_600SemiBold' }}>
        {average.toFixed(1)}
      </AppText>
      <AppText muted variant={variant}>
        ({count})
      </AppText>
    </View>
  );
}
