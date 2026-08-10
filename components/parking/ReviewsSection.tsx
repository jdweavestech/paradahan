"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import type { VehicleType } from "@/lib/types";

const VEHICLE_TYPES: VehicleType[] = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];

export default function ReviewsSection({
  spotId,
  currentUser,
  onReviewSaved,
}: {
  spotId: string;
  currentUser: { id: string } | null;
  /** Called after a review is successfully saved — used to refresh the
   * spot's aggregate rating shown elsewhere on the page. */
  onReviewSaved?: () => void;
}) {
  const { reviews, loading, error, refresh } = useReviews(spotId);
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [vehicleType, setVehicleType] = useState<VehicleType>("Car");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const myReview = currentUser
    ? reviews?.find((r) => r.userId === currentUser.id) ?? null
    : null;

  function openForm() {
    if (!currentUser) {
      router.push(`/login?next=/parking/${spotId}`);
      return;
    }
    setRating(myReview?.rating ?? 0);
    setVehicleType(myReview?.vehicleType ?? "Car");
    setComment(myReview?.comment ?? "");
    setFormErrors({});
    setFormOpen(true);
  }

  async function submitReview() {
    setSubmitting(true);
    setFormErrors({});
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId, rating, comment, vehicleType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormErrors(data.errors ?? { form: "Something went wrong." });
        return;
      }
      setFormOpen(false);
      refresh();
      onReviewSaved?.();
    } catch {
      setFormErrors({ form: "Network error — please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">
          Community Reviews{reviews ? ` (${reviews.length})` : ""}
        </h2>
        {!formOpen && (
          <button onClick={openForm} className="btn-secondary !py-2.5 !px-5 text-xs">
            {myReview ? "Edit Your Review" : "Write a Review"}
          </button>
        )}
      </div>

      {formOpen && (
        <div className="card-surface mt-4 p-6">
          <p className="text-sm font-semibold text-ink">Your rating</p>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                className="p-0.5"
              >
                <Star
                  size={22}
                  className={
                    n <= (hoverRating || rating)
                      ? "fill-warning text-warning"
                      : "text-ink/20"
                  }
                />
              </button>
            ))}
          </div>
          {formErrors.rating && (
            <p className="mt-1 text-xs font-medium text-danger">{formErrors.rating}</p>
          )}

          <div className="mt-4">
            <label className="text-sm font-semibold text-ink">Vehicle type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="input-base mt-1.5 text-sm"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-ink">Your review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share what parking here was like…"
              className="input-base mt-1.5 text-sm"
            />
            {formErrors.comment && (
              <p className="mt-1 text-xs font-medium text-danger">{formErrors.comment}</p>
            )}
          </div>

          {formErrors.form && (
            <p className="mt-3 text-xs font-medium text-danger">{formErrors.form}</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={submitReview}
              disabled={submitting || rating === 0}
              className="btn-primary !py-2.5 !px-5 text-xs disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {myReview ? "Update Review" : "Submit Review"}
            </button>
            <button
              onClick={() => setFormOpen(false)}
              disabled={submitting}
              className="btn-ghost !py-2.5 !px-5 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        )}

        {!loading && error && <p className="text-sm text-danger">{error}</p>}

        {!loading && !error && reviews && reviews.length === 0 && (
          <p className="text-sm text-muted">
            No reviews yet — be the first to share what parking here is like.
          </p>
        )}

        {!loading &&
          reviews?.map((review) => (
            <div key={review.id} className="card-surface p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-hover">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{review.author}</p>
                    <p className="text-xs text-muted">
                      {review.date} · {review.vehicleType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={13} className="fill-warning" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/80">{review.comment}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
