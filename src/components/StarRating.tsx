/**
 * Read-only star rating display. Renders 5 stars and fills them based on the
 * `value` (supports halves via rounding to the nearest 0.5).
 */

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export default function StarRating({
  value,
  size = "md",
  className = "",
}: StarRatingProps) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${SIZE_MAP[size]} ${className}`}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rounded >= star;
        const isHalf = !isFull && rounded >= star - 0.5;
        return (
          <span key={star} className="relative leading-none h-em w-em">
            <span className="text-gray-200">★</span>
            {(isFull || isHalf) && (
              <span
                className={`absolute inset-0 overflow-hidden text-amber-400 ${
                  isHalf ? "w-1/2" : "w-full"
                }`}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
