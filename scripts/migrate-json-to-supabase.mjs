// One-time import of the old local JSON store (data/*.json) into Supabase.
//
//   node --env-file=.env scripts/migrate-json-to-supabase.mjs
//
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, and supabase/schema.sql
// already applied. Safe to re-run: rows are upserted by primary key.
// Base64 photos from old submissions are uploaded to the spot-photos bucket.

import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first (e.g. in .env).");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const DATA_DIR = path.join(process.cwd(), "data");

function load(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    console.warn(`Skipping unreadable ${file}`);
    return [];
  }
}

async function upsert(table, rows, onConflict) {
  if (rows.length === 0) return console.log(`${table}: nothing to import`);
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: imported ${rows.length}`);
}

async function uploadDataUrl(dataUrl, userId) {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return dataUrl; // already a URL
  const [, contentType, b64] = match;
  const ext = contentType.split("/")[1].replace("jpeg", "jpg").replace("+xml", "");
  const objectPath = `${userId}/${randomUUID()}.${ext}`;
  const { error } = await db.storage
    .from("spot-photos")
    .upload(objectPath, Buffer.from(b64, "base64"), { contentType });
  if (error) throw new Error(`photo upload: ${error.message}`);
  return db.storage.from("spot-photos").getPublicUrl(objectPath).data.publicUrl;
}

const users = load("users");
await upsert(
  "users",
  users.map((u) => ({
    id: u.id,
    full_name: u.fullName,
    email: u.email.toLowerCase(),
    password_hash: u.passwordHash,
    created_at: u.createdAt,
    reset_token_hash: u.resetTokenHash ?? null,
    reset_token_expires_at: u.resetTokenExpiresAt ?? null,
  })),
  "id"
);
const userIds = new Set(users.map((u) => u.id));
const known = (id) => userIds.has(id);

const submissions = load("parking-submissions").filter((s) => known(s.submittedBy));
const submissionRows = [];
for (const s of submissions) {
  const photos = [];
  for (const p of s.photos ?? []) photos.push(await uploadDataUrl(p, s.submittedBy));
  submissionRows.push({
    id: s.id,
    submitted_by: s.submittedBy,
    submitted_by_name: s.submittedByName,
    status: s.status,
    created_at: s.createdAt,
    name: s.name,
    address: s.address,
    city: s.city,
    lat: s.lat,
    lng: s.lng,
    description: s.description ?? "",
    parking_type: s.parkingType ?? "",
    vehicle_types: s.vehicleTypes ?? [],
    amenities: s.amenities ?? [],
    opening_time: s.openingTime ?? "",
    closing_time: s.closingTime ?? "",
    is_open_24h: Boolean(s.isOpen24h),
    rate: s.rate,
    rate_unit: s.rateUnit ?? "hour",
    photos,
    reviewed_at: s.reviewedAt ?? null,
    reviewed_by: s.reviewedBy ?? null,
    review_note: s.reviewNote ?? null,
  });
}
await upsert("parking_submissions", submissionRows, "id");

await upsert(
  "favorites",
  load("favorites")
    .filter((f) => known(f.userId))
    .map((f) => ({ user_id: f.userId, spot_id: f.spotId, created_at: f.createdAt })),
  "user_id,spot_id"
);

await upsert(
  "reviews",
  load("reviews")
    .filter((r) => known(r.userId))
    .map((r) => ({
      id: r.id,
      spot_id: r.spotId,
      user_id: r.userId,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      vehicle_type: r.vehicleType,
      date: r.date,
      created_at: r.createdAt,
    })),
  "spot_id,user_id"
);

await upsert(
  "reports",
  load("reports").map((r) => ({
    id: r.id,
    spot_id: r.spotId,
    spot_name: r.spotName,
    reported_by: known(r.reportedBy) ? r.reportedBy : null,
    reported_by_name: r.reportedByName,
    reason: r.reason,
    details: r.details ?? "",
    status: r.status,
    created_at: r.createdAt,
  })),
  "id"
);

console.log("Done.");
