import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';

import {
  useCancelTrip,
  useEndTrip,
  useMyTrip,
  useRecordTripEvent,
  useStartTrip,
  useTripManifest,
} from '../../../features/trips/queries';
import { useOfflineTripQueue } from '../../../features/trips/offlineSync';
import type { ManifestRider } from '../../../api/trips.api';
import { useTripInquiryInbox, useUpdateTripInquiryStatus } from '../../../features/trip-inquiries/queries';
import { AppButton, AppCard, AppInput, AppScreen, AppText, ErrorState, LoadingState, StatusBadge } from '../../../components/ui';
import { useTheme } from '../../../theme';
import {
  tripPosterActions,
  tripStatusMeta,
  tripInquiryStatusMeta,
  PickupSource,
  TripEventType,
  TripInquiryStatus,
  TripStatus,
} from '../../../types/enums';
import { formatDate, formatPrice, titleCase } from '../../../utils/format';
import { normalizeApiError } from '../../../api/errors';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function MyTripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const { data: trip, isLoading, isError, refetch } = useMyTrip(id);
  const cancelTrip = useCancelTrip(id as string);
  const startTrip = useStartTrip(id as string);
  const endTrip = useEndTrip(id as string);
  const recordEvent = useRecordTripEvent(id as string);
  const [actionError, setActionError] = useState<string | null>(null);
  const [startConfirming, setStartConfirming] = useState(false);
  const [endConfirming, setEndConfirming] = useState(false);
  // NO_SHOW doesn't change pickupConfirmedAt/droppedOffAt server-side (it's
  // just a logged event), so there's nothing to refetch — track it locally
  // to keep the tap visible until the next manifest fetch (e.g. after End Trip).
  const [noShowIds, setNoShowIds] = useState<Set<string>>(new Set());
  // Applied when start/pickup/dropoff/end calls fail with a network error and
  // get queued instead — lets the driver keep working through the whole flow
  // offline (e.g. start the trip, then tap pickups along a low-signal route)
  // without waiting on a round trip that can't happen yet. Real data from the
  // server always wins once the queue syncs (see the merges below).
  const [optimisticStarted, setOptimisticStarted] = useState(false);
  const [optimisticEnded, setOptimisticEnded] = useState(false);
  const [optimisticEvents, setOptimisticEvents] = useState<
    Record<string, { pickupConfirmedAt?: string; droppedOffAt?: string }>
  >({});

  const { data: inquiriesRes, isLoading: inquiriesLoading } = useTripInquiryInbox({
    tripId: id as string,
  });
  const updateInquiryStatus = useUpdateTripInquiryStatus();
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState('');

  // Fetched (and cached by react-query) regardless of status — the backend
  // doesn't gate this on trip status either — so a manifest fetched earlier
  // while online is already sitting in cache if "Start trip" is later tapped
  // offline. Only the CARD's visibility is gated on effective status below.
  const { data: manifest, isLoading: manifestLoading } = useTripManifest(id);
  const offlineQueue = useOfflineTripQueue(id);

  if (isLoading) return <LoadingState label="Loading trip..." />;
  if (isError || !trip) return <ErrorState message="Couldn't load this trip." onRetry={refetch} />;

  const statusMeta = tripStatusMeta[trip.status];
  const effectiveInProgress = trip.status === TripStatus.IN_PROGRESS || (trip.status === TripStatus.ACTIVE && optimisticStarted);
  const effectiveCompleted = trip.status === TripStatus.COMPLETED || (effectiveInProgress && optimisticEnded);
  const showManifest = effectiveInProgress || effectiveCompleted;
  const actions = effectiveCompleted
    ? []
    : effectiveInProgress
      ? ['end' as const]
      : tripPosterActions(trip.status);

  const handleCancel = async () => {
    setActionError(null);
    try {
      await cancelTrip.mutateAsync(undefined);
    } catch (error) {
      setActionError(normalizeApiError(error).message);
    }
  };

  const handleStart = async () => {
    setActionError(null);
    try {
      await startTrip.mutateAsync();
      setStartConfirming(false);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.kind === 'network') {
        await offlineQueue.enqueue({
          id: Crypto.randomUUID(),
          kind: 'start',
          tripId: id as string,
          queuedAt: new Date().toISOString(),
        });
        setOptimisticStarted(true);
        setStartConfirming(false);
      } else {
        setActionError(normalized.message);
      }
    }
  };

  const handleEnd = async () => {
    setActionError(null);
    try {
      await endTrip.mutateAsync();
      setEndConfirming(false);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.kind === 'network') {
        await offlineQueue.enqueue({
          id: Crypto.randomUUID(),
          kind: 'end',
          tripId: id as string,
          queuedAt: new Date().toISOString(),
        });
        setOptimisticEnded(true);
        setEndConfirming(false);
      } else {
        setActionError(normalized.message);
      }
    }
  };

  const handleRiderEvent = async (tripInquiryId: string, type: TripEventType) => {
    setActionError(null);
    const eventId = Crypto.randomUUID();
    const occurredAt = new Date().toISOString();
    try {
      await recordEvent.mutateAsync({ id: eventId, tripInquiryId, type, occurredAt });
      if (type === TripEventType.NO_SHOW) {
        setNoShowIds((prev) => new Set(prev).add(tripInquiryId));
      }
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.kind === 'network') {
        await offlineQueue.enqueue({
          id: eventId,
          kind: 'event',
          tripId: id as string,
          queuedAt: occurredAt,
          payload: { id: eventId, tripInquiryId, type, occurredAt },
        });
        if (type === TripEventType.NO_SHOW) {
          setNoShowIds((prev) => new Set(prev).add(tripInquiryId));
        } else {
          setOptimisticEvents((prev) => ({
            ...prev,
            [tripInquiryId]: {
              ...prev[tripInquiryId],
              ...(type === TripEventType.PICKUP ? { pickupConfirmedAt: occurredAt } : { droppedOffAt: occurredAt }),
            },
          }));
        }
      } else {
        setActionError(normalized.message);
      }
    }
  };

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <AppText variant="title" style={{ textTransform: 'capitalize', flex: 1, marginRight: spacing.md }}>
            {trip.originCity} → {trip.destinationCity}
          </AppText>
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        </View>

        {offlineQueue.pendingCount > 0 ? (
          <AppCard style={{ marginTop: spacing.md, backgroundColor: colors.surfaceAlt }}>
            <AppText variant="caption">
              {offlineQueue.flushing
                ? 'Syncing…'
                : `${offlineQueue.pendingCount} action${offlineQueue.pendingCount !== 1 ? 's' : ''} queued — no connection yet. They'll sync automatically once you're back online.`}
            </AppText>
          </AppCard>
        ) : null}

        {trip.rejectionReason ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label" color={colors.danger}>
              Rejection reason
            </AppText>
            <AppText muted style={{ marginTop: spacing.xs }}>
              {trip.rejectionReason}
            </AppText>
          </AppCard>
        ) : null}
        {trip.cancelReason ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label">Cancellation reason</AppText>
            <AppText muted style={{ marginTop: spacing.xs }}>
              {trip.cancelReason}
            </AppText>
          </AppCard>
        ) : null}

        <AppCard style={{ marginTop: spacing.lg }}>
          <Row label="Departure" value={formatDate(trip.departureAt)} />
          <Row label="Pickup point" value={trip.pickupPoint} />
          {trip.dropoffPoint ? <Row label="Drop-off point" value={trip.dropoffPoint} /> : null}
          <Row label="Available seats" value={String(trip.availableSeats)} />
          <Row label="Price / seat" value={formatPrice(trip.pricePerSeat)} />
          <Row label="Contact number" value={trip.contactNumber} />
        </AppCard>

        <AppCard style={{ marginTop: spacing.lg }}>
          <AppText variant="label" style={{ marginBottom: spacing.sm }}>
            Vehicle
          </AppText>
          {trip.userVehicle.images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {trip.userVehicle.images.map((image) => (
                  <View key={image.id} style={{ width: 112, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}>
                    <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
          <Row
            label="Vehicle"
            value={`${titleCase(trip.userVehicle.make)} ${titleCase(trip.userVehicle.model)}`}
          />
          <Row label="Plate" value={trip.userVehicle.plateNumber} />
        </AppCard>

        {trip.notes ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label">Notes</AppText>
            <AppText muted style={{ marginTop: spacing.xs }}>
              {trip.notes}
            </AppText>
          </AppCard>
        ) : null}

        {trip.status === TripStatus.ACTIVE && !effectiveInProgress ? (
        <AppCard style={{ marginTop: spacing.lg }}>
          <AppText variant="label" style={{ marginBottom: spacing.sm }}>
            Incoming requests
          </AppText>
          {inquiriesLoading ? (
            <AppText muted variant="caption">
              Loading…
            </AppText>
          ) : !inquiriesRes?.data.length ? (
            <AppText muted variant="caption">
              No requests yet — riders who ask for a seat will show up here.
            </AppText>
          ) : (
            inquiriesRes.data.map((inquiry) => (
              <View
                key={inquiry.id}
                style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <AppText variant="caption" style={{ flex: 1, marginRight: spacing.sm }}>
                    {inquiry.user.name} · {inquiry.requestedSeats} seat{inquiry.requestedSeats !== 1 ? 's' : ''}
                  </AppText>
                  <StatusBadge
                    label={tripInquiryStatusMeta[inquiry.status].label}
                    tone={tripInquiryStatusMeta[inquiry.status].tone}
                  />
                </View>
                {inquiry.message ? (
                  <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
                    &ldquo;{inquiry.message}&rdquo;
                  </AppText>
                ) : null}

                {inquiry.status === 'PENDING' && decliningId !== inquiry.id ? (
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <AppButton
                        title="Accept"
                        loading={updateInquiryStatus.isPending}
                        onPress={() =>
                          updateInquiryStatus.mutate({ id: inquiry.id, data: { newStatus: TripInquiryStatus.ACCEPTED } })
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppButton
                        title="Decline"
                        variant="secondary"
                        onPress={() => {
                          setDeclineNote('');
                          setDecliningId(inquiry.id);
                        }}
                      />
                    </View>
                  </View>
                ) : null}

                {decliningId === inquiry.id ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <AppInput
                      placeholder="Optional note for the rider"
                      value={declineNote}
                      onChangeText={setDeclineNote}
                    />
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                      <View style={{ flex: 1 }}>
                        <AppButton title="Keep pending" variant="secondary" onPress={() => setDecliningId(null)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppButton
                          title="Confirm decline"
                          variant="danger"
                          loading={updateInquiryStatus.isPending}
                          onPress={async () => {
                            await updateInquiryStatus.mutateAsync({
                              id: inquiry.id,
                              data: { newStatus: TripInquiryStatus.REJECTED, note: declineNote || undefined },
                            });
                            setDecliningId(null);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </AppCard>
        ) : null}

        {showManifest ? (
          <AppCard style={{ marginTop: spacing.lg }}>
            <AppText variant="label" style={{ marginBottom: spacing.sm }}>
              Manifest
            </AppText>
            {manifestLoading ? (
              <AppText muted variant="caption">
                Loading…
              </AppText>
            ) : !manifest?.riders.length ? (
              <AppText muted variant="caption">
                No confirmed riders on this trip.
              </AppText>
            ) : (
              manifest.riders.map((rider) => {
                const optimistic = optimisticEvents[rider.id];
                const mergedRider: ManifestRider = optimistic
                  ? {
                      ...rider,
                      pickupConfirmedAt: rider.pickupConfirmedAt ?? optimistic.pickupConfirmedAt ?? null,
                      droppedOffAt: rider.droppedOffAt ?? optimistic.droppedOffAt ?? null,
                      pickupSource: rider.pickupSource ?? (optimistic.pickupConfirmedAt ? PickupSource.DRIVER_TAP : null),
                    }
                  : rider;
                return (
                  <ManifestRiderRow
                    key={rider.id}
                    rider={mergedRider}
                    tripInProgress={effectiveInProgress}
                    noShow={noShowIds.has(rider.id)}
                    pending={recordEvent.isPending}
                    onAction={(type) => handleRiderEvent(rider.id, type)}
                  />
                );
              })
            )}
          </AppCard>
        ) : null}

        {actionError ? (
          <AppText color={colors.danger} style={{ marginTop: spacing.md }}>
            {actionError}
          </AppText>
        ) : null}

        {actions.includes('start') ? (
          startConfirming ? (
            <AppCard style={{ marginTop: spacing.xl }}>
              <AppText variant="label">Start this trip?</AppText>
              <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
                This locks in your currently accepted riders as the manifest and removes the trip from search.
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppButton title="Not yet" variant="secondary" onPress={() => setStartConfirming(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton title="Start trip" loading={startTrip.isPending} onPress={handleStart} />
                </View>
              </View>
            </AppCard>
          ) : (
            <AppButton
              title="Start trip"
              onPress={() => setStartConfirming(true)}
              style={{ marginTop: spacing.xl }}
            />
          )
        ) : null}

        {actions.includes('cancel') ? (
          <AppButton
            title="Cancel trip"
            variant="danger"
            loading={cancelTrip.isPending}
            onPress={handleCancel}
            style={{ marginTop: spacing.md }}
          />
        ) : null}

        {actions.includes('end') ? (
          endConfirming ? (
            <AppCard style={{ marginTop: spacing.xl }}>
              <AppText variant="label">End this trip?</AppText>
              <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
                Any rider you haven&apos;t tapped pickup/drop-off for will be marked as completed automatically.
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppButton title="Not yet" variant="secondary" onPress={() => setEndConfirming(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton title="End trip" loading={endTrip.isPending} onPress={handleEnd} />
                </View>
              </View>
            </AppCard>
          ) : (
            <AppButton
              title="End trip"
              onPress={() => setEndConfirming(true)}
              style={{ marginTop: spacing.xl }}
            />
          )
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function ManifestRiderRow({
  rider,
  tripInProgress,
  noShow,
  pending,
  onAction,
}: {
  rider: ManifestRider;
  tripInProgress: boolean;
  noShow: boolean;
  pending: boolean;
  onAction: (type: TripEventType) => void;
}) {
  const { colors, spacing } = useTheme();
  const pickedUp = !!rider.pickupConfirmedAt;
  const droppedOff = !!rider.droppedOffAt;
  const autoResolved = rider.pickupSource === PickupSource.AUTO_ON_TRIP_END;

  return (
    <View
      style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <AppText variant="caption" style={{ flex: 1, marginRight: spacing.sm }}>
          {rider.user.name} · {rider.requestedSeats} seat{rider.requestedSeats !== 1 ? 's' : ''}
          {rider.user.phone ? ` · ${rider.user.phone}` : ''}
        </AppText>
        {droppedOff ? (
          <StatusBadge label={autoResolved ? 'Auto-completed' : 'Dropped off'} tone="complete" />
        ) : pickedUp ? (
          <StatusBadge label="Picked up" tone="success" />
        ) : noShow ? (
          <StatusBadge label="No-show logged" tone="warning" />
        ) : (
          <StatusBadge label="Waiting" tone="neutral" />
        )}
      </View>
      {rider.pickupNote ? (
        <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
          Pickup note: {rider.pickupNote}
        </AppText>
      ) : null}
      {pickedUp && !autoResolved ? (
        <AppText muted variant="caption" style={{ marginTop: spacing.xs }}>
          Picked up {formatTime(rider.pickupConfirmedAt as string)}
          {droppedOff ? ` · Dropped off ${formatTime(rider.droppedOffAt as string)}` : ''}
        </AppText>
      ) : null}

      {tripInProgress && !pickedUp && !noShow ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <AppButton title="Picked up" loading={pending} onPress={() => onAction(TripEventType.PICKUP)} />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              title="No-show"
              variant="secondary"
              onPress={() => onAction(TripEventType.NO_SHOW)}
            />
          </View>
        </View>
      ) : null}

      {tripInProgress && pickedUp && !droppedOff ? (
        <AppButton
          title="Dropped off"
          loading={pending}
          onPress={() => onAction(TripEventType.DROPOFF)}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </View>
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
