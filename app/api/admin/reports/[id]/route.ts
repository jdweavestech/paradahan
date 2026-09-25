import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/session";
import { updateReportStatus } from "@/lib/server/reportStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { status } = body as Record<string, unknown>;
  if (status !== "open" && status !== "resolved") {
    return NextResponse.json({ error: "status must be 'open' or 'resolved'." }, { status: 400 });
  }

  const updated = await updateReportStatus(params.id, status, user!.fullName);
  if (!updated) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  return NextResponse.json({ report: updated });
}
