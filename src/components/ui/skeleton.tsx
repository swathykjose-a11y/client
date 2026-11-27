import { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card-white border border-sage-border/80 rounded-lg p-3 sm:p-4 space-y-3 shadow-2xs">
      <Skeleton className="w-full aspect-square rounded-md" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-1/3 rounded" />
          <Skeleton className="h-3 w-1/4 rounded opacity-60" />
        </div>
      </div>
    </div>
  );
}
