import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setResetToken } from "@/lib/server/db";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/server/resetToken";
import { validateForgotPassword } from "@/lib/server/validation";
import { isEmailConfigured, passwordResetEmail, sendEmail } from "@/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends the reset link by email (Resend — see lib/server/email.ts).
 *
 * Outside production, when no email provider is configured, the link is
 * also returned in the response so the flow is testable locally. That
 * fallback is never used in production: returning the link there would let
 * anyone reset anyone else's password.
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
  const user = await getUserByEmail(normalizedEmail);

  // Always return the same generic response whether or not the email is
  // registered, so this endpoint can't be used to find out which emails
  // have accounts.
  const genericMessage =
    "If an account exists for that email, we've sent a link to reset your password.";

  if (!user) {
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }

  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
  await setResetToken(user.id, hash, expiresAt);

  const origin = process.env.APP_URL?.replace(/\/$/, "") || req.nextUrl.origin;
  const resetUrl = `${origin}/reset-password?token=${raw}`;

  if (isEmailConfigured()) {
    await sendEmail({ to: user.email, ...passwordResetEmail(user.fullName, resetUrl) });
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "[forgot-password] RESEND_API_KEY / EMAIL_FROM are not set — reset email was not sent."
    );
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }

  // Local dev without an email provider.
  console.log(`[forgot-password] Reset link for ${user.email}: ${resetUrl}`);
  return NextResponse.json({ message: genericMessage, resetUrl }, { status: 200 });
}
