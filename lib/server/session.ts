import { cookies } from "next/headers";
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

  const user = getUserById(payload.userId);
  if (!user) return null;

  return toPublicUser(user);
}
