import { Pressable, View } from 'react-native';
import { useTheme } from '../../../theme';
import { AppCard, AppText } from '../../../components/ui';
import { formatPrice, titleCase } from '../../../utils/format';
import type { TripRouteGroup } from '../../../api/trips.api';

interface RouteGroupCardProps {
  route: TripRouteGroup;
  selected?: boolean;
  onPress: () => void;
}

export function RouteGroupCard({ route, selected, onPress }: RouteGroupCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <AppCard
        style={{
          width: 200,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        }}
      >
        <AppText variant="label" numberOfLines={1}>
          {titleCase(route.originCity)} → {titleCase(route.destinationCity)}
        </AppText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <AppText muted variant="caption">
            {route.tripCount} {route.tripCount === 1 ? 'trip' : 'trips'}
          </AppText>
          <AppText variant="caption" color={colors.primary}>
            from {formatPrice(route.minPricePerSeat)}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}
