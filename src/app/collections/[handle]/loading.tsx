import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

export default function CollectionLoading() {
  return (
    <section className="py-12 md:py-20 bg-sage-canvas">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        {/* Collection Header Skeleton */}
        <div className="mb-10 md:mb-14 space-y-3">
          <Skeleton className="h-10 md:h-14 w-60 md:w-80 rounded" />
          <Skeleton className="h-4 w-96 max-w-xl rounded" />
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
