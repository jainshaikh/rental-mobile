import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useTripInquiry, useUpdateTripInquiryStatus } from '../../../features/trip-inquiries/queries';
import { AppButton, AppCard, AppScreen, AppText, ErrorState, LoadingState, StatusBadge } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { tripInquiryStatusMeta, tripInquiryRiderActions, PickupSource, TripInquiryStatus, TripStatus } from '../../../types/enums';
import { formatPrice, titleCase } from '../../../utils/format';
import { normalizeApiError } from '../../../api/errors';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function MyTripRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const { data: inquiry, isLoading, isError, refetch } = useTripInquiry(id);
  const updateStatus = useUpdateTripInquiryStatus();
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Loading request..." />;
  if (isError || !inquiry) return <ErrorState message="Couldn't load this request." onRetry={refetch} />;

  const availableActions = tripInquiryRiderActions(inquiry.status);

  const handleCancel = async () => {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({ id: id as string, data: { newStatus: TripInquiryStatus.CANCELLED } });
    } catch (error) {
      setActionError(normalizeApiError(error).message);
    }
  };

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Trip request' }} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <AppText variant="title" style={{ flex: 1, marginRight: spacing.md, textTransform: 'capitalize' }}>
            {titleCase(inquiry.trip.originCity)} → {titleCase(inquiry.trip.destinationCity)}
          </AppText>
          <StatusBadge label={tripInquiryStatusMeta[inquiry.status].label} tone={tripInquiryStatusMeta[inquiry.status].tone} />
        </View>
        <AppText muted style={{ marginTop: spacing.xs }}>
          {inquiry.trip.postedBy.name}
        </AppText>

        <AppCard style={{ marginTop: spacing.lg }}>
          <Row label="Departure" value={new Date(inquiry.trip.departureAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })} />
          <Row label="Seats requested" value={String(inquiry.requestedSeats)} />
          <Row label="Pickup point" value={inquiry.trip.pickupPoint} />
          {inquiry.pickupNote ? <Row label="Your note" value={inquiry.pickupNote} /> : null}
          <Row label="Price / seat" value={formatPrice(inquiry.trip.pricePerSeat)} />
        </AppCard>

        {inquiry.message ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label">Your message</AppText>
            <AppText muted style={{ marginTop: spacing.xs }}>
              {inquiry.message}
            </AppText>
          </AppCard>
        ) : null}

        {inquiry.status === 'ACCEPTED' ? (
          <AppCard style={{ marginTop: spacing.lg, borderColor: colors.success }}>
            <AppText variant="label" color={colors.success}>
              Accepted!
            </AppText>
            <AppText muted style={{ marginTop: spacing.xs }}>
              Contact {inquiry.trip.postedBy.name} to confirm pickup details.
            </AppText>
            <AppButton
              title="Contact via WhatsApp"
              variant="secondary"
              style={{ marginTop: spacing.md }}
              onPress={() => {
                // wa.me requires digits only — no leading '+', spaces, or dashes.
                const number = inquiry.trip.contactNumber.replace(/\D/g, '');
                Linking.openURL(`https://wa.me/${number}`).catch(() => {});
              }}
            />
          </AppCard>
        ) : null}

        {inquiry.status === 'ACCEPTED' && inquiry.trip.status !== TripStatus.ACTIVE ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label" style={{ marginBottom: spacing.xs }}>
              Trip status
            </AppText>
            {inquiry.droppedOffAt ? (
              <AppText muted variant="caption">
                {inquiry.pickupSource === PickupSource.AUTO_ON_TRIP_END
                  ? 'Trip completed.'
                  : `You were dropped off at ${formatTime(inquiry.droppedOffAt)}.`}
              </AppText>
            ) : inquiry.pickupConfirmedAt ? (
              <AppText muted variant="caption">
                You&apos;re on the trip — picked up at {formatTime(inquiry.pickupConfirmedAt)}.
              </AppText>
            ) : inquiry.trip.status === TripStatus.IN_PROGRESS ? (
              <AppText muted variant="caption">
                Your driver has started the trip.
              </AppText>
            ) : (
              <AppText muted variant="caption">
                Trip completed.
              </AppText>
            )}
          </AppCard>
        ) : null}

        {inquiry.status === 'REJECTED' && inquiry.rejectionReason ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label">Note from the driver</AppText>
            <AppText muted style={{ marginTop: spacing.xs }}>
              {inquiry.rejectionReason}
            </AppText>
          </AppCard>
        ) : null}

        {actionError ? (
          <AppText color={colors.danger} style={{ marginTop: spacing.md }}>
            {actionError}
          </AppText>
        ) : null}

        {availableActions.includes(TripInquiryStatus.CANCELLED) ? (
          <AppButton
            title={inquiry.status === 'ACCEPTED' ? 'Cancel my seat' : 'Cancel request'}
            variant="danger"
            loading={updateStatus.isPending}
            onPress={handleCancel}
            style={{ marginTop: spacing.xl }}
          />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
      <AppText muted variant="caption">
        {label}
      </AppText>
      <AppText variant="caption">{value}</AppText>
    </View>
  );
}
