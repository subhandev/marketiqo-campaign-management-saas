"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatus } from "@/features/campaigns/types";

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSpend(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtDeadline(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNameInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function daysLabel(n: number | null): string {
  if (n === null) return "No deadline set";
  if (n < 0) return `Overdue by ${Math.abs(n)} day${Math.abs(n) !== 1 ? "s" : ""}`;
  if (n === 0) return "Due today";
  return `${n} day${n !== 1 ? "s" : ""} remaining`;
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

// ── Health segment color config ───────────────────────────────────────────────

const HEALTH_SEGMENTS = [
  { label: "Active",    key: "active" as const,    bar: "bg-[hsl(var(--success))]",              dot: "bg-[hsl(var(--success))]" },
  { label: "At Risk",  key: "at_risk" as const,   bar: "bg-[hsl(var(--destructive))]",          dot: "bg-[hsl(var(--destructive))]" },
  { label: "Completed",key: "completed" as const, bar: "bg-[hsl(var(--brand))]",                dot: "bg-[hsl(var(--brand))]" },
  { label: "Planned",  key: "planned" as const,   bar: "bg-[hsl(var(--warning))]",              dot: "bg-[hsl(var(--warning))]" },
  { label: "Archived", key: "archived" as const,  bar: "bg-[hsl(var(--muted-foreground)/0.25)]",dot: "bg-[hsl(var(--muted-foreground)/0.25)]" },
];

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-4 w-36 mt-1.5" />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr" }}>
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.username ?? "there";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Captured when data loads so deadline diffs are stable across re-renders
  const [fetchedAt, setFetchedAt] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData) => {
        setData(d);
        setFetchedAt(Date.now());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-[hsl(var(--muted-foreground))] text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  const { stats, health, recentCampaigns, atRiskCampaignsList, recentClients } = data;

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
      value: formatSpend(stats.totalSpend),
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

  // ── Recent Campaigns ───────────────────────────────────────────────────────

  const campaigns = recentCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    client: c.client?.name ?? "—",
    platform: c.platform,
    due: fmtDeadline(c.deadline),
    status: c.status,
    ownerInitials: getNameInitials(c.client?.name ?? c.name),
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

  // ── Campaign Health ────────────────────────────────────────────────────────

  const healthLegend = HEALTH_SEGMENTS.map((seg) => {
    const value = health[seg.key];
    return {
      ...seg,
      value,
      pct: `${health.total > 0 ? Math.round((value / health.total) * 100) : 0}%`,
      count: value,
    };
  });

  // ── AI Summary insights ────────────────────────────────────────────────────

  const aiInsights = [
    {
      icon: Zap,
      iconClass: "text-[hsl(var(--brand))]",
      text: `${stats.activeCampaigns} active campaign${stats.activeCampaigns !== 1 ? "s" : ""} currently running across your portfolio.`,
    },
    {
      icon: AlertTriangle,
      iconClass: "text-[hsl(var(--warning))]",
      text:
        stats.atRiskCampaigns > 0
          ? `${stats.atRiskCampaigns} campaign${stats.atRiskCampaigns !== 1 ? "s" : ""} need${stats.atRiskCampaigns === 1 ? "s" : ""} attention — review at-risk campaigns now.`
          : "All campaigns are on track — no immediate action needed.",
    },
    {
      icon: DollarSign,
      iconClass: "text-[hsl(var(--success))]",
      text: `${formatSpend(stats.totalSpend)} total spend tracked across all clients.`,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Here&apos;s what&apos;s happening across your campaigns today.
          </p>
        </div>
        
      </div>

      {/* ── Row 1 — KPI cards ── */}
      <div className="grid grid-cols-5 gap-4">
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
      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr" }}>

        {/* Needs Attention — dynamic severity */}
        <div
          className={cn(
            "rounded-xl p-5 shadow-card border",
            sev.cardBg,
            sev.cardBorder
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                sev.iconBg
              )}
            >
              <SevIcon size={15} className={sev.iconColor} />
            </div>
            <div>
              <p className={cn("text-sm font-semibold", sev.titleColor)}>
                Needs Attention
              </p>
              <p className={cn("text-xs", sev.subtitleColor)}>
                {alerts.length} campaign{alerts.length !== 1 ? "s" : ""} require
                {alerts.length === 1 ? "s" : ""} action
              </p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-6 mt-3">
              <CheckCircle2 size={28} className="text-[hsl(var(--success))]" />
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                All campaigns on track
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                No campaigns need attention right now.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "rounded-lg border p-3 mt-3",
                  sev.innerCardBg,
                  sev.innerCardBorder
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-[hsl(var(--foreground))] truncate">
                    {alert.name}
                  </span>
                  <StatusBadge status="at_risk" />
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {alert.client} · {alert.platform}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock size={11} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {daysLabel(alert.daysRemaining)}
                  </span>
                </div>
              </div>
            ))
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
            Review campaign
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* AI Summary */}
        <div className="bg-[hsl(var(--brand-soft))] border border-[hsl(var(--brand)/0.2)] rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-ai flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--accent-foreground))]">
                AI Summary
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "hsl(var(--brand) / 0.7)" }}
              >
                Updated just now
              </p>
            </div>
            <span className="ml-auto bg-white/70 text-[hsl(var(--brand))] border border-[hsl(var(--brand)/0.2)] text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
              BETA
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {aiInsights.map(({ icon: Icon, iconClass, text }) => (
              <div
                key={text}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 border border-[hsl(var(--brand)/0.12)] backdrop-blur-sm"
              >
                <Icon size={13} className={cn("mt-0.5 shrink-0", iconClass)} />
                <span
                  className="text-sm"
                  style={{ color: "hsl(var(--accent-foreground) / 0.9)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-end gap-1 mt-3 text-sm font-medium cursor-pointer hover:underline"
            style={{ color: "hsl(var(--brand))" }}
            onClick={() => router.push("/campaigns")}
          >
            View full AI report
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* ── Row 3 — Recent Campaigns + Recent Clients ── */}
      <div className="grid grid-cols-[1fr_300px] gap-4">

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
            <table className="w-full">
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

      {/* ── Row 4 — Campaign Health ── */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Campaign Health
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Distribution across {health.total} campaign{health.total !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {health.total}
          </span>
        </div>

        {health.total === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4 text-center py-4">
            No campaigns yet.
          </p>
        ) : (
          <>
            {/* Segmented bar — flex values driven by real counts */}
            <div className="flex w-full h-2 rounded-full overflow-hidden mt-4 gap-px">
              {healthLegend
                .filter((item) => item.value > 0)
                .map((item) => (
                  <div
                    key={item.label}
                    className={item.bar}
                    style={{ flex: item.value }}
                  />
                ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-5 gap-6 mt-4">
              {healthLegend.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn("w-2.5 h-2.5 rounded-full shrink-0", item.dot)}
                    />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {item.pct}
                    </span>
                    <span className="text-sm font-semibold text-[hsl(var(--foreground))] ml-2">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
