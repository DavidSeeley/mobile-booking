/**
 * =========================================================================
 * AdminVar — Shared admin variables + localStorage persistence
 * =========================================================================
 * All six admin data sets live here as typed defaults.
 * loadAdminVars() reads saved values from localStorage (falls back to defaults).
 * saveAdminVars() writes the current state back to localStorage.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApartmentSizeRow {
  id: string;
  name: string;
  ratio: number;
  box: number;
  allowance: number;
}

export interface RoomSizeRow {
  id: string;
  name: string;
  ratio: number;
  fur: number;
}

export interface TruckSizeRow {
  id: string;
  name: string;
  count: number;
  mover: number;
}

export interface LoadSizeRow {
  id: string;
  name: string;
  ratio: number;
}

export interface AddedItemRow {
  id: string;
  name: string;
  ratio: number;
}

export interface ConverterRow {
  id: string;
  name: string;
  ratio: number;
  formula: string;
}

export interface AdminVars {
  roomSizes: RoomSizeRow[];
  truckSizes: TruckSizeRow[];
  loadSizes: LoadSizeRow[];
  addedItems: AddedItemRow[];
  converter: ConverterRow[];
}

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

export const DEFAULT_APARTMENT_SIZES: ApartmentSizeRow[] = [
  { id: 'studio',    name: 'Studio',    ratio: 7,  box: 15, allowance: 400 },
  { id: '1-bedroom', name: '1 Bedroom', ratio: 8,  box: 30, allowance: 500 },
  { id: '2-bedroom', name: '2 Bedroom', ratio: 9,  box: 50, allowance: 700 },
  { id: '3-bedroom', name: '3 Bedroom', ratio: 10, box: 70, allowance: 900 },
];

export const DEFAULT_ROOM_SIZES: RoomSizeRow[] = [
  { id: 'studio',      name: 'Studio',      ratio: 1, fur: 0 },
  { id: 'bedroom',     name: 'Bedroom',     ratio: 1, fur: 0 },
  { id: 'living-room', name: 'Living Room', ratio: 1, fur: 0 },
  { id: 'dining',      name: 'Dining',      ratio: 1, fur: 0 },
  { id: 'den',         name: 'Den',         ratio: 1, fur: 0 },
  { id: 'patio',       name: 'Patio',       ratio: 1, fur: 0 },
];

export const DEFAULT_TRUCK_SIZES: TruckSizeRow[] = [
  { id: 'trailer',     name: 'Trailer',     count: 1, mover: 1 },
  { id: 'small-truck', name: 'Small Truck', count: 2, mover: 2 },
  { id: 'large-truck', name: 'Large Truck', count: 3, mover: 3 },
  { id: 'semi',        name: 'Semi',        count: 4, mover: 4 },
];

export const DEFAULT_LOAD_SIZES: LoadSizeRow[] = [
  { id: 'partial', name: 'partial', ratio: 0.25 },
  { id: 'half',    name: 'Half',    ratio: 0.5  },
  { id: 'full',    name: 'Full',    ratio: 1    },
];

export const DEFAULT_ADDED_ITEMS: AddedItemRow[] = [
  { id: 'lighting',        name: 'Lighting',         ratio: 1 },
  { id: 'cleaning',        name: 'Cleaning',          ratio: 1 },
  { id: 'tvs-monitors',    name: 'TVs and Monitors',  ratio: 1 },
  { id: 'music-equipment', name: 'Music Equipment',   ratio: 1 },
  { id: 'sporting-goods',  name: 'Sporting Goods',    ratio: 1 },
  { id: 'kids-stuff',      name: 'Kids Stuff',        ratio: 1 },
];

export const DEFAULT_CONVERTER: ConverterRow[] = [
  { id: 'furniture', name: 'Furniture', ratio: 25, formula: 'SUM(selectedRooms[id].fur × bedroomCount if bedroom)' },
  { id: 'boxes',     name: 'Boxes',     ratio: 75, formula: '(TruckSize Box) * (LoadSize Ratio) * (Added Items Ratio)' },
  { id: 'trucks',    name: 'Trucks',    ratio: 0,  formula: '' },
  { id: 'movers',    name: 'Movers',    ratio: 0,  formula: '' },
];

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lm_admin_vars';

// ---------------------------------------------------------------------------
// Load — reads from localStorage, falls back to defaults for missing keys
// ---------------------------------------------------------------------------

export function loadAdminVars(): AdminVars {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    const parsed = JSON.parse(raw) as Partial<AdminVars>;
    return {
      roomSizes: parsed.roomSizes
        ? parsed.roomSizes.map((stored) => {
            const def = DEFAULT_ROOM_SIZES.find((d) => d.id === stored.id);
            return { ...def, ...stored };
          })
        : DEFAULT_ROOM_SIZES,
      truckSizes:     parsed.truckSizes     ?? DEFAULT_TRUCK_SIZES,
      loadSizes:      parsed.loadSizes      ?? DEFAULT_LOAD_SIZES,
      addedItems:     DEFAULT_ADDED_ITEMS,
      converter:      parsed.converter      ?? DEFAULT_CONVERTER,
    };
  } catch {
    return getDefaults();
  }
}

// ---------------------------------------------------------------------------
// Save — writes all five data sets to localStorage
// ---------------------------------------------------------------------------

export function saveAdminVars(vars: AdminVars): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
  } catch {
    // localStorage unavailable (e.g. private browsing quota exceeded) — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaults(): AdminVars {
  return {
    roomSizes:      DEFAULT_ROOM_SIZES,
    truckSizes:     DEFAULT_TRUCK_SIZES,
    loadSizes:      DEFAULT_LOAD_SIZES,
    addedItems:     DEFAULT_ADDED_ITEMS,
    converter:      DEFAULT_CONVERTER,
  };
}