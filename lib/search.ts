import type { ParkingSpot } from "./types";

/** "Quezon City" → "quezon-city"; matches the ids used in the cities list. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Free-text match against a spot's name, city, address and description.
 * Every word in the query must appear somewhere; a trailing plural "s" is
 * ignored so "Malls" still finds "SM Mall".
 */
export function matchesQuery(spot: ParkingSpot, query: string): boolean {
  const words = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
  if (words.length === 0) return true;

  const haystack = normalize(
    [spot.name, spot.city, spot.address, spot.description ?? "", spot.parkingType].join(" ")
  );
  return words.every((w) => haystack.includes(w));
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
