import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <section className="py-12 md:py-20 lg:py-28 bg-sage-canvas">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        {/* Header Skeleton */}
        <div className="mb-10 md:mb-14 space-y-3">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-9 md:h-12 w-48 md:w-64 rounded" />
          <Skeleton className="h-4 w-80 max-w-lg rounded" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
