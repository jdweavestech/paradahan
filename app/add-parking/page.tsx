"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  MapPin,
  Info,
  Clock,
  ImagePlus,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2,
  PartyPopper,
  LogIn,
} from "lucide-react";
import Container from "@/components/shared/Container";
import { useSession } from "@/hooks/useSession";
import type { ParkingType, VehicleType } from "@/lib/types";

const LocationPicker = dynamic(
  () => import("@/components/shared/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-border bg-background">
        <p className="text-sm font-medium text-muted">Loading map…</p>
      </div>
    ),
  }
);

const steps = [
  { title: "Location", icon: MapPin },
  { title: "Details", icon: Info },
  { title: "Hours & Rates", icon: Clock },
  { title: "Photos", icon: ImagePlus },
];

const vehicleTypes: VehicleType[] = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];
const parkingTypes: ParkingType[] = ["Covered", "Open-air", "Multi-level", "Street"];
const amenitiesList = [
  "CCTV",
  "Security Guard",
  "Well-lit",
  "EV Charging",
  "Covered",
  "Elevator Access",
];

// Photos are read client-side into small base64 previews and sent as part
// of the JSON submission. Fine for a handful of demo photos; a production
// build should upload straight to object storage (S3/Supabase Storage) and
// only send back the resulting URLs. Keep it small to stay under the API's
// request-size cap.
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function AddParkingPage() {
  const { user, loading: sessionLoading } = useSession();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [parkingType, setParkingType] = useState<ParkingType | "">("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [isOpen24h, setIsOpen24h] = useState(false);
  const [rate, setRate] = useState("");
  const [rateUnit, setRateUnit] = useState<"hour" | "entry" | "day">("hour");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = <T extends string>(list: T[], setList: (v: T[]) => void, value: T) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const isLast = step === steps.length - 1;

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again later
    setPhotoError(null);

    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;

    const accepted: string[] = [];
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError("Each photo should be under 1.5MB.");
        continue;
      }
      accepted.push(await fileToDataUrl(file));
    }
    if (accepted.length) setPhotos((p) => [...p, ...accepted]);
  }

  function removePhoto(index: number) {
    setPhotos((p) => p.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!coords || !user) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/parking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          lat: coords.lat,
          lng: coords.lng,
          description,
          parkingType,
          vehicleTypes: selectedVehicles,
          amenities: selectedAmenities,
          openingTime,
          closingTime,
          isOpen24h,
          rate: rate ? Number(rate) : null,
          rateUnit,
          photos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstError =
          data?.errors && typeof data.errors === "object"
            ? (Object.values(data.errors)[0] as string)
            : data?.error;
        setSubmitError(firstError || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(0);
    setName("");
    setAddress("");
    setCity("");
    setAddressAutoFilled(false);
    setDescription("");
    setSelectedVehicles([]);
    setSelectedAmenities([]);
    setParkingType("");
    setCoords(null);
    setOpeningTime("06:00");
    setClosingTime("22:00");
    setIsOpen24h(false);
    setRate("");
    setRateUnit("hour");
    setPhotos([]);
    setSubmitted(false);
    setSubmitError(null);
  }

  // Logged-out visitors can't submit — a spot needs to be attributed to
  // someone for moderation and for "My Contributions" to make sense.
  if (!sessionLoading && !user) {
    return (
      <div className="bg-background py-16">
        <Container className="max-w-lg text-center">
          <div className="card-surface p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light/60 text-primary">
              <LogIn size={24} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
              Log in to add a parking spot
            </h1>
            <p className="mt-2 text-sm text-muted">
              We ask contributors to sign in so we can credit your submission
              and let you track it under My Contributions.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/login?next=/add-parking" className="btn-primary">
                Log In
              </Link>
              <Link href="/signup?next=/add-parking" className="btn-secondary">
                Sign Up
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-background py-16">
        <Container className="max-w-lg text-center">
          <div className="card-surface p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <PartyPopper size={24} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
              Thanks for the contribution!
            </h1>
            <p className="mt-2 text-sm text-muted">
              A moderator will review "{name}" before it appears publicly.
              You can track its status any time.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/account?tab=contributions" className="btn-primary">
                View My Contributions
              </Link>
              <button onClick={resetForm} className="btn-secondary">
                Add Another Spot
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ayala Triangle Gardens Parking"
                      className="input-base"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Address">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setAddressAutoFilled(false);
                        }}
                        placeholder="Street, Barangay, City"
                        className="input-base"
                      />
                      {addressAutoFilled && (
                        <p className="mt-1.5 text-xs font-medium text-primary">
                          Auto-filled from the map pin — feel free to edit it.
                        </p>
                      )}
                    </Field>
                    <Field label="City">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Makati"
                        className="input-base"
                      />
                    </Field>
                  </div>
                  <Field label="Map Pin">
                    <LocationPicker
                      value={coords}
                      onChange={setCoords}
                      onAddressDetected={(detected, detectedCity) => {
                        setAddress(detected);
                        setAddressAutoFilled(true);
                        if (detectedCity) setCity((prev) => prev || detectedCity);
                      }}
                      className="h-56 w-full"
                    />
                    <p className="mt-2 text-xs text-muted">
                      {coords
                        ? `Pinned at ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                        : "Tap the map (or drag the pin once dropped) to set the exact spot — we'll try to fill in the address for you."}
                    </p>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <Field label="Description">
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                          onClick={() => toggle(selectedVehicles, setSelectedVehicles, v)}
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
                          onClick={() => toggle(selectedAmenities, setSelectedAmenities, a)}
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
                      <input
                        type="time"
                        value={openingTime}
                        onChange={(e) => setOpeningTime(e.target.value)}
                        disabled={isOpen24h}
                        className="input-base disabled:opacity-50"
                      />
                    </Field>
                    <Field label="Closing Time">
                      <input
                        type="time"
                        value={closingTime}
                        onChange={(e) => setClosingTime(e.target.value)}
                        disabled={isOpen24h}
                        className="input-base disabled:opacity-50"
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2.5 text-sm font-medium text-ink/80">
                    <input
                      type="checkbox"
                      checked={isOpen24h}
                      onChange={(e) => setIsOpen24h(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    Open 24 hours
                  </label>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Rate">
                      <input
                        type="number"
                        min={0}
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="e.g. 40"
                        className="input-base"
                      />
                    </Field>
                    <Field label="Rate Unit">
                      <select
                        value={rateUnit}
                        onChange={(e) => setRateUnit(e.target.value as "hour" | "entry" | "day")}
                        className="input-base"
                      >
                        <option value="hour">Per Hour</option>
                        <option value="entry">Per Entry</option>
                        <option value="day">Per Day</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Field label="Photos">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {photos.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
                          <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label="Remove photo"
                            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {photos.length < MAX_PHOTOS && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted transition-colors hover:border-primary/40 hover:bg-primary-light/30"
                        >
                          <ImagePlus size={22} />
                          <span className="text-xs font-medium">Upload</span>
                        </button>
                      )}
                    </div>
                    {photoError && <p className="mt-2 text-xs font-medium text-danger">{photoError}</p>}
                    <p className="mt-2 text-xs text-muted">Up to {MAX_PHOTOS} photos, 1.5MB each. Optional.</p>
                  </Field>
                  <div className="rounded-2xl bg-primary-light/50 p-5 text-sm text-primary-hover">
                    Ready to submit! A moderator will review your entry before
                    it appears publicly.
                  </div>
                  {submitError && (
                    <p className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">
                      {submitError}
                    </p>
                  )}
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
              onClick={() => {
                if (isLast) {
                  handleSubmit();
                } else {
                  setStep((s) => Math.min(steps.length - 1, s + 1));
                }
              }}
              disabled={(step === 0 && (!coords || !name || !address || !city)) || submitting}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  {isLast ? "Submit Parking Spot" : "Continue"}
                  {!isLast && <ArrowRight size={16} />}
                </>
              )}
            </button>
          </div>
          {step === 0 && (!coords || !name || !address || !city) && (
            <p className="mt-3 text-right text-xs text-muted">
              Add a name, address, city, and map pin to continue.
            </p>
          )}
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
