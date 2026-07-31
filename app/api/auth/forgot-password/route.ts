import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setResetToken } from "@/lib/server/db";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/server/resetToken";
import { validateForgotPassword } from "@/lib/server/validation";

export const runtime = "nodejs";

/**
 * NOTE: This project has no email-sending integration configured yet
 * (no Resend/SendGrid/SES, etc.). Rather than silently pretend an email
 * went out, we return the reset link directly in the API response so the
 * flow is actually usable end-to-end during development.
 *
 * Before shipping this to real users, wire up an email provider, send the
 * link there instead, and remove `resetUrl` from this response.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email } = body as Record<string, unknown>;
  const errors = validateForgotPassword({ email });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = getUserByEmail(normalizedEmail);

  // Always return the same generic response whether or not the email is
  // registered, so this endpoint can't be used to find out which emails
  // have accounts.
  const genericMessage =
    "If an account exists for that email, a password reset link has been generated.";

  if (!user) {
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }

  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
  setResetToken(user.id, hash, expiresAt);

  const origin = req.nextUrl.origin;
  const resetUrl = `${origin}/reset-password?token=${raw}`;

  // Stand-in for "sending an email" until a real provider is wired up.
  // eslint-disable-next-line no-console
  console.log(`[forgot-password] Reset link for ${user.email}: ${resetUrl}`);

  return NextResponse.json({ message: genericMessage, resetUrl }, { status: 200 });
}
