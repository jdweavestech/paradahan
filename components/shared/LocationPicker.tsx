"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LocateFixed, Loader2 } from "lucide-react";

const MANILA_CENTER: [number, number] = [14.5995, 120.9842];
const DEFAULT_ZOOM = 13;

/**
 * Reverse-geocodes a lat/lng into a human-readable address using
 * OpenStreetMap's free Nominatim API (no API key required).
 *
 * Usage note: Nominatim's public instance is rate-limited (~1 req/sec) and
 * asks that requests identify the app. That's fine for a form where a
 * person drops one pin at a time, but for higher volume swap this for a
 * paid geocoder (Google/Mapbox/LocationIQ) or a self-hosted Nominatim.
 */
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; city: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.display_name !== "string") return null;
    const a = data.address ?? {};
    const city = a.city || a.town || a.municipality || a.city_district || a.county || "";
    return { address: data.display_name, city };
  } catch {
    return null;
  }
}

function pinIcon() {
  const html = `
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgb(15 23 42 / 0.3));">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9z" fill="#2563EB"/>
      <circle cx="12" cy="9" r="3.6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
}

function ClickToPlace({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterButton({
  onLocated,
}: {
  onLocated: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16, { animate: true });
            onLocated(latitude, longitude);
            setLocating(false);
          },
          () => setLocating(false)
        );
      }}
      className="absolute right-3 top-3 z-[400] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary shadow-soft transition-colors hover:bg-primary-light/40"
      aria-label="Use my current location"
      title="Use my current location"
    >
      {locating ? (
        <Loader2 size={17} className="animate-spin" />
      ) : (
        <LocateFixed size={17} />
      )}
    </button>
  );
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  /** Called with the auto-detected street address (and city, when found) whenever a pin is placed/moved. */
  onAddressDetected?: (address: string, city: string) => void;
  className?: string;
}

export default function LocationPicker({
  value,
  onChange,
  onAddressDetected,
  className,
}: LocationPickerProps) {
  const [marker, setMarker] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [detecting, setDetecting] = useState(false);
  const icon = useMemo(() => pinIcon(), []);
  // Guards against a slow, stale geocode response overwriting a newer pin.
  const requestId = useRef(0);

  const handlePick = (lat: number, lng: number) => {
    setMarker([lat, lng]);
    onChange({ lat, lng });

    if (!onAddressDetected) return;
    const thisRequest = ++requestId.current;
    setDetecting(true);
    reverseGeocode(lat, lng).then((result) => {
      if (requestId.current !== thisRequest) return; // a newer pin was dropped meanwhile
      setDetecting(false);
      if (result) onAddressDetected(result.address, result.city);
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border ${className ?? ""}`}>
      <MapContainer
        center={marker ?? MANILA_CENTER}
        zoom={marker ? 16 : DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-56 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPlace onPick={handlePick} />
        <RecenterButton onLocated={handlePick} />
        {marker && (
          <Marker
            position={marker}
            icon={icon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const { lat, lng } = m.getLatLng();
                handlePick(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>

      {!marker && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70">
          <p className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-muted shadow-soft">
            Tap anywhere on the map to drop a pin
          </p>
        </div>
      )}

      {detecting && (
        <div className="absolute bottom-3 left-1/2 z-[400] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-muted shadow-soft">
          <Loader2 size={12} className="animate-spin" />
          Detecting address…
        </div>
      )}
    </div>
  );
}
