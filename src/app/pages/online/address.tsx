/**
 * =========================================================================
 * Address Page - Multi-Step Form Step 2 of 3 ("Address")
 * =========================================================================
 * Address autocomplete uses Nominatim (OpenStreetMap) — no Places library.
 * Google Maps + AdvancedMarkerElement used for pin display only.
 *
 * Flow:
 *   1. User types → debounced Nominatim fetch → dropdown of suggestions
 *   2. User picks a suggestion → address state set → Yes button activates
 *   3. Map pin moves to the selected coordinates
 *   4. User taps "Yes! That's my address" → saveAddress() → /inventory
 *
 * US-only search: countrycodes=us param + client-side country_code filter.
 * Display is formatted as: street, city, state zip — no county.
 *
 * Refactored to use FormContext for centralized state management.
 * v1.12.305
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { LocateFixed, MapPin, Home } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoImage from '../../../assets/BookingLogo.png';
import { DetailCard } from '@/components/detail-card';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID } from '@/utils/env';
import type { GoogleMap, GoogleAdvancedMarker } from '@/types';
import { useFormData } from '@/context/FormContext';
import type { NominatimAddress, NominatimResult } from '@/types/address';
import { useStopTypes } from '@/hooks/useStopTypes';

// ---------------------------------------------------------------------------
// Format a Nominatim result as: "123 Main St, City, ST 12345"
// Falls back to display_name if address parts are missing.
// ---------------------------------------------------------------------------
function formatAddress(result: NominatimResult): string {
  const a = result.address;
  if (!a) return result.display_name;

  const street = [a.house_number, a.road].filter(Boolean).join(' ');
  const city   = a.city || a.town || a.village || a.municipality || '';
  const state  = a.state || '';
  const zip    = a.postcode || '';

  const parts: string[] = [];
  if (street) parts.push(street);
  if (city)   parts.push(city);

  const stateZip = [state, zip].filter(Boolean).join(' ');
  if (stateZip) parts.push(stateZip);

  return parts.length > 0 ? parts.join(', ') : result.display_name;
}

// ---------------------------------------------------------------------------
// Singleton Google Maps loader — no places library needed
// ---------------------------------------------------------------------------
let mapsReady: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (mapsReady) return mapsReady;

  mapsReady = new Promise<void>((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }

    const existing = document.querySelector(
      'script[data-google-maps-loader="true"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      const check = window.setInterval(() => {
        if (window.google?.maps) { window.clearInterval(check); resolve(); }
      }, 50);
      window.setTimeout(() => {
        window.clearInterval(check);
        reject(new Error('Google Maps API was not ready in time'));
      }, 10000);
      return;
    }

    window.__initGoogleMaps = () => {
      resolve();
      delete window.__initGoogleMaps;
    };

    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&callback=__initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'true';
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(script);
  });

  return mapsReady;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Address() {
  const navigate = useNavigate();
  const { formData, setAddress } = useFormData();
  const { stopTypes } = useStopTypes();
  const mapRef         = useRef<HTMLDivElement>(null);
  const markerRef      = useRef<GoogleAdvancedMarker | null>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search state
  const [query, setQuery]               = useState('');
  const [suggestions, setSuggestions]   = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Confirmed address state (drives Yes button + map)
  const [address, setAddressLocal]   = useState('');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [addressParts, setAddressParts] = useState<{
    street: string; city: string; state: string; zipcode: string;
  }>({ street: '', city: '', state: '', zipcode: '' });
  const [homeType, setHomeType]           = useState('');
  const [homeTypeId, setHomeTypeId]       = useState<number | undefined>(undefined);
  const [homeTypeRatio, setHomeTypeRatio] = useState<number>(1);
  const [showHomeTypeError, setShowHomeTypeError] = useState(false);

  // ── Navigation guard ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.__appStarted) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // ── Restore from FormContext on mount ─────────────────────────────────────
  useEffect(() => {
    if (formData.address) {
      setQuery(formData.address.formattedAddress);
      setAddressLocal(formData.address.formattedAddress);
      if (formData.address.lat !== null && formData.address.lng !== null) {
        setPosition({ lat: formData.address.lat, lng: formData.address.lng });
      }
      setAddressParts({
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zipcode: formData.address.zipcode,
      });
      if (formData.address.homeType) setHomeType(formData.address.homeType);
      if (formData.address.homeTypeId !== undefined) setHomeTypeId(formData.address.homeTypeId);
      if (formData.address.homeTypeRatio !== undefined) setHomeTypeRatio(formData.address.homeTypeRatio);
    }
  }, []);

  // ── Google Map init ───────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        await loadGoogleMaps();
        if (!mounted || !mapRef.current || !window.google) return;

        const { Map }                   = await window.google.maps.importLibrary('maps');
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

        if (!mounted || !mapRef.current) return;

        const defaultPos = { lat: 37.7749, lng: -122.4194 };

        const map = new Map(mapRef.current, {
          center: defaultPos,
          zoom: 13,
          mapId: GOOGLE_MAPS_MAP_ID,
        });

        mapInstanceRef.current = map;
        markerRef.current = new AdvancedMarkerElement({ map, position: defaultPos });
      } catch (err) {
        console.error('Google Maps init error:', err);
      }
    };

    initMap();
    return () => { mounted = false; };
  }, []);

  // ── Move map pin whenever position changes ────────────────────────────────
  useEffect(() => {
    if (!position || !mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15);
    markerRef.current.position = position;
  }, [position]);

  // ── Nominatim debounced search (US only) ─────────────────────────────────
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    // Clear any previously confirmed address while the user is re-typing
    setAddressLocal('');
    setPosition(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', value);
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '6');
        url.searchParams.set('countrycodes', 'us');
        // Restrict to Minnesota + Wisconsin bounding box
        url.searchParams.set('viewbox', '-97.2,49.4,-86.2,42.5');
        url.searchParams.set('bounded', '1');

        const res = await fetch(url.toString(), {
          headers: { 'Accept-Language': 'en' },
        });

        const data: NominatimResult[] = await res.json();
        // Client-side fallback filter — ensures only MN / WI results
        const MN_WI_STATES = ['minnesota', 'wisconsin'];
        const usOnly = data.filter(
          (item) =>
            item.address?.country_code?.toLowerCase() === 'us' &&
            MN_WI_STATES.includes((item.address?.state ?? '').toLowerCase())
        );

        setSuggestions(usOnly);
        setShowDropdown(usOnly.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
  }, []);

  // ── User picks a suggestion ───────────────────────────────────────────────
  const handleSelectSuggestion = (result: NominatimResult) => {
    const lat       = parseFloat(result.lat);
    const lng       = parseFloat(result.lon);
    const formatted = formatAddress(result);
    const a         = result.address;

    const street  = [a?.house_number, a?.road].filter(Boolean).join(' ') || formatted;
    const city    = a?.city || a?.town || a?.village || a?.municipality || '';
    const state   = a?.state || '';
    const zipcode = a?.postcode || '';

    setQuery(formatted);
    setAddressLocal(formatted);
    setPosition({ lat, lng });
    setAddressParts({ street, city, state, zipcode });
    setSuggestions([]);
    setShowDropdown(false);
  };

  // ── Confirm → save to FormContext → navigate ──────────────────────────────
  const handleConfirm = () => {
    if (!homeType) {
      setShowHomeTypeError(true);
      return;
    }
    setAddress({
      formattedAddress: address,
      street:   addressParts.street,
      city:     addressParts.city,
      state:    addressParts.state,
      zipcode:  addressParts.zipcode,
      lat: position?.lat ?? null,
      lng: position?.lng ?? null,
      homeType:      homeType || undefined,
      homeTypeId:    homeType ? homeTypeId : undefined,
      homeTypeRatio: homeType ? homeTypeRatio : undefined,
    });
    navigate('/inventory');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between bg-white flex-shrink-0">
        <img src={logoImage} alt="Local Motion" className="h-10 md:h-12 w-auto" />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 pb-3">
        <div className="max-w-3xl">

          {/* Page Title */}
          <div className="flex items-center gap-3 mb-6">
            <LocateFixed className="h-6 w-6 text-orange-500" />
            <h1 className="text-gray-900 font-bold" style={{ fontSize: '16px' }}>Please share your current address</h1>
          </div>

          {/* Card */}
          <DetailCard>

            {/* Search input + Nominatim dropdown */}
            <label className="block mb-1 text-sm text-slate-500">Search address</label>
            <div className="relative w-full mb-4">
              <input
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Start typing your MN or WI address…"
                autoComplete="off"
                className="w-full border-b border-slate-400 focus:border-blue-600 bg-transparent outline-none py-2 text-slate-700 placeholder-slate-400 transition-colors text-15px"
              />
              {loadingSearch && (
                <span className="absolute right-2 top-2 text-xs text-slate-400">Searching…</span>
              )}

              {showDropdown && suggestions.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleSelectSuggestion(s)}
                      className="flex items-start gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-slate-600 text-13px">
                        {formatAddress(s)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>


            {/* Google Map */}
            <div
              ref={mapRef}
              className="w-full rounded border border-gray-200"
              style={{ height: '240px' }}
            />
          </DetailCard>

          {/* Home Type */}
          <div className="mt-5 mb-4">
            <h2 className="text-gray-900 mb-3 font-bold flex items-center gap-2 section-heading">
              <Home className="h-5 w-5 text-orange-500 flex-shrink-0" />
              What type of home is this?
            </h2>
            <select
              value={homeType}
              onChange={(e) => {
                const val = e.target.value;
                setHomeType(val);
                setShowHomeTypeError(false);
                const matched = stopTypes.find(s => s.name === val);
                setHomeTypeId(matched?.id);
                setHomeTypeRatio(matched?.ratio ?? 1);
              }}
              className={[
                'w-full max-w-xs px-4 py-3 border-2 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-blue-500',
                showHomeTypeError ? 'border-red-500' : 'border-gray-300',
              ].join(' ')}
            >
              <option value="">Select home type…</option>
              <option value="Single Family">Single Family</option>
              <option value="Apartment">Apartment</option>
              <option value="Storage Unit">Storage Unit</option>
              <option value="Rambler">Rambler</option>
              <option value="Duplex">Duplex</option>
              <option value="Condo">Condo</option>
            </select>
            {showHomeTypeError && (
              <p className="text-red-500 text-sm mt-2">Please select a home type.</p>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 md:px-8 py-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl inline-flex items-center gap-1 transition-colors"
          >
            <span className="text-base">←</span>
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!address || !homeType}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl inline-flex items-center gap-2 transition-colors"
          >
            Next
            <span className="text-base">→</span>
          </button>
        </div>
      </footer>

    </div>
  );
}