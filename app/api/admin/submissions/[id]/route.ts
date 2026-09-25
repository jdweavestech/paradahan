import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/session";
import {
  deleteSubmission,
  getSubmissionById,
  updateSubmissionStatus,
} from "@/lib/server/parkingStore";
import type { SubmissionStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const existing = await getSubmissionById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { status, reviewNote } = body as Record<string, unknown>;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'." },
      { status: 400 }
    );
  }

  const updated = await updateSubmissionStatus(
    params.id,
    status as SubmissionStatus,
    user!.fullName,
    typeof reviewNote === "string" ? reviewNote.trim() || undefined : undefined
  );

  return NextResponse.json({ submission: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const deleted = await deleteSubmission(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
