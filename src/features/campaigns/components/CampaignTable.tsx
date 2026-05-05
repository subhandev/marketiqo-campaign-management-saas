"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, MoreHorizontal, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampaignList } from "@/features/campaigns/hooks/useCampaignList";
import { CampaignListItem } from "@/features/campaigns/types";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "needs_attention" | "active" | "planned" | "completed";

const TAB_TO_STATUS: Record<string, string | null> = {
  all: null,
  needs_attention: "at_risk",
  active: "active",
  planned: "planned",
  completed: "completed",
};

const PLATFORM_STYLES: Record<string, string> = {
  GOOGLE: "bg-blue-50 text-blue-700 border-blue-200",
  META: "bg-indigo-50 text-indigo-700 border-indigo-200",
  LINKEDIN: "bg-sky-50 text-sky-700 border-sky-200",
  TIKTOK: "bg-pink-50 text-pink-700 border-pink-200",
  X: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const STATUS_BADGE: Record<string, { bg: string; dot: string }> = {
  at_risk:   { bg: "bg-orange-50 text-orange-700 border-orange-200",  dot: "bg-orange-500" },
  active:    { bg: "bg-green-50 text-green-700 border-green-200",     dot: "bg-green-500" },
  planned:   { bg: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-blue-400" },
  completed: { bg: "bg-zinc-100 text-zinc-500 border-zinc-200",       dot: "bg-zinc-400" },
  inactive:  { bg: "bg-zinc-100 text-zinc-500 border-zinc-200",       dot: "bg-zinc-400" },
};

const ACCENT_BAR: Record<string, string> = {
  at_risk:   "bg-orange-500",
  active:    "bg-green-500",
  planned:   "bg-blue-400",
  completed: "bg-transparent",
  inactive:  "bg-transparent",
};

function capitalize(s: string) {
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace(/_/g, " ");
}

function formatK(n: number): string {
  if (n >= 1000) {
    const v = (n / 1000).toFixed(1);
    return v.endsWith(".0") ? v.slice(0, -2) + "k" : v + "k";
  }
  return String(Math.round(n));
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PlatformBadge({ platform }: { platform: string }) {
  const key = platform.toUpperCase();
  const style = PLATFORM_STYLES[key] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md border", style)}>
      {key}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { bg, dot } = STATUS_BADGE[status] ?? STATUS_BADGE.inactive;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border", bg)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />
      {capitalize(status)}
    </span>
  );
}

function InsightArea({
  campaign,
  isLoading,
}: {
  campaign: CampaignListItem;
  isLoading: boolean;
}) {
  if (campaign._count.metrics === 0) return null;

  if (isLoading) {
    return <div className="w-52 h-3 rounded bg-muted animate-pulse mt-1.5" />;
  }

  if (!campaign.latestInsight) return null;

  return (
    <div className="flex items-start gap-1 mt-1.5">
      <Sparkles className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
      <span className="text-xs text-muted-foreground leading-snug">
        {campaign.latestInsight.content}
      </span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden mt-4">
      <div className="bg-muted/50 border-b border-border px-6 py-3 flex items-center gap-4">
        <div className="flex-[2.5] h-3 w-24 bg-muted/80 animate-pulse rounded" />
        <div className="flex-[3] h-3 w-20 bg-muted/80 animate-pulse rounded" />
        <div className="min-w-[280px] h-3 w-28 bg-muted/80 animate-pulse rounded" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center border-b border-border last:border-0 px-6 py-4 gap-4">
          <div className="flex-[2.5] space-y-2">
            <div className="h-4 w-44 bg-muted animate-pulse rounded" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex-[3] flex gap-6">
            <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
            <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
            <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
          </div>
          <div className="min-w-[280px] space-y-2">
            <div className="h-5 w-20 bg-muted animate-pulse rounded-md" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CampaignTable() {
  const router = useRouter();
  const { campaigns, isLoading, loadingInsights, error, counts, clientList } = useCampaignList();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  const filtered = campaigns
    .filter((c) => {
      const status = TAB_TO_STATUS[activeTab];
      return status === null || c.status === status;
    })
    .filter((c) => selectedClientId === "all" || c.client.id === selectedClientId)
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.client.name.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q)
      );
    });

  const tabs: { key: FilterTab; label: string; count: number; dot?: boolean }[] = [
    { key: "all",              label: "All",             count: counts.all },
    { key: "needs_attention",  label: "Needs attention", count: counts.needs_attention, dot: true },
    { key: "active",           label: "Active",          count: counts.active },
    { key: "planned",          label: "Planned",         count: counts.planned },
    { key: "completed",        label: "Completed",       count: counts.completed },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.needs_attention > 0 && (
              <span className="text-orange-600 font-medium">
                {counts.needs_attention}{" "}
                {counts.needs_attention === 1 ? "campaign needs" : "campaigns need"} attention
                {" · "}
              </span>
            )}
            {counts.active} active · {counts.planned} planned
          </p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Campaign
        </Button>
      </div>

      {/* Filter + search row */}
      <div className="flex items-center justify-between gap-4">
        {/* Pills */}
        <div className="inline-flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.dot && (
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
              )}
              {tab.label} {tab.count}
            </button>
          ))}
        </div>

        {/* Search + client filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            />
          </div>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clientList.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive mt-4">{error}</p>}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-background rounded-xl border border-border shadow-sm mt-4 flex items-center justify-center py-20 text-sm text-muted-foreground">
          No campaigns match your filters.
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden mt-4">
          {/* Header row */}
          <div className="bg-muted/50 border-b border-border px-6 py-3 flex items-center">
            <div className="flex-[2.5] text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Campaign
            </div>
            <div className="flex-[3] pl-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Performance
            </div>
            <div className="min-w-[280px] pl-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Health &amp; Insight
            </div>
          </div>

          {/* Data rows */}
          {filtered.map((campaign) => {
            const isAtRisk = campaign.status === "at_risk";
            const isGenerating = loadingInsights.has(campaign.id);
            const m = campaign.latestMetric;
            const accent = ACCENT_BAR[campaign.status] ?? "bg-transparent";

            return (
              <div
                key={campaign.id}
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                className="relative group flex items-stretch border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                {/* Left accent bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", accent)} />

                {/* Campaign cell */}
                <div className="flex-[2.5] pl-6 pr-4 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{campaign.name}</span>
                    <PlatformBadge platform={campaign.platform} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {campaign.client.name}
                    {(campaign.startDate || campaign.endDate) && (
                      <>
                        {" · "}
                        {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
                      </>
                    )}
                  </div>
                </div>

                {/* Performance cell */}
                <div className="flex-[3] px-4 py-4 flex flex-row gap-6">
                  {/* SPEND */}
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                      Spend
                    </div>
                    {m ? (
                      <div className="text-sm font-medium">
                        ${formatK(m.spend)}
                        {m.budget > 0 && (
                          <span className="text-muted-foreground font-normal">
                            {" / "}${formatK(m.budget)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>

                  {/* CLICKS */}
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                      Clicks
                    </div>
                    {m ? (
                      <div className="text-sm font-medium">{formatK(m.clicks)}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>

                  {/* CONV. */}
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                      Conv.
                    </div>
                    {m ? (
                      <div className="text-sm font-medium">{formatK(m.conversions)}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>
                </div>

                {/* Health & Insight cell */}
                <div
                  className={cn(
                    "min-w-[280px] px-4 py-4",
                    isAtRisk && "bg-orange-50/40"
                  )}
                >
                  <StatusBadge status={campaign.status} />
                  <InsightArea campaign={campaign} isLoading={isGenerating} />
                </div>

                {/* Overflow menu — absolute, appears on hover */}
                <button
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 px-1">
          Sorted by priority · Updated just now
        </p>
      )}
    </div>
  );
}
