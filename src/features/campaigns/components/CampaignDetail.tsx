"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddMetricModal } from "@/features/campaigns/components/AddMetricModal";
import { fetchInsights, fetchMetrics, generateInsight } from "@/features/campaigns/api/campaigns.api";
import { useCampaignMutations } from "@/features/campaigns/hooks/useCampaigns";
import { Campaign, CampaignStatus, Insight, Metric } from "@/features/campaigns/types";
import { formatDateMedium, formatRelativeTime } from "@/shared/format/dates";
import { formatCompact, formatCurrency } from "@/shared/format/numbers";
import { getInitials, humanizeEnum } from "@/shared/format/strings";
import { cn } from "@/lib/utils";

type ChartTab = "spend" | "clicks" | "impressions" | "conversions";

const MS_DAY = 86_400_000;

type ScheduleDerived = {
  progressPercent: number;
  daysLeftUntilEnd: number;
  daysUntilStart: number;
  ended: boolean;
  notStarted: boolean;
  invalidOrder: boolean;
};

function isValidTimelineDate(d: Date | null): d is Date {
  return d != null && Number.isFinite(d.getTime()) && !Number.isNaN(d.getTime());
}

function deriveScheduleTimeline(start: Date, end: Date, now: Date): ScheduleDerived | null {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const nowMs = now.getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;

  const span = endMs - startMs;

  const daysUntilStart = Math.max(0, Math.ceil((startMs - nowMs) / MS_DAY));
  const daysLeftUntilEnd = Math.max(0, Math.ceil((endMs - nowMs) / MS_DAY));

  if (span < 0) {
    return {
      progressPercent: 0,
      daysLeftUntilEnd,
      daysUntilStart: 0,
      ended: nowMs >= endMs,
      notStarted: false,
      invalidOrder: true,
    };
  }

  if (span === 0) {
    const ended = nowMs >= endMs;
    return {
      progressPercent: ended ? 100 : 0,
      daysLeftUntilEnd: ended ? 0 : daysLeftUntilEnd,
      daysUntilStart,
      ended,
      notStarted: nowMs < startMs && !ended,
      invalidOrder: false,
    };
  }

  if (nowMs >= endMs) {
    return {
      progressPercent: 100,
      daysLeftUntilEnd: 0,
      daysUntilStart: 0,
      ended: true,
      notStarted: false,
      invalidOrder: false,
    };
  }

  if (nowMs <= startMs) {
    return {
      progressPercent: 0,
      daysLeftUntilEnd,
      daysUntilStart,
      ended: false,
      notStarted: true,
      invalidOrder: false,
    };
  }

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((nowMs - startMs) / span) * 100))
  );

  return {
    progressPercent,
    daysLeftUntilEnd,
    daysUntilStart: 0,
    ended: false,
    notStarted: false,
    invalidOrder: false,
  };
}

interface CampaignDetailProps {
  campaign: Campaign;
}

const CampaignTrendChart = dynamic(
  () =>
    import("@/features/campaigns/components/CampaignTrendChart").then(
      (mod) => mod.CampaignTrendChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-xl border border-border bg-muted/30" />
    ),
  }
);

