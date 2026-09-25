import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserById, toPublicUser } from "./db";
import { createSessionToken, verifySessionToken } from "./token";

export const SESSION_COOKIE = "paradahan_session";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

/** Build the Set-Cookie options for a new/refreshed session cookie. */
export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  };
}

export function issueSessionToken(userId: string, email: string) {
  return createSessionToken(userId, email, SEVEN_DAYS_SECONDS * 1000);
}

/** Server Component / Route Handler helper: read the current logged-in user, if any. */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.userId);
  if (!user) return null;

  return toPublicUser(user);
}

/**
 * Route Handler helper for admin-only endpoints. Returns the current user
 * if they're an admin, or a `{ response }` with the right status (401 not
 * logged in, 403 logged in but not an admin) to return as-is otherwise.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  if (!user.isAdmin) {
    return { user: null, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { user, response: null };
}
