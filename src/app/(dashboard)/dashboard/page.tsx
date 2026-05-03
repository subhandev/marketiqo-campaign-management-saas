"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type AlertSeverity = "critical" | "warning" | "info" | "none";

type CampaignStatus = "at_risk" | "active" | "completed" | "archived" | "planned";

// ── Severity system ───────────────────────────────────────────────────────────

const ALERT_SEVERITY_MAP: Record<string, AlertSeverity> = {
  failed: "critical",
  critical: "critical",
  at_risk: "warning",
  overdue: "warning",
  needs_review: "info",
  pending: "info",
};

function getAlertSeverity(status: string): AlertSeverity {
  return ALERT_SEVERITY_MAP[status] ?? "none";
}

function getHighestSeverity(alerts: typeof MOCK_ALERTS): AlertSeverity {
  const order: AlertSeverity[] = ["critical", "warning", "info", "none"];
  for (const level of order) {
    if (alerts.some((a) => getAlertSeverity(a.status) === level)) return level;
  }
  return "none";
}

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
    badge: "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)]",
  },
  at_risk: {
    label: "At Risk",
    dot: "bg-[hsl(var(--warning))]",
    badge: "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning-foreground))] border border-[hsl(var(--warning)/0.3)]",
  },
  completed: {
    label: "Completed",
    dot: "bg-[hsl(var(--muted-foreground)/0.5)]",
    badge: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
  },
  archived: {
    label: "Archived",
    dot: "bg-[hsl(var(--muted-foreground)/0.4)]",
    badge: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
  },
  planned: {
    label: "Planned",
    dot: "bg-[hsl(var(--brand))]",
    badge: "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))] border border-[hsl(var(--brand)/0.3)]",
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

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ALERTS = [
  {
    id: 1,
    name: "Instagram Growth Campaign",
    client: "GreenLeaf Organics",
    platform: "Meta",
    daysRemaining: 12,
    status: "at_risk" as const,
  },
];

const MOCK_STATS = [
  {
    label: "Active Campaigns",
    value: "4",
    trend: "+12% vs last month",
    up: true,
    icon: MessageSquare,
    iconBg: "bg-[hsl(var(--brand-soft))]",
    iconColor: "text-[hsl(var(--brand))]",
    trendColor: "text-[hsl(var(--success))]",
    href: "/campaigns",
  },
  {
    label: "At Risk",
    value: "1",
    trend: "+1 vs last month",
    up: false,
    icon: AlertTriangle,
    iconBg: "bg-[hsl(var(--warning-soft))]",
    iconColor: "text-[hsl(var(--warning))]",
    trendColor: "text-[hsl(var(--warning))]",
    href: "/campaigns",
  },
  {
    label: "Completed",
    value: "2",
    trend: "+2 vs last month",
    up: true,
    icon: CheckCircle2,
    iconBg: "bg-[hsl(var(--success-soft))]",
    iconColor: "text-[hsl(var(--success))]",
    trendColor: "text-[hsl(var(--success))]",
    href: "/campaigns",
  },
  {
    label: "Total Clients",
    value: "5",
    trend: "+1 vs last month",
    up: true,
    icon: Users,
    iconBg: "bg-[hsl(var(--info-soft))]",
    iconColor: "text-[hsl(var(--info))]",
    trendColor: "text-[hsl(var(--success))]",
    href: "/clients",
  },
  {
    label: "Total Spend",
    value: "$73.4K",
    trend: "+8.2% vs last month",
    up: true,
    icon: DollarSign,
    iconBg: "bg-[hsl(var(--brand-soft))]",
    iconColor: "text-[hsl(var(--brand))]",
    trendColor: "text-[hsl(var(--success))]",
    href: "/campaigns",
  },
];

const MOCK_CAMPAIGNS: {
  id: string;
  name: string;
  client: string;
  platform: string;
  due: string;
  status: CampaignStatus;
  ownerInitials: string;
  ownerBg: string;
}[] = [
  {
    id: "1",
    name: "Instagram Growth Campaign",
    client: "GreenLeaf Organics",
    platform: "Meta",
    due: "May 15",
    status: "at_risk",
    ownerInitials: "SA",
    ownerBg: "bg-[hsl(var(--primary))]",
  },
  {
    id: "2",
    name: "Summer Sale Launch 2026",
    client: "Nike Regional",
    platform: "Meta",
    due: "Jul 31",
    status: "active",
    ownerInitials: "JH",
    ownerBg: "bg-[hsl(var(--brand))]",
  },
  {
    id: "3",
    name: "Brand Awareness — YouTube",
    client: "Nike Regional",
    platform: "YouTube",
    due: "Mar 31",
    status: "completed",
    ownerInitials: "NO",
    ownerBg: "bg-[hsl(var(--success))]",
  },
  {
    id: "4",
    name: "Nike Regional Launch",
    client: "Nike Regional",
    platform: "Twitter/X",
    due: "Jun 15",
    status: "archived",
    ownerInitials: "JH",
    ownerBg: "bg-[hsl(var(--brand))]",
  },
  {
    id: "5",
    name: "EduLearn Spring",
    client: "EduLearn",
    platform: "Meta",
    due: "Aug 12",
    status: "archived",
    ownerInitials: "NO",
    ownerBg: "bg-[hsl(var(--success))]",
  },
];

const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Nike Regional",
    industry: "Ecommerce",
    campaigns: 3,
    icon: ShoppingBag,
    iconBg: "bg-[hsl(var(--brand-soft))]",
    iconColor: "text-[hsl(var(--brand))]",
  },
  {
    id: "2",
    name: "EduLearn",
    industry: "Education",
    campaigns: 2,
    icon: GraduationCap,
    iconBg: "bg-[hsl(var(--warning-soft))]",
    iconColor: "text-[hsl(var(--warning))]",
  },
  {
    id: "3",
    name: "StartupX",
    industry: "SaaS",
    campaigns: 2,
    icon: Rocket,
    iconBg: "bg-[hsl(var(--accent))]",
    iconColor: "text-[hsl(var(--accent-foreground))]",
  },
  {
    id: "4",
    name: "Local Mart",
    industry: "Retail",
    campaigns: 1,
    icon: Store,
    iconBg: "bg-[hsl(var(--success-soft))]",
    iconColor: "text-[hsl(var(--success))]",
  },
];

