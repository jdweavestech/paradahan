import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { ParkingSpot, ParkingSubmission, SubmissionStatus } from "@/lib/types";
import { parkingSpots } from "@/lib/mock-data";

/**
 * Lightweight JSON-file store for community-submitted parking spots.
 *
 * Same stand-in pattern as lib/server/db.ts: a drop-in shape that a real
 * database (Supabase/Postgres/etc.) could replace later without touching
 * the API routes. Not meant for concurrent production traffic (no file
 * locking) — see the README note on when to graduate off this.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "parking-submissions.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf8");
}

function readAll(): ParkingSubmission[] {
  ensureStore();
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as ParkingSubmission[];
  } catch {
    return [];
  }
}

function writeAll(submissions: ParkingSubmission[]) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), "utf8");
}

export function createSubmission(
  input: Omit<ParkingSubmission, "id" | "createdAt" | "status">
): ParkingSubmission {
  const submissions = readAll();
  const submission: ParkingSubmission = {
    ...input,
    id: randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  submissions.push(submission);
  writeAll(submissions);
  return submission;
}

export function getSubmissionsByUser(userId: string): ParkingSubmission[] {
  return readAll()
    .filter((s) => s.submittedBy === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAllSubmissions(status?: SubmissionStatus): ParkingSubmission[] {
  const submissions = readAll();
  const filtered = status ? submissions.filter((s) => s.status === status) : submissions;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSubmissionById(id: string): ParkingSubmission | null {
  return readAll().find((s) => s.id === id) ?? null;
}

/** Admin action: approve or reject a submission. */
export function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewedBy: string,
  reviewNote?: string
): ParkingSubmission | null {
  const submissions = readAll();
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return null;

  submission.status = status;
  submission.reviewedAt = new Date().toISOString();
  submission.reviewedBy = reviewedBy;
  if (reviewNote !== undefined) submission.reviewNote = reviewNote;
  else delete submission.reviewNote;

  writeAll(submissions);
  return submission;
}

/** Admin action: permanently remove a submission (e.g. spam). */
export function deleteSubmission(id: string): boolean {
  const submissions = readAll();
  const next = submissions.filter((s) => s.id !== id);
  if (next.length === submissions.length) return false;
  writeAll(next);
  return true;
}

// Generic parking-lot photo used when a community submission has none —
// keeps the card layout consistent instead of leaving a blank image.
const DEFAULT_SPOT_IMAGE =
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200&auto=format&fit=crop";

function formatTime12h(value: string): string {
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  if (Number.isNaN(h)) return value;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr ?? "00"} ${period}`;
}

/** Converts an approved submission into the same shape the curated seed spots use. */
export function submissionToParkingSpot(sub: ParkingSubmission): ParkingSpot {
  return {
    id: sub.id,
    name: sub.name,
    city: sub.city,
    address: sub.address,
    image: sub.photos[0] ?? DEFAULT_SPOT_IMAGE,
    lat: sub.lat,
    lng: sub.lng,
    priceFrom: sub.rate ?? 0,
    priceUnit: sub.rateUnit,
    hours: sub.isOpen24h
      ? "24 Hours"
      : `${formatTime12h(sub.openingTime)} – ${formatTime12h(sub.closingTime)}`,
    isOpen24h: sub.isOpen24h,
    parkingType: sub.parkingType || "Open-air",
    rating: 0,
    reviewCount: 0,
    vehicleTypes: sub.vehicleTypes,
    amenities: sub.amenities,
    isCommunitySubmitted: true,
    addedAt: sub.reviewedAt ?? sub.createdAt,
  };
}

/** All approved community submissions, converted to the public ParkingSpot shape. */
export function getApprovedSpots(): ParkingSpot[] {
  return getAllSubmissions("approved").map(submissionToParkingSpot);
}

/**
 * Looks up a single spot by id across both the curated seed set and
 * approved community submissions — used by the reviews/reports routes to
 * validate a spotId before writing anything keyed to it.
 */
export function getPublicSpotById(id: string): ParkingSpot | null {
  const seedSpot = parkingSpots.find((s) => s.id === id);
  if (seedSpot) return seedSpot;
  return getApprovedSpots().find((s) => s.id === id) ?? null;
}
