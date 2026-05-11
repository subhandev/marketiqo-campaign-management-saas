"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  Sparkles,
  Clock,
  Zap,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  GraduationCap,
  Rocket,
  Store,
  AlertCircle,
  Info,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CampaignStatus } from "@/features/campaigns/types";
import { DashboardLoadingSkeleton } from "@/features/dashboard/components/DashboardLoadingSkeleton";
import { formatCurrency } from "@/shared/format/numbers";
import { formatDateShort } from "@/shared/format/dates";
import { getInitials } from "@/shared/format/strings";

// ── API response type ─────────────────────────────────────────────────────────

interface DashboardData {
  stats: {
    totalClients: number;
    activeCampaigns: number;
    atRiskCampaigns: number;
    completedCampaigns: number;
    totalSpend: number;
  };
  health: {
    active: number;
    at_risk: number;
    completed: number;
    planned: number;
    archived: number;
    total: number;
  };
  recentCampaigns: {
    id: string;
    name: string;
    platform: string;
    status: CampaignStatus;
    deadline: string | null;
    client: { id: string; name: string; industry: string | null } | null;
  }[];
  atRiskCampaignsList: {
    id: string;
    name: string;
    platform: string;
    deadline: string | null;
    client: { id: string; name: string; industry: string | null } | null;
  }[];
  recentClients: {
    id: string;
    name: string;
    industry: string | null;
    status: string;
    campaignCount: number;
  }[];
}

type PortfolioAiCategory = "performance" | "risk" | "budget" | "next_action";
type PortfolioAiSeverity = "positive" | "info" | "warning" | "critical";

interface PortfolioAiInsight {
  category: PortfolioAiCategory;
  severity: PortfolioAiSeverity;
  headline: string;
  insight: string;
  recommendedAction: string;
  campaignId?: string;
  campaignName?: string;
}

interface PortfolioAiBrief {
  briefTitle: string;
  summary: string;
  generatedAt: string;
  source: "ai" | "fallback";
  insights: PortfolioAiInsight[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysLabel(n: number | null): string {
  if (n === null) return "No deadline set";
  if (n < 0) return `Overdue by ${Math.abs(n)} day${Math.abs(n) !== 1 ? "s" : ""}`;
  if (n === 0) return "Due today";
  return `${n} day${n !== 1 ? "s" : ""} remaining`;
}

function riskPriorityLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) return "Needs schedule";
  if (daysRemaining < 0) return "Critical priority";
  if (daysRemaining <= 3) return "High priority";
  return "Watch closely";
}

function riskSuggestedAction(daysRemaining: number | null): string {
  if (daysRemaining === null) return "Set a deadline and define the next action.";
  if (daysRemaining < 0) return "Escalate owner and reset the delivery plan.";
  if (daysRemaining <= 3) return "Review pacing and unblock the next milestone.";
  return "Confirm owner, timeline, and campaign pacing today.";
}

function deadlinePressureLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) return "No deadline";
  if (daysRemaining < 0) return "Overdue";
  if (daysRemaining === 0) return "Due today";
  if (daysRemaining <= 3) return "High pressure";
  return "Upcoming";
}

