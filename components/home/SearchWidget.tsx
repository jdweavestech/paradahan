"use client";

import { useState } from "react";
import { MapPin, Car, Search } from "lucide-react";
import { popularSearches } from "@/lib/mock-data";

const vehicleOptions = ["Car", "Motorcycle", "Van/SUV", "Truck"];

export default function SearchWidget() {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full max-w-3xl">
      <div
        className={`flex flex-col gap-2 rounded-3xl bg-white/95 p-2.5 shadow-lift backdrop-blur-xl transition-shadow duration-300 sm:flex-row sm:items-center ${
          focused ? "shadow-glow" : ""
        }`}
      >
        <div className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3.5 sm:border-r sm:border-border">
          <MapPin size={18} className="shrink-0 text-primary" />
          <input
            type="text"
            placeholder="Where do you need to park?"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 sm:w-48">
          <Car size={18} className="shrink-0 text-primary" />
          <select
            defaultValue="Car"
            className="w-full appearance-none bg-transparent text-sm font-medium text-ink focus:outline-none"
          >
            {vehicleOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary w-full shrink-0 sm:w-auto">
          <Search size={17} />
          Search
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="text-sm text-white/70">Popular:</span>
        {popularSearches.map((tag) => (
          <button
            key={tag}
            className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
