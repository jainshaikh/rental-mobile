import { Pressable, View } from 'react-native';
import { AppText } from '../ui';
import { useTheme } from '../../theme';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_PX = { sm: 14, md: 20, lg: 28 };

// Read-only when onChange is omitted; interactive (tap to set) when provided.
// Uses plain star glyphs rather than an icon library — matches the rest of
// this app, which has no icon dependency installed.
export function RatingStars({ value, onChange, size = 'md' }: RatingStarsProps) {
  const { colors, spacing } = useTheme();
  const interactive = !!onChange;
  const fontSize = SIZE_PX[size];

  return (
    <View
      style={{ flexDirection: 'row', gap: spacing.xs }}
      accessibilityRole={interactive ? 'adjustable' : undefined}
      accessibilityLabel={interactive ? 'Rating' : `Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          disabled={!interactive}
          hitSlop={8}
          onPress={() => onChange?.(n)}
          accessibilityRole={interactive ? 'button' : undefined}
          accessibilityLabel={interactive ? `Rate ${n} out of 5` : undefined}
        >
          <AppText style={{ fontSize, lineHeight: fontSize + 2, color: n <= value ? colors.warning : colors.borderStrong }}>
            {n <= value ? '★' : '☆'}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