const STATUS_STYLES: Record<CampaignStatus, string> = {
  planned: "border-blue-200 bg-blue-50 text-blue-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  at_risk: "border-rose-200 bg-rose-50 text-rose-700",
  completed: "border-zinc-200 bg-zinc-50 text-zinc-500",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

const STATUS_DOTS: Record<CampaignStatus, string> = {
  planned: "bg-blue-400",
  active: "bg-emerald-500",
  at_risk: "bg-rose-500",
  completed: "bg-zinc-400",
  archived: "bg-zinc-400",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  planned: "Planned",
  active: "Active",
  at_risk: "At risk",
  completed: "Completed",
  archived: "Archived",
};

const PLATFORM_STYLES: Record<string, string> = {
  GOOGLE: "border-amber-200 bg-amber-50 text-amber-700",
  "GOOGLE ADS": "border-amber-200 bg-amber-50 text-amber-700",
  META: "border-indigo-200 bg-indigo-50 text-indigo-700",
  "META ADS": "border-indigo-200 bg-indigo-50 text-indigo-700",
  LINKEDIN: "border-blue-200 bg-blue-50 text-blue-700",
  "LINKEDIN ADS": "border-blue-200 bg-blue-50 text-blue-700",
  YOUTUBE: "border-red-200 bg-red-50 text-red-700",
  "YOUTUBE ADS": "border-red-200 bg-red-50 text-red-700",
  TIKTOK: "border-pink-200 bg-pink-50 text-pink-700",
  "TIKTOK ADS": "border-pink-200 bg-pink-50 text-pink-700",
  "TWITTER/X": "border-zinc-200 bg-zinc-100 text-zinc-700",
  X: "border-zinc-200 bg-zinc-100 text-zinc-700",
  EMAIL: "border-violet-200 bg-violet-50 text-violet-700",
  SEO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OTHER: "border-slate-200 bg-slate-100 text-slate-600",
};

function pctChange(recent: number, previous: number) {
  if (previous <= 0) return null;
  return (recent - previous) / previous;
}

function formatGoal(goal: string | null | undefined) {
  if (!goal) return "-";
  return humanizeEnum(goal);
}

function StatusPill({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", STATUS_DOTS[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function PlatformPill({ platform }: { platform: string }) {
  const key = platform.toUpperCase();
  const style = PLATFORM_STYLES[key] ?? "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        style
      )}
    >
      {key}
    </span>
  );
}

function MetricChange({ value }: { value: number | null }) {
  if (value === null) return null;

  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive ? "text-emerald-600" : "text-rose-600"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value * 100).toFixed(0)}%
    </span>
  );
}

