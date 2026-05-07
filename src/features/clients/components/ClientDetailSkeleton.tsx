import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-36 rounded-full" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="bg-muted/30 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-fit">
              <Skeleton className="h-9 flex-1 sm:w-32 sm:flex-none" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-xl border border-border bg-muted/35 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 items-start lg:grid-cols-[3fr_2fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[420px] gap-4 border-b border-border px-4 py-2"
              style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="grid min-w-[420px] gap-4 border-b border-border px-4 py-3 last:border-0"
                style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
              >
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
