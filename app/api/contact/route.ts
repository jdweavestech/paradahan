import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { validateContactMessage } from "@/lib/server/validation";
import { createContactMessage } from "@/lib/server/contactStore";
import type { ContactSubject } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errors: { form: "Invalid request body." } }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  // Honeypot: real users never see or fill the "website" field.
  if (typeof input.website === "string" && input.website.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const errors = validateContactMessage(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const user = await getCurrentUser();
  await createContactMessage({
    fullName: String(input.fullName).trim(),
    email: String(input.email).trim().toLowerCase(),
    subject: input.subject as ContactSubject,
    message: String(input.message).trim(),
    userId: user?.id,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
