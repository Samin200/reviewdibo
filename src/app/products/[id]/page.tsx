"use client";

import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { getProduct, type ProductDetail } from "@/lib/api";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getProduct(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      >
        ← Back to products
      </Link>

      {loading && (
        <div className="grid animate-pulse grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="h-[560px] rounded-[2rem] bg-slate-200" />
          <div className="space-y-6 pt-4">
            <div className="h-14 w-4/5 rounded-2xl bg-slate-200" />
            <div className="h-8 w-52 rounded-xl bg-slate-200" />
            <div className="space-y-3 pt-8">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-11/12 rounded bg-slate-200" />
              <div className="h-4 w-4/5 rounded bg-slate-200" />
            </div>
            <div className="h-14 w-60 rounded-2xl bg-slate-200" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-xl rounded-[2rem] border border-rose-100 bg-white p-12 text-center shadow-xl shadow-rose-100/50">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-3xl text-rose-600">!</div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Something went wrong</h3>
          <p className="mt-2 text-rose-600">{error}</p>
          <button onClick={() => { setLoading(true); load(); }} className="btn-primary mt-8">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && product && (
        <div>
          <section className="grid grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="group relative overflow-hidden rounded-[2.25rem] border border-white bg-white shadow-2xl shadow-slate-300/50 ring-1 ring-slate-900/[0.04]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-[380px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.035] sm:h-[520px] lg:h-[590px]"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center bg-slate-100 text-8xl">📦</div>
              )}
              <div className="absolute inset-x-6 bottom-6 rounded-[1.7rem] border border-white/30 bg-white/82 p-4 shadow-2xl shadow-black/10 backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Verified rating</p>
                    <div className="mt-1 flex items-center gap-3">
                      <StarRating value={product.averageRating} size="sm" />
                      <span className="text-lg font-black text-slate-950">{product.averageRating > 0 ? product.averageRating.toFixed(1) : "—"}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-white">
                    <div className="text-xl font-black leading-none">{product.reviewCount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Reviews</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 lg:pl-3 lg:pt-8">
              <span className="section-label">Customer verified</span>
              <h1 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {product.title}
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                {product.description}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Quality", value: "Verified" },
                  { label: "Buyers", value: "Real" },
                  { label: "Signal", value: "Trusted" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button className="btn-primary h-14 flex-1 text-[15px] sm:flex-none sm:min-w-[220px]">
                  Add to Cart
                </button>
                <button className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.985]">
                  ♡ Save
                </button>
              </div>
            </div>
          </section>

          <section className="mt-20 border-t border-slate-200/70 pt-14">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="section-label">Buyer feedback</span>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  Customer Reviews
                </h2>
                <p className="mt-2 text-slate-500">{product.reviewCount} verified reviews from real shoppers.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <StarRating value={product.averageRating} size="sm" />
                  <span className="text-lg font-black text-slate-950">{product.averageRating > 0 ? product.averageRating.toFixed(1) : "—"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <ReviewList reviews={product.reviews} onRefresh={load} />
              </div>
              <div className="xl:col-span-5">
                <div className="sticky top-24">
                  <ReviewForm productId={product.id} onSubmitted={load} />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
