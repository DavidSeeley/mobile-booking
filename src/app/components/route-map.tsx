/**
 * RouteMap — embeds a Google Maps Directions view between two addresses.
 * Uses the Maps Embed API (iframe) — no JS SDK required.
 */

import { GOOGLE_MAPS_API_KEY } from '@/utils/env';

interface RouteMapProps {
  origin: string;
  destination: string;
}

export function RouteMap({ origin, destination }: RouteMapProps) {
  if (!origin || !destination) return null;

  const src =
    `https://www.google.com/maps/embed/v1/directions` +
    `?key=${GOOGLE_MAPS_API_KEY}` +
    `&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&mode=driving`;

  return (
    <iframe
      title="Route map"
      src={src}
      width="100%"
      height="320"
      style={{ border: 0, borderRadius: '12px', display: 'block' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
