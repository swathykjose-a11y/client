import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] bg-sage-canvas flex flex-col justify-start items-center">
      {/* Subtle luxury top loading accent */}
      <div className="w-full h-0.5 bg-neutral-200 overflow-hidden">
        <div className="w-1/3 h-full bg-charcoal animate-[shimmer_1.5s_infinite_linear]" />
      </div>

      {/* Hero / Editorial Placeholder Skeleton */}
      <div className="w-full max-w-6xl px-4 sm:px-8 py-12 md:py-16 space-y-8 animate-pulse">
        <div className="w-full aspect-21/9 sm:aspect-16/7 bg-neutral-200/70 rounded-2xl flex items-center justify-center">
          <div className="space-y-3 text-center px-4 max-w-md">
            <Skeleton className="h-8 md:h-12 w-48 md:w-64 mx-auto bg-neutral-300/60 rounded-lg" />
            <Skeleton className="h-3 w-72 mx-auto bg-neutral-300/40 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Skeleton className="h-40 bg-neutral-200/50 rounded-xl" />
          <Skeleton className="h-40 bg-neutral-200/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
