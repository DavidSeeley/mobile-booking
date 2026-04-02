// =============================================================================
// google-maps.d.ts — Google Maps API type definitions
// =============================================================================

/**
 * Google Maps Map constructor options
 */
interface GoogleMapOptions {
  center: GoogleLatLng;
  zoom: number;
  mapId: string;
}

/**
 * Latitude/Longitude coordinate pair
 */
interface GoogleLatLng {
  lat: number;
  lng: number;
}

/**
 * Google Maps Map instance
 */
interface GoogleMap {
  setCenter(latLng: GoogleLatLng): void;
  setZoom(zoom: number): void;
}

/**
 * Google Maps Map constructor
 */
interface GoogleMapConstructor {
  new (element: HTMLElement, options: GoogleMapOptions): GoogleMap;
}

/**
 * AdvancedMarkerElement options
 */
interface GoogleAdvancedMarkerOptions {
  map: GoogleMap;
  position: GoogleLatLng;
}

/**
 * Google Maps AdvancedMarkerElement instance
 */
interface GoogleAdvancedMarker {
  position: GoogleLatLng;
}

/**
 * AdvancedMarkerElement constructor
 */
interface GoogleAdvancedMarkerConstructor {
  new (options: GoogleAdvancedMarkerOptions): GoogleAdvancedMarker;
}

export type {
  GoogleMapOptions,
  GoogleLatLng,
  GoogleMap,
  GoogleMapConstructor,
  GoogleAdvancedMarkerOptions,
  GoogleAdvancedMarker,
  GoogleAdvancedMarkerConstructor,
};
