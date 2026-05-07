"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Pencil,
  Phone,
  Plus,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  Lightbulb,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Client, Campaign, ClientInsight } from "@/features/clients/types";
import { useClientMutations } from "@/features/clients/hooks/useClients";
import { getInitials } from "@/shared/format/strings";
import { formatRelativeTime, formatDateLong } from "@/shared/format/dates";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ClientDetailProps {
  client: Client;
  insights: ClientInsight[];
}

const statusStyles = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const campaignStatusStyles: Record<string, string> = {
  planned: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-green-50 text-green-700 border-green-200",
  at_risk: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived: "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const campaignStatusLabel: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  at_risk: "At Risk",
  completed: "Completed",
  archived: "Archived",
};
const INSIGHT_UI = {
  risk: {
    badge: "bg-orange-50 text-orange-600 border border-orange-200",
    iconWrap: "bg-orange-50 text-orange-500",
    label: "RISK",
    Icon: AlertTriangle,
  },
  performance: {
    badge: "bg-purple-50 text-purple-600 border border-purple-200",
    iconWrap: "bg-purple-50 text-purple-500",
    label: "TREND",
    Icon: TrendingDown,
  },
  recommendation: {
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
    iconWrap: "bg-blue-50 text-blue-500",
    label: "RECOMMENDATION",
    Icon: Lightbulb,
  },
} as const;

function CampaignTableHeader() {
  return (
    <div
      className="grid min-w-[420px] gap-4 border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
    >
      <span>Campaign</span>
      <span>Platform</span>
      <span>Status</span>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  return (
    <div
      className="grid min-w-[420px] cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
      style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
      onClick={() => router.push(`/campaigns/${campaign.id}`)}
    >
      <span className="text-sm font-medium truncate">{campaign.name}</span>
      <span className="text-sm text-muted-foreground">{campaign.platform}</span>
      <span
        className={cn(
          "text-xs px-2.5 py-1 rounded-full font-medium border w-fit",
          campaignStatusStyles[campaign.status] ?? campaignStatusStyles.planned,
        )}
      >
        {campaignStatusLabel[campaign.status] ?? campaign.status}
      </span>
    </div>
  );
}

export function ClientDetail({
  client,
  insights,
}: ClientDetailProps) {
  const router = useRouter();
  const { remove, loading } = useClientMutations();
  const [activeTab, setActiveTab] = useState<
    "overview" | "campaigns" | "notes"
  >("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const campaigns = client.campaigns ?? [];

  const handleDelete = async () => {
    await remove(client.id);
    router.push("/clients");
  };

  const initials = getInitials(client.name);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  const lastActivityDate =
    campaigns.length > 0
      ? [...campaigns].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0].createdAt
      : client.createdAt;

  const stats = [
    { label: "Total Campaigns", value: campaigns.length, valueClass: "", icon: MessageSquareText },
    { label: "Active", value: activeCampaigns, valueClass: "text-green-700", icon: TrendingDown },
    {
      label: "AI Insights",
      value: insights.length,
      valueClass: "text-primary",
      icon: Sparkles,
    },
    {
      label: "Last Activity",
      value: formatRelativeTime(lastActivityDate),
      valueClass: "",
      icon: CalendarDays,
    },
  ];

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "campaigns" as const, label: `Campaigns (${campaigns.length})` },
    { key: "notes" as const, label: "Notes" },
  ];

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete client?"
        description={`This will permanently delete "${client.name}" and all associated data. This action cannot be undone.`}
        confirmLabel="Delete Client"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <button
        onClick={() => router.push("/clients")}
        className="group inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Clients
      </button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="bg-gradient-to-br from-primary/10 via-[hsl(var(--brand-soft))] to-background px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary ring-1 ring-primary/15">
                {initials}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight">
                    {client.name}
                  </h1>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
                      statusStyles[client.status as keyof typeof statusStyles] ??
                        statusStyles.inactive,
                    )}
                  >
                    {client.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {client.company && <span>{client.company}</span>}
                  {client.industry && (
                    <span className="rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {client.industry}
                    </span>
                  )}
                  <span>Added {formatDateLong(client.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 items-center gap-2 sm:w-fit">
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => router.push(`/campaigns/new?clientId=${client.id}`)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Campaign
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 cursor-pointer bg-card/80"
                    aria-label="Open menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => router.push(`/clients/${client.id}/edit`)}
                    className="flex items-center px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p
                      className={cn(
                        "mt-1 text-2xl font-semibold tracking-tight",
                        stat.valueClass,
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[3fr_2fr]">
              {/* Left: Campaigns + AI Insights */}
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold">Campaigns</h2>
                    {campaigns.length > 5 && (
                      <button
                        onClick={() => setActiveTab("campaigns")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  {campaigns.length > 0 ? (
                    <div className="overflow-x-auto">
                      <CampaignTableHeader />
                      <div className="divide-y divide-border">
                        {campaigns.slice(0, 5).map((c) => (
                          <CampaignRow key={c.id} campaign={c} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <MessageSquareText className="h-5 w-5" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No campaigns yet
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/campaigns/new?clientId=${client.id}`)
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Create Campaign
                      </Button>
                    </div>
                  )}
                </div>

                {insights.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-semibold">AI Insights</h2>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {insights.length} total
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {insights
                        .slice()
                        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                        .slice(0, 3)
                        .map((insight) => {
                          const ui =
                            INSIGHT_UI[insight.type as keyof typeof INSIGHT_UI] ??
                            INSIGHT_UI.recommendation;
                          const Icon = ui.Icon;

                          const colonIdx = insight.content.indexOf(":");
                          const title =
                            colonIdx > -1 ? insight.content.slice(0, colonIdx) : insight.content;
                          const body =
                            colonIdx > -1 ? insight.content.slice(colonIdx + 1).trim() : "";

                          return (
                            <div
                              key={insight.id}
                              className="rounded-xl border border-border bg-card p-5 space-y-3"
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md", ui.badge)}>
                                  {ui.label}
                                </span>
                                {insight.score != null && (
                                  <span className="text-xs text-muted-foreground">
                                    Confidence {Math.round((insight.score ?? 0) * 100)}%
                                  </span>
                                )}
                                <span className="ml-auto text-xs text-muted-foreground/70">
                                  {formatRelativeTime(insight.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", ui.iconWrap)}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold leading-snug">{title}</p>
                                  {body && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {body}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Client Info */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Client Information</h2>
                  <button
                    onClick={() => router.push(`/clients/${client.id}/edit`)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <InfoRow icon={Building2} label="Company / Brand" value={client.company} />
                  <InfoRow icon={Sparkles} label="Industry" value={client.industry} />
                  <InfoRow icon={Mail} label="Email" value={client.email} />
                  <InfoRow icon={Phone} label="Phone" value={client.phone} />
                  <InfoRow icon={Globe} label="Website" value={client.website} />
                  <InfoRow icon={CalendarDays} label="Added On" value={formatDateLong(client.createdAt)} />
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              {campaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <CampaignTableHeader />
                  <div className="divide-y divide-border">
                    {campaigns.map((c) => (
                      <CampaignRow key={c.id} campaign={c} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No campaigns yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/campaigns/new?clientId=${client.id}`)
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Campaign
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="max-w-2xl space-y-2 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-sm font-semibold">Notes</h2>
              {client.notes ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {client.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes added.{" "}
                  <button
                    onClick={() => router.push(`/clients/${client.id}/edit`)}
                    className="text-primary hover:underline"
                  >
                    Add notes
                  </button>
                </p>
              )}
            </div>
          )}
      </>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/25 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="max-w-full truncate text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}
