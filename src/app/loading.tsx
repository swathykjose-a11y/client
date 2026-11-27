import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-12 md:py-20 bg-sage-canvas">
      {/* Header skeleton */}
      <div className="mb-10 md:mb-14 space-y-3">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-10 md:h-12 w-64 md:w-80 rounded" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* Grid of product card skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
