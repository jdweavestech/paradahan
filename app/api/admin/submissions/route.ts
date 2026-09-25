import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/session";
import { getAllSubmissions } from "@/lib/server/parkingStore";
import type { SubmissionStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES: SubmissionStatus[] = ["pending", "approved", "rejected"];

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const statusParam = req.nextUrl.searchParams.get("status");
  const status =
    statusParam && VALID_STATUSES.includes(statusParam as SubmissionStatus)
      ? (statusParam as SubmissionStatus)
      : undefined;

  return NextResponse.json({ submissions: await getAllSubmissions(status) });
}
