import { NextRequest, NextResponse } from "next/server";
import { validateNewsletter } from "@/lib/server/validation";
import { addNewsletterSubscriber } from "@/lib/server/contactStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errors: { email: "Invalid request body." } }, { status: 400 });
  }

  const { email } = body as Record<string, unknown>;
  const errors = validateNewsletter({ email });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  await addNewsletterSubscriber(String(email));
  return NextResponse.json({ subscribed: true }, { status: 201 });
}
