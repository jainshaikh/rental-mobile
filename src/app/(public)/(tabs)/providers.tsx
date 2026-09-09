import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { useInfiniteProviders } from '../../../features/providers/queries';
import { useCities } from '../../../features/listings/queries';
import { ProviderCard } from '../../../features/providers/components/ProviderCard';
import { FilterChipRow } from '../../../features/listings/components/FilterChipRow';
import { AppScreen, AppText, ErrorState, LoadingState } from '../../../components/ui';
import { EmptyState } from '../../../components/ui/States';
import { NearMeControl } from '../../../components/maps/NearMeControl';
import { ResultsMap } from '../../../components/maps/ResultsMap';
import { useCurrentLocation } from '../../../hooks/useCurrentLocation';
import { useTheme } from '../../../theme';
import type { ProviderFilters } from '../../../api/providers.api';

// Kept small (a real neighborhood, not the whole city) so the "near me" map
// circle reads as a local estimate rather than covering the entire metro area.
const NEARBY_RADIUS_KM = 8;

export default function ProvidersScreen() {
  const { spacing } = useTheme();
  const [cityFilter, setCityFilter] = useState<string | undefined>(undefined);
  const cities = useCities();
  const location = useCurrentLocation();

  const filters: ProviderFilters = useMemo(
    () => ({
      city: location.coords ? undefined : cityFilter,
      lat: location.coords?.lat,
      lng: location.coords?.lng,
      radiusKm: location.coords ? NEARBY_RADIUS_KM : undefined,
    }),
    [cityFilter, location.coords],
  );

  const query = useInfiniteProviders(filters);
  const providers = query.data?.pages.flatMap((page) => page.data) ?? [];

  const cityOptions = (cities.data ?? []).map((c) => ({ label: c, value: c }));

  const pins = providers
    .filter((p) => p.showrooms[0]?.mapLat != null && p.showrooms[0]?.mapLng != null)
    .map((p) => ({
      id: p.id,
      lat: p.showrooms[0].mapLat as number,
      lng: p.showrooms[0].mapLng as number,
      title: p.businessName,
    }));

  const handleNearMe = async () => {
    const coords = await location.requestLocation();
    if (coords) setCityFilter(undefined);
  };

  return (
    <AppScreen edges={['top', 'left', 'right']}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm }}>
        <AppText variant="title">Providers</AppText>
        <AppText muted variant="caption">
          Rental businesses you can book with
        </AppText>
        <NearMeControl
          active={!!location.coords}
          loading={location.loading}
          error={location.error}
          onActivate={handleNearMe}
          onClear={location.clearLocation}
        />
      </View>

      {location.coords && pins.length > 0 ? (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
          <ResultsMap userLocation={location.coords} radiusKm={NEARBY_RADIUS_KM} pins={pins} />
        </View>
      ) : cityOptions.length > 0 ? (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
          <FilterChipRow options={cityOptions} value={cityFilter} onChange={setCityFilter} />
        </View>
      ) : null}

      {query.isLoading ? (
        <LoadingState label="Loading providers..." />
      ) : query.isError ? (
        <ErrorState message="Couldn't load providers." onRetry={() => query.refetch()} />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, flexGrow: 1 }}
          renderItem={({ item }) => <ProviderCard provider={item} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: spacing.md }} /> : null}
          ListEmptyComponent={<EmptyState title="No providers found" description="Try a different city." />}
        />
      )}
    </AppScreen>
  );
}
