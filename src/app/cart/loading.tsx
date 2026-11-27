import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <section className="py-12 md:py-20 bg-sage-canvas">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-8 md:h-10 w-36 rounded" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-card-white border border-sage-border/70 rounded-xl p-4 sm:p-5 flex gap-4 items-center"
              >
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3.5 w-1/4 rounded" />
                  <div className="pt-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box skeleton */}
          <div className="bg-card-white border border-sage-border/70 rounded-xl p-6 space-y-5 h-fit">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
              <div className="pt-3 border-t border-sage-border/50 flex justify-between">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
