import type { Review, VehicleType } from "@/lib/types";
import { supabase, unwrap, unwrapOne } from "./supabase";

/** Spot reviews, backed by the `reviews` table in Supabase. */

interface ReviewRow {
  id: string;
  spot_id: string;
  user_id: string;
  author: string;
  rating: number;
  comment: string;
  vehicle_type: VehicleType;
  date: string;
  created_at: string;
}

function fromRow(row: ReviewRow): Review {
  return {
    id: row.id,
    spotId: row.spot_id,
    userId: row.user_id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    vehicleType: row.vehicle_type,
    date: row.date,
    createdAt: row.created_at,
  };
}

export async function getReviewsBySpot(spotId: string): Promise<Review[]> {
  const rows = unwrap(
    await supabase()
      .from("reviews")
      .select("*")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false })
      .returns<ReviewRow[]>(),
    "getReviewsBySpot"
  );
  return (rows ?? []).map(fromRow);
}

export interface UpsertReviewInput {
  spotId: string;
  userId: string;
  author: string;
  rating: number;
  comment: string;
  vehicleType: VehicleType;
}

/**
 * Creates a new review, or overwrites the same user's existing review for
 * that spot (one review per user per spot — resubmitting edits it in place
 * rather than piling up duplicates).
 */
export async function upsertReview(input: UpsertReviewInput): Promise<Review> {
  const now = new Date();
  const row = unwrapOne(
    await supabase()
      .from("reviews")
      .upsert(
        {
          spot_id: input.spotId,
          user_id: input.userId,
          author: input.author,
          rating: input.rating,
          comment: input.comment,
          vehicle_type: input.vehicleType,
          date: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          created_at: now.toISOString(),
        },
        { onConflict: "spot_id,user_id" }
      )
      .select("*")
      .single<ReviewRow>(),
    "upsertReview"
  );
  return fromRow(row);
}

/** Review count and rating sum for every spot that has at least one review. */
export async function getAllReviewStats(): Promise<Map<string, { count: number; total: number }>> {
  const rows = unwrap(
    await supabase().from("review_stats").select("spot_id, review_count, rating_total"),
    "getAllReviewStats"
  );
  const stats = new Map<string, { count: number; total: number }>();
  for (const r of rows ?? []) {
    stats.set(r.spot_id, { count: r.review_count, total: r.rating_total });
  }
  return stats;
}

/**
 * Merges a spot's baked-in seed rating (curated spots ship with a static
 * rating/reviewCount standing in for pre-existing reviews) with real
 * submitted reviews into one weighted average, so new reviews actually
 * move the number instead of being decorative. Community-submitted spots
 * start at 0/0, so for those this is just the real average.
 */
export function mergeRating(
  baseRating: number,
  baseReviewCount: number,
  real: { count: number; total: number } | undefined
): { rating: number; reviewCount: number } {
  const realCount = real?.count ?? 0;
  const totalCount = baseReviewCount + realCount;
  if (totalCount === 0) return { rating: 0, reviewCount: 0 };

  const rating = (baseRating * baseReviewCount + (real?.total ?? 0)) / totalCount;
  return { rating: Math.round(rating * 10) / 10, reviewCount: totalCount };
}
