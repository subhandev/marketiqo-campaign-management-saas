"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Plus, Sparkles, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignTableSkeleton } from "@/features/campaigns/components/CampaignTableSkeleton";
import { useCampaignList } from "@/features/campaigns/hooks/useCampaignList";
import { CampaignListItem, CampaignStatus } from "@/features/campaigns/types";
import { CAMPAIGN_STATUS_CONFIG } from "@/features/campaigns/utils/status";
import { formatCompact } from "@/shared/format/numbers";
import { formatDateShort } from "@/shared/format/dates";
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
  GOOGLE: "bg-amber-50 text-amber-700 border-amber-200",
  "GOOGLE ADS": "bg-amber-50 text-amber-700 border-amber-200",
  META: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "META ADS": "bg-indigo-50 text-indigo-700 border-indigo-200",
  LINKEDIN: "bg-blue-50 text-blue-700 border-blue-200",
  "LINKEDIN ADS": "bg-blue-50 text-blue-700 border-blue-200",
  YOUTUBE: "bg-red-50 text-red-700 border-red-200",
  "YOUTUBE ADS": "bg-red-50 text-red-700 border-red-200",
  TIKTOK: "bg-pink-50 text-pink-700 border-pink-200",
  "TIKTOK ADS": "bg-pink-50 text-pink-700 border-pink-200",
  "TWITTER/X": "bg-zinc-100 text-zinc-700 border-zinc-200",
  X: "bg-zinc-100 text-zinc-700 border-zinc-200",
  EMAIL: "bg-violet-50 text-violet-700 border-violet-200",
  SEO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OTHER: "bg-slate-100 text-slate-600 border-slate-200",
};

const HEALTH_BAR_STYLES: Record<CampaignStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  at_risk: "border-rose-200 bg-rose-50 text-rose-700",
  planned: "border-zinc-200 bg-zinc-100 text-zinc-600",
  completed: "border-zinc-200 bg-zinc-50 text-zinc-500",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

function PlatformBadge({ platform }: { platform: string }) {
  const key = platform.toUpperCase();
  const style = PLATFORM_STYLES[key] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        style
      )}
    >
      {key}
    </span>
  );
}

function HealthArea({
  campaign,
  isLoading,
}: {
  campaign: CampaignListItem;
  isLoading: boolean;
}) {
  const status = campaign.status as CampaignStatus;
  const cfg = CAMPAIGN_STATUS_CONFIG[status];
  const statusClass = HEALTH_BAR_STYLES[status] ?? "bg-zinc-100 text-zinc-500";
  const iconClass =
    status === "at_risk"
      ? "text-orange-600"
      : status === "active"
      ? "text-emerald-600"
      : "text-muted-foreground";
  const insightClass =
    status === "at_risk"
      ? "font-medium text-foreground"
      : status === "completed" || status === "archived"
      ? "text-muted-foreground/70"
      : "text-muted-foreground";

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-52 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "ml-auto flex h-5 w-fit items-center rounded-full border px-2 text-[11px] font-semibold leading-none",
          statusClass
        )}
      >
        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", cfg?.dot ?? "bg-zinc-400")} />
        {cfg?.label ?? campaign.status}
      </div>

      {campaign.latestInsight ? (
        <div className="flex items-start gap-2">
          <Sparkles className={cn("mt-0.5 h-3 w-3 flex-shrink-0", iconClass)} />
          <span className={cn("line-clamp-2 text-xs leading-snug", insightClass)}>
            {campaign.latestInsight.content}
          </span>
        </div>
      ) : (
        <p className={cn("text-xs leading-snug", insightClass)}>
          {campaign._count.metrics === 0 ? "Add metrics to generate insight" : "Insight pending"}
        </p>
      )}
    </div>
  );
}

function MetricChange({ value }: { value: number | null }) {
  if (value === null) return null;

  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "ml-1 inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive ? "text-emerald-600" : "text-rose-600"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value * 100).toFixed(0)}%
    </span>
  );
}

