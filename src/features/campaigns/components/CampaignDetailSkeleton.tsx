import { Skeleton } from "@/components/ui/skeleton";

export function CampaignDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl">

      {/* Back */}
      <Skeleton className="h-6 w-36" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* 🔥 Actions (important) */}
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-8 w-28" /> {/* Add Metrics */}
          <Skeleton className="h-8 w-36" /> {/* AI Report */}
          <Skeleton className="h-8 w-8" />  {/* menu */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>

      {/* Metric cards (more realistic) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>

            {/* Bigger value */}
            <Skeleton className="h-8 w-20" />

            {/* subtle trend line */}
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* 🔥 Chart placeholder (future-ready) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Campaign Info */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <Skeleton className="h-4 w-44" />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights (styled closer to real) */}
        <div>
          <div className="rounded-xl border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand-soft))] p-5 space-y-4">
            
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-10 rounded-full ml-auto" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/60 border space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>

            <Skeleton className="h-4 w-32 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}