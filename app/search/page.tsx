"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  Map as MapIcon,
  Loader2,
} from "lucide-react";
import Container from "@/components/shared/Container";
import ParkingCard from "@/components/shared/ParkingCard";
import Reveal from "@/components/shared/Reveal";
import { usePublicSpots } from "@/hooks/usePublicSpots";

const MapView = dynamic(() => import("@/components/shared/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-primary-light/40">
      <p className="text-sm font-semibold text-primary-hover">Loading map…</p>
    </div>
  ),
});

const vehicleFilters = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];
const typeFilters = ["Covered", "Open-air", "Multi-level", "Street"];

export default function SearchPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showMap, setShowMap] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { spots, loading } = usePublicSpots();
  const results = spots ?? [];

  return (
    <div className="bg-background">
      {/* Search header */}
      <section className="border-b border-border bg-white py-8">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
              <MapPin size={18} className="text-primary" />
              <input
                type="text"
                defaultValue="Makati City"
                className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none"
              />
            </div>
            <button className="btn-secondary">
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <button className="btn-primary">Search</button>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          {/* Filters sidebar */}
          <aside className="hidden lg:block">
            <div className="card-surface sticky top-24 space-y-8 p-6">
              <div>
                <h3 className="text-sm font-bold text-ink">Price Range</h3>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={60}
                  className="mt-4 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>₱0</span>
                  <span>₱100+/hr</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-ink">Vehicle Type</h3>
                <div className="mt-3 space-y-2.5">
                  {vehicleFilters.map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2.5 text-sm text-ink/80"
                    >
                      <input
                        type="checkbox"
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
                    <label
                      key={t}
                      className="flex items-center gap-2.5 text-sm text-ink/80"
                    >
                      <input
                        type="checkbox"
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
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Open 24 hours
                </label>
              </div>

              <button className="btn-ghost w-full justify-center border border-border">
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">
                <span className="font-bold text-ink">
                  {results.length}
                </span>{" "}
                parking spaces found
              </p>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/5">
                  Sort: Nearest
                  <ChevronDown size={14} />
                </button>

                <div className="flex items-center rounded-full border border-border p-1">
                  <button
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      view === "grid"
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-ink/5"
                    }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    aria-label="List view"
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      view === "list"
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-ink/5"
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

            <div
              className={`mt-8 grid grid-cols-1 gap-8 ${
                showMap ? "xl:grid-cols-[1fr_380px]" : ""
              }`}
            >
              {loading ? (
                <div className="flex h-64 items-center justify-center text-muted">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : (
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2"
                      : "flex flex-col gap-5"
                  }
                >
                  {results.map((spot, i) => (
                    <Reveal key={spot.id} delay={i * 0.05}>
                      <div
                        onMouseEnter={() => setActiveId(spot.id)}
                        onMouseLeave={() =>
                          setActiveId((cur) => (cur === spot.id ? null : cur))
                        }
                      >
                        <ParkingCard
                          spot={spot}
                          className={view === "list" ? "sm:flex sm:max-w-none" : ""}
                        />
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
