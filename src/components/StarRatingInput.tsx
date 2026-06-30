"use client";

import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export default function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className={`text-4xl leading-none transition-all duration-200 hover:scale-110 focus:outline-none ${
              disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer active:scale-95"
            } ${star <= active ? "text-amber-400" : "text-gray-200"}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-500">
        {value > 0 ? `${value} / 5` : "Click to rate"}
      </span>
    </div>
  );
}
