import { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton-shimmer rounded-xs ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-card-white border border-sage-border/50 rounded-xs overflow-hidden">
      {/* Product Image Placeholder */}
      <div className="relative aspect-square w-full bg-[#f6f8f5]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Product Information Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2 border-t border-sage-border/40 bg-card-white">
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/3 opacity-70" />
        </div>
        <Skeleton className="h-3 w-3 shrink-0 opacity-50" />
      </div>
    </div>
  );
}
