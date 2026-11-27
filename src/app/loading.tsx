import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full bg-sage-canvas">
      {/* 1. Full-Viewport Hero Section Skeleton */}
      <section className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-charcoal/95">
        <div className="relative z-10 text-center px-4 max-w-5xl my-auto flex flex-col items-center gap-6">
          <div className="h-14 sm:h-20 md:h-28 lg:h-36 w-64 sm:w-96 md:w-128 bg-white/10 rounded-xs animate-pulse" />
          <div className="h-3.5 w-72 sm:w-96 bg-white/10 rounded-xs animate-pulse" />
          <div className="h-11 w-36 border border-white/25 bg-white/5 rounded-xs mt-2 animate-pulse" />
        </div>
      </section>

      {/* 2. Featured Collections Section Skeleton */}
      <section className="py-16 md:py-24 lg:py-32 bg-sage-canvas">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left Column: Eyebrow, Serif Headline, Description, CTA */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <Skeleton className="h-2.5 w-24 mb-4" />
                <div className="space-y-2.5">
                  <Skeleton className="h-9 md:h-11 lg:h-12 w-3/4" />
                  <Skeleton className="h-9 md:h-11 lg:h-12 w-2/3" />
                  <Skeleton className="h-9 md:h-11 lg:h-12 w-1/2" />
                </div>
                <div className="mt-6 space-y-2 max-w-sm">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>
              </div>

              <div className="mt-8">
                <Skeleton className="h-10 w-36" />
              </div>
            </div>

            {/* Right Column: 2-Card Product Grid */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
