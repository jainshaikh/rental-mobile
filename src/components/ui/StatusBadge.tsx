import { View } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';
import type { StatusTone } from '../../types/enums';

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  const { tones, radii, spacing } = useTheme();
  const { bg, fg } = tones[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        borderRadius: radii.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
      }}
    >
      <AppText variant="caption" color={fg} style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </View>
  );
}