const HEALTH_LEGEND = [
  { label: "Active", dot: "bg-[hsl(var(--success))]", pct: "40%", count: 4, flex: "flex-[4]", bar: "bg-[hsl(var(--success))]" },
  { label: "At Risk", dot: "bg-[hsl(var(--destructive))]", pct: "10%", count: 1, flex: "flex-[1]", bar: "bg-[hsl(var(--destructive))]" },
  { label: "Completed", dot: "bg-[hsl(var(--brand))]", pct: "20%", count: 2, flex: "flex-[2]", bar: "bg-[hsl(var(--brand))]" },
  { label: "Planned", dot: "bg-[hsl(var(--warning))]", pct: "10%", count: 1, flex: "flex-[1]", bar: "bg-[hsl(var(--warning))]" },
  { label: "Archived", dot: "bg-[hsl(var(--muted-foreground)/0.25)]", pct: "20%", count: 2, flex: "flex-[2]", bar: "bg-[hsl(var(--muted-foreground)/0.25)]" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.username ?? "there";

  const severity = getHighestSeverity(MOCK_ALERTS);
  const sev = SEVERITY_CONFIG[severity];
  const SevIcon = sev.IconComponent;

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
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            All systems operational
          </span>
        </div>
      </div>

      {/* ── Row 1 — KPI cards ── */}
      <div className="grid grid-cols-5 gap-4">
        {MOCK_STATS.map((stat) => (
          <div
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-5 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                {stat.label}
              </p>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", stat.iconBg)}>
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
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", sev.iconBg)}>
              <SevIcon size={15} className={sev.iconColor} />
            </div>
            <div>
              <p className={cn("text-sm font-semibold", sev.titleColor)}>
                Needs Attention
              </p>
              <p className={cn("text-xs", sev.subtitleColor)}>
                {MOCK_ALERTS.length} campaign{MOCK_ALERTS.length !== 1 ? "s" : ""} require{MOCK_ALERTS.length === 1 ? "s" : ""} action
              </p>
            </div>
          </div>

          {MOCK_ALERTS.length === 0 ? (
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
            MOCK_ALERTS.map((alert) => (
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
                  <StatusBadge status={alert.status as CampaignStatus} />
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {alert.client} · {alert.platform}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock size={11} className="text-[hsl(var(--muted-foreground))]" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {alert.daysRemaining} days remaining
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
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--brand) / 0.7)" }}>
                Updated just now
              </p>
            </div>
            <span className="ml-auto bg-white/70 text-[hsl(var(--brand))] border border-[hsl(var(--brand)/0.2)] text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
              BETA
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {[
              {
                icon: Zap,
                iconClass: "text-[hsl(var(--brand))]",
                text: "4 active campaigns currently running across your portfolio.",
              },
              {
                icon: AlertTriangle,
                iconClass: "text-[hsl(var(--warning))]",
                text: "1 campaign needs attention — review at-risk campaigns now.",
              },
              {
                icon: DollarSign,
                iconClass: "text-[hsl(var(--success))]",
                text: "$73,400 total spend tracked across all clients.",
              },
            ].map(({ icon: Icon, iconClass, text }) => (
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

          <table className="w-full">
            <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
              <tr>
                {["Campaign", "Client", "Platform", "Due", "Status", "Owner"].map((h) => (
                  <th
                    key={h}
                    className="text-[10px] uppercase tracking-wider font-medium text-[hsl(var(--muted-foreground))] px-5 py-2.5 text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CAMPAIGNS.map((c) => (
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

          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {MOCK_CLIENTS.map((client) => (
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
              Distribution across 10 campaigns
            </p>
          </div>
          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">10</span>
        </div>

        {/* Segmented bar */}
        <div className="flex w-full h-2 rounded-full overflow-hidden mt-4 gap-px">
          {HEALTH_LEGEND.map((item) => (
            <div key={item.label} className={cn(item.flex, item.bar)} />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-5 gap-6 mt-4">
          {HEALTH_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", item.dot)} />
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
      </div>

    </div>
  );
}
