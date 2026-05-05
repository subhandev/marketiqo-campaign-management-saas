"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCampaignList } from "@/features/campaigns/hooks/useCampaigns";
import { CampaignListItem, CampaignStatus } from "@/features/campaigns/types";
import { cn } from "@/lib/utils";

type FilterTab = "all" | CampaignStatus;

const PLATFORM_STYLES: Record<string, string> = {
  GOOGLE: "bg-blue-50 text-blue-700 border-blue-200",
  META: "bg-indigo-50 text-indigo-700 border-indigo-200",
  LINKEDIN: "bg-sky-50 text-sky-700 border-sky-200",
  TIKTOK: "bg-pink-50 text-pink-700 border-pink-200",
  X: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const STATUS_STYLES: Record<string, string> = {
  at_risk: "bg-orange-50 text-orange-700 border-orange-200",
  active: "bg-green-50 text-green-700 border-green-200",
  planned: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const STATUS_DOT: Record<string, string> = {
  at_risk: "bg-orange-500",
  active: "bg-green-500",
  planned: "bg-blue-500",
  completed: "bg-zinc-400",
  archived: "bg-zinc-400",
};

function formatK(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PlatformBadge({ platform }: { platform: string }) {
  const key = platform.toUpperCase();
  const style = PLATFORM_STYLES[key] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded border inline-block", style)}>
      {key}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.archived;
  const dot = STATUS_DOT[status] ?? "bg-zinc-400";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border",
        style
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />
      {status.replace("_", " ")}
    </span>
  );
}

function ClicksCell({
  clicks,
  clicksChange,
}: {
  clicks: number;
  clicksChange: number | null;
}) {
  return (
    <div className="flex items-center gap-1">
      <span>{clicks.toLocaleString()}</span>
      {clicksChange !== null && (
        <span
          className={cn(
            "text-xs flex items-center",
            clicksChange >= 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {clicksChange >= 0 ? (
            <TrendingUp className="h-3 w-3 mr-0.5" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-0.5" />
          )}
          {Math.abs(Math.round(clicksChange * 100))}%
        </span>
      )}
    </div>
  );
}

function InsightCell({
  campaign,
  isGenerating,
}: {
  campaign: CampaignListItem;
  isGenerating: boolean;
}) {
  if (!campaign.latestMetric) return null;

  if (isGenerating && !campaign.latestInsight) {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <Sparkles className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
        <div className="w-48 h-3 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!campaign.latestInsight) return null;

  return (
    <div className="flex items-start gap-1.5 mt-1">
      <Sparkles className="h-3 w-3 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
      <span className="text-xs text-muted-foreground leading-tight line-clamp-2">
        {campaign.latestInsight.content}
      </span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 border-b border-border/50"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
            <div className="h-3 w-40 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CampaignTable() {
  const router = useRouter();
  const { campaigns, isLoading, error, generatingIds } = useCampaignList();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const countBy = (status: CampaignStatus) =>
    campaigns.filter((c) => c.status === status).length;

  const atRiskCount = countBy("at_risk");
  const activeCount = countBy("active");
  const plannedCount = countBy("planned");
  const completedCount = countBy("completed");

  const filtered = campaigns
    .filter((c) => activeTab === "all" || c.status === activeTab)
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.client.name.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q)
      );
    });

  const tabs: { key: FilterTab; label: string; count: number; dot?: string }[] = [
    { key: "all", label: "All", count: campaigns.length },
    { key: "at_risk", label: "Needs attention", count: atRiskCount, dot: "bg-orange-500" },
    { key: "active", label: "Active", count: activeCount },
    { key: "planned", label: "Planned", count: plannedCount },
    { key: "completed", label: "Completed", count: completedCount },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm mt-0.5">
            {atRiskCount > 0 && (
              <>
                <span className="text-orange-600 font-medium">
                  {atRiskCount} {atRiskCount === 1 ? "campaign needs" : "campaigns need"} attention
                </span>
                <span className="text-muted-foreground"> · </span>
              </>
            )}
            <span className="text-muted-foreground">
              {activeCount} active · {plannedCount} planned
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-muted-foreground">
            Filters
          </Button>
          <Button size="sm" onClick={() => router.push("/campaigns/new")}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Filter tabs + search row */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60">
        <div className="flex items-center gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.dot && (
                <span className={cn("w-1.5 h-1.5 rounded-full", tab.dot)} />
              )}
              {tab.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.key
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs text-muted-foreground">
            All clients
          </Button>
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button className="p-1.5 bg-muted/60 hover:bg-muted transition-colors">
              <List className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button className="p-1.5 hover:bg-muted/40 transition-colors">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive py-4">{error}</p>}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          No campaigns match your search.
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-2.5 w-[34%]">
                Campaign
              </th>
              <th
                className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-2.5"
                colSpan={3}
              >
                Performance
              </th>
              <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-2.5 w-[28%]">
                Health &amp; Insight
              </th>
              <th className="w-8" />
            </tr>
            <tr className="border-b border-border/40 bg-muted/20">
              <th />
              <th className="text-left text-xs uppercase tracking-wide text-muted-foreground/60 font-medium px-4 py-1.5 w-28">
                Spend
              </th>
              <th className="text-left text-xs uppercase tracking-wide text-muted-foreground/60 font-medium px-4 py-1.5 w-28">
                Clicks
              </th>
              <th className="text-left text-xs uppercase tracking-wide text-muted-foreground/60 font-medium px-4 py-1.5 w-24">
                Conv.
              </th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((campaign) => {
              const isAtRisk = campaign.status === "at_risk";
              const isGenerating = generatingIds.has(campaign.id);
              const m = campaign.latestMetric;

              return (
                <tr
                  key={campaign.id}
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  className="border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-colors group relative"
                >
                  {/* Campaign */}
                  <td className="relative px-4 py-3">
                    {isAtRisk && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-500 rounded-r" />
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{campaign.name}</span>
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
                  </td>

                  {/* Spend */}
                  <td className="px-4 py-3 text-sm">
                    {m ? (
                      <>
                        <span className="text-foreground">${formatK(m.spend)}</span>
                        {campaign.budget ? (
                          <span className="text-muted-foreground"> / ${formatK(campaign.budget)}</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Clicks */}
                  <td className="px-4 py-3 text-sm">
                    {m ? (
                      <ClicksCell clicks={m.clicks} clicksChange={m.clicksChange} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Conversions */}
                  <td className="px-4 py-3 text-sm">
                    {m?.conversions != null ? (
                      <span>{m.conversions.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Health & Insight */}
                  <td className={cn("px-4 py-3", isAtRisk && "bg-orange-50/30")}>
                    <StatusBadge status={campaign.status} />
                    <InsightCell campaign={campaign} isGenerating={isGenerating} />
                  </td>

                  {/* More menu */}
                  <td
                    className="px-2 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/campaigns/${campaign.id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/campaigns/${campaign.id}?edit=true`)}
                        >
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Footer */}
      {!isLoading && filtered.length > 0 && (
        <div className="text-xs text-muted-foreground pt-3 pb-1 px-4">
          Sorted by priority · Updated just now
        </div>
      )}
    </div>
  );
}