function generatedAtLabel(value: string | null): string {
  if (!value) return "Awaiting AI brief";

  const generatedAt = new Date(value).getTime();
  if (Number.isNaN(generatedAt)) return "Recently generated";

  const minutes = Math.max(0, Math.round((Date.now() - generatedAt) / 60000));
  if (minutes < 1) return "Generated just now";
  if (minutes === 1) return "Generated 1 minute ago";
  if (minutes < 60) return `Generated ${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  return hours === 1 ? "Generated 1 hour ago" : `Generated ${hours} hours ago`;
}

async function requestPortfolioAiBrief(): Promise<PortfolioAiBrief> {
  const response = await fetch("/api/dashboard/insights", { method: "POST" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error ?? "Failed to generate dashboard insights.");
  }

  return payload as PortfolioAiBrief;
}

const OWNER_BG_POOL = [
  "bg-[hsl(var(--primary))]",
  "bg-[hsl(var(--brand))]",
  "bg-[hsl(var(--success))]",
  "bg-[hsl(var(--warning))]",
];

function ownerBgFromName(name: string): string {
  let hash = 0;
  for (const c of name) hash = ((hash * 31) + c.charCodeAt(0)) & 0xffff;
  return OWNER_BG_POOL[hash % OWNER_BG_POOL.length];
}

const INDUSTRY_CONFIG: Record<
  string,
  { icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  ecommerce: {
    icon: ShoppingBag,
    iconBg: "bg-[hsl(var(--brand-soft))]",
    iconColor: "text-[hsl(var(--brand))]",
  },
  education: {
    icon: GraduationCap,
    iconBg: "bg-[hsl(var(--warning-soft))]",
    iconColor: "text-[hsl(var(--warning))]",
  },
  saas: {
    icon: Rocket,
    iconBg: "bg-[hsl(var(--accent))]",
    iconColor: "text-[hsl(var(--accent-foreground))]",
  },
  retail: {
    icon: Store,
    iconBg: "bg-[hsl(var(--success-soft))]",
    iconColor: "text-[hsl(var(--success))]",
  },
};

function getIndustryConfig(industry: string | null) {
  const key = (industry ?? "").toLowerCase();
  return (
    INDUSTRY_CONFIG[key] ?? {
      icon: Building2,
      iconBg: "bg-[hsl(var(--muted))]",
      iconColor: "text-[hsl(var(--muted-foreground))]",
    }
  );
}

// ── Severity system ───────────────────────────────────────────────────────────

type AlertSeverity = "critical" | "warning" | "info" | "none";

type SeverityConfig = {
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  iconColor: string;
  IconComponent: React.ElementType;
  titleColor: string;
  subtitleColor: string;
  innerCardBg: string;
  innerCardBorder: string;
  buttonBorder: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
};

const SEVERITY_CONFIG: Record<AlertSeverity, SeverityConfig> = {
  critical: {
    cardBg: "bg-[hsl(var(--destructive-soft))]",
    cardBorder: "border-[hsl(var(--destructive)/0.3)]",
    iconBg: "bg-[hsl(var(--destructive)/0.15)]",
    iconColor: "text-[hsl(var(--destructive))]",
    IconComponent: AlertCircle,
    titleColor: "text-[hsl(var(--destructive))]",
    subtitleColor: "text-[hsl(var(--muted-foreground))]",
    innerCardBg: "bg-[hsl(var(--card))]",
    innerCardBorder: "border-[hsl(var(--destructive)/0.25)]",
    buttonBorder: "border-[hsl(var(--destructive)/0.3)]",
    buttonBg: "bg-[hsl(var(--card))]",
    buttonHover: "hover:bg-[hsl(var(--destructive-soft))]",
    buttonText: "text-[hsl(var(--destructive))]",
  },
  warning: {
    cardBg: "bg-[hsl(var(--warning-soft))]",
    cardBorder: "border-[hsl(var(--warning)/0.3)]",
    iconBg: "bg-[hsl(var(--warning)/0.15)]",
    iconColor: "text-[hsl(var(--warning))]",
    IconComponent: AlertTriangle,
    titleColor: "text-[hsl(var(--foreground))]",
    subtitleColor: "text-[hsl(var(--muted-foreground))]",
    innerCardBg: "bg-[hsl(var(--card))]",
    innerCardBorder: "border-[hsl(var(--warning)/0.25)]",
    buttonBorder: "border-[hsl(var(--border))]",
    buttonBg: "bg-[hsl(var(--card))]",
    buttonHover: "hover:bg-[hsl(var(--muted))]",
    buttonText: "text-[hsl(var(--foreground))]",
  },
  info: {
    cardBg: "bg-[hsl(var(--info-soft))]",
    cardBorder: "border-[hsl(var(--info)/0.3)]",
    iconBg: "bg-[hsl(var(--info)/0.15)]",
    iconColor: "text-[hsl(var(--info))]",
    IconComponent: Info,
    titleColor: "text-[hsl(var(--foreground))]",
    subtitleColor: "text-[hsl(var(--muted-foreground))]",
    innerCardBg: "bg-[hsl(var(--card))]",
    innerCardBorder: "border-[hsl(var(--info)/0.25)]",
    buttonBorder: "border-[hsl(var(--border))]",
    buttonBg: "bg-[hsl(var(--card))]",
    buttonHover: "hover:bg-[hsl(var(--muted))]",
    buttonText: "text-[hsl(var(--foreground))]",
  },
  none: {
    cardBg: "bg-[hsl(var(--card))]",
    cardBorder: "border-[hsl(var(--border))]",
    iconBg: "bg-[hsl(var(--success-soft))]",
    iconColor: "text-[hsl(var(--success))]",
    IconComponent: CheckCircle2,
    titleColor: "text-[hsl(var(--foreground))]",
    subtitleColor: "text-[hsl(var(--muted-foreground))]",
    innerCardBg: "bg-[hsl(var(--muted)/0.5)]",
    innerCardBorder: "border-[hsl(var(--border))]",
    buttonBorder: "border-[hsl(var(--border))]",
    buttonBg: "bg-[hsl(var(--card))]",
    buttonHover: "hover:bg-[hsl(var(--muted))]",
    buttonText: "text-[hsl(var(--foreground))]",
  },
};

// ── Status badge system ───────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  dot: string;
  badge: string;
};

const STATUS_CONFIG: Record<CampaignStatus, StatusConfig> = {
  active: {
    label: "Active",
    dot: "bg-[hsl(var(--success))]",
    badge:
      "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)]",
  },
  at_risk: {
    label: "At Risk",
    dot: "bg-[hsl(var(--warning))]",
    badge:
      "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning-foreground))] border border-[hsl(var(--warning)/0.3)]",
  },
  completed: {
    label: "Completed",
    dot: "bg-[hsl(var(--muted-foreground)/0.5)]",
    badge:
      "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
  },
  archived: {
    label: "Archived",
    dot: "bg-[hsl(var(--muted-foreground)/0.4)]",
    badge:
      "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
  },
  planned: {
    label: "Planned",
    dot: "bg-[hsl(var(--brand))]",
    badge:
      "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))] border border-[hsl(var(--brand)/0.3)]",
  },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium w-fit",
        cfg.badge
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

const AI_CATEGORY_CONFIG: Record<
  PortfolioAiCategory,
  { label: string; icon: React.ElementType; iconClass: string }
> = {
  performance: {
    label: "Performance",
    icon: Zap,
    iconClass: "text-[hsl(var(--brand))]",
  },
  risk: {
    label: "Risk",
    icon: AlertTriangle,
    iconClass: "text-[hsl(var(--warning))]",
  },
  budget: {
    label: "Budget",
    icon: DollarSign,
    iconClass: "text-[hsl(var(--success))]",
  },
  next_action: {
    label: "Next Action",
    icon: ArrowUpRight,
    iconClass: "text-[hsl(var(--info))]",
  },
};

const AI_SEVERITY_CLASS: Record<PortfolioAiSeverity, string> = {
  positive: "border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success-soft))]",
  info: "border-[hsl(var(--brand)/0.14)] bg-white/60",
  warning: "border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning-soft))]",
  critical: "border-[hsl(var(--destructive)/0.35)] bg-[hsl(var(--destructive-soft))]",
};

// ── Dashboard content ─────────────────────────────────────────────────────────

export function DashboardContent() {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.username ?? "there";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Captured when data loads so deadline diffs are stable across re-renders
  const [fetchedAt, setFetchedAt] = useState(0);
  const [aiBrief, setAiBrief] = useState<PortfolioAiBrief | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const aiRequestIdRef = useRef(0);

  const loadAiBrief = useCallback(async () => {
    const requestId = aiRequestIdRef.current + 1;
    aiRequestIdRef.current = requestId;
    setInsightsLoading(true);
    setInsightsError(null);

    try {
      const brief = await requestPortfolioAiBrief();
      if (aiRequestIdRef.current === requestId) {
        setAiBrief(brief);
      }
    } catch {
      if (aiRequestIdRef.current === requestId) {
        setInsightsError("AI brief could not refresh. Showing the latest available readout.");
      }
    } finally {
      if (aiRequestIdRef.current === requestId) {
        setInsightsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData) => {
        setData(d);
        setFetchedAt(Date.now());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    const requestId = aiRequestIdRef.current + 1;
    aiRequestIdRef.current = requestId;

    requestPortfolioAiBrief()
      .then((brief) => {
        if (active && aiRequestIdRef.current === requestId) setAiBrief(brief);
      })
      .catch(() => {
        if (active && aiRequestIdRef.current === requestId) {
          setInsightsError("AI brief could not refresh. Showing the latest available readout.");
        }
      })
      .finally(() => {
        if (active && aiRequestIdRef.current === requestId) setInsightsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <DashboardLoadingSkeleton />;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-[hsl(var(--muted-foreground))] text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  const { stats, recentCampaigns, atRiskCampaignsList, recentClients } = data;

  // ── Stat cards ──────────────────────────────────────────────────────────────

  const statCards = [
    {
      label: "Active Campaigns",
      value: String(stats.activeCampaigns),
      trend:
        stats.activeCampaigns > 0
          ? `${stats.activeCampaigns} running now`
          : "No active campaigns",
      up: true,
      icon: MessageSquare,
      iconBg: "bg-[hsl(var(--brand-soft))]",
      iconColor: "text-[hsl(var(--brand))]",
      trendColor: "text-[hsl(var(--success))]",
      href: "/campaigns",
    },
    {
      label: "At Risk",
      value: String(stats.atRiskCampaigns),
      trend:
        stats.atRiskCampaigns === 0
          ? "All on track"
          : `${stats.atRiskCampaigns} need${stats.atRiskCampaigns === 1 ? "s" : ""} review`,
      up: stats.atRiskCampaigns === 0,
      icon: AlertTriangle,
      iconBg: "bg-[hsl(var(--warning-soft))]",
      iconColor: "text-[hsl(var(--warning))]",
      trendColor:
        stats.atRiskCampaigns === 0
          ? "text-[hsl(var(--success))]"
          : "text-[hsl(var(--warning))]",
      href: "/campaigns",
    },
    {
      label: "Completed",
      value: String(stats.completedCampaigns),
      trend: `${stats.completedCampaigns} delivered`,
      up: true,
      icon: CheckCircle2,
      iconBg: "bg-[hsl(var(--success-soft))]",
      iconColor: "text-[hsl(var(--success))]",
      trendColor: "text-[hsl(var(--success))]",
      href: "/campaigns",
    },
    {
      label: "Total Clients",
      value: String(stats.totalClients),
      trend: `${stats.totalClients} registered`,
      up: true,
      icon: Users,
      iconBg: "bg-[hsl(var(--info-soft))]",
      iconColor: "text-[hsl(var(--info))]",
      trendColor: "text-[hsl(var(--success))]",
      href: "/clients",
    },
    {
      label: "Total Spend",
      value: formatCurrency(stats.totalSpend),
      trend: "Across all campaigns",
      up: true,
      icon: DollarSign,
      iconBg: "bg-[hsl(var(--brand-soft))]",
      iconColor: "text-[hsl(var(--brand))]",
      trendColor: "text-[hsl(var(--success))]",
      href: "/campaigns",
    },
  ];

  // ── Needs Attention alerts ─────────────────────────────────────────────────

  const alerts = atRiskCampaignsList.map((c) => {
    const daysRemaining = c.deadline
      ? Math.ceil(
          (new Date(c.deadline).getTime() - fetchedAt) / (1000 * 60 * 60 * 24)
        )
      : null;
    return {
      id: c.id,
      name: c.name,
      client: c.client?.name ?? "Unknown",
      platform: c.platform,
      daysRemaining,
      // overdue = critical, otherwise warning
      status:
        daysRemaining !== null && daysRemaining < 0 ? "overdue" : "at_risk",
    };
  });

  const severity: AlertSeverity =
    alerts.length === 0
      ? "none"
      : alerts.some((a) => a.daysRemaining !== null && a.daysRemaining < 0)
      ? "critical"
      : "warning";

  const sev = SEVERITY_CONFIG[severity];
  const SevIcon = sev.IconComponent;
  const closestAlert = alerts
    .filter((alert) => alert.daysRemaining !== null)
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))[0];
  const overdueCount = alerts.filter(
    (alert) => alert.daysRemaining !== null && alert.daysRemaining < 0
  ).length;
  const dueSoonCount = alerts.filter(
    (alert) => alert.daysRemaining !== null && alert.daysRemaining >= 0 && alert.daysRemaining <= 3
  ).length;
  const highestUrgencyLabel =
    overdueCount > 0
      ? "Critical"
      : dueSoonCount > 0
      ? "High"
      : alerts.length > 0
      ? "Medium"
      : "Clear";
  const deadlinePressure =
    closestAlert?.daysRemaining !== undefined
      ? deadlinePressureLabel(closestAlert.daysRemaining)
      : "Monitoring";

  // ── Recent Campaigns ───────────────────────────────────────────────────────

  const campaigns = recentCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    client: c.client?.name ?? "—",
    platform: c.platform,
    due: formatDateShort(c.deadline),
    status: c.status,
    ownerInitials: getInitials(c.client?.name ?? c.name),
    ownerBg: ownerBgFromName(c.client?.name ?? c.id),
  }));

  // ── Recent Clients ─────────────────────────────────────────────────────────

  const clients = recentClients.map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry ?? "General",
    campaigns: c.campaignCount,
    ...getIndustryConfig(c.industry),
  }));

  const aiGeneratedLabel = generatedAtLabel(aiBrief?.generatedAt ?? null);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Your AI campaign analyst is watching portfolio health, spend, and next actions.
          </p>
        </div>
      </div>

      {/* ── Row 1 — KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-5 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                {stat.label}
              </p>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  stat.iconBg
                )}
              >
                <stat.icon size={16} className={stat.iconColor} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-[hsl(var(--foreground))] mt-3">
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              {stat.up ? (
                <TrendingUp size={12} className={stat.trendColor} />
              ) : (
                <TrendingDown size={12} className={stat.trendColor} />
              )}
              <span className={cn("text-xs", stat.trendColor)}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Needs Attention + AI Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Needs Attention — dynamic severity */}
        <div
          className={cn(
            "rounded-xl p-5 shadow-card border flex flex-col",
            sev.cardBg,
            sev.cardBorder,
            "lg:col-span-2"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  sev.iconBg
                )}
              >
                <SevIcon size={15} className={sev.iconColor} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("text-sm font-semibold", sev.titleColor)}>
                    Needs Attention
                  </p>
                  <span className="rounded-full border border-[hsl(var(--warning)/0.22)] bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--warning-foreground))]">
                    AI triaged
                  </span>
                </div>
                <p className={cn("text-xs mt-0.5", sev.subtitleColor)}>
                  {alerts.length} campaign{alerts.length !== 1 ? "s" : ""} require
                  {alerts.length === 1 ? "s" : ""} action
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-[hsl(var(--border)/0.8)] bg-white/65 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Urgency
              </p>
              <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                {highestUrgencyLabel}
              </p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border)/0.8)] bg-white/65 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Deadline
              </p>
              <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                {deadlinePressure}
              </p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border)/0.8)] bg-white/65 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Queue
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-[hsl(var(--foreground))]">
                {alerts.length}
              </p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center gap-2 py-8 mt-3 rounded-lg border border-dashed border-[hsl(var(--border))] bg-white/45">
              <CheckCircle2 size={28} className="text-[hsl(var(--success))]" />
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                All campaigns on track
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                No campaigns need attention right now.
              </p>
              <p className="mt-1 max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
                AI will flag deadline, pacing, and status risks here.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {alerts.map((alert) => (
                <button
                  type="button"
                  key={alert.id}
                  onClick={() => router.push(`/campaigns/${alert.id}`)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors hover:bg-white/80",
                    sev.innerCardBg,
                    sev.innerCardBorder
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[hsl(var(--foreground))] truncate">
                        {alert.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        {alert.client} · {alert.platform}
                      </p>
                    </div>
                    <span className="rounded-full border border-[hsl(var(--warning)/0.25)] bg-[hsl(var(--warning-soft))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--warning-foreground))] shrink-0">
                      {riskPriorityLabel(alert.daysRemaining)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Clock size={11} className="text-[hsl(var(--muted-foreground))]" />
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {daysLabel(alert.daysRemaining)}
                    </span>
                  </div>
                  <div className="mt-2 rounded-md border border-[hsl(var(--border)/0.7)] bg-white/65 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Suggested action
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--foreground))]">
                      {riskSuggestedAction(alert.daysRemaining)}
                    </p>
                  </div>
                </button>
              ))}

              <div className="rounded-lg border border-[hsl(var(--warning)/0.2)] bg-white/55 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles size={13} className="mt-0.5 shrink-0 text-[hsl(var(--warning))]" />
                  <div>
                    <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
                      AI recommendation
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                      Start with the closest deadline, then compare spend and conversions before changing budgets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/campaigns")}
            className={cn(
              "w-full mt-3 h-9 rounded-lg border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors",
              sev.buttonBorder,
              sev.buttonBg,
              sev.buttonHover,
              sev.buttonText
            )}
          >
            Review triage queue
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Portfolio AI Brief */}
        <div className="bg-[hsl(var(--brand-soft))] border border-[hsl(var(--brand)/0.2)] rounded-xl p-5 shadow-card lg:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-ai flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--accent-foreground))]">
                  Portfolio AI Brief
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "hsl(var(--brand) / 0.72)" }}
                >
                  {insightsLoading
                    ? "Analyzing campaigns, spend, deadlines, and saved insights..."
                    : aiGeneratedLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadAiBrief}
              disabled={insightsLoading}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--brand)/0.22)] bg-white/70 px-3 text-xs font-medium text-[hsl(var(--brand))] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={12}
                className={cn(insightsLoading && "animate-spin")}
                aria-hidden
              />
              {insightsLoading ? "Generating" : "Regenerate"}
            </button>
          </div>

          <div
            className="mt-3 rounded-lg border border-[hsl(var(--brand)/0.12)] bg-white/45 p-3"
            style={{ color: "hsl(var(--accent-foreground) / 0.86)" }}
          >
            <p className="text-sm font-medium">
              {aiBrief?.summary ??
                "AI will summarize portfolio performance once campaign signals are available."}
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Based on recent campaigns, deadlines, spend, metrics, and saved campaign insights.
            </p>
          </div>

          {insightsError && (
            <div className="mt-3 rounded-lg border border-[hsl(var(--warning)/0.25)] bg-[hsl(var(--warning-soft))] px-3 py-2 text-xs text-[hsl(var(--warning-foreground))]">
              {insightsError}
            </div>
          )}

          <div className="space-y-2 mt-3">
            {insightsLoading && !aiBrief ? (
              <div className="animate-pulse space-y-2">
                <div className="h-16 bg-white/50 rounded-lg" />
                <div className="h-16 bg-white/50 rounded-lg" />
                <div className="h-16 bg-white/50 rounded-lg" />
              </div>
            ) : aiBrief?.insights.length ? (
              aiBrief.insights.map((insight, i) => {
                const cfg = AI_CATEGORY_CONFIG[insight.category];
                const Icon = cfg.icon;
                const targetHref = insight.campaignId
                  ? `/campaigns/${insight.campaignId}`
                  : "/campaigns";

                return (
                  <button
                    type="button"
                    key={`${insight.category}-${insight.headline}-${i}`}
                    onClick={() => router.push(targetHref)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left backdrop-blur-sm transition-colors hover:bg-white/80",
                      AI_SEVERITY_CLASS[insight.severity]
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon size={14} className={cn("mt-0.5 shrink-0", cfg.iconClass)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                            {cfg.label}
                          </span>
                          {insight.campaignName && (
                            <span className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
                              {insight.campaignName}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                          {insight.headline}
                        </p>
                        <p className="mt-1 text-sm text-[hsl(var(--accent-foreground)/0.88)]">
                          {insight.insight}
                        </p>
                        <p className="mt-2 text-xs font-medium text-[hsl(var(--brand))]">
                          Recommended: {insight.recommendedAction}
                        </p>
                      </div>
                      <ArrowRight
                        size={13}
                        className="mt-1 shrink-0 text-[hsl(var(--muted-foreground))]"
                      />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-[hsl(var(--brand)/0.18)] bg-white/45 p-5 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-[hsl(var(--brand)/0.55)]" />
                <p className="mt-3 text-sm font-medium text-[hsl(var(--foreground))]">
                  No AI brief yet
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Add campaigns and metrics, then regenerate the portfolio AI brief.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-white/70 text-[hsl(var(--brand))] border border-[hsl(var(--brand)/0.2)] text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
                AI POWERED
              </span>
              {aiBrief?.source === "fallback" && (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Using safe fallback signals
                </span>
              )}
            </div>
            <button
              type="button"
              className="flex items-center justify-end gap-1 text-sm font-medium hover:underline"
              style={{ color: "hsl(var(--brand))" }}
              onClick={() => router.push("/campaigns")}
            >
              Review AI-prioritized campaigns
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3 — Recent Campaigns + Recent Clients ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

        {/* Recent Campaigns */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-card overflow-hidden">
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Recent Campaigns
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Latest activity across clients
              </p>
            </div>
            <button
              onClick={() => router.push("/campaigns")}
              className="text-xs font-medium hover:underline"
              style={{ color: "hsl(var(--brand))" }}
            >
              View all
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No campaigns yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                  <tr>
                    {["Campaign", "Client", "Platform", "Due", "Status", "Owner"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-[10px] uppercase tracking-wider font-medium text-[hsl(var(--muted-foreground))] px-5 py-2.5 text-left"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/campaigns/${c.id}`)}
                      className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.4)] cursor-pointer transition-colors last:border-0"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-[hsl(var(--foreground))] max-w-[200px]">
                        <span className="truncate block">{c.name}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {c.client}
                      </td>
                      <td className="px-5 py-3 text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {c.platform}
                      </td>
                      <td className="px-5 py-3 text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {c.due}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full text-white text-[10px] font-semibold flex items-center justify-center",
                            c.ownerBg
                          )}
                        >
                          {c.ownerInitials}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Recent Clients
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Active accounts
              </p>
            </div>
            <button
              onClick={() => router.push("/clients")}
              className="text-xs font-medium hover:underline"
              style={{ color: "hsl(var(--brand))" }}
            >
              View all
            </button>
          </div>

          {clients.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
              No clients yet.
            </p>
          ) : (
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      client.iconBg,
                      client.iconColor
                    )}
                  >
                    <client.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {client.industry}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      {client.campaigns}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Campaigns
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
