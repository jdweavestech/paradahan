"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map as MapIcon,
  Loader2,
  SearchX,
  X,
} from "lucide-react";
import Container from "@/components/shared/Container";
import ParkingCard from "@/components/shared/ParkingCard";
import Reveal from "@/components/shared/Reveal";
import { usePublicSpots } from "@/hooks/usePublicSpots";
import { distanceKm, matchesQuery, slugify } from "@/lib/search";
import type { ParkingType, VehicleType } from "@/lib/types";

const MapView = dynamic(() => import("@/components/shared/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-primary-light/40">
      <p className="text-sm font-semibold text-primary-hover">Loading map…</p>
    </div>
  ),
});

const vehicleFilters: VehicleType[] = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];
const typeFilters: ParkingType[] = ["Covered", "Open-air", "Multi-level", "Street"];

// Slider's top stop means "no limit" so pricier spots aren't hidden by default.
const PRICE_MAX = 200;

type SortKey = "recommended" | "rating" | "price" | "nearest";
const sortOptions: { id: SortKey; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "rating", label: "Top rated" },
  { id: "price", label: "Lowest price" },
  { id: "nearest", label: "Nearest to me" },
];

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const vehicleParam = searchParams.get("vehicle") as VehicleType | null;

  const [view, setView] = useState<"grid" | "list">("grid");
  const [showMap, setShowMap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(cityParam);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [vehicles, setVehicles] = useState<VehicleType[]>(
    vehicleParam && vehicleFilters.includes(vehicleParam) ? [vehicleParam] : []
  );
  const [types, setTypes] = useState<ParkingType[]>([]);
  const [only24h, setOnly24h] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { spots, loading, error } = usePublicSpots();

  // Keep state in sync when the URL changes (e.g. clicking a city or a
  // home-page search while already on /search).
  useEffect(() => {
    setQueryInput(initialQuery);
    setQuery(initialQuery);
  }, [initialQuery]);
  useEffect(() => setCity(cityParam), [cityParam]);

  function updateUrl(next: { q?: string; city?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("vehicle");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setQuery(queryInput.trim());
    updateUrl({ q: queryInput.trim() });
  }

  function clearFilters() {
    setMaxPrice(PRICE_MAX);
    setVehicles([]);
    setTypes([]);
    setOnly24h(false);
    setCity("");
    updateUrl({ city: "" });
  }

  function chooseSort(next: SortKey) {
    setSort(next);
    if (next !== "nearest" || location) return;
    if (!("geolocation" in navigator)) {
      setLocationError("Your browser can't share your location.");
      setSort("recommended");
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocationError("Location access was denied, so we can't sort by distance.");
        setSort("recommended");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  const results = useMemo(() => {
    const filtered = (spots ?? [])
      .map((spot) => ({
        ...spot,
        distanceKm: location ? Math.round(distanceKm(location, spot) * 10) / 10 : undefined,
      }))
      .filter((spot) => {
        if (city && slugify(spot.city) !== city) return false;
        if (query && !matchesQuery(spot, query)) return false;
        if (maxPrice < PRICE_MAX && spot.priceFrom > maxPrice) return false;
        if (vehicles.length && !vehicles.some((v) => spot.vehicleTypes.includes(v))) return false;
        if (types.length && !types.includes(spot.parkingType)) return false;
        if (only24h && !spot.isOpen24h) return false;
        return true;
      });

    switch (sort) {
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case "price":
        return filtered.sort((a, b) => a.priceFrom - b.priceFrom);
      case "nearest":
        return location ? filtered.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)) : filtered;
      default:
        return filtered;
    }
  }, [spots, city, query, maxPrice, vehicles, types, only24h, sort, location]);

  const cityLabel = useMemo(() => {
    if (!city) return null;
    return (spots ?? []).find((s) => slugify(s.city) === city)?.city ?? city.replace(/-/g, " ");
  }, [city, spots]);

  const activeFilterCount =
    (maxPrice < PRICE_MAX ? 1 : 0) + vehicles.length + types.length + (only24h ? 1 : 0) + (city ? 1 : 0);

  const filtersPanel = (
    <div className="space-y-8">
      {cityLabel && (
        <div>
          <h3 className="text-sm font-bold text-ink">City</h3>
          <button
            onClick={() => {
              setCity("");
              updateUrl({ city: "" });
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold capitalize text-primary-hover"
          >
            {cityLabel}
            <X size={12} />
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-ink">Max Rate</h3>
        <input
          type="range"
          min={10}
          max={PRICE_MAX}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-4 w-full accent-primary"
          aria-label="Maximum rate"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>₱10</span>
          <span className="font-semibold text-ink">
            {maxPrice >= PRICE_MAX ? "Any price" : `Up to ₱${maxPrice}`}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-ink">Vehicle Type</h3>
        <div className="mt-3 space-y-2.5">
          {vehicleFilters.map((v) => (
            <label key={v} className="flex items-center gap-2.5 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={vehicles.includes(v)}
                onChange={() => setVehicles((list) => toggleIn(list, v))}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-ink">Parking Type</h3>
        <div className="mt-3 space-y-2.5">
          {typeFilters.map((t) => (
            <label key={t} className="flex items-center gap-2.5 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={types.includes(t)}
                onChange={() => setTypes((list) => toggleIn(list, t))}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-ink">Availability</h3>
        <label className="mt-3 flex items-center gap-2.5 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={only24h}
            onChange={(e) => setOnly24h(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Open 24 hours
        </label>
      </div>

      <button
        onClick={clearFilters}
        disabled={activeFilterCount === 0}
        className="btn-ghost w-full justify-center border border-border disabled:opacity-50"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="bg-background">
      {/* Search header */}
      <section className="border-b border-border bg-white py-8">
        <Container>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
              <MapPin size={18} className="text-primary" />
              <input
                type="search"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search by place, street, or city"
                aria-label="Search parking"
                className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="btn-secondary lg:hidden"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
          {showFilters && <div className="card-surface mt-4 p-6 lg:hidden">{filtersPanel}</div>}
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          {/* Filters sidebar */}
          <aside className="hidden lg:block">
            <div className="card-surface sticky top-24 p-6">{filtersPanel}</div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">
                <span className="font-bold text-ink">{results.length}</span>{" "}
                parking {results.length === 1 ? "space" : "spaces"} found
                {query && (
                  <>
                    {" "}
                    for <span className="font-semibold text-ink">&ldquo;{query}&rdquo;</span>
                  </>
                )}
                {cityLabel && (
                  <>
                    {" "}
                    in <span className="font-semibold capitalize text-ink">{cityLabel}</span>
                  </>
                )}
              </p>

              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => chooseSort(e.target.value as SortKey)}
                  aria-label="Sort results"
                  className="rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/5 focus:outline-none"
                >
                  {sortOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center rounded-full border border-border p-1">
                  <button
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      view === "grid" ? "bg-primary text-white" : "text-muted hover:bg-ink/5"
                    }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    aria-label="List view"
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      view === "list" ? "bg-primary text-white" : "text-muted hover:bg-ink/5"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>

                <button
                  onClick={() => setShowMap((v) => !v)}
                  className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/5 xl:flex"
                >
                  <MapIcon size={14} />
                  {showMap ? "Hide Map" : "Show Map"}
                </button>
              </div>
            </div>

            {(locationError || error) && (
              <p className="mt-4 rounded-2xl bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
                {locationError ?? error}
              </p>
            )}

            <div className={`mt-8 grid grid-cols-1 gap-8 ${showMap ? "xl:grid-cols-[1fr_380px]" : ""}`}>
              {loading ? (
                <div className="flex h-64 items-center justify-center text-muted">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border py-16 text-center">
                  <SearchX size={28} className="mx-auto text-muted" />
                  <p className="mt-3 text-sm font-semibold text-ink">No parking spots match</p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                    Try a different search or loosen your filters.
                  </p>
                  {(activeFilterCount > 0 || query) && (
                    <button
                      onClick={() => {
                        clearFilters();
                        setQuery("");
                        setQueryInput("");
                        updateUrl({ q: "", city: "" });
                      }}
                      className="btn-secondary mt-5"
                    >
                      Reset search
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={
                    view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2" : "flex flex-col gap-5"
                  }
                >
                  {results.map((spot, i) => (
                    <Reveal key={spot.id} delay={Math.min(i, 8) * 0.05}>
                      <div
                        onMouseEnter={() => setActiveId(spot.id)}
                        onMouseLeave={() => setActiveId((cur) => (cur === spot.id ? null : cur))}
                      >
                        <ParkingCard spot={spot} className={view === "list" ? "sm:flex sm:max-w-none" : ""} />
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}

              {showMap && !loading && (
                <div className="hidden xl:block">
                  <div className="sticky top-24 h-[640px] overflow-hidden rounded-3xl border border-border">
                    <MapView
                      spots={results}
                      activeId={activeId}
                      onMarkerClick={setActiveId}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
