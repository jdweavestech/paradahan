import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { validateParkingSubmission } from "@/lib/server/validation";
import { createSubmission, getApprovedSpots, getSubmissionsByUser } from "@/lib/server/parkingStore";
import { getRatingSummary } from "@/lib/server/reviewStore";
import { parkingSpots } from "@/lib/mock-data";
import type { VehicleType, ParkingType } from "@/lib/types";

export const runtime = "nodejs";

// Small safety cap so a handful of base64 photo previews can't blow up the
// JSON file store. Swap for real object storage (S3/Supabase Storage) before
// accepting production traffic — see README.
const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { errors: { form: "You need to be logged in to add a parking spot." } },
      { status: 401 }
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { errors: { form: "That submission is too large. Try fewer or smaller photos." } },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ errors: { form: "Invalid request body." } }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const errors = validateParkingSubmission(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const submission = createSubmission({
    submittedBy: user.id,
    submittedByName: user.fullName,
    name: String(input.name).trim(),
    address: String(input.address).trim(),
    city: typeof input.city === "string" ? input.city.trim() : "",
    lat: Number(input.lat),
    lng: Number(input.lng),
    description: typeof input.description === "string" ? input.description.trim() : "",
    parkingType: (input.parkingType as ParkingType) ?? "",
    vehicleTypes: Array.isArray(input.vehicleTypes) ? (input.vehicleTypes as VehicleType[]) : [],
    amenities: Array.isArray(input.amenities) ? (input.amenities as string[]) : [],
    openingTime: typeof input.openingTime === "string" ? input.openingTime : "",
    closingTime: typeof input.closingTime === "string" ? input.closingTime : "",
    isOpen24h: Boolean(input.isOpen24h),
    rate: typeof input.rate === "number" ? input.rate : null,
    rateUnit: (input.rateUnit as "hour" | "entry" | "day") ?? "hour",
    photos: Array.isArray(input.photos) ? (input.photos as string[]).slice(0, 3) : [],
  });

  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const mine = req.nextUrl.searchParams.get("mine");
  if (mine === "true") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    return NextResponse.json({ submissions: getSubmissionsByUser(user.id) });
  }

  // Public listing: the curated seed set plus any approved community
  // submissions, merged into one list so Search/Home/detail pages don't
  // need to know the difference. Each spot's rating/reviewCount is
  // recomputed here to fold in real submitted reviews on top of the
  // curated set's baked-in seed numbers (community spots start at 0/0,
  // so for those it's just the real average).
  const spots = [...parkingSpots, ...getApprovedSpots()].map((spot) => ({
    ...spot,
    ...getRatingSummary(spot.id, spot.rating, spot.reviewCount),
  }));
  return NextResponse.json({ spots });
}
