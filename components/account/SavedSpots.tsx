"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import ParkingCard from "@/components/shared/ParkingCard";
import { usePublicSpots } from "@/hooks/usePublicSpots";

export default function SavedSpots() {
  const [spotIds, setSpotIds] = useState<string[] | null>(null);
  const { spots, loading: spotsLoading } = usePublicSpots();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : { spotIds: [] }))
      .then((data) => {
        if (!cancelled) setSpotIds(data.spotIds ?? []);
      })
      .catch(() => {
        if (!cancelled) setSpotIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (spotIds === null || spotsLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  const savedSpots = (spots ?? []).filter((s) => spotIds.includes(s.id));

  if (savedSpots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center">
        <Heart size={28} className="mx-auto text-muted" />
        <p className="mt-3 text-sm font-semibold text-ink">No saved spots yet</p>
        <p className="mt-1 text-sm text-muted">
          Tap the heart icon on any parking spot to save it here.
        </p>
        <Link href="/search" className="btn-primary mt-5 inline-flex">
          Browse Parking Spots
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {savedSpots.map((spot) => (
        <ParkingCard key={spot.id} spot={spot} initialSaved />
      ))}
    </div>
  );
}
