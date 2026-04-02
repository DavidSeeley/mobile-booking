/**
 * env.ts - Typed environment variable wrapper
 *
 * Single source of truth for every credential and external URL in the project.
 * Falls back to hardcoded defaults so the app runs in the sandbox without a
 * .env file. In production, set the corresponding VITE_* variables instead.
 *
 * Rules:
 * - No page, component, or hook may read import.meta.env directly.
 * - When moving to a real server, set VITE_* vars in CI/CD and remove fallbacks.
 */

// ---------------------------------------------------------------------------
// Google Maps
// ---------------------------------------------------------------------------

/** Browser API key for Google Maps JS SDK (map display + AdvancedMarker). */
export const GOOGLE_MAPS_API_KEY: string =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ??
  "AIzaSyDL-FjThAuJXzxLHKqwi7rBWQI0p54QknU";

/** Map ID created in Google Cloud Console - required for AdvancedMarkerElement. */
export const GOOGLE_MAPS_MAP_ID: string =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ??
  "708739ccffb324067d573ab8";

// ---------------------------------------------------------------------------
// Sales Order API
// ---------------------------------------------------------------------------

/** Base URL for ApiSalesOrder v1.00 (no trailing slash). */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:5173/localmotion/api/wp/api.php?controller=sales_order";

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

/** Supabase project URL — set VITE_SUPABASE_URL in .env */
export const SUPABASE_URL: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';

/** Supabase anon/public key — set VITE_SUPABASE_ANON_KEY in .env */
export const SUPABASE_ANON_KEY: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';
