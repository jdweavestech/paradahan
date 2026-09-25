import { NextRequest, NextResponse } from "next/server";
import { getUserByValidResetTokenHash, toPublicUser, updateUserPassword } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { hashResetToken } from "@/lib/server/resetToken";
import { issueSessionToken, sessionCookieOptions } from "@/lib/server/session";
import { validateResetPassword } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { token, password } = body as Record<string, unknown>;
  const errors = validateResetPassword({ token, password });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const tokenHash = hashResetToken(String(token));
  const user = await getUserByValidResetTokenHash(tokenHash);

  if (!user) {
    return NextResponse.json(
      { errors: { token: "This reset link is invalid or has expired. Request a new one." } },
      { status: 400 }
    );
  }

  const passwordHash = hashPassword(String(password));
  await updateUserPassword(user.id, passwordHash);

  // Log the user in right away so they land back in the app, not another form.
  const sessionToken = issueSessionToken(user.id, user.email);
  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
  res.cookies.set({ ...sessionCookieOptions(), value: sessionToken });
  return res;
}
