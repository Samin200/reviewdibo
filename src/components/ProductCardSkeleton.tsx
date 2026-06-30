/** Premium loading skeleton matching new card design */
export default function ProductCardSkeleton() {
  return (
    <div className="premium-card">
      <div className="aspect-[16/10] w-full bg-slate-200 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-5 w-4/5 rounded bg-slate-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-5/6 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-11 w-full rounded-2xl bg-slate-200 animate-pulse mt-2" />
      </div>
    </div>
  );
}