export function CampaignTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { campaigns, isLoading, loadingInsights, error, counts, clientList } = useCampaignList();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    searchParams.get("clientId") ?? "all"
  );

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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        </div>
        <Button className="w-full sm:w-fit" onClick={() => router.push("/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Filter + search row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Pills */}
        <div className="flex w-full max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 lg:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
              )}
            >
              {tab.dot && (
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
              )}
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] leading-none",
                  activeTab === tab.key
                    ? "bg-muted text-foreground"
                    : "bg-background/80 text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + client filter */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full lg:max-w-xs"
          />
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="h-10 w-full border-border bg-muted/50 px-3 shadow-none transition-colors hover:bg-muted/70 focus-visible:bg-background sm:w-44">
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="end"
              className="min-w-[220px] rounded-xl border border-border bg-popover p-1 shadow-lg"
            >
              <SelectItem className="h-9 cursor-pointer rounded-lg pl-2.5 pr-8" value="all">
                All Clients
              </SelectItem>
              {clientList.map((c) => (
                <SelectItem
                  key={c.id}
                  className="h-9 cursor-pointer rounded-lg pl-2.5 pr-8"
                  value={c.id}
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Table */}
      {isLoading ? (
        <CampaignTableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
          No campaigns match your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="w-full overflow-x-auto">
          <div className="min-w-[1040px]">
          {/* Header row */}
          <div className="grid grid-cols-[minmax(300px,1.25fr)_minmax(280px,0.95fr)_minmax(360px,1.35fr)] gap-6 border-b border-border bg-muted/35 px-5 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Campaign
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Performance
            </div>
            <div className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Health &amp; Insight
            </div>
          </div>

          {/* Data rows */}
          {filtered.map((campaign) => {
            const isAtRisk = campaign.status === "at_risk";
            const isGenerating = loadingInsights.has(campaign.id);
            const m = campaign.latestMetric;
            const statusKey = campaign.status as CampaignStatus;
            const accent = CAMPAIGN_STATUS_CONFIG[statusKey]?.accent ?? "bg-transparent";

            return (
              <div
                key={campaign.id}
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                className={cn(
                  "group relative grid cursor-pointer grid-cols-[minmax(300px,1.25fr)_minmax(280px,0.95fr)_minmax(360px,1.35fr)] gap-6 border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20",
                  isAtRisk && "bg-orange-50/20"
                )}
              >
                {/* Left accent bar */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 top-0 w-[2px]",
                    isAtRisk ? accent : "bg-transparent"
                  )}
                />

                {/* Campaign cell */}
                <div className="py-4 pl-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight">
                      {campaign.name}
                    </span>
                    <PlatformBadge platform={campaign.platform} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {campaign.client.name}
                    {(campaign.startDate || campaign.endDate) && (
                      <>
                        {" · "}
                        {formatDateShort(campaign.startDate)} → {formatDateShort(campaign.endDate)}
                      </>
                    )}
                  </div>
                </div>

                {/* Performance cell */}
                <div className="grid grid-cols-3 gap-8 py-4">
                  {/* SPEND */}
                  <div>
                    <div className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Spend
                    </div>
                    {m ? (
                      <div className="text-sm font-semibold">
                        ${formatCompact(m.spend)}
                        <MetricChange value={m.spendChange} />
                        {m.budget > 0 && (
                          <span className="font-normal text-muted-foreground">
                            {" / "}${formatCompact(m.budget)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>

                  {/* CLICKS */}
                  <div>
                    <div className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Clicks
                    </div>
                    {m ? (
                      <div className="text-sm font-semibold">
                        {formatCompact(m.clicks)}
                        <MetricChange value={m.clicksChange} />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>

                  {/* CONV. */}
                  <div>
                    <div className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Conv.
                    </div>
                    {m ? (
                      <div className="text-sm font-semibold">
                        {formatCompact(m.conversions)}
                        <MetricChange value={m.conversionsChange} />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>
                </div>

                {/* Health & Insight cell */}
                <div
                  className={cn(
                    "py-3.5 pl-4 pr-5 transition-colors",
                    isAtRisk && "bg-orange-50/20 group-hover:bg-transparent"
                  )}
                >
                  <HealthArea campaign={campaign} isLoading={isGenerating} />
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
          </div>
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
