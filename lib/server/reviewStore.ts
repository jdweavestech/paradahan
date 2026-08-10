import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { Review, VehicleType } from "@/lib/types";

/**
 * Lightweight JSON-file store for spot reviews. Same stand-in pattern as
 * favoritesStore.ts / parkingStore.ts — a drop-in shape a real database
 * could replace later without touching the API routes.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reviews.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf8");
}

function readAll(): Review[] {
  ensureStore();
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
}

function writeAll(reviews: Review[]) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2), "utf8");
}

export function getReviewsBySpot(spotId: string): Review[] {
  return readAll()
    .filter((r) => r.spotId === spotId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserReviewForSpot(spotId: string, userId: string): Review | null {
  return readAll().find((r) => r.spotId === spotId && r.userId === userId) ?? null;
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
export function upsertReview(input: UpsertReviewInput): Review {
  const reviews = readAll();
  const now = new Date();
  const existingIndex = reviews.findIndex(
    (r) => r.spotId === input.spotId && r.userId === input.userId
  );

  const review: Review = {
    id: existingIndex >= 0 ? reviews[existingIndex].id : randomUUID(),
    spotId: input.spotId,
    userId: input.userId,
    author: input.author,
    rating: input.rating,
    comment: input.comment,
    vehicleType: input.vehicleType,
    date: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    createdAt: now.toISOString(),
  };

  if (existingIndex >= 0) reviews[existingIndex] = review;
  else reviews.push(review);

  writeAll(reviews);
  return review;
}

/**
 * Merges a spot's baked-in seed rating (curated spots ship with a static
 * rating/reviewCount standing in for pre-existing reviews) with real
 * submitted reviews into one weighted average, so new reviews actually
 * move the number instead of being decorative. Community-submitted spots
 * start at 0/0, so for those this is just the real average.
 */
export function getRatingSummary(
  spotId: string,
  baseRating: number,
  baseReviewCount: number
): { rating: number; reviewCount: number } {
  const spotReviews = getReviewsBySpot(spotId);
  const totalCount = baseReviewCount + spotReviews.length;
  if (totalCount === 0) return { rating: 0, reviewCount: 0 };

  const baseTotal = baseRating * baseReviewCount;
  const realTotal = spotReviews.reduce((sum, r) => sum + r.rating, 0);
  const rating = (baseTotal + realTotal) / totalCount;

  return { rating: Math.round(rating * 10) / 10, reviewCount: totalCount };
}
