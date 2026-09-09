import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTheme } from '../../../theme';
import { AppCard, AppText } from '../../../components/ui';
import { formatPrice, titleCase } from '../../../utils/format';
import type { TripCard as TripCardData } from '../../../types/api.types';

function formatDepartureDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function TripCard({ trip }: { trip: TripCardData }) {
  const { colors, spacing } = useTheme();
  const poster = trip.userVehicle.images[0];

  return (
    <Pressable onPress={() => router.push(`/trip/${trip.id}`)} accessibilityRole="button">
      <AppCard style={{ padding: 0, overflow: 'hidden', marginBottom: spacing.md }}>
        {poster ? (
          <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.surfaceAlt }}>
            <Image
              source={{ uri: poster.url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
              accessibilityLabel={poster.altText ?? `${trip.userVehicle.make} ${trip.userVehicle.model}`}
            />
          </View>
        ) : null}

        <View style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="subtitle" style={{ textTransform: 'capitalize' }}>
              {trip.originCity} → {trip.destinationCity}
            </AppText>
            <AppText variant="subtitle" color={colors.primary}>
              {formatPrice(trip.pricePerSeat)}
            </AppText>
          </View>

          <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
            {formatDepartureDateTime(trip.departureAt)} · {trip.availableSeats} seats available
          </AppText>

          <AppText muted variant="caption" style={{ marginTop: 2 }} numberOfLines={1}>
            {titleCase(trip.userVehicle.make)} {titleCase(trip.userVehicle.model)}
            {trip.userVehicle.color ? ` · ${titleCase(trip.userVehicle.color)}` : ''} · {trip.postedBy.name}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}
