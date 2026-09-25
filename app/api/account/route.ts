import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { getUserById, toPublicUser, updateUserPassword, updateUserProfile } from "@/lib/server/db";
import { verifyPassword, hashPassword } from "@/lib/server/password";
import { validateProfileUpdate } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errors: { form: "Invalid request body." } }, { status: 400 });
  }

  const { fullName, currentPassword, newPassword } = body as Record<string, unknown>;
  const errors = validateProfileUpdate({ fullName, newPassword });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Changing the password requires re-entering the current one.
  if (typeof newPassword === "string" && newPassword.length > 0) {
    const fullUser = await getUserById(sessionUser.id);
    if (!fullUser || !verifyPassword(String(currentPassword ?? ""), fullUser.passwordHash)) {
      return NextResponse.json(
        { errors: { currentPassword: "Current password is incorrect." } },
        { status: 401 }
      );
    }
    await updateUserPassword(sessionUser.id, hashPassword(newPassword));
  }

  await updateUserProfile(sessionUser.id, { fullName: String(fullName) });

  const updated = await getUserById(sessionUser.id);
  return NextResponse.json({ user: updated ? toPublicUser(updated) : sessionUser });
}
