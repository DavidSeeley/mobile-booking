export interface WelcomeData {
  locationLabel: string;
  locationStreet: string;
  locationCity: string;
  locationState: string;
  locationZip: string;
  unitType: string;
  allowance: number;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  serviceDate: string;        // YYYY-MM-DD
  serviceDateDisplay: string; // "March 22, 2026"
}

export interface AddressData {
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number | null;
  lng: number | null;
}

export interface InventoryData {
  selectedRooms: string[];
  bedroomCount: number;
  disassembleBeds?: boolean;
}

export interface MiscellaneousData {
  selectedCategories: string[];
  boxCount: number;
  packFragile?: boolean;
}

export interface ServiceData {
  selectedServices: string[];
}

export interface ProfileData {
  [key: string]: unknown;
}

export interface FormData {
  welcome: WelcomeData | null;
  contact: ContactData | null;
  address: AddressData | null;
  inventory: InventoryData | null;
  miscellaneous: MiscellaneousData | null;
  service: ServiceData | null;
  profile: ProfileData | null;
}

export interface FormContextValue {
  formData: FormData;
  setWelcome: (data: WelcomeData) => void;
  setContact: (data: ContactData) => void;
  setAddress: (data: AddressData) => void;
  setInventory: (data: InventoryData) => void;
  setMiscellaneous: (data: MiscellaneousData) => void;
  setService: (data: ServiceData) => void;
  setProfile: (data: ProfileData) => void;
  resetForm: () => void;
}
