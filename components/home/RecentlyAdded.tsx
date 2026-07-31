"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parkingSpots } from "@/lib/mock-data";
import ParkingCard from "../shared/ParkingCard";
import Container from "../shared/Container";
import SectionHeading from "../shared/SectionHeading";
import Reveal from "../shared/Reveal";

export default function RecentlyAdded() {
  const scrollerRef = useRef<HTMLDivElement>(null);

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
          <div
            ref={scrollerRef}
            className="no-scrollbar mt-10 flex gap-5 overflow-x-auto scroll-smooth pb-4"
          >
            {parkingSpots.map((spot) => (
              <ParkingCard
                key={spot.id}
                spot={spot}
                className="w-[300px] shrink-0 sm:w-[320px]"
              />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
