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
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock data ─────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Active Campaigns",
    value: "4",
    trend: "+12% vs last month",
    up: true,
    icon: MessageSquare,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    href: "/campaigns",
  },
  {
    label: "At Risk",
    value: "1",
    trend: "+1 vs last month",
    up: false,
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    href: "/campaigns",
  },
  {
    label: "Completed",
    value: "2",
    trend: "+2 vs last month",
    up: true,
    icon: CheckCircle2,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    href: "/campaigns",
  },
  {
    label: "Total Clients",
    value: "5",
    trend: "+1 vs last month",
    up: true,
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    href: "/clients",
  },
  {
    label: "Total Spend",
    value: "$73.4K",
    trend: "+8.2% vs last month",
    up: true,
    icon: DollarSign,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    href: "/campaigns",
  },
];

const RECENT_CAMPAIGNS = [
  {
    id: "1",
    name: "Instagram Growth Campaign",
    client: "GreenLeaf Organics",
    platform: "Meta",
    due: "May 15",
    status: "at_risk" as const,
    ownerInitials: "SA",
    ownerBg: "bg-zinc-800",
  },
  {
    id: "2",
    name: "Summer Sale Launch 2026",
    client: "Nike Regional",
    platform: "Meta",
    due: "Jul 31",
    status: "active" as const,
    ownerInitials: "JH",
    ownerBg: "bg-blue-600",
  },
  {
    id: "3",
    name: "Brand Awareness — YouTube",
    client: "Nike Regional",
    platform: "YouTube",
    due: "Mar 31",
    status: "completed" as const,
    ownerInitials: "NO",
    ownerBg: "bg-green-700",
  },
  {
    id: "4",
    name: "Nike Regional Launch",
    client: "Nike Regional",
    platform: "Twitter/X",
    due: "Jun 15",
    status: "archived" as const,
    ownerInitials: "JH",
    ownerBg: "bg-blue-600",
  },
  {
    id: "5",
    name: "EduLearn Spring",
    client: "EduLearn",
    platform: "Meta",
    due: "Aug 12",
    status: "archived" as const,
    ownerInitials: "NO",
    ownerBg: "bg-green-700",
  },
];

const RECENT_CLIENTS = [
  {
    id: "1",
    name: "Nike Regional",
    industry: "Ecommerce",
    campaigns: 3,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    initial: "N",
  },
  {
    id: "2",
    name: "EduLearn",
    industry: "Education",
    campaigns: 2,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    initial: "E",
  },
  {
    id: "3",
    name: "StartupX",
    industry: "SaaS",
    campaigns: 2,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    initial: "S",
  },
  {
    id: "4",
    name: "Local Mart",
    industry: "Retail",
    campaigns: 1,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    initial: "L",
  },
];

// ── Status badge config ───────────────────────────────────────────────────────

type Status = "at_risk" | "active" | "completed" | "archived" | "planned";

const STATUS_CONFIG: Record<
  Status,
  { label: string; dot: string; badge: string }
> = {
  at_risk: {
    label: "At Risk",
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  active: {
    label: "Active",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border border-green-200",
  },
  completed: {
    label: "Completed",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  },
  archived: {
    label: "Archived",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  },
  planned: {
    label: "Planned",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit",
        cfg.badge
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="space-y-4">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening across your campaigns today.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          All systems operational
        </div>
      </div>

      {/* ── Row 1 — 5 stat cards ── */}
      <div className="grid grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className="rounded-xl border border-border bg-card shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  stat.iconBg
                )}
              >
                <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight mt-2">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {stat.up ? (
                <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
              )}
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Needs Attention + AI Summary ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Needs Attention */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
            <span className="font-semibold text-sm">Needs Attention</span>
            <span className="text-xs text-muted-foreground">
              1 campaign requires action
            </span>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Instagram Growth Campaign</span>
              <StatusBadge status="at_risk" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              GreenLeaf Organics · Meta
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">12 days remaining</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/campaigns")}
            className="w-full mt-3 border border-border bg-background hover:bg-muted/50 text-sm font-medium h-9 rounded-lg transition-colors"
          >
            Review campaign →
          </button>
        </div>

        {/* AI Summary */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
            <span className="font-semibold text-sm">AI Summary</span>
            <span className="text-xs text-muted-foreground">Updated just now</span>
            <span className="ml-auto bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
              BETA
            </span>
          </div>

          <div className="mt-3 space-y-0.5">
            <div className="flex items-start gap-2.5 text-sm py-1">
              <Zap className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>4 active campaigns currently running across your portfolio.</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm py-1">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <span>1 campaign needs attention — review at-risk campaigns now.</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm py-1">
              <DollarSign className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <span>$73,400 total spend tracked across all clients.</span>
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={() => router.push("/campaigns")}
              className="text-sm text-primary font-medium hover:underline"
            >
              View full AI report →
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3 — Recent Campaigns + Recent Clients ── */}
      <div className="grid grid-cols-[1fr_280px] gap-4">

        {/* Recent Campaigns */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-semibold text-sm">Recent Campaigns</span>
              <span className="text-xs text-muted-foreground ml-2">
                Latest activity across clients
              </span>
            </div>
            <button
              onClick={() => router.push("/campaigns")}
              className="text-sm text-primary font-medium hover:underline"
            >
              View all
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Campaign", "Client", "Platform", "Due", "Status", "Owner"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-xs uppercase tracking-wide text-muted-foreground pb-2 text-left font-medium"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {RECENT_CAMPAIGNS.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/campaigns/${c.id}`)}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 pr-3 text-sm font-medium max-w-[180px] truncate">
                    {c.name}
                  </td>
                  <td className="py-2.5 pr-3 text-sm text-muted-foreground whitespace-nowrap">
                    {c.client}
                  </td>
                  <td className="py-2.5 pr-3 text-sm whitespace-nowrap">{c.platform}</td>
                  <td className="py-2.5 pr-3 text-sm text-muted-foreground whitespace-nowrap">
                    {c.due}
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-medium",
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
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-sm">Recent Clients</span>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </div>
            <button
              onClick={() => router.push("/clients")}
              className="text-sm text-primary font-medium hover:underline"
            >
              View all
            </button>
          </div>

          {RECENT_CLIENTS.map((client) => (
            <div
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="flex items-center justify-between py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 transition-colors -mx-2 px-2 rounded"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0",
                    client.iconBg,
                    client.iconColor
                  )}
                >
                  {client.initial}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.industry}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{client.campaigns}</p>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                  Campaigns
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 4 — Campaign Health ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm">Campaign Health</span>
            <span className="text-xs text-muted-foreground ml-2">
              Distribution across 10 campaigns
            </span>
          </div>
          <span className="text-2xl font-bold">10</span>
        </div>

        {/* Segmented bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex mt-3">
          <div className="flex-[4] bg-green-500" />
          <div className="flex-[1] bg-red-500" />
          <div className="flex-[2] bg-blue-500" />
          <div className="flex-[1] bg-yellow-400" />
          <div className="flex-[2] bg-zinc-300" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          {[
            { label: "Active", dot: "bg-green-500", pct: "40%", count: 4 },
            { label: "At Risk", dot: "bg-red-500", pct: "10%", count: 1 },
            { label: "Completed", dot: "bg-blue-500", pct: "20%", count: 2 },
            { label: "Planned", dot: "bg-yellow-400", pct: "10%", count: 1 },
            { label: "Archived", dot: "bg-zinc-300", pct: "20%", count: 2 },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn("w-2.5 h-2.5 rounded-full shrink-0", item.dot)}
                />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{item.pct}</span>
                <span className="text-sm font-semibold ml-1">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
