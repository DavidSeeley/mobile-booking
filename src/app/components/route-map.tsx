/**
 * RouteMap — renders a driving route between two addresses using the
 * Google Maps JavaScript API (DirectionsService + DirectionsRenderer).
 * Auto-fits bounds so both pins sit near the map edges with the full
 * route visible. Reuses the same Maps loader singleton as address.tsx.
 */

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/utils/env';

// ---------------------------------------------------------------------------
// Singleton loader — safe to call multiple times
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
        reject(new Error('Google Maps timed out'));
      }, 10000);
      return;
    }

    (window as any).__initGoogleMaps = () => {
      resolve();
      delete (window as any).__initGoogleMaps;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&callback=__initGoogleMaps`;
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
interface RouteMapProps {
  origin: string;
  destination: string;
  height?: number;
}

export function RouteMap({ origin, destination, height = 320 }: RouteMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination || !mapDivRef.current) return;

    let cancelled = false;

    loadGoogleMaps().then(() => {
      if (cancelled || !mapDivRef.current) return;

      const gmaps = (window as any).google.maps;

      const map = new gmaps.Map(mapDivRef.current, {
        zoom: 10,
        center: { lat: 44.97, lng: -93.27 }, // Minneapolis fallback
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: gmaps.ControlPosition.RIGHT_CENTER,
        },
      });

      const directionsService = new gmaps.DirectionsService();
      const directionsRenderer = new gmaps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: { strokeColor: '#2563eb', strokeWeight: 5 },
      });

      directionsService.route(
        {
          origin,
          destination,
          travelMode: gmaps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (cancelled) return;
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            // Fit with padding so pins land away from edges and controls
            const bounds = result.routes[0].bounds;
            map.fitBounds(bounds, { top: 48, right: 56, bottom: 48, left: 48 });
          } else {
            console.error('DirectionsService status:', status);
            setError(`Could not calculate route (${status}).`);
          }
        }
      );
    }).catch(() => {
      if (!cancelled) setError('Failed to load Google Maps.');
    });

    return () => { cancelled = true; };
  }, [origin, destination]);

  if (error) {
    return (
      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
    );
  }

  return (
    <div
      ref={mapDivRef}
      style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden' }}
    />
  );
}
