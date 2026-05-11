import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="mt-1.5 h-4 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-card lg:col-span-2">
          <div className="flex items-start gap-2">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-[hsl(var(--border))] p-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-card lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