function MetricCard({
  label,
  value,
  change,
  helper,
}: {
  label: string;
  value: string;
  change: number | null;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <MetricChange value={change} />
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {helper}
        </span>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const type = insight.type;
  const colonIdx = insight.content.indexOf(":");
  const title = colonIdx > -1 ? insight.content.slice(0, colonIdx) : insight.content;
  const body = colonIdx > -1 ? insight.content.slice(colonIdx + 1).trim() : "";

  const tone =
    type === "risk"
      ? {
          label: "RISK",
          badge: "border-orange-200 bg-orange-50 text-orange-700",
          icon: "border-orange-200 bg-orange-50 text-orange-600",
          Icon: AlertTriangle,
        }
      : type === "performance"
      ? {
          label: "TREND",
          badge: "border-purple-200 bg-purple-50 text-purple-700",
          icon: "border-purple-200 bg-purple-50 text-purple-600",
          Icon: TrendingDown,
        }
      : type === "summary"
      ? {
          label: "SNAPSHOT",
          badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
          icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
          Icon: Sparkles,
        }
      : {
          label: "RECOMMENDATION",
          badge: "border-blue-200 bg-blue-50 text-blue-700",
          icon: "border-blue-200 bg-blue-50 text-blue-600",
          Icon: Lightbulb,
        };
  const Icon = tone.Icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold", tone.badge)}>
          {tone.label}
        </span>
        {insight.score !== null && (
          <span className="text-xs text-muted-foreground">
            Confidence {Math.round((insight.score ?? 0) * 100)}%
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground/70">
          {formatRelativeTime(insight.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            tone.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-snug">{title}</p>
          {body && <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? "-"}</span>
    </div>
  );
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  const router = useRouter();
  const { remove, loading: mutationLoading } = useCampaignMutations();

  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [insights, setInsights] = useState<Insight[]>(campaign.insights ?? []);
  const [generating, setGenerating] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [showAddMetrics, setShowAddMetrics] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeChart, setActiveChart] = useState<ChartTab>("spend");

  const loadMetrics = useCallback(async () => {
    const metrics = await fetchMetrics(campaign.id);
    setAllMetrics(metrics);
  }, [campaign.id]);

  useEffect(() => {
    let cancelled = false;

    fetchMetrics(campaign.id)
      .then((metrics) => {
        if (!cancelled) setAllMetrics(metrics);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [campaign.id]);

  const handleDelete = async () => {
    await remove(campaign.id);
    router.push("/campaigns");
  };

  const handleGenerateInsights = useCallback(async () => {
    try {
      setGenerating(true);
      setInsightError(null);
      await generateInsight(campaign.id);
      const updated = await fetchInsights(campaign.id);
      setInsights(updated);
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [campaign.id]);

  const sorted = [...allMetrics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const recent7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);

  const totalSpend = allMetrics.reduce((sum, metric) => sum + metric.spend, 0);
  const totalImpressions = allMetrics.reduce((sum, metric) => sum + metric.impressions, 0);
  const totalClicks = allMetrics.reduce((sum, metric) => sum + metric.clicks, 0);
  const totalConversions = allMetrics.reduce(
    (sum, metric) => sum + (metric.conversions ?? 0),
    0
  );
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : null;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : null;

  const rSpend = recent7.reduce((sum, metric) => sum + metric.spend, 0);
  const pSpend = prev7.reduce((sum, metric) => sum + metric.spend, 0);
  const rClicks = recent7.reduce((sum, metric) => sum + metric.clicks, 0);
  const pClicks = prev7.reduce((sum, metric) => sum + metric.clicks, 0);
  const rImpressions = recent7.reduce((sum, metric) => sum + metric.impressions, 0);
  const pImpressions = prev7.reduce((sum, metric) => sum + metric.impressions, 0);
  const rConversions = recent7.reduce((sum, metric) => sum + (metric.conversions ?? 0), 0);
  const pConversions = prev7.reduce((sum, metric) => sum + (metric.conversions ?? 0), 0);
  const rCtr = rImpressions > 0 ? rClicks / rImpressions : 0;
  const pCtr = pImpressions > 0 ? pClicks / pImpressions : 0;
  const rCpc = rClicks > 0 ? rSpend / rClicks : 0;
  const pCpc = pClicks > 0 ? pSpend / pClicks : 0;

  const noMetrics = allMetrics.length === 0;
  const metricCards = [
    {
      label: "Spend",
      value: noMetrics ? "-" : formatCurrency(totalSpend),
      change: pctChange(rSpend, pSpend),
      helper: campaign.budget ? `${formatCurrency(campaign.budget)} budget` : "No budget",
    },
    {
      label: "Conversions",
      value: noMetrics ? "-" : formatCompact(totalConversions),
      change: pctChange(rConversions, pConversions),
      helper: "Last 7 days",
    },
    {
      label: "CTR",
      value: noMetrics || ctr === null ? "-" : `${ctr.toFixed(2)}%`,
      change: pctChange(rCtr, pCtr),
      helper: "Engagement",
    },
    {
      label: "CPC",
      value: noMetrics || cpc === null ? "-" : formatCurrency(cpc),
      change: pctChange(rCpc, pCpc),
      helper: "Efficiency",
    },
    {
      label: "Clicks",
      value: noMetrics ? "-" : formatCompact(totalClicks),
      change: pctChange(rClicks, pClicks),
      helper: "Traffic",
    },
    {
      label: "Impressions",
      value: noMetrics ? "-" : formatCompact(totalImpressions),
      change: pctChange(rImpressions, pImpressions),
      helper: "Reach",
    },
  ];

  const chartData = sorted.map((metric) => ({
    date: new Date(metric.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    spend: metric.spend,
    clicks: metric.clicks,
    impressions: metric.impressions,
    conversions: metric.conversions ?? 0,
  }));

  const today = new Date();
  const timelineStartRaw = campaign.startDate ?? campaign.createdAt;
  const timelineEndRaw = campaign.endDate ?? campaign.deadline;
  const startDate =
    timelineStartRaw != null && timelineStartRaw !== ""
      ? new Date(timelineStartRaw)
      : null;
  const endDate =
    timelineEndRaw != null && timelineEndRaw !== "" ? new Date(timelineEndRaw) : null;
  const hasTimeline = isValidTimelineDate(startDate) && isValidTimelineDate(endDate);
  const schedule =
    hasTimeline && startDate && endDate ? deriveScheduleTimeline(startDate, endDate, today) : null;
  const progressPercent = schedule?.progressPercent ?? 0;

  const activities = [
    ...insights.map((insight) => ({
      title: "Insight generated",
      detail: `${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} signal flagged`,
      date: insight.createdAt,
    })),
    ...[...allMetrics]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((metric) => ({
        title: "Metrics updated",
        detail: `Data recorded for ${formatDateMedium(metric.date)}`,
        date: metric.date,
      })),
    {
      title: "Campaign created",
      detail: `Added to ${campaign.client?.name ?? "client"}`,
      date: campaign.createdAt,
    },
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const clientInitials = campaign.client ? getInitials(campaign.client.name) : "?";

  return (
    <>
      <div className="space-y-6">
        <button
          onClick={() => router.push("/campaigns")}
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          Back to Campaigns
        </button>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="bg-gradient-to-br from-primary/10 via-[hsl(var(--brand-soft))] to-background px-5 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/15">
                    {clientInitials}
                  </span>
                  {campaign.client && (
                    <button
                      onClick={() => router.push(`/clients/${campaign.clientId}`)}
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {campaign.client.name}
                    </button>
                  )}
                  <span>·</span>
                  <PlatformPill platform={campaign.platform} />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="min-w-0 text-2xl font-semibold tracking-tight md:text-3xl">
                      {campaign.name}
                    </h1>
                    <StatusPill status={campaign.status} />
                  </div>
                  {campaign.description && (
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {campaign.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-fit">
                <Button className="sm:w-fit" onClick={() => setShowAddMetrics(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Metrics
                </Button>
                <Button
                  variant="outline"
                  className="bg-card/80"
                  onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-card/80"
                      aria-label="Open campaign actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Campaign
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {hasTimeline && schedule && (
              <div className="mt-5 rounded-xl border border-border/70 bg-card/75 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:shrink-0">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDateMedium(campaign.startDate ?? campaign.createdAt)}</span>
                    <span className="text-muted-foreground/50">to</span>
                    <span>{formatDateMedium(campaign.endDate ?? campaign.deadline)}</span>
                  </div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {schedule.invalidOrder ? (
                      <>End date is before start date — fix dates in Edit.</>
                    ) : schedule.ended ? (
                      <>100% complete · Schedule ended</>
                    ) : schedule.notStarted ? (
                      <>
                        Not started · kicks off in {schedule.daysUntilStart} day
                        {schedule.daysUntilStart !== 1 ? "s" : ""}
                      </>
                    ) : (
                      <>
                        {schedule.progressPercent}% complete · {schedule.daysLeftUntilEnd} day
                        {schedule.daysLeftUntilEnd !== 1 ? "s" : ""} left
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Performance Trends
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Daily movement across spend, clicks, impressions, and conversions.
                  </p>
                </div>
                <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1">
                  {(["spend", "clicks", "impressions", "conversions"] as ChartTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveChart(tab)}
                      className={cn(
                        "h-8 shrink-0 rounded-lg px-3 text-xs font-medium capitalize transition-colors",
                        activeChart === tab
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                  No metrics data yet. Add metrics to see trends.
                </div>
              ) : (
                <CampaignTrendChart data={chartData} activeChart={activeChart} />
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Insights
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Prioritized signals from recent campaign movement.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleGenerateInsights}
                  disabled={generating}
                >
                  {generating ? "Generating..." : "Regenerate"}
                </Button>
              </div>

              {insightError && <p className="mb-3 text-xs text-destructive">{insightError}</p>}

              {generating ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium">No insights yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add metrics data, then generate AI insights for this campaign.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </p>
              <div className="mt-4 space-y-3">
                <DetailRow label="Goal" value={formatGoal(campaign.goal)} />
                <DetailRow label="Platform" value={campaign.platform} />
                <DetailRow
                  label="Budget"
                  value={campaign.budget ? formatCurrency(campaign.budget) : "-"}
                />
                <DetailRow label="Deadline" value={formatDateMedium(campaign.deadline)} />
                <DetailRow label="Created" value={formatDateMedium(campaign.createdAt)} />
                <DetailRow label="Client" value={campaign.client?.name ?? "-"} />
                <DetailRow label="Status" value={<StatusPill status={campaign.status} />} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Activity
              </p>
              <div className="mt-4 space-y-4">
                {activities.map((activity, index) => (
                  <div key={`${activity.title}-${index}`} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    <div>
                      <p className="text-sm font-medium leading-snug">{activity.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{activity.detail}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/60">
                        {formatRelativeTime(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Next best action</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Review recent movement and add fresh metrics before making budget changes.
              </p>
            </div>
          </aside>
        </section>
      </div>

      <AddMetricModal
        open={showAddMetrics}
        onClose={() => setShowAddMetrics(false)}
        campaignId={campaign.id}
        onSuccess={() => {
          loadMetrics().catch(() => {});
        }}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        loading={mutationLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
