import { isAdminEmail } from "./admin";
import { supabase, unwrap, unwrapOne } from "./supabase";

/**
 * User store, backed by the `users` table in Supabase (see
 * supabase/schema.sql). Auth itself is still custom (scrypt hashes + signed
 * session cookies); Supabase is just the storage.
 */

export interface UserRecord {
  id: string;
  fullName: string;
  email: string; // stored lowercase
  passwordHash: string;
  createdAt: string;
  resetTokenHash?: string; // sha256 hash of the raw token sent to the user
  resetTokenExpiresAt?: string; // ISO date
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
  reset_token_hash: string | null;
  reset_token_expires_at: string | null;
}

function fromRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    resetTokenHash: row.reset_token_hash ?? undefined,
    resetTokenExpiresAt: row.reset_token_expires_at ?? undefined,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const row = unwrap(
    await supabase().from("users").select("*").eq("email", normalized).maybeSingle<UserRow>(),
    "getUserByEmail"
  );
  return row ? fromRow(row) : null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  // Old session cookies from the JSON store era can carry ids Postgres
  // would reject as malformed uuids — treat those as "no such user".
  if (!UUID_RE.test(id)) return null;
  const row = unwrap(
    await supabase().from("users").select("*").eq("id", id).maybeSingle<UserRow>(),
    "getUserById"
  );
  return row ? fromRow(row) : null;
}

export async function createUser(input: {
  fullName: string;
  email: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const row = unwrapOne(
    await supabase()
      .from("users")
      .insert({
        full_name: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        password_hash: input.passwordHash,
      })
      .select("*")
      .single<UserRow>(),
    "createUser"
  );
  return fromRow(row);
}

export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    isAdmin: isAdminEmail(user.email),
  };
}

export async function setResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<void> {
  unwrap(
    await supabase()
      .from("users")
      .update({ reset_token_hash: tokenHash, reset_token_expires_at: expiresAt })
      .eq("id", userId),
    "setResetToken"
  );
}

/** Looks up a user by a reset token's hash, but only if it hasn't expired. */
export async function getUserByValidResetTokenHash(tokenHash: string): Promise<UserRecord | null> {
  const row = unwrap(
    await supabase()
      .from("users")
      .select("*")
      .eq("reset_token_hash", tokenHash)
      .gt("reset_token_expires_at", new Date().toISOString())
      .maybeSingle<UserRow>(),
    "getUserByValidResetTokenHash"
  );
  return row ? fromRow(row) : null;
}

export async function updateUserProfile(
  userId: string,
  updates: { fullName?: string }
): Promise<void> {
  if (typeof updates.fullName !== "string" || !updates.fullName.trim()) return;
  unwrap(
    await supabase().from("users").update({ full_name: updates.fullName.trim() }).eq("id", userId),
    "updateUserProfile"
  );
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  // A successful reset invalidates the token so it can't be reused.
  unwrap(
    await supabase()
      .from("users")
      .update({ password_hash: passwordHash, reset_token_hash: null, reset_token_expires_at: null })
      .eq("id", userId),
    "updateUserPassword"
  );
}
