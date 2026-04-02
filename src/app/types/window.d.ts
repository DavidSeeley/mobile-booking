// =============================================================================
// window.d.ts — Global Window interface extensions
// =============================================================================

declare global {
  interface Window {
    /**
     * Flag set by the Splash page when user taps "Get Started".
     * Used by navigation guards to redirect fresh loads/reloads back to splash.
     */
    __appStarted?: boolean;

    /**
     * Google Maps API namespace (loaded dynamically via script tag)
     */
    google?: {
      maps: {
        importLibrary(library: 'maps'): Promise<{ Map: GoogleMapConstructor }>;
        importLibrary(library: 'marker'): Promise<{ AdvancedMarkerElement: GoogleAdvancedMarkerConstructor }>;
      };
    };

    /**
     * Callback invoked by Google Maps script when loaded
     */
    __initGoogleMaps?: () => void;
  }
}

// This export is required to make this file a module
export {};
