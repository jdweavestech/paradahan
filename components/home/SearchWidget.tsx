"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Car, Search } from "lucide-react";
import { popularSearches } from "@/lib/mock-data";

const vehicleOptions = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];

export default function SearchWidget() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [vehicle, setVehicle] = useState("Car");

  function go(q: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("vehicle", vehicle);
    router.push(`/search?${params.toString()}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    go(query);
  }

  return (
    <div className="w-full max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2 rounded-3xl bg-white/95 p-2.5 shadow-lift backdrop-blur-xl transition-shadow duration-300 sm:flex-row sm:items-center ${
          focused ? "shadow-glow" : ""
        }`}
      >
        <div className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3.5 sm:border-r sm:border-border">
          <MapPin size={18} className="shrink-0 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where do you need to park?"
            aria-label="Where do you need to park?"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 sm:w-48">
          <Car size={18} className="shrink-0 text-primary" />
          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            aria-label="Vehicle type"
            className="w-full appearance-none bg-transparent text-sm font-medium text-ink focus:outline-none"
          >
            {vehicleOptions.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary w-full shrink-0 sm:w-auto">
          <Search size={17} />
          Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="text-sm text-white/70">Popular:</span>
        {popularSearches.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => go(tag)}
            className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
