import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key. Every table has
 * RLS enabled with no policies (see supabase/schema.sql), so this key is the
 * only way in — auth and permission checks stay in the API routes, same as
 * with the old JSON store. Never import this from a client component.
 */

export const PHOTO_BUCKET = "spot-photos";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example)."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Next 14 caches fetch() by default in some server contexts; data here
    // must always be fresh.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}

/** Throws a readable error for a failed Supabase call, otherwise returns data. */
export function unwrap<T>(result: { data: T; error: { message: string } | null }, context: string): T {
  if (result.error) throw new Error(`[supabase] ${context}: ${result.error.message}`);
  return result.data;
}

/** Like `unwrap`, for `.single()` calls where a missing row is also an error. */
export function unwrapOne<T>(result: { data: T | null; error: { message: string } | null }, context: string): T {
  const data = unwrap(result, context);
  if (data === null) throw new Error(`[supabase] ${context}: no row returned`);
  return data;
}

/** Public URL prefix for objects in the photo bucket — used to validate submitted photo URLs. */
export function photoPublicUrlPrefix(): string {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/${PHOTO_BUCKET}/`;
}
