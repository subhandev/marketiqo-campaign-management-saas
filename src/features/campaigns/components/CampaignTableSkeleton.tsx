export function CampaignTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1040px]">
          <div className="grid grid-cols-[minmax(300px,1.25fr)_minmax(280px,0.95fr)_minmax(360px,1.35fr)] gap-6 border-b border-border bg-muted/35 px-5 py-3">
            <div className="h-3 w-24 animate-pulse rounded bg-muted/80" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted/80" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted/80" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(300px,1.25fr)_minmax(280px,0.95fr)_minmax(360px,1.35fr)] gap-6 border-b border-border/50 px-5 py-4 last:border-0"
            >
              <div className="space-y-2">
                <div className="h-4 w-44 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
