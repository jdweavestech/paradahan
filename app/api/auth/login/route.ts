import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, toPublicUser } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/password";
import { issueSessionToken, sessionCookieOptions } from "@/lib/server/session";
import { validateLogin } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;
  const errors = validateLogin({ email, password });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await getUserByEmail(normalizedEmail);

  // Same generic message for "no such user" and "wrong password" so we
  // don't leak which emails are registered.
  const genericError = { errors: { form: "Incorrect email or password." } };

  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return NextResponse.json(genericError, { status: 401 });
  }

  const token = issueSessionToken(user.id, user.email);
  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}
