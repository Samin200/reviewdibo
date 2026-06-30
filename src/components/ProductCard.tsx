import Link from "next/link";
import type { ProductSummary } from "@/lib/api";
import StarRating from "./StarRating";

export default function ProductCard({ product }: { product: ProductSummary }) {
  const { id, title, description, imageUrl, averageRating, reviewCount } = product;

  const ratingLabel = averageRating >= 4.6 ? "Loved" : averageRating >= 4 ? "Great" : "Reviewed";

  return (
    <article className="premium-card group relative">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <Link href={`/products/${id}`} className="product-image-wrapper relative block aspect-[16/10] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <span className="text-5xl">📦</span>
          </div>
        )}

        <div className="absolute left-4 top-4 z-10 rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-lg backdrop-blur-xl">
          {ratingLabel}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link href={`/products/${id}`} className="block">
          <h3 className="line-clamp-2 text-xl font-black leading-tight tracking-[-0.04em] text-slate-950 transition-colors group-hover:text-indigo-600">
            {title}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-[14.5px] leading-relaxed text-slate-500">
          {description}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <StarRating value={averageRating} size="sm" />
              <span className="text-sm font-black text-slate-950 tabular-nums">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>

          <Link
            href={`/products/${id}`}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/25 active:scale-[0.985]"
          >
            View Details
            <span className="ml-1.5 text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
