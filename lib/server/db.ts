import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/**
 * Lightweight JSON-file user store.
 *
 * This project doesn't have a database wired up yet, so this module is a
 * drop-in stand-in: the same shape (getUserByEmail / createUser / etc.)
 * that a Prisma/Postgres-backed lib/server/db.ts would expose. When a real
 * database is ready, swap the implementations in this file only — nothing
 * in the API routes needs to change.
 *
 * Not meant for concurrent production traffic (no file locking), but is
 * safe and simple for local dev / a single-instance deployment.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

export interface UserRecord {
  id: string;
  fullName: string;
  email: string; // stored lowercase
  passwordHash: string;
  createdAt: string;
  resetTokenHash?: string; // sha256 hash of the raw token sent to the user
  resetTokenExpiresAt?: string; // ISO date
}

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf8");
}

function readAll(): UserRecord[] {
  ensureStore();
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as UserRecord[];
  } catch {
    return [];
  }
}

function writeAll(users: UserRecord[]) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function getUserByEmail(email: string): UserRecord | null {
  const normalized = email.trim().toLowerCase();
  const users = readAll();
  return users.find((u) => u.email === normalized) ?? null;
}

export function getUserById(id: string): UserRecord | null {
  const users = readAll();
  return users.find((u) => u.id === id) ?? null;
}

export function createUser(input: {
  fullName: string;
  email: string;
  passwordHash: string;
}): UserRecord {
  const users = readAll();
  const user: UserRecord = {
    id: randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);
  return user;
}

export function toPublicUser(user: UserRecord) {
  return { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
}

export function setResetToken(userId: string, tokenHash: string, expiresAt: string): void {
  const users = readAll();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  user.resetTokenHash = tokenHash;
  user.resetTokenExpiresAt = expiresAt;
  writeAll(users);
}

/** Looks up a user by a reset token's hash, but only if it hasn't expired. */
export function getUserByValidResetTokenHash(tokenHash: string): UserRecord | null {
  const users = readAll();
  const user = users.find((u) => u.resetTokenHash === tokenHash);
  if (!user) return null;
  if (!user.resetTokenExpiresAt || new Date(user.resetTokenExpiresAt).getTime() < Date.now()) {
    return null;
  }
  return user;
}

export function updateUserPassword(userId: string, passwordHash: string): void {
  const users = readAll();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  user.passwordHash = passwordHash;
  // A successful reset invalidates the token so it can't be reused.
  delete user.resetTokenHash;
  delete user.resetTokenExpiresAt;
  writeAll(users);
}
