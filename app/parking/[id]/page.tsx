"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Heart,
  Flag,
  Car,
  ShieldCheck,
  Camera,
  Zap,
  Sun,
  Layers,
  Loader2,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Badge from "@/components/shared/Badge";
import StarRating from "@/components/shared/StarRating";
import ParkingCard from "@/components/shared/ParkingCard";
import Reveal from "@/components/shared/Reveal";
import ShareButton from "@/components/parking/ShareButton";
import ReportSpotPanel from "@/components/parking/ReportSpotPanel";
import ReviewsSection from "@/components/parking/ReviewsSection";
import { usePublicSpots } from "@/hooks/usePublicSpots";
import { useSession } from "@/hooks/useSession";

const MapView = dynamic(() => import("@/components/shared/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-primary-light/40">
      <p className="text-sm font-semibold text-primary-hover">Loading map…</p>
    </div>
  ),
});

const amenityIcons: Record<string, any> = {
  CCTV: Camera,
  "Security Guard": ShieldCheck,
  "Well-lit": Sun,
  "EV Charging": Zap,
  Covered: Layers,
};

export default function ParkingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { spots, loading, refresh: refreshSpots } = usePublicSpots();
  const { user } = useSession();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const spot = spots?.find((s) => s.id === params.id) ?? null;

  useEffect(() => {
    if (!spot || !user) return;
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
  }, [spot?.id, user?.id]);

  async function toggleSaved() {
    if (!spot) return;
    if (!user) {
      router.push(`/login?next=/parking/${spot.id}`);
      return;
    }
    if (savePending) return;

    const next = !saved;
    setSaved(next);
    setSavePending(true);
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
      if (!res.ok) setSaved(!next);
    } catch {
      setSaved(!next);
    } finally {
      setSavePending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="bg-background py-24 text-center">
        <Container className="max-w-md">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Parking spot not found
          </h1>
          <p className="mt-2 text-sm text-muted">
            It may have been removed, or the link is out of date.
          </p>
        </Container>
      </div>
    );
  }

  const gallery = [spot.image, spot.image, spot.image];
  const allSpots = spots ?? [];
  const nearby = allSpots
    .filter((s) => s.id !== spot.id && s.city === spot.city)
    .slice(0, 3)
    .concat(allSpots.filter((s) => s.id !== spot.id && s.city !== spot.city))
    .slice(0, 3);

  return (
    <div className="bg-background pb-24">
      {/* Gallery */}
      <section className="pt-8">
        <Container>
          <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-3xl sm:h-[440px] sm:grid-cols-[1.6fr_1fr]">
            <div className="relative h-72 sm:h-full">
              <Image
                src={gallery[activeImage]}
                alt={spot.name}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="hidden grid-rows-2 gap-2 sm:grid">
              {gallery.slice(0, 2).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="relative overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${spot.name} photo ${i + 2}`}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="mt-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div>
            <Reveal>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{spot.parkingType}</Badge>
                    {spot.isOpen24h && <Badge tone="success">Open 24h</Badge>}
                    {spot.isCommunitySubmitted && <Badge tone="default">Community-submitted</Badge>}
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    {spot.name}
                  </h1>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                    <MapPin size={15} />
                    {spot.address}
                  </p>
                  <div className="mt-3">
                    <StarRating rating={spot.rating} reviewCount={spot.reviewCount} size={16} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSaved}
                    disabled={savePending}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white transition-colors hover:border-danger/40 hover:bg-danger/5 disabled:opacity-60"
                  >
                    <Heart
                      size={18}
                      className={saved ? "fill-danger text-danger" : "text-ink/60"}
                    />
                  </button>
                  <ShareButton spotName={spot.name} />
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push(`/login?next=/parking/${spot.id}`);
                        return;
                      }
                      setReportOpen((open) => !open);
                    }}
                    className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-danger/40 hover:bg-danger/5 hover:text-danger"
                  >
                    <Flag size={15} />
                    Report
                  </button>
                </div>
              </div>

              {reportOpen && (
                <ReportSpotPanel spotId={spot.id} onClose={() => setReportOpen(false)} />
              )}
            </Reveal>

            {/* Location map */}
            <Reveal delay={0.1}>
              <div className="mt-8 h-72 overflow-hidden rounded-3xl border border-border">
                <MapView
                  spots={[spot]}
                  linkToDetails={false}
                  className="h-full w-full"
                />
              </div>
            </Reveal>

            {/* Info grid */}
            <Reveal delay={0.15}>
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="card-surface p-5">
                  <Clock size={18} className="text-primary" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Operating Hours
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">{spot.hours}</p>
                </div>
                <div className="card-surface p-5">
                  <span className="font-bold text-primary">₱</span>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Rate
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    ₱{spot.priceFrom} / {spot.priceUnit}
                  </p>
                </div>
                <div className="card-surface p-5">
                  <Car size={18} className="text-primary" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Vehicle Types
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    {spot.vehicleTypes.join(", ")}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Amenities */}
            <Reveal delay={0.2}>
              <div className="mt-10">
                <h2 className="text-lg font-bold text-ink">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {spot.amenities.map((a) => {
                    const Icon = amenityIcons[a] ?? ShieldCheck;
                    return (
                      <span
                        key={a}
                        className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink/80"
                      >
                        <Icon size={15} className="text-primary" />
                        {a}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Reviews */}
            <Reveal delay={0.25}>
              <ReviewsSection
                spotId={spot.id}
                currentUser={user}
                onReviewSaved={refreshSpots}
              />
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="card-surface sticky top-24 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Starting rate
              </p>
              <p className="mt-1 text-3xl font-extrabold text-ink">
                ₱{spot.priceFrom}
                <span className="text-base font-medium text-muted">
                  /{spot.priceUnit}
                </span>
              </p>
              <button className="btn-primary mt-5 w-full">
                Get Directions
              </button>
              <button
                onClick={toggleSaved}
                disabled={savePending}
                className="btn-secondary mt-3 w-full disabled:opacity-60"
              >
                {saved ? "Saved" : "Save for Later"}
              </button>

              <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Address</span>
                  <span className="max-w-[60%] text-right font-medium text-ink">
                    {spot.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Type</span>
                  <span className="font-medium text-ink">{spot.parkingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Hours</span>
                  <span className="font-medium text-ink">{spot.hours}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Nearby suggestions */}
        {nearby.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-20">
              <h2 className="text-xl font-bold text-ink">
                Nearby parking suggestions
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.map((s) => (
                  <ParkingCard key={s.id} spot={s} />
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </div>
  );
}
