// =============================================================================
// MobileCust.ts — In-memory session store for the multi-step form flow
// =============================================================================

export interface MobileCust {
  id: number;
  address?: string;
  lat?: number;
  lng?: number;
  [key: string]: unknown;
}

export const MOCK_MOBILE_CUSTS: MobileCust[] = [];

// ---------------------------------------------------------------------------
// Welcome page — moving-to location + unit type
// ---------------------------------------------------------------------------
export interface SavedWelcome {
  locationLabel: string;
  locationStreet: string;
  locationCity: string;
  locationState: string;
  locationZip: string;
  unitType: string;
}

let _savedWelcome: SavedWelcome | null = null;

export function saveWelcome(data: SavedWelcome): void {
  _savedWelcome = data;
}

export function getSavedWelcome(): SavedWelcome | null {
  return _savedWelcome;
}

// ---------------------------------------------------------------------------
// Contact / Location page — name, phone, date of service
// ---------------------------------------------------------------------------
export interface SavedContact {
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  serviceDate: string; // YYYY-MM-DD
  serviceDateDisplay: string; // "March 22, 2026"
}

let _savedContact: SavedContact | null = null;

export function saveContact(data: SavedContact): void {
  _savedContact = data;
}

export function getSavedContact(): SavedContact | null {
  return _savedContact;
}

// ---------------------------------------------------------------------------
// Address page — confirmed address + coordinates
// ---------------------------------------------------------------------------
export interface SavedAddress {
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number | null;
  lng: number | null;
}

let _savedAddress: SavedAddress | null = null;

export function saveAddress(data: SavedAddress): void {
  _savedAddress = data;
  const existing = MOCK_MOBILE_CUSTS.find((c) => c.id === 1);
  if (existing) {
    existing.address = data.formattedAddress;
    existing.lat = data.lat ?? undefined;
    existing.lng = data.lng ?? undefined;
  } else {
    MOCK_MOBILE_CUSTS.push({
      id: 1,
      address: data.formattedAddress,
      lat: data.lat ?? undefined,
      lng: data.lng ?? undefined,
    });
  }
}

export function getSavedAddress(): SavedAddress | null {
  return _savedAddress;
}

// ---------------------------------------------------------------------------
// Inventory page — selected rooms + bedroom count
// ---------------------------------------------------------------------------
export interface SavedInventory {
  selectedRooms: string[];
  bedroomCount: number;
  disassembleBeds?: boolean;
}

let _savedInventory: SavedInventory | null = null;

export function saveInventory(data: SavedInventory): void {
  _savedInventory = data;
}

export function getSavedInventory(): SavedInventory | null {
  return _savedInventory;
}

// ---------------------------------------------------------------------------
// Miscellaneous page — selected categories + fragile packing
// ---------------------------------------------------------------------------
export interface SavedMiscellaneous {
  selectedCategories: string[];
  packFragile?: boolean;
}

let _savedMiscellaneous: SavedMiscellaneous | null = null;

export function saveMiscellaneous(data: SavedMiscellaneous): void {
  _savedMiscellaneous = data;
}

export function getSavedMiscellaneous(): SavedMiscellaneous | null {
  return _savedMiscellaneous;
}