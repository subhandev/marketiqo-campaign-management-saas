"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CampaignStatus } from "@/features/campaigns/types";
import { Skeleton } from "@/components/ui/skeleton";

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

const statusStyles: Record<CampaignStatus, string> = {
  planned:   "bg-blue-50 text-blue-700 border-blue-200",
  active:    "bg-green-50 text-green-700 border-green-200",
  at_risk:   "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived:  "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const statusLabel: Record<CampaignStatus, string> = {
  planned:   "Planned",
  active:    "Active",
  at_risk:   "At Risk",
  completed: "Completed",
  archived:  "Archived",
};

function DonutChart({ health }: { health: DashboardData["health"] }) {
  const segments = [
    { key: "active",    value: health.active,    color: "#22c55e", label: "Active" },
    { key: "at_risk",   value: health.at_risk,   color: "#f97316", label: "At Risk" },
    { key: "completed", value: health.completed, color: "#94a3b8", label: "Completed" },
    { key: "planned",   value: health.planned,   color: "#3b82f6", label: "Planned" },
    { key: "archived",  value: health.archived,  color: "#d4d4d8", label: "Archived" },
  ].filter((s) => s.value > 0);

  // Use sum of visible segments so percentages always add to 100%
  const segmentTotal = segments.reduce((sum, s) => sum + s.value, 0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((segment) => {
            const pct = segment.value / segmentTotal;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const el = (
              <circle
                key={segment.key}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="20"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                className="transition-all duration-500"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{health.total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-sm">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="font-semibold ml-auto pl-4">
              {segment.value}
              <span className="text-muted-foreground font-normal ml-1">
                ({Math.round((segment.value / segmentTotal) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (!data) return null;

  const { stats, health, recentCampaigns, atRiskCampaignsList, recentClients } = data;
  const hasAnyCampaigns = health.total > 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()} 👋
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Row — 5 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Active Campaigns",
            value: stats.activeCampaigns,
            display: String(stats.activeCampaigns),
            icon: Megaphone,
            color: "text-green-600",
            bg: "bg-green-50",
            onClick: () => router.push("/campaigns"),
          },
          {
            label: "At Risk",
            value: stats.atRiskCampaigns,
            display: String(stats.atRiskCampaigns),
            icon: AlertTriangle,
            color: "text-orange-600",
            bg: "bg-orange-50",
            onClick: () => router.push("/campaigns"),
          },
          {
            label: "Completed",
            value: stats.completedCampaigns,
            display: String(stats.completedCampaigns),
            icon: CheckCircle,
            color: "text-zinc-500",
            bg: "bg-zinc-100",
            onClick: () => router.push("/campaigns"),
          },
          {
            label: "Total Clients",
            value: stats.totalClients,
            display: String(stats.totalClients),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            onClick: () => router.push("/clients"),
          },
          {
            label: "Total Spend",
            value: stats.totalSpend,
            display: `$${stats.totalSpend.toLocaleString()}`,
            icon: DollarSign,
            color: "text-purple-600",
            bg: "bg-purple-50",
            onClick: () => router.push("/campaigns"),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            onClick={stat.onClick}
            className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.display}</p>
            {stat.value === 0 && (
              <p className="text-xs text-muted-foreground">No data yet</p>
            )}
          </div>
        ))}
      </div>

      {/* Middle Row — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Needs Attention */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold">Needs Attention</h2>
              {stats.atRiskCampaigns > 0 && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                  {stats.atRiskCampaigns}
                </span>
              )}
            </div>
            <button
              onClick={() => router.push("/campaigns")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </button>
          </div>

          {atRiskCampaignsList.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-8">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm font-medium">All campaigns on track</p>
              <p className="text-xs text-muted-foreground">
                No campaigns need attention right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {atRiskCampaignsList.map((campaign) => {
                const daysLeft = campaign.deadline
                  ? Math.ceil(
                      (new Date(campaign.deadline).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;
                return (
                  <div
                    key={campaign.id}
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="flex items-start justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/40 cursor-pointer hover:bg-orange-50 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {campaign.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.client?.name} · {campaign.platform}
                      </p>
                    </div>
                    <div className="shrink-0 ml-2 text-right">
                      {daysLeft !== null && (
                        <p className={cn(
                          "text-xs font-medium",
                          daysLeft <= 3 ? "text-red-600" :
                          daysLeft <= 7 ? "text-orange-600" :
                          "text-muted-foreground"
                        )}>
                          {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Campaign Health */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold">Campaign Health</h2>
          {!hasAnyCampaigns ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <p className="text-sm text-muted-foreground">No campaigns yet</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/campaigns/new")}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <DonutChart health={health} />
          )}
        </div>

        {/* AI Summary */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">AI Summary</h2>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Beta
            </span>
          </div>

          {!hasAnyCampaigns ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              <p className="text-sm text-muted-foreground">
                Add clients and run campaigns to generate AI insights
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/clients/new")}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Client
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-green-200 bg-green-50/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    <p className="text-xs font-semibold">
                      {stats.activeCampaigns} active campaign{stats.activeCampaigns !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently running across your client portfolio.
                  </p>
                </div>

                {stats.atRiskCampaigns > 0 && (
                  <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      <p className="text-xs font-semibold">
                        {stats.atRiskCampaigns} need{stats.atRiskCampaigns === 1 ? "s" : ""} attention
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Open each at-risk campaign and generate AI insights for recommendations.
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-xs font-semibold">
                      ${stats.totalSpend.toLocaleString()} tracked
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total spend across all campaigns. Open campaigns to generate AI analysis.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/campaigns")}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                View all campaigns
              </Button>
            </>
          )}
        </div>

      </div>

      {/* Bottom Row — equal height Recent Campaigns + Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Recent Campaigns */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Campaigns</h2>
            <button
              onClick={() => router.push("/campaigns")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col flex-grow">
            {recentCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 flex-grow">
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/campaigns/new")}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border flex-grow">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {campaign.name[0]}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium">{campaign.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {campaign.client && <span>{campaign.client.name}</span>}
                          <span>·</span>
                          <span>{campaign.platform}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {campaign.deadline && (
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          Due {new Date(campaign.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium border",
                        statusStyles[campaign.status]
                      )}>
                        {statusLabel[campaign.status]}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Clients</h2>
            <button
              onClick={() => router.push("/clients")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col flex-grow">
            {recentClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 flex-grow">
                <p className="text-sm text-muted-foreground">No clients yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/clients/new")}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Client
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border flex-grow">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {client.name[0]}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium">{client.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {client.industry ?? "No industry"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {client.campaignCount} campaign{client.campaignCount !== 1 ? "s" : ""}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
