import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RecordTripEventPayload } from '../api/trips.api';

// One shared queue for all trips — a driver only ever runs one trip at a time,
// but this stays correct even if that ever changes. Persisted (not in-memory)
// so a queued action survives the app being killed with no signal — it flushes
// the next time the app opens and the trip screen mounts.
const QUEUE_KEY = 'trips.offlineQueue';

export type QueuedTripAction =
  | { id: string; kind: 'start'; tripId: string; queuedAt: string }
  | { id: string; kind: 'end'; tripId: string; queuedAt: string }
  | { id: string; kind: 'event'; tripId: string; queuedAt: string; payload: RecordTripEventPayload };

async function readQueue(): Promise<QueuedTripAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedTripAction[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueuedTripAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function getQueuedActionsForTrip(tripId: string): Promise<QueuedTripAction[]> {
  return (await readQueue()).filter((action) => action.tripId === tripId);
}

export async function enqueueTripAction(action: QueuedTripAction): Promise<void> {
  const queue = await readQueue();
  queue.push(action);
  await writeQueue(queue);
}

// Safe to call with an id that's already gone (e.g. two flush attempts racing) —
// filtering a missing id is a no-op, not an error.
export async function removeQueuedAction(id: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(queue.filter((action) => action.id !== id));
}
