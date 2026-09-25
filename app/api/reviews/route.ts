import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { validateReview } from "@/lib/server/validation";
import { getReviewsBySpot, upsertReview } from "@/lib/server/reviewStore";
import { getPublicSpotById } from "@/lib/server/parkingStore";
import type { VehicleType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const spotId = req.nextUrl.searchParams.get("spotId");
  if (!spotId) {
    return NextResponse.json({ error: "spotId is required." }, { status: 400 });
  }
  return NextResponse.json({ reviews: await getReviewsBySpot(spotId) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { errors: { form: "You need to be logged in to write a review." } },
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
  const spotId = typeof input.spotId === "string" ? input.spotId : "";
  if (!spotId || !(await getPublicSpotById(spotId))) {
    return NextResponse.json(
      { errors: { form: "That parking spot couldn't be found." } },
      { status: 404 }
    );
  }

  const errors = validateReview(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const review = await upsertReview({
    spotId,
    userId: user.id,
    author: user.fullName,
    rating: Number(input.rating),
    comment: String(input.comment).trim(),
    vehicleType: input.vehicleType as VehicleType,
  });

  return NextResponse.json({ review }, { status: 201 });
}
