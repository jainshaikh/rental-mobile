import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTheme } from '../../../theme';
import { AppCard, AppText } from '../../../components/ui';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatDistance, titleCase } from '../../../utils/format';
import type { PublicProviderCard } from '../../../types/api.types';

export function ProviderCard({ provider }: { provider: PublicProviderCard }) {
  const { colors, spacing, radii } = useTheme();
  const firstShowroom = provider.showrooms[0];

  return (
    <Pressable
      onPress={() => router.push(`/provider/${provider.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={provider.businessName}
    >
      <AppCard style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {provider.logoUrl ? (
            <Image
              source={{ uri: provider.logoUrl }}
              style={{ width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.surfaceAlt }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: radii.md,
                backgroundColor: colors.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText variant="subtitle">{provider.businessName.charAt(0).toUpperCase()}</AppText>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
                {provider.businessName}
              </AppText>
              {provider.isFeatured ? <StatusBadge label="Featured" tone="info" /> : null}
            </View>
            <AppText muted variant="caption" style={{ marginTop: 2 }}>
              {provider._count.vehicles} {provider._count.vehicles === 1 ? 'vehicle' : 'vehicles'}
            </AppText>
          </View>
        </View>

        {provider.businessDescription ? (
          <AppText muted variant="caption" numberOfLines={2} style={{ marginTop: spacing.sm }}>
            {provider.businessDescription}
          </AppText>
        ) : null}

        {provider.distanceKm !== undefined ? (
          <AppText variant="caption" color={colors.primary} style={{ marginTop: spacing.sm }}>
            {formatDistance(provider.distanceKm)}
          </AppText>
        ) : firstShowroom ? (
          <AppText muted variant="caption" style={{ marginTop: spacing.sm, textTransform: 'capitalize' }}>
            {titleCase(firstShowroom.city)}
            {firstShowroom.area ? `, ${firstShowroom.area}` : ''}
          </AppText>
        ) : null}
      </AppCard>
    </Pressable>
  );
}
