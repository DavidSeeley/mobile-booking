// =============================================================================
// index.ts — Central type exports
// =============================================================================

export type {
  GoogleMapOptions,
  GoogleLatLng,
  GoogleMap,
  GoogleMapConstructor,
  GoogleAdvancedMarkerOptions,
  GoogleAdvancedMarker,
  GoogleAdvancedMarkerConstructor,
} from './google-maps';

// Window extensions in window.d.ts are global declarations
// They are automatically picked up by TypeScript without needing imports
