"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParkingSpot } from "@/lib/types";

/**
 * Fetches the public parking spot list — the curated seed set plus any
 * approved community submissions, merged server-side by /api/parking.
 * Falls back to an empty array on error rather than throwing, since most
 * callers just render a grid/map and can show an empty state.
 *
 * Exposes `refresh()` so callers can re-fetch after an action that changes
 * a spot's server-computed fields (e.g. submitting a review recalculates
 * that spot's rating/reviewCount).
 */
export function usePublicSpots() {
  const [spots, setSpots] = useState<ParkingSpot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((isInitial: boolean) => {
    fetch("/api/parking")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => setSpots(data.spots ?? []))
      .catch(() => {
        if (isInitial) setSpots([]);
        setError("Couldn't load parking spots. Please try again.");
      });
  }, []);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => load(false), [load]);

  return { spots, loading: spots === null, error, refresh };
}
