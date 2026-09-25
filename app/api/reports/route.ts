import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib/server/session";
import { validateReport } from "@/lib/server/validation";
import { createReport, getAllReports } from "@/lib/server/reportStore";
import { getPublicSpotById } from "@/lib/server/parkingStore";
import type { ReportReason, ReportStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { errors: { form: "You need to be logged in to report a listing." } },
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
  const spot = spotId ? await getPublicSpotById(spotId) : null;
  if (!spot) {
    return NextResponse.json(
      { errors: { form: "That parking spot couldn't be found." } },
      { status: 404 }
    );
  }

  const errors = validateReport(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const report = await createReport({
    spotId,
    spotName: spot.name,
    reportedBy: user.id,
    reportedByName: user.fullName,
    reason: input.reason as ReportReason,
    details: typeof input.details === "string" ? input.details.trim() : "",
  });

  return NextResponse.json({ report }, { status: 201 });
}

// Admin-only: backs the Reports tab of the /admin moderation panel.
export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const param = req.nextUrl.searchParams.get("status");
  const status: ReportStatus | undefined = param === "open" || param === "resolved" ? param : undefined;
  return NextResponse.json({ reports: await getAllReports(status) });
}
