"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Clock, Car } from "lucide-react";
import { ParkingSpot } from "@/lib/types";
import { useSession } from "@/hooks/useSession";
import StarRating from "./StarRating";
import Badge from "./Badge";

interface ParkingCardProps {
  spot: ParkingSpot;
  className?: string;
  /** Pre-fetched saved state, e.g. from the account page's saved-spots list — skips the per-card favorites lookup. */
  initialSaved?: boolean;
}

export default function ParkingCard({ spot, className, initialSaved }: ParkingCardProps) {
  const { user } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialSaved !== undefined || !user) return;
    let cancelled = false;
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : { spotIds: [] }))
      .then((data) => {
        if (!cancelled) setSaved((data.spotIds ?? []).includes(spot.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, spot.id]);

  async function toggleSaved(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login?next=/search");
      return;
    }
    if (pending) return;

    const next = !saved;
    setSaved(next); // optimistic
    setPending(true);
    try {
      const res = next
        ? await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ spotId: spot.id }),
          })
        : await fetch(`/api/favorites?spotId=${encodeURIComponent(spot.id)}`, {
            method: "DELETE",
          });
      if (!res.ok) setSaved(!next); // revert on failure
    } catch {
      setSaved(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`group card-surface overflow-hidden hover:shadow-lift ${className ?? ""}`}
    >
      <Link href={`/parking/${spot.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={spot.image}
            alt={spot.name}
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge tone="dark">{spot.parkingType}</Badge>
            {spot.isOpen24h && <Badge tone="success">Open 24h</Badge>}
            {spot.isCommunitySubmitted && <Badge tone="primary">Community</Badge>}
          </div>
          <button
            onClick={toggleSaved}
            aria-label={saved ? "Remove from saved" : "Save parking spot"}
            aria-pressed={saved}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95 disabled:opacity-70"
            disabled={pending}
          >
            <Heart
              size={17}
              className={saved ? "fill-danger text-danger" : "text-ink/60"}
            />
          </button>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/parking/${spot.id}`}>
            <h3 className="text-base font-bold leading-snug text-ink transition-colors group-hover:text-primary">
              {spot.name}
            </h3>
          </Link>
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{spot.city}</span>
          {typeof spot.distanceKm === "number" && (
            <span className="ml-1 shrink-0 text-xs text-muted">
              · {spot.distanceKm} km away
            </span>
          )}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <StarRating rating={spot.rating} reviewCount={spot.reviewCount} />
          <p className="text-sm font-bold text-primary">
            ₱{spot.priceFrom}
            <span className="font-medium text-muted">/{spot.priceUnit}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {spot.hours}
          </span>
          <span className="flex items-center gap-1">
            <Car size={13} />
            {spot.vehicleTypes.length} vehicle types
          </span>
        </div>
      </div>
    </motion.div>
  );
}
