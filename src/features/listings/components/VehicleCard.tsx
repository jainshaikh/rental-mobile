import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTheme } from '../../../theme';
import { AppCard, AppText } from '../../../components/ui';
import { SaveButton } from '../../saved-vehicles/components/SaveButton';
import { formatDistance, formatPrice, titleCase } from '../../../utils/format';
import type { VehicleCard as VehicleCardData } from '../../../types/api.types';

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const { colors, spacing } = useTheme();
  const cover = vehicle.images[0];

  return (
    <Pressable
      onPress={() => router.push(`/vehicle/${vehicle.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={vehicle.title}
    >
      <AppCard style={{ padding: 0, overflow: 'hidden', marginBottom: spacing.md }}>
        <View style={{ width: '100%', aspectRatio: 16 / 10, backgroundColor: colors.surfaceAlt }}>
          {cover ? (
            <Image
              source={{ uri: cover.url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
              accessibilityLabel={cover.altText ?? vehicle.title}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <AppText muted variant="caption">
                No image
              </AppText>
            </View>
          )}
          <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
            <SaveButton vehicleId={vehicle.id} size="sm" />
          </View>
        </View>

        <View style={{ padding: spacing.md }}>
          <AppText variant="subtitle" numberOfLines={1}>
            {vehicle.title}
          </AppText>
          <AppText muted variant="caption" style={{ marginTop: 2 }}>
            {titleCase(vehicle.make)} {titleCase(vehicle.model)} · {vehicle.year} · {vehicle.seatingCapacity} seats
          </AppText>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: spacing.sm,
            }}
          >
            <AppText variant="subtitle" color={colors.primary}>
              {formatPrice(vehicle.pricePerDay)}
              <AppText muted variant="caption">
                {' '}
                / day
              </AppText>
            </AppText>
            {vehicle.distanceKm !== undefined ? (
              <AppText variant="caption" color={colors.primary}>
                {formatDistance(vehicle.distanceKm)}
              </AppText>
            ) : vehicle.showroom?.city ? (
              <AppText muted variant="caption" style={{ textTransform: 'capitalize' }}>
                {vehicle.showroom.city}
              </AppText>
            ) : null}
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
