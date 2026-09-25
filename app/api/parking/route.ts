import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { validateParkingSubmission } from "@/lib/server/validation";
import { createSubmission, getApprovedSpots, getSubmissionsByUser } from "@/lib/server/parkingStore";
import { getAllReviewStats, mergeRating } from "@/lib/server/reviewStore";
import { photoPublicUrlPrefix } from "@/lib/server/supabase";
import { parkingSpots } from "@/lib/mock-data";
import type { VehicleType, ParkingType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VEHICLE_TYPES: VehicleType[] = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];
const PARKING_TYPES: ParkingType[] = ["Covered", "Open-air", "Multi-level", "Street"];
const RATE_UNITS = ["hour", "entry", "day"] as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_PHOTOS = 3;

function cleanString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { errors: { form: "You need to be logged in to add a parking spot." } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errors: { form: "Invalid request body." } }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const errors = validateParkingSubmission(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Photos are uploaded straight to Supabase Storage (see /api/uploads);
  // only accept URLs that point at our own bucket.
  const photoPrefix = photoPublicUrlPrefix();
  const photos = Array.isArray(input.photos)
    ? (input.photos as unknown[])
        .filter((p): p is string => typeof p === "string" && p.startsWith(photoPrefix))
        .slice(0, MAX_PHOTOS)
    : [];

  const rate = typeof input.rate === "number" && Number.isFinite(input.rate) && input.rate >= 0 ? input.rate : null;
  const rateUnit = RATE_UNITS.includes(input.rateUnit as (typeof RATE_UNITS)[number])
    ? (input.rateUnit as (typeof RATE_UNITS)[number])
    : "hour";
  const openingTime = typeof input.openingTime === "string" && TIME_RE.test(input.openingTime) ? input.openingTime : "";
  const closingTime = typeof input.closingTime === "string" && TIME_RE.test(input.closingTime) ? input.closingTime : "";

  const submission = await createSubmission({
    submittedBy: user.id,
    submittedByName: user.fullName,
    name: cleanString(input.name, 150),
    address: cleanString(input.address, 300),
    city: cleanString(input.city, 100),
    lat: Number(input.lat),
    lng: Number(input.lng),
    description: cleanString(input.description, 2000),
    parkingType: PARKING_TYPES.includes(input.parkingType as ParkingType) ? (input.parkingType as ParkingType) : "",
    vehicleTypes: Array.isArray(input.vehicleTypes)
      ? VEHICLE_TYPES.filter((v) => (input.vehicleTypes as unknown[]).includes(v))
      : [],
    amenities: Array.isArray(input.amenities)
      ? (input.amenities as unknown[])
          .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
          .map((a) => a.trim().slice(0, 50))
          .slice(0, 20)
      : [],
    openingTime,
    closingTime,
    isOpen24h: Boolean(input.isOpen24h) || !openingTime || !closingTime,
    rate,
    rateUnit,
    photos,
  });

  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const mine = req.nextUrl.searchParams.get("mine");
  if (mine === "true") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    return NextResponse.json({ submissions: await getSubmissionsByUser(user.id) });
  }

  // Public listing: the curated seed set plus any approved community
  // submissions, merged into one list so Search/Home/detail pages don't
  // need to know the difference. Each spot's rating/reviewCount is
  // recomputed here to fold in real submitted reviews on top of the
  // curated set's baked-in seed numbers (community spots start at 0/0,
  // so for those it's just the real average).
  const [approved, stats] = await Promise.all([getApprovedSpots(), getAllReviewStats()]);
  const spots = [...parkingSpots, ...approved].map((spot) => ({
    ...spot,
    ...mergeRating(spot.rating, spot.reviewCount, stats.get(spot.id)),
  }));
  return NextResponse.json({ spots });
}
