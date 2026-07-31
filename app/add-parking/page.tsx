"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  MapPin,
  Info,
  Clock,
  ImagePlus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/shared/Container";

const steps = [
  { title: "Location", icon: MapPin },
  { title: "Details", icon: Info },
  { title: "Hours & Rates", icon: Clock },
  { title: "Photos", icon: ImagePlus },
];

const vehicleTypes = ["Car", "Motorcycle", "Van/SUV", "Truck"];
const parkingTypes = ["Covered", "Open-air", "Multi-level", "Street"];
const amenitiesList = [
  "CCTV",
  "Security Guard",
  "Well-lit",
  "EV Charging",
  "Covered",
  "Elevator Access",
];

export default function AddParkingPage() {
  const [step, setStep] = useState(0);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [parkingType, setParkingType] = useState<string>("");

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const isLast = step === steps.length - 1;

  return (
    <div className="bg-background py-16">
      <Container className="max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">Community Contribution</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Add a Parking Spot
          </h1>
          <p className="mt-3 text-muted">
            Takes about two minutes. Every field helps another driver.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mx-auto mt-12 flex max-w-xl items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{
                    backgroundColor: i <= step ? "#2563EB" : "#FFFFFF",
                    borderColor: i <= step ? "#2563EB" : "#E5E7EB",
                    color: i <= step ? "#FFFFFF" : "#6B7280",
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-soft"
                >
                  {i < step ? <Check size={18} /> : <s.icon size={18} />}
                </motion.div>
                <span
                  className={`hidden text-xs font-semibold sm:block ${
                    i <= step ? "text-ink" : "text-muted"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="card-surface mt-12 overflow-hidden p-8 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div className="space-y-6">
                  <Field label="Parking Name">
                    <input
                      type="text"
                      placeholder="e.g. Ayala Triangle Gardens Parking"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Address">
                    <input
                      type="text"
                      placeholder="Street, Barangay, City"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Map Pin">
                    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-background">
                      <div className="flex flex-col items-center gap-2 text-muted">
                        <MapPin size={24} />
                        <p className="text-sm">Tap the map to drop a pin</p>
                      </div>
                    </div>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <Field label="Description">
                    <textarea
                      rows={4}
                      placeholder="Describe the entrance, landmarks, or anything helpful for drivers"
                      className="input-base resize-none"
                    />
                  </Field>
                  <Field label="Parking Type">
                    <div className="flex flex-wrap gap-2">
                      {parkingTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setParkingType(t)}
                          aria-pressed={parkingType === t}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            parkingType === t
                              ? "border-primary bg-primary text-white"
                              : "border-border text-ink/70 hover:border-primary/40 hover:bg-primary-light/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Vehicle Types Accepted">
                    <div className="flex flex-wrap gap-2">
                      {vehicleTypes.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            toggle(selectedVehicles, setSelectedVehicles, v)
                          }
                          aria-pressed={selectedVehicles.includes(v)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            selectedVehicles.includes(v)
                              ? "border-primary bg-primary text-white"
                              : "border-border text-ink/70 hover:border-primary/40 hover:bg-primary-light/40"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Amenities">
                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() =>
                            toggle(selectedAmenities, setSelectedAmenities, a)
                          }
                          aria-pressed={selectedAmenities.includes(a)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            selectedAmenities.includes(a)
                              ? "border-primary bg-primary text-white"
                              : "border-border text-ink/70 hover:border-primary/40 hover:bg-primary-light/40"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Opening Time">
                      <input type="time" defaultValue="06:00" className="input-base" />
                    </Field>
                    <Field label="Closing Time">
                      <input type="time" defaultValue="22:00" className="input-base" />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2.5 text-sm font-medium text-ink/80">
                    <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                    Open 24 hours
                  </label>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Rate">
                      <input type="number" placeholder="e.g. 40" className="input-base" />
                    </Field>
                    <Field label="Rate Unit">
                      <select className="input-base">
                        <option>Per Hour</option>
                        <option>Per Entry</option>
                        <option>Per Day</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Field label="Photos">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted transition-colors hover:border-primary/40 hover:bg-primary-light/30"
                        >
                          <ImagePlus size={22} />
                          <span className="text-xs font-medium">Upload</span>
                        </div>
                      ))}
                    </div>
                  </Field>
                  <div className="rounded-2xl bg-primary-light/50 p-5 text-sm text-primary-hover">
                    Ready to submit! A moderator will review your entry before
                    it appears publicly.
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost disabled:opacity-0"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() => !isLast && setStep((s) => Math.min(steps.length - 1, s + 1))}
              className="btn-primary"
            >
              {isLast ? "Submit Parking Spot" : "Continue"}
              {!isLast && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}
