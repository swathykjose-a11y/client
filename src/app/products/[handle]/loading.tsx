import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <section className="min-h-[calc(100vh-80px)] bg-sage-canvas">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
        {/* Left: Product Image Skeleton */}
        <div className="relative bg-[#E8E4DF] min-h-[420px] lg:min-h-full flex items-center justify-center p-8 sm:p-12">
          <Skeleton className="w-full max-w-md aspect-square rounded-xl shadow-xs" />
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 space-y-8">
          <div className="space-y-6 max-w-lg">
            {/* Tag / Category */}
            <Skeleton className="h-3.5 w-24 rounded" />

            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 w-4/5 rounded" />
              <Skeleton className="h-8 sm:h-10 w-2/3 rounded" />
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-28 rounded" />
              <Skeleton className="h-5 w-20 rounded opacity-60" />
            </div>

            {/* Variant Pills Skeleton */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-16 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>

            {/* Description lines */}
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>

          {/* Action button skeleton */}
          <div className="pt-6 max-w-lg">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
