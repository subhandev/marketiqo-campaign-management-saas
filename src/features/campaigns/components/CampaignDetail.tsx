"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
  CalendarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Campaign, CampaignStatus, Metric, Insight } from "@/features/campaigns/types";
import { useCampaignMutations } from "@/features/campaigns/hooks/useCampaigns";
import { fetchMetrics, generateInsight, fetchInsights } from "@/features/campaigns/api/campaigns.api";
import { AddMetricModal } from "@/features/campaigns/components/AddMetricModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatCurrency, formatCompact } from "@/shared/format/numbers";
import { formatDateMedium, formatRelativeTime } from "@/shared/format/dates";
import { getInitials, humanizeEnum } from "@/shared/format/strings";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────

function formatGoal(goal: string | null | undefined): string {
  if (!goal) return "—";
  return humanizeEnum(goal);
}

function pctChange(recent: number, prev: number): string | null {
  if (prev === 0) return null;
  return ((recent - prev) / prev * 100).toFixed(1);
}

// ── StatusBadge ────────────────────────────────────────────

const STATUS_STYLES: Record<CampaignStatus, string> = {
  planned: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-green-50 text-green-700 border-green-200",
  at_risk: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived: "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  planned: "Planned",
  active: "Active",
  at_risk: "At Risk",
  completed: "Completed",
  archived: "Archived",
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium border",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Chart tooltip ──────────────────────────────────────────

type ChartTab = "spend" | "clicks" | "impressions" | "conversions";

function ChartTooltip({
  active,
  payload,
  label,
  tab,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  tab: ChartTab;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">
        {tab === "spend" ? formatCurrency(val) : formatCompact(val)}
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

interface CampaignDetailProps {
  campaign: Campaign;
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

  // Fetch all metrics for chart + stats
  useEffect(() => {
    fetchMetrics(campaign.id)
      .then(setAllMetrics)
      .catch(() => {});
  }, [campaign.id]);

  // ── Handlers ────────────────────────────────────────────

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

  // ── Computed: timeline ────────────────────────────────────

  const hasTimeline = !!(campaign.startDate ?? campaign.createdAt) &&
    !!(campaign.endDate ?? campaign.deadline);

  const today = new Date();
  const startDate = new Date(campaign.startDate ?? campaign.createdAt);
  const endDate = campaign.endDate ?? campaign.deadline
    ? new Date((campaign.endDate ?? campaign.deadline)!)
    : null;

  let progressPercent = 0;
  let daysLeft = 0;
  if (hasTimeline && endDate) {
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    progressPercent = total > 0
      ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
      : 0;
    daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000));
  }

  // ── Computed: metric totals + pct change ─────────────────

  const sorted = [...allMetrics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const recent7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);

  const totalSpend = allMetrics.reduce((s, m) => s + m.spend, 0);
  const totalImpressions = allMetrics.reduce((s, m) => s + m.impressions, 0);
  const totalClicks = allMetrics.reduce((s, m) => s + m.clicks, 0);
  const totalConversions = allMetrics.reduce((s, m) => s + (m.conversions ?? 0), 0);
  const ctr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : null;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : null;

  const rSpend = recent7.reduce((s, m) => s + m.spend, 0);
  const pSpend = prev7.reduce((s, m) => s + m.spend, 0);
  const rImpressions = recent7.reduce((s, m) => s + m.impressions, 0);
  const pImpressions = prev7.reduce((s, m) => s + m.impressions, 0);
  const rClicks = recent7.reduce((s, m) => s + m.clicks, 0);
  const pClicks = prev7.reduce((s, m) => s + m.clicks, 0);
  const rConversions = recent7.reduce((s, m) => s + (m.conversions ?? 0), 0);
  const pConversions = prev7.reduce((s, m) => s + (m.conversions ?? 0), 0);
  const rCTR = rImpressions > 0 ? rClicks / rImpressions : 0;
  const pCTR = pImpressions > 0 ? pClicks / pImpressions : 0;
  const rCPC = rClicks > 0 ? rSpend / rClicks : 0;
  const pCPC = pClicks > 0 ? pSpend / pClicks : 0;

  const noMetrics = allMetrics.length === 0;

  const metricCells: { label: string; value: string; change: string | null }[] = [
    {
      label: "SPEND",
      value: noMetrics ? "—" : formatCurrency(totalSpend),
      change: pctChange(rSpend, pSpend),
    },
    {
      label: "IMPRESSIONS",
      value: noMetrics ? "—" : formatCompact(totalImpressions),
      change: pctChange(rImpressions, pImpressions),
    },
    {
      label: "CLICKS",
      value: noMetrics ? "—" : formatCompact(totalClicks),
      change: pctChange(rClicks, pClicks),
    },
    {
      label: "CONVERSIONS",
      value: noMetrics ? "—" : formatCompact(totalConversions),
      change: pctChange(rConversions, pConversions),
    },
    {
      label: "CTR",
      value: noMetrics || ctr === null ? "—" : `${ctr.toFixed(2)}%`,
      change: pctChange(rCTR, pCTR),
    },
    {
      label: "CPC",
      value: noMetrics || cpc === null ? "—" : formatCurrency(cpc),
      change: pctChange(rCPC, pCPC),
    },
  ];

  // ── Computed: chart data ──────────────────────────────────

  const chartData = sorted.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    spend: m.spend,
    clicks: m.clicks,
    impressions: m.impressions,
    conversions: m.conversions ?? 0,
  }));

  // ── Computed: activity feed ───────────────────────────────

  type ActivityItem = { title: string; description: string; date: string };

  const activities: ActivityItem[] = [
    ...insights.map((ins) => ({
      title: "New insight generated",
      description: `${ins.type.charAt(0).toUpperCase() + ins.type.slice(1)} flagged`,
      date: ins.createdAt,
    })),
    ...[...allMetrics]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((m) => ({
        title: "Metrics updated",
        description: `Data recorded for ${new Date(m.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
        date: m.date,
      })),
    {
      title: "Campaign created",
      description: `Added on ${formatDateMedium(campaign.createdAt)}`,
      date: campaign.createdAt,
    },
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // ── Client initials ───────────────────────────────────────

  const clientInitials = campaign.client
    ? getInitials(campaign.client.name)
    : "?";

  // ── Render ────────────────────────────────────────────────

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-6">

        {/* Back */}
        <button
          onClick={() => router.push("/campaigns")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <span className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card group-hover:bg-muted transition-colors">
            <ArrowLeftIcon className="h-3.5 w-3.5" />
          </span>
          Back to Campaigns
        </button>

        {/* ── HEADER ────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Breadcrumb + actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                {clientInitials}
              </div>
              {campaign.client && (
                <>
                  <span
                    className="font-medium text-foreground cursor-pointer hover:underline underline-offset-2"
                    onClick={() => router.push(`/clients/${campaign.clientId}`)}
                  >
                    {campaign.client.name}
                  </span>
                  <span>·</span>
                </>
              )}
              <span>{campaign.platform}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 h-9 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                Edit
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-border bg-background w-9 h-9 flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Title + status */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h1>
            <StatusBadge status={campaign.status} />
          </div>

          {/* Description */}
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {campaign.description}
            </p>
          )}
        </div>

        {/* ── TIMELINE BAR ──────────────────────────────── */}
        {hasTimeline && endDate && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:shrink-0">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDateMedium(campaign.startDate ?? campaign.createdAt)}</span>
              <span className="text-muted-foreground/50">→</span>
              <span>{formatDateMedium(campaign.endDate ?? campaign.deadline)}</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground sm:shrink-0">
              {progressPercent}% · {daysLeft} days left
            </span>
          </div>
        )}

        {/* ── PERFORMANCE METRICS ROW ───────────────────── */}
        <div className="rounded-xl border border-border bg-card">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            {metricCells.map((cell) => {
              const change = cell.change !== null ? parseFloat(cell.change) : null;
              const isPositive = change !== null && change >= 0;
              return (
                <div key={cell.label} className="px-5 py-4 flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {cell.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold tracking-tight">
                      {cell.value}
                    </span>
                    {change !== null && (
                      <span
                        className={cn(
                          "text-xs font-medium flex items-center gap-0.5",
                          isPositive ? "text-green-600" : "text-red-500"
                        )}
                      >
                        {isPositive ? "↑" : "↓"}
                        {Math.abs(change).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── TWO-COLUMN SECTION ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* LEFT: AI Insights */}
          <div>
            {/* Insights header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    AI Insights
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Prioritized signals from the last 7 days · {insights.length} active
                </span>
              </div>
              <button
                onClick={handleGenerateInsights}
                disabled={generating}
                className="h-8 w-fit rounded-lg border border-border px-3 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
              >
                {generating ? "Generating…" : "Regenerate"}
              </button>
            </div>

            {insightError && (
              <p className="text-xs text-destructive mb-3">{insightError}</p>
            )}

            {/* Loading skeletons */}
            {generating ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse"
                  >
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight) => {
                  const type = insight.type;
                  const colonIdx = insight.content.indexOf(":");
                  const title =
                    colonIdx > -1
                      ? insight.content.slice(0, colonIdx)
                      : insight.content;
                  const body =
                    colonIdx > -1
                      ? insight.content.slice(colonIdx + 1).trim()
                      : "";

                  return (
                    <div
                      key={insight.id}
                      className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-border/80 transition-colors"
                    >
                      {/* Type badge + confidence */}
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md",
                            type === "risk"
                              ? "bg-orange-50 text-orange-600 border border-orange-200"
                              : type === "performance"
                              ? "bg-purple-50 text-purple-600 border border-purple-200"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          )}
                        >
                          {type === "performance" ? "TREND" : type.toUpperCase()}
                        </span>
                        {insight.score !== null && (
                          <span className="text-xs text-muted-foreground">
                            Confidence {Math.round((insight.score ?? 0) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Icon + content */}
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            type === "risk"
                              ? "bg-orange-50 text-orange-500"
                              : type === "performance"
                              ? "bg-purple-50 text-purple-500"
                              : "bg-blue-50 text-blue-500"
                          )}
                        >
                          {type === "risk" && (
                            <ExclamationTriangleIcon className="w-4 h-4" />
                          )}
                          {type === "performance" && (
                            <ArrowTrendingDownIcon className="w-4 h-4" />
                          )}
                          {type === "recommendation" && (
                            <LightBulbIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold leading-snug">
                            {title}
                          </p>
                          {body && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {body}
                            </p>
                          )}
                        </div>
                      </div>

                      <button className="text-xs font-medium text-primary hover:underline underline-offset-2 ml-11">
                        Take action →
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-3">
                <SparklesIcon className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                <div>
                  <p className="text-sm font-medium">No insights yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add metrics data then generate AI insights for this campaign.
                  </p>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Generate insights →
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Details + Activity */}
          <div className="space-y-6">

            {/* Details panel */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Details
              </h3>
              <div className="space-y-0">
                {[
                  { label: "GOAL", value: formatGoal(campaign.goal) },
                  { label: "PLATFORM", value: campaign.platform },
                  { label: "DEADLINE", value: formatDateMedium(campaign.deadline) },
                  { label: "CREATED", value: formatDateMedium(campaign.createdAt) },
                  { label: "CLIENT", value: campaign.client?.name ?? "—" },
                  { label: "STATUS", value: <StatusBadge status={campaign.status} /> },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-medium text-right">
                      {value ?? "—"}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAddMetrics(true)}
                className="mt-4 w-full rounded-lg border border-border bg-background h-9 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                + Add Metrics
              </button>
            </div>

            {/* Activity panel */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Activity
              </h3>
              <div className="space-y-4">
                {activities.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {formatRelativeTime(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PERFORMANCE TRENDS ────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Performance Trends
            </h3>

            {/* Tab switcher */}
            <div className="flex max-w-full items-center overflow-x-auto rounded-lg border border-border">
              {(["spend", "clicks", "impressions", "conversions"] as ChartTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveChart(tab)}
                    className={cn(
                      "px-3 h-7 text-xs font-medium transition-colors capitalize",
                      activeChart === tab
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No metrics data yet — add metrics to see trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    activeChart === "spend" ? formatCurrency(v) : formatCompact(v)
                  }
                />
                <Tooltip
                  content={
                    <ChartTooltip tab={activeChart} />
                  }
                />
                <Line
                  type="monotone"
                  dataKey={activeChart}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────── */}
      <AddMetricModal
        open={showAddMetrics}
        onClose={() => setShowAddMetrics(false)}
        campaignId={campaign.id}
        onSuccess={() => {
          fetchMetrics(campaign.id).then(setAllMetrics).catch(() => {});
        }}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={mutationLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
