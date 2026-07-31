import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export default function StarRating({
  rating,
  reviewCount,
  size = 14,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Star size={size} className="fill-warning text-warning" />
      <span className="text-sm font-semibold text-ink">
        {rating.toFixed(1)}
      </span>
      {typeof reviewCount === "number" && (
        <span className="text-sm text-muted">({reviewCount})</span>
      )}
    </div>
  );
}
