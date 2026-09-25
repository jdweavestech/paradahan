import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { PHOTO_BUCKET, supabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

/**
 * Issues a one-time signed upload URL for a spot photo. The browser then
 * uploads the file straight to Supabase Storage, which keeps large images
 * out of our serverless functions (Vercel caps request bodies at ~4.5MB).
 * The bucket itself enforces the 5MB size limit and allowed image types.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "You need to be logged in to upload photos." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { contentType } = body as Record<string, unknown>;
  const ext = typeof contentType === "string" ? EXTENSIONS[contentType] : undefined;
  if (!ext) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF or HEIC images are allowed." }, { status: 400 });
  }

  const path = `${user.id}/${randomUUID()}.${ext}`;
  const bucket = supabase().storage.from(PHOTO_BUCKET);
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[uploads] createSignedUploadUrl failed:", error?.message);
    return NextResponse.json({ error: "Couldn't prepare the upload. Please try again." }, { status: 500 });
  }

  const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ uploadUrl: data.signedUrl, publicUrl });
}
