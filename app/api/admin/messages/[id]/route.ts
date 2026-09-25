import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/session";
import { updateContactMessageStatus } from "@/lib/server/contactStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { status } = body as Record<string, unknown>;
  if (status !== "new" && status !== "handled") {
    return NextResponse.json({ error: "status must be 'new' or 'handled'." }, { status: 400 });
  }

  const updated = await updateContactMessageStatus(params.id, status);
  if (!updated) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }
  return NextResponse.json({ message: updated });
}
