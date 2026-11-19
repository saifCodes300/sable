export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-sable-beige/80 rounded-none ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-sable-border bg-sable-white">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/3" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
          <Skeleton className="w-3.5 h-3.5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-5 pt-6">
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
