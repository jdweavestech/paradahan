import type { FavoriteRecord } from "@/lib/types";
import { supabase, unwrap } from "./supabase";

/** Favorites store, backed by the `favorites` table in Supabase. */

export async function getFavoritesByUser(userId: string): Promise<FavoriteRecord[]> {
  const rows = unwrap(
    await supabase()
      .from("favorites")
      .select("user_id, spot_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    "getFavoritesByUser"
  );
  return (rows ?? []).map((r) => ({ userId: r.user_id, spotId: r.spot_id, createdAt: r.created_at }));
}

export async function addFavorite(userId: string, spotId: string): Promise<void> {
  unwrap(
    await supabase()
      .from("favorites")
      .upsert({ user_id: userId, spot_id: spotId }, { onConflict: "user_id,spot_id", ignoreDuplicates: true }),
    "addFavorite"
  );
}

export async function removeFavorite(userId: string, spotId: string): Promise<void> {
  unwrap(
    await supabase().from("favorites").delete().eq("user_id", userId).eq("spot_id", spotId),
    "removeFavorite"
  );
}
