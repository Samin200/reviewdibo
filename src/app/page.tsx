"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts, type ProductSummary } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

type MinRating = "all" | "4" | "3";

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<MinRating>("all");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const min = minRating === "all" ? 0 : Number(minRating);
    return products.filter((p) => {
      const matchesQuery = p.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesRating = p.averageRating >= min;
      return matchesQuery && matchesRating;
    });
  }, [products, query, minRating]);

  const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      {/* ==================== HERO ==================== */}
      <section className="hero-bg relative px-5 pb-16 pt-28 text-white sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-white/90 backdrop-blur-xl sm:text-sm">
            <svg className="h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Trusted by thousands of real buyers
          </div>

          {/* Headline */}
          <h1 className="mt-7 text-5xl font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[88px]">
            Find Products
            <span className="mt-1 block bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              You Can Trust
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/70 sm:text-lg md:text-xl">
            Real reviews from real people. Make smarter buying decisions with authentic community feedback.
          </p>

          {/* Search bar */}
          <div className="relative mt-9 w-full max-w-2xl sm:mt-10">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 sm:left-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              placeholder="Search products by name..."
              className="hero-search"
            />
            <div
              className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                query.trim()
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4 pointer-events-none"
              }`}
            >
              <button
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-9 grid w-full max-w-lg grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
            {[
              { label: "Real buyers", value: "100%" },
              { label: "Products", value: products.length || 10 },
              { label: "Reviews", value: totalReviews || 20 },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 backdrop-blur-xl sm:px-4">
                <div className="text-xl font-black text-white sm:text-2xl">{stat.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT DISCOVERY ==================== */}
      <section id="products" className="subtle-noise relative mx-auto w-full max-w-7xl px-5 pb-24 pt-16 scroll-mt-16 sm:px-6 lg:px-8">
        <div className="relative z-10">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="section-label">Curated marketplace</span>
              <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                  All Products
                </h2>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-black text-slate-700 shadow-sm sm:px-4 sm:py-2">
                  {filtered.length} shown
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Browse beautifully organized products, inspect verified ratings, and jump straight into real customer feedback.
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white/80 p-2 shadow-lg shadow-slate-200/50 backdrop-blur-xl sm:w-auto">
              {[
                { id: "all", label: "All" },
                { id: "4", label: "4+ Stars" },
                { id: "3", label: "3+ Stars" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setMinRating(pill.id as MinRating)}
                  className={`filter-pill flex-1 sm:flex-none ${minRating === pill.id ? "filter-pill-active" : "filter-pill-inactive"}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-rose-100 bg-white p-12 text-center shadow-xl shadow-rose-100/50">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-3xl text-rose-600">!</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950">Couldn’t load products</h3>
              <p className="mt-2 text-rose-600">{error}</p>
              <button onClick={load} className="btn-primary mt-8 bg-rose-600 hover:bg-rose-700">
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white px-6 py-20 text-center shadow-xl shadow-slate-200/60">
              <div className="mb-6 rounded-[2rem] bg-slate-50 p-6 text-6xl">🔍</div>
              <h3 className="text-3xl font-black tracking-tight text-slate-950">No matches found</h3>
              <p className="mt-3 max-w-md text-slate-500">Try a different product name or lower the minimum rating filter.</p>
              <button
                onClick={() => { setQuery(""); setMinRating("all"); }}
                className="btn-primary mt-8"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
