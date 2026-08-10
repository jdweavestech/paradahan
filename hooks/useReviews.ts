"use client";

import { useCallback, useEffect, useState } from "react";
import type { Review } from "@/lib/types";

/** Fetches the real submitted reviews for one spot from /api/reviews. */
export function useReviews(spotId: string | undefined) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!spotId) return;
    fetch(`/api/reviews?spotId=${encodeURIComponent(spotId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => {
        setReviews([]);
        setError("Couldn't load reviews. Please try again.");
      });
  }, [spotId]);

  useEffect(() => {
    setReviews(null);
    setError(null);
    refresh();
  }, [refresh]);

  return { reviews, loading: reviews === null, error, refresh };
}
