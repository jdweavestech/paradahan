"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePublicSpots } from "@/hooks/usePublicSpots";
import ParkingCard from "../shared/ParkingCard";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import Reveal from "../shared/Reveal";

export default function RecentlyAdded() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { spots, loading } = usePublicSpots();

  // Community submissions carry an addedAt date, so they surface first;
  // the curated seed set (no addedAt) fills the rest in its original order.
  const ordered = useMemo(() => {
    if (!spots) return [];
    return [...spots].sort((a, b) => {
      if (a.addedAt && b.addedAt) return b.addedAt.localeCompare(a.addedAt);
      if (a.addedAt) return -1;
      if (b.addedAt) return 1;
      return 0;
    });
  }, [spots]);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({
      left: dir * 340,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Fresh from the community"
            title="Recently added parking"
            description="New spaces mapped by drivers in the last few days."
          />
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white transition-colors hover:border-primary/40 hover:bg-primary-light/40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white transition-colors hover:border-primary/40 hover:bg-primary-light/40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <Reveal delay={0.15}>
          {loading ? (
            <div className="mt-10 flex h-40 items-center justify-center text-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <div
              ref={scrollerRef}
              className="no-scrollbar mt-10 flex gap-5 overflow-x-auto scroll-smooth pb-4"
            >
              {ordered.map((spot) => (
                <ParkingCard
                  key={spot.id}
                  spot={spot}
                  className="w-[300px] shrink-0 sm:w-[320px]"
                />
              ))}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
