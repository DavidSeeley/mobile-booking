/**
 * =========================================================================
 * FormContext - Centralized State Management for Multi-Step Form
 * =========================================================================
 * Context-based state store that:
 * - Centralizes all form data across multiple steps
 * - Auto-persists to sessionStorage to prevent data loss
 * - Eliminates prop drilling and duplicate state logic
 * - Provides type-safe API via useFormData hook
 * 
 * Part of Step 4 optimization (Proper State Management)
 * Part of Step 6 optimization (Performance Optimization)
 * v1.12.500
 */

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface WelcomeData {
  locationLabel: string;
  locationStreet: string;
  locationCity: string;
  locationState: string;
  locationZip: string;
  unitType: string;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  serviceDate: string; // YYYY-MM-DD
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
  // Add profile-specific fields as needed
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

// ============================================================================
// Context
// ============================================================================

interface FormContextValue {
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

const FormContext = createContext<FormContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

const STORAGE_KEY = 'local_motion_form_data';

function getInitialFormData(): FormData {
  // Try to restore from sessionStorage
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }
  
  return {
    welcome: null,
    contact: null,
    address: null,
    inventory: null,
    miscellaneous: null,
    service: null,
    profile: null,
  };
}

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(getInitialFormData);

  // Auto-persist to sessionStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const setWelcome = useCallback((data: WelcomeData) => {
    setFormData(prev => ({ ...prev, welcome: data }));
  }, []);

  const setContact = useCallback((data: ContactData) => {
    setFormData(prev => ({ ...prev, contact: data }));
  }, []);

  const setAddress = useCallback((data: AddressData) => {
    setFormData(prev => ({ ...prev, address: data }));
  }, []);

  const setInventory = useCallback((data: InventoryData) => {
    setFormData(prev => ({ ...prev, inventory: data }));
  }, []);

  const setMiscellaneous = useCallback((data: MiscellaneousData) => {
    setFormData(prev => ({ ...prev, miscellaneous: data }));
  }, []);

  const setService = useCallback((data: ServiceData) => {
    setFormData(prev => ({ ...prev, service: data }));
  }, []);

  const setProfile = useCallback((data: ProfileData) => {
    setFormData(prev => ({ ...prev, profile: data }));
  }, []);

  const resetForm = useCallback(() => {
    const emptyData: FormData = {
      welcome: null,
      contact: null,
      address: null,
      inventory: null,
      miscellaneous: null,
      service: null,
      profile: null,
    };
    setFormData(emptyData);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  // Only recreates when formData or setter functions change
  const value: FormContextValue = useMemo(() => ({
    formData,
    setWelcome,
    setContact,
    setAddress,
    setInventory,
    setMiscellaneous,
    setService,
    setProfile,
    resetForm,
  }), [formData, setWelcome, setContact, setAddress, setInventory, setMiscellaneous, setService, setProfile, resetForm]);

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useFormData() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormData must be used within FormProvider');
  }
  return context;
}