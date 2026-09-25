"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, ArrowUpRight, SearchX } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import { cities } from "@/lib/mock-data";
import { usePublicSpots } from "@/hooks/usePublicSpots";
import { slugify } from "@/lib/search";
import type { CityInfo } from "@/lib/types";

const FALLBACK_CITY_IMAGE =
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200&auto=format&fit=crop";

function spotLabel(count: number) {
  return `${count} parking ${count === 1 ? "spot" : "spots"}`;
}

export default function CitiesPage() {
  const { spots } = usePublicSpots();
  const [search, setSearch] = useState("");

  // Curated cities first, then any city that only exists because of an
  // approved community submission. Counts come from the live spot list.
  const allCities = useMemo<CityInfo[]>(() => {
    const counts = new Map<string, number>();
    const names = new Map<string, string>();
    for (const s of spots ?? []) {
      const id = slugify(s.city);
      counts.set(id, (counts.get(id) ?? 0) + 1);
      if (!names.has(id)) names.set(id, s.city);
    }
    const known = cities.map((c) => ({ ...c, parkingCount: counts.get(c.id) ?? 0 }));
    const extra = Array.from(names.entries())
      .filter(([id]) => !cities.some((c) => c.id === id))
      .map(([id, name]) => ({
        id,
        name,
        region: "Philippines",
        parkingCount: counts.get(id) ?? 0,
        image: FALLBACK_CITY_IMAGE,
      }));
    return [...known, ...extra];
  }, [spots]);

  const term = search.trim().toLowerCase();
  const filtered = term
    ? allCities.filter((c) => `${c.name} ${c.region}`.toLowerCase().includes(term))
    : allCities;
  const featured = term ? [] : filtered.slice(0, 3);
  const rest = term ? filtered : filtered.slice(3);

  return (
    <div className="bg-background pb-24">
      {/* Hero */}
      <section className="bg-dark py-20 text-center">
        <Container>
          <Reveal className="mx-auto max-w-2xl">
            <span className="eyebrow border border-white/15 bg-white/10 text-white">
              Cities
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Parking, mapped city by city
            </h1>
            <p className="mt-4 text-base text-white/60 sm:text-lg">
              Browse every city Paradahan currently covers, from busy
              business districts to island getaways.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full bg-white/10 px-5 py-3.5 backdrop-blur-md">
              <Search size={18} className="text-white/60" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search a city"
                placeholder="Search a city..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Featured cities */}
      {featured.length > 0 && (
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Featured" title="Most searched cities" />

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((city, i) => (
              <Reveal key={city.id} delay={i * 0.1}>
                <Link
                  href={`/search?city=${city.id}`}
                  className="group relative block h-80 overflow-hidden rounded-3xl shadow-soft"
                >
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-xl font-bold text-white">
                      {city.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                      <MapPin size={13} />
                      {city.region} · {spots ? spotLabel(city.parkingCount) : "…"}
                    </p>
                  </div>
                  <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={16} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      )}

      {/* Popular cities grid */}
      <section className={term ? "py-16" : "py-8"}>
        <Container>
          <SectionHeading
            eyebrow={term ? "Results" : "All Cities"}
            title={term ? `Cities matching “${search.trim()}”` : "Popular cities"}
          />

          {term && rest.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-border py-14 text-center">
              <SearchX size={28} className="mx-auto text-muted" />
              <p className="mt-3 text-sm font-semibold text-ink">No cities found</p>
              <p className="mt-1 text-sm text-muted">
                Know a spot there? <Link href="/add-parking" className="font-semibold text-primary">Add it</Link>.
              </p>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((city, i) => (
              <Reveal key={city.id} delay={i * 0.08}>
                <Link
                  href={`/search?city=${city.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-ink">
                      {city.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {city.region}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {spots ? spotLabel(city.parkingCount) : "…"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
