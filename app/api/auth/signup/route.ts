import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, toPublicUser } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { issueSessionToken, sessionCookieOptions } from "@/lib/server/session";
import { validateSignup } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { fullName, email, password } = body as Record<string, unknown>;
  const errors = validateSignup({ fullName, email, password });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (await getUserByEmail(normalizedEmail)) {
    return NextResponse.json(
      { errors: { email: "An account with this email already exists." } },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(String(password));
  const user = await createUser({
    fullName: String(fullName),
    email: normalizedEmail,
    passwordHash,
  });

  const token = issueSessionToken(user.id, user.email);
  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}
