"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import Link from "next/link";
import { Star } from "lucide-react";
import type { ParkingSpot } from "@/lib/types";

// Manila is used as the default center whenever there's nothing else to
// go on (e.g. an empty result set).
const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];
const DEFAULT_ZOOM = 12;

function pinIcon(color: string, size = 34) {
  const html = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgb(15 23 42 / 0.25));">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9z" fill="${color}"/>
      <circle cx="12" cy="9" r="3.6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

/** Keeps the map's viewport in sync with the set of markers being shown. */
function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    // key intentionally captures the point set so this only re-runs when
    // the underlying spots (not just the map instance) change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

interface MapViewProps {
  spots: ParkingSpot[];
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
  className?: string;
  /** When true, popups link through to the spot's details page. */
  linkToDetails?: boolean;
}

export default function MapView({
  spots,
  activeId,
  onMarkerClick,
  className,
  linkToDetails = true,
}: MapViewProps) {
  const points = useMemo(
    () => spots.map((s) => [s.lat, s.lng] as [number, number]),
    [spots]
  );

  const defaultIcon = useMemo(() => pinIcon("#2563EB"), []);
  const activeIcon = useMemo(() => pinIcon("#1D4ED8", 42), []);

  const center = points[0] ?? DEFAULT_CENTER;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers points={points} />
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={spot.id === activeId ? activeIcon : defaultIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(spot.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1.5">
                <p className="text-sm font-bold text-ink">{spot.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Star size={12} className="fill-warning text-warning" />
                  {spot.rating.toFixed(1)} ({spot.reviewCount})
                </p>
                <p className="text-xs font-semibold text-primary">
                  ₱{spot.priceFrom}/{spot.priceUnit === "hour" ? "hr" : spot.priceUnit}
                </p>
                {linkToDetails && (
                  <Link
                    href={`/parking/${spot.id}`}
                    className="mt-1 inline-block text-xs font-semibold text-primary underline underline-offset-2"
                  >
                    View details
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
