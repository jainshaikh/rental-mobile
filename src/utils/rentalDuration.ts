import { RentalDurationType } from '../types/enums';

export interface VehicleRentalPrices {
  pricePer6Hours?: string | null;
  pricePer12Hours?: string | null;
  pricePerDay: string;
  pricePerWeek?: string | null;
  pricePerMonth?: string | null;
}

interface DurationOption {
  type: RentalDurationType;
  label: string;
  unitLabel: string;
  field: keyof VehicleRentalPrices;
}

// Display order matches web exactly: 6h -> 12h -> day -> week -> month.
export const RENTAL_DURATION_OPTIONS: DurationOption[] = [
  { type: RentalDurationType.HOURS_6, label: '6 Hours', unitLabel: '/ 6 hrs', field: 'pricePer6Hours' },
  { type: RentalDurationType.HOURS_12, label: '12 Hours', unitLabel: '/ 12 hrs', field: 'pricePer12Hours' },
  { type: RentalDurationType.DAY, label: 'Day', unitLabel: '/ day', field: 'pricePerDay' },
  { type: RentalDurationType.WEEK, label: 'Week', unitLabel: '/ week', field: 'pricePerWeek' },
  { type: RentalDurationType.MONTH, label: 'Month', unitLabel: '/ month', field: 'pricePerMonth' },
];

// Client-side preview only — the backend independently recomputes requestedToDate
// and totalPrice from the same vehicle price fields and is the source of truth.
export function getUnitPrice(vehicle: VehicleRentalPrices, type: RentalDurationType): number | null {
  const option = RENTAL_DURATION_OPTIONS.find((o) => o.type === type);
  if (!option) return null;
  const raw = vehicle[option.field];
  if (raw === null || raw === undefined) return null;
  const num = parseFloat(raw);
  return Number.isNaN(num) ? null : num;
}

// Only the tiers this vehicle is actually priced for (pricePerDay is always present).
export function getAvailableDurations(vehicle: VehicleRentalPrices): DurationOption[] {
  return RENTAL_DURATION_OPTIONS.filter((o) => getUnitPrice(vehicle, o.type) !== null);
}

export function computeReturnDate(from: Date, type: RentalDurationType, quantity: number): Date {
  const result = new Date(from);
  switch (type) {
    case RentalDurationType.HOURS_6:
      result.setHours(result.getHours() + 6 * quantity);
      break;
    case RentalDurationType.HOURS_12:
      result.setHours(result.getHours() + 12 * quantity);
      break;
    case RentalDurationType.DAY:
      result.setDate(result.getDate() + quantity);
      break;
    case RentalDurationType.WEEK:
      result.setDate(result.getDate() + 7 * quantity);
      break;
    case RentalDurationType.MONTH:
      result.setMonth(result.getMonth() + quantity);
      break;
  }
  return result;
}
