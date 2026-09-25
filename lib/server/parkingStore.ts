import type { ParkingSpot, ParkingSubmission, SubmissionStatus } from "@/lib/types";
import { parkingSpots } from "@/lib/mock-data";
import { PHOTO_BUCKET, photoPublicUrlPrefix, supabase, unwrap, unwrapOne } from "./supabase";

/**
 * Community-submitted parking spots, backed by the `parking_submissions`
 * table in Supabase. Curated seed spots still live in lib/mock-data.ts and
 * are merged in at read time.
 */

interface SubmissionRow {
  id: string;
  submitted_by: string;
  submitted_by_name: string;
  status: SubmissionStatus;
  created_at: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  parking_type: string;
  vehicle_types: string[];
  amenities: string[];
  opening_time: string;
  closing_time: string;
  is_open_24h: boolean;
  rate: number | string | null;
  rate_unit: "hour" | "entry" | "day";
  photos: string[];
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
}

function fromRow(row: SubmissionRow): ParkingSubmission {
  return {
    id: row.id,
    submittedBy: row.submitted_by,
    submittedByName: row.submitted_by_name,
    status: row.status,
    createdAt: row.created_at,
    name: row.name,
    address: row.address,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    parkingType: row.parking_type as ParkingSubmission["parkingType"],
    vehicleTypes: row.vehicle_types as ParkingSubmission["vehicleTypes"],
    amenities: row.amenities,
    openingTime: row.opening_time,
    closingTime: row.closing_time,
    isOpen24h: row.is_open_24h,
    // numeric columns come back as strings from PostgREST
    rate: row.rate === null ? null : Number(row.rate),
    rateUnit: row.rate_unit,
    photos: row.photos ?? [],
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewNote: row.review_note ?? undefined,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createSubmission(
  input: Omit<ParkingSubmission, "id" | "createdAt" | "status">
): Promise<ParkingSubmission> {
  const row = unwrapOne(
    await supabase()
      .from("parking_submissions")
      .insert({
        submitted_by: input.submittedBy,
        submitted_by_name: input.submittedByName,
        name: input.name,
        address: input.address,
        city: input.city,
        lat: input.lat,
        lng: input.lng,
        description: input.description,
        parking_type: input.parkingType,
        vehicle_types: input.vehicleTypes,
        amenities: input.amenities,
        opening_time: input.openingTime,
        closing_time: input.closingTime,
        is_open_24h: input.isOpen24h,
        rate: input.rate,
        rate_unit: input.rateUnit,
        photos: input.photos,
      })
      .select("*")
      .single<SubmissionRow>(),
    "createSubmission"
  );
  return fromRow(row);
}

export async function getSubmissionsByUser(userId: string): Promise<ParkingSubmission[]> {
  const rows = unwrap(
    await supabase()
      .from("parking_submissions")
      .select("*")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false })
      .returns<SubmissionRow[]>(),
    "getSubmissionsByUser"
  );
  return (rows ?? []).map(fromRow);
}

export async function getAllSubmissions(status?: SubmissionStatus): Promise<ParkingSubmission[]> {
  let query = supabase().from("parking_submissions").select("*");
  if (status) query = query.eq("status", status);
  const rows = unwrap(
    await query.order("created_at", { ascending: false }).returns<SubmissionRow[]>(),
    "getAllSubmissions"
  );
  return (rows ?? []).map(fromRow);
}

export async function getSubmissionById(id: string): Promise<ParkingSubmission | null> {
  if (!UUID_RE.test(id)) return null;
  const row = unwrap(
    await supabase().from("parking_submissions").select("*").eq("id", id).maybeSingle<SubmissionRow>(),
    "getSubmissionById"
  );
  return row ? fromRow(row) : null;
}

/** Admin action: approve or reject a submission. */
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewedBy: string,
  reviewNote?: string
): Promise<ParkingSubmission | null> {
  if (!UUID_RE.test(id)) return null;
  const row = unwrap(
    await supabase()
      .from("parking_submissions")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        review_note: reviewNote ?? null,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle<SubmissionRow>(),
    "updateSubmissionStatus"
  );
  return row ? fromRow(row) : null;
}

/** Admin action: permanently remove a submission (e.g. spam), including its photos. */
export async function deleteSubmission(id: string): Promise<boolean> {
  const existing = await getSubmissionById(id);
  if (!existing) return false;

  unwrap(await supabase().from("parking_submissions").delete().eq("id", id), "deleteSubmission");

  const prefix = photoPublicUrlPrefix();
  const paths = existing.photos
    .filter((url) => url.startsWith(prefix))
    .map((url) => decodeURIComponent(url.slice(prefix.length)));
  if (paths.length > 0) {
    // Best effort — a leftover orphaned photo isn't worth failing the delete over.
    const { error } = await supabase().storage.from(PHOTO_BUCKET).remove(paths);
    if (error) console.warn(`[parkingStore] couldn't remove photos for ${id}: ${error.message}`);
  }
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
    photos: sub.photos,
    description: sub.description || undefined,
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
export async function getApprovedSpots(): Promise<ParkingSpot[]> {
  return (await getAllSubmissions("approved")).map(submissionToParkingSpot);
}

/**
 * Looks up a single spot by id across both the curated seed set and
 * approved community submissions — used by the reviews/reports routes to
 * validate a spotId before writing anything keyed to it.
 */
export async function getPublicSpotById(id: string): Promise<ParkingSpot | null> {
  const seedSpot = parkingSpots.find((s) => s.id === id);
  if (seedSpot) return seedSpot;
  const sub = await getSubmissionById(id);
  return sub && sub.status === "approved" ? submissionToParkingSpot(sub) : null;
}
