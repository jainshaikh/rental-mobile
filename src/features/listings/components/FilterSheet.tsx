import { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useTheme } from '../../../theme';
import { AppButton, AppInput, AppText } from '../../../components/ui';
import { FilterChipRow } from './FilterChipRow';
import { useCities, useMakes } from '../queries';
import type { ListingFilters } from '../../../api/listings.api';
import { FuelType, Transmission } from '../../../types/enums';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' as const },
  { label: 'Price: Low to high', value: 'price_asc' as const },
  { label: 'Price: High to low', value: 'price_desc' as const },
  { label: 'Popular', value: 'popular' as const },
];

const TRANSMISSION_OPTIONS = [
  { label: 'Automatic', value: Transmission.AUTOMATIC },
  { label: 'Manual', value: Transmission.MANUAL },
  { label: 'CVT', value: Transmission.CVT },
];

const FUEL_OPTIONS = [
  { label: 'Petrol', value: FuelType.PETROL },
  { label: 'Diesel', value: FuelType.DIESEL },
  { label: 'Electric', value: FuelType.ELECTRIC },
  { label: 'Hybrid', value: FuelType.HYBRID },
  { label: 'CNG', value: FuelType.CNG },
];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
}

export function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const { colors, spacing } = useTheme();
  const [draft, setDraft] = useState<ListingFilters>(filters);
  const cities = useCities();
  const makes = useMakes();

  const cityOptions = (cities.data ?? []).map((c) => ({ label: c, value: c }));
  const makeOptions = (makes.data ?? []).map((m) => ({ label: m, value: m }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '85%',
            padding: spacing.lg,
          }}
        >
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
            Filters
          </AppText>

          <ScrollView showsVerticalScrollIndicator={false}>
            <AppText variant="label" style={{ marginBottom: spacing.xs }}>
              Sort by
            </AppText>
            <FilterChipRow
              options={SORT_OPTIONS}
              value={draft.sort}
              onChange={(sort) => setDraft((d) => ({ ...d, sort }))}
            />

            {cityOptions.length > 0 ? (
              <View style={{ marginTop: spacing.lg }}>
                <AppText variant="label" style={{ marginBottom: spacing.xs }}>
                  City
                </AppText>
                <FilterChipRow
                  options={cityOptions}
                  value={draft.city}
                  onChange={(city) => setDraft((d) => ({ ...d, city }))}
                />
              </View>
            ) : null}

            {makeOptions.length > 0 ? (
              <View style={{ marginTop: spacing.lg }}>
                <AppText variant="label" style={{ marginBottom: spacing.xs }}>
                  Make
                </AppText>
                <FilterChipRow
                  options={makeOptions}
                  value={draft.make}
                  onChange={(make) => setDraft((d) => ({ ...d, make }))}
                />
              </View>
            ) : null}

            <View style={{ marginTop: spacing.lg }}>
              <AppText variant="label" style={{ marginBottom: spacing.xs }}>
                Transmission
              </AppText>
              <FilterChipRow
                options={TRANSMISSION_OPTIONS}
                value={draft.transmission}
                onChange={(transmission) => setDraft((d) => ({ ...d, transmission }))}
              />
            </View>

            <View style={{ marginTop: spacing.lg }}>
              <AppText variant="label" style={{ marginBottom: spacing.xs }}>
                Fuel type
              </AppText>
              <FilterChipRow
                options={FUEL_OPTIONS}
                value={draft.fuelType}
                onChange={(fuelType) => setDraft((d) => ({ ...d, fuelType }))}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Min price/day"
                  keyboardType="numeric"
                  value={draft.priceMin?.toString() ?? ''}
                  onChangeText={(v) => setDraft((d) => ({ ...d, priceMin: v ? Number(v) : undefined }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Max price/day"
                  keyboardType="numeric"
                  value={draft.priceMax?.toString() ?? ''}
                  onChangeText={(v) => setDraft((d) => ({ ...d, priceMax: v ? Number(v) : undefined }))}
                />
              </View>
            </View>

            <AppInput
              label="Minimum seats"
              keyboardType="numeric"
              value={draft.seats?.toString() ?? ''}
              onChangeText={(v) => setDraft((d) => ({ ...d, seats: v ? Number(v) : undefined }))}
            />
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Reset"
                variant="secondary"
                onPress={() => {
                  const cleared: ListingFilters = { search: filters.search };
                  setDraft(cleared);
                }}
              />
            </View>
            <View style={{ flex: 2 }}>
              <AppButton
                title="Apply filters"
                onPress={() => {
                  onApply(draft);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
