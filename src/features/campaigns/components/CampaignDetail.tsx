"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreHorizontal,
  Sparkles,
  Calendar,
  Target,
  Globe,
  TrendingUp,
  MousePointer,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Campaign, CampaignStatus } from "@/features/campaigns/types";
import { useCampaignMutations } from "@/features/campaigns/hooks/useCampaigns";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: string;
  content: string;
  score: number | null;
  createdAt: string;
}

interface CampaignDetailProps {
  campaign: Campaign & { insights?: Insight[] };
}

const statusStyles: Record<CampaignStatus, string> = {
  planned: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-green-50 text-green-700 border-green-200",
  at_risk: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived: "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const statusLabel: Record<CampaignStatus, string> = {
  planned: "Planned",
  active: "Active",
  at_risk: "At Risk",
  completed: "Completed",
  archived: "Archived",
};

const insightIcon = (type: string) => {
  switch (type) {
    case "risk":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "performance":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "recommendation":
      return <Lightbulb className="h-4 w-4 text-blue-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-primary" />;
  }
};

const insightCardStyle = (type: string) => {
  switch (type) {
    case "risk":
      return "border-orange-200 bg-orange-50/50";
    case "performance":
      return "border-green-200 bg-green-50/50";
    case "recommendation":
      return "border-blue-200 bg-blue-50/50";
    default:
      return "border-border bg-background";
  }
};

export function CampaignDetail({ campaign }: CampaignDetailProps) {
  const router = useRouter();
  const { remove, update, loading } = useCampaignMutations();
  const [activeTab, setActiveTab] = useState("overview");
  const [insights, setInsights] = useState<Insight[]>(campaign.insights ?? []);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [notes, setNotes] = useState(campaign.description ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const handleDelete = async () => {
    await remove(campaign.id);
    router.push("/campaigns");
  };

  const handleGenerateInsights = useCallback(async () => {
    try {
      setGeneratingInsights(true);
      setInsightError(null);
      const res = await fetch(`/api/campaigns/${campaign.id}/insights`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate insights");
      const data = await res.json();
      setInsights(data.insights);
    } catch (err) {
      setInsightError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setGeneratingInsights(false);
    }
  }, [campaign.id]);

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await update(campaign.id, { description: notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back */}
      <button
        onClick={() => router.push("/campaigns")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <span className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card group-hover:bg-muted transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Campaigns
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h1>
            <span
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium border",
                statusStyles[campaign.status],
              )}
            >
              {statusLabel[campaign.status]}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {campaign.client && (
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                  {campaign.client.name[0]}
                </div>
                <span
                  className="hover:text-foreground cursor-pointer transition-colors"
                  onClick={() => router.push(`/clients/${campaign.clientId}`)}
                >
                  {campaign.client.name}
                </span>
              </div>
            )}
            {campaign.platform && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>{campaign.platform}</span>
              </div>
            )}
            {campaign.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Due{" "}
                  {new Date(campaign.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {campaign.goal && (
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                <span>{campaign.goal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleGenerateInsights}
            disabled={generatingInsights}
          >
            {generatingInsights ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1.5" />
            )}
            {generatingInsights ? "Generating..." : "Generate AI Report"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/campaigns/${campaign.id}?edit=true`)
                }
              >
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Spend",
                value: campaign.metrics?.[0]
                  ? `$${campaign.metrics[0].spend.toLocaleString()}`
                  : "$0",
                icon: DollarSign,
                color: "text-blue-600",
                bg: "bg-blue-50",
                hasData: !!campaign.metrics?.[0],
              },
              {
                label: "Impressions",
                value: campaign.metrics?.[0]
                  ? campaign.metrics[0].impressions.toLocaleString()
                  : "0",
                icon: TrendingUp,
                color: "text-purple-600",
                bg: "bg-purple-50",
                hasData: !!campaign.metrics?.[0],
              },
              {
                label: "Clicks",
                value: campaign.metrics?.[0]
                  ? campaign.metrics[0].clicks.toLocaleString()
                  : "0",
                icon: MousePointer,
                color: "text-green-600",
                bg: "bg-green-50",
                hasData: !!campaign.metrics?.[0],
              },
              {
                label: "Conversions",
                value: campaign.metrics?.[0]
                  ? (campaign.metrics[0].conversions ?? 0).toLocaleString()
                  : "0",
                icon: ShoppingCart,
                color: "text-orange-600",
                bg: "bg-orange-50",
                hasData: !!campaign.metrics?.[0],
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      metric.bg,
                    )}
                  >
                    <metric.icon className={cn("h-4 w-4", metric.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">
                  {metric.hasData
                    ? `As of ${new Date(campaign.metrics![0].date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "No data yet — add metrics to track"}
                </p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold">Campaign Information</h2>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {[
                    { label: "Client", value: campaign.client?.name },
                    { label: "Platform", value: campaign.platform },
                    {
                      label: "Start Date",
                      value: campaign.startDate
                        ? new Date(campaign.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : null,
                    },
                    {
                      label: "End Date",
                      value: campaign.endDate
                        ? new Date(campaign.endDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : null,
                    },
                    {
                      label: "Deadline",
                      value: campaign.deadline
                        ? new Date(campaign.deadline).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : null,
                    },
                    { label: "Goal", value: campaign.goal },
                    {
                      label: "Industry",
                      value: campaign.client?.industry,
                    },
                    {
                      label: "Created",
                      value: new Date(campaign.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="font-medium">{item.value ?? "—"}</p>
                    </div>
                  ))}
                </div>

                {campaign.description && (
                  <div className="pt-3 border-t border-border space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold">AI Insights</h2>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      Beta
                    </span>
                  </div>
                  {insights.length > 0 && (
                    <button
                      onClick={handleGenerateInsights}
                      disabled={generatingInsights}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Refresh
                    </button>
                  )}
                </div>

                {insightError && (
                  <p className="text-xs text-destructive">{insightError}</p>
                )}

                {generatingInsights ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground">
                      Analyzing your campaign...
                    </p>
                  </div>
                ) : insights.length > 0 ? (
                  <div className="space-y-3">
                    {insights.map((insight) => {
                      const [title, ...rest] = insight.content.split(": ");
                      const body = rest.join(": ");
                      return (
                        <div
                          key={insight.id}
                          className={cn(
                            "p-3 rounded-lg border space-y-1",
                            insightCardStyle(insight.type),
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {insightIcon(insight.type)}
                            <p className="text-xs font-semibold">{title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {body || insight.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-3 py-6">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No insights yet</p>
                      <p className="text-xs text-muted-foreground">
                        Click generate to get AI-powered analysis and
                        recommendations.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleGenerateInsights}
                      disabled={generatingInsights}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Generate Insights
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <div className="max-w-2xl space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold">Campaign Notes</h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add campaign notes, strategy, observations..."
                rows={8}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {notesSaved
                    ? "✓ Saved"
                    : "Changes are not saved automatically"}
                </p>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/20 space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">AI Reports coming soon</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Generate comprehensive AI-powered reports with performance
              analysis, recommendations and forecasts.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
