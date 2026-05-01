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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CampaignStatus } from "@/features/campaigns/types";

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

// Simple donut chart using SVG
function DonutChart({ health }: { health: DashboardData["health"] }) {
  const total = health.total;
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
      No campaigns yet
    </div>
  );

  const segments = [
    { key: "active",    value: health.active,    color: "#22c55e", label: "Active" },
    { key: "at_risk",   value: health.at_risk,   color: "#f97316", label: "At Risk" },
    { key: "completed", value: health.completed, color: "#94a3b8", label: "Completed" },
    { key: "planned",   value: health.planned,   color: "#3b82f6", label: "Planned" },
  ].filter((s) => s.value > 0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((segment) => {
            const pct = segment.value / total;
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
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="font-semibold ml-auto pl-4">
              {segment.value}
              <span className="text-muted-foreground font-normal ml-1">
                ({Math.round((segment.value / total) * 100)}%)
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
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, health, recentCampaigns } = data;

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

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Campaigns",
            value: stats.activeCampaigns,
            icon: Megaphone,
            color: "text-green-600",
            bg: "bg-green-50",
            onClick: () => router.push("/campaigns"),
          },
          {
            label: "At Risk",
            value: stats.atRiskCampaigns,
            icon: AlertTriangle,
            color: "text-orange-600",
            bg: "bg-orange-50",
            onClick: () => router.push("/campaigns"),
          },
          {
            label: "Completed",
            value: stats.completedCampaigns,
            icon: CheckCircle,
            color: "text-zinc-500",
            bg: "bg-zinc-100",
            onClick: () => router.push("/campaigns"),
          },
          {
            label: "Total Clients",
            value: stats.totalClients,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            onClick: () => router.push("/clients"),
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
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Insights */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">AI Insights</h2>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                Beta
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/campaigns")}
            >
              View all campaigns
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>

          {stats.atRiskCampaigns > 0 ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <p className="text-xs font-semibold">
                    {stats.atRiskCampaigns} campaign{stats.atRiskCampaigns > 1 ? "s" : ""} need your attention
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  You have {stats.atRiskCampaigns} at-risk campaign{stats.atRiskCampaigns > 1 ? "s" : ""} that may need immediate action to stay on track.
                </p>
                <button
                  onClick={() => router.push("/campaigns")}
                  className="text-xs text-orange-600 font-medium hover:underline mt-1"
                >
                  View at-risk campaigns →
                </button>
              </div>

              <div className="p-3 rounded-lg border border-green-200 bg-green-50/50 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-xs font-semibold">
                    {stats.activeCampaigns} campaign{stats.activeCampaigns > 1 ? "s" : ""} running smoothly
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your active campaigns are in progress. Open each campaign to generate AI insights and track performance.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-semibold">
                    ${stats.totalSpend.toLocaleString()} total spend tracked
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Open individual campaigns and click "Generate AI Report" to get performance analysis and optimization recommendations.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-3 py-8">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">All campaigns looking good</p>
                <p className="text-xs text-muted-foreground">
                  No campaigns are at risk. Open any campaign to generate detailed AI insights.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/campaigns")}
              >
                View campaigns
              </Button>
            </div>
          )}
        </div>

        {/* Campaign Health */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold">Campaign Health</h2>
          <DonutChart health={health} />
        </div>

      </div>

      {/* Recent Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Campaigns</h2>
          <button
            onClick={() => router.push("/campaigns")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {recentCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <p className="text-sm text-muted-foreground">No campaigns yet</p>
              <Button
                size="sm"
                onClick={() => router.push("/campaigns/new")}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
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
                        {campaign.client && (
                          <span>{campaign.client.name}</span>
                        )}
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

    </div>
  );
}