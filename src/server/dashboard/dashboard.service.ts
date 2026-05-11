import { chatModel, getChatClient } from "@/lib/chat-llm";
import { getDashboardAiContext } from "@/server/dashboard/dashboard.repository";

export type PortfolioAiCategory = "performance" | "risk" | "budget" | "next_action";
export type PortfolioAiSeverity = "positive" | "info" | "warning" | "critical";

export type PortfolioAiInsight = {
  category: PortfolioAiCategory;
  severity: PortfolioAiSeverity;
  headline: string;
  insight: string;
  recommendedAction: string;
  campaignId?: string;
  campaignName?: string;
};

export type PortfolioAiBrief = {
  briefTitle: string;
  summary: string;
  generatedAt: string;
  source: "ai" | "fallback";
  insights: PortfolioAiInsight[];
};

const CATEGORIES: PortfolioAiCategory[] = ["performance", "risk", "budget", "next_action"];
const SEVERITIES: PortfolioAiSeverity[] = ["positive", "info", "warning", "critical"];
/** Portfolio AI Brief body: one summary strip plus this many insight cards on the dashboard. */
const MAX_PORTFOLIO_INSIGHTS = 3;
/** Post-parse string caps (UTF-16 length); keep LLM prompt word limits within these. */
const BRIEF_TITLE_MAX = 114;
const BRIEF_SUMMARY_MAX = 408;
const INSIGHT_HEADLINE_MAX = 114;
const INSIGHT_BODY_MAX = 398;
const INSIGHT_ACTION_MAX = 322;

function clampText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim().replace(/\s+/g, " ");
  if (!text) return fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

function normalizeCategory(value: unknown, fallback: PortfolioAiCategory): PortfolioAiCategory {
  return CATEGORIES.includes(value as PortfolioAiCategory)
    ? (value as PortfolioAiCategory)
    : fallback;
}

function normalizeSeverity(value: unknown, fallback: PortfolioAiSeverity): PortfolioAiSeverity {
  return SEVERITIES.includes(value as PortfolioAiSeverity)
    ? (value as PortfolioAiSeverity)
    : fallback;
}

function insightSignature(insight: Pick<PortfolioAiInsight, "category" | "headline" | "insight">) {
  return `${insight.category}:${insight.headline}:${insight.insight}`
    .toLowerCase()
    .replace(/[^a-z0-9:]+/g, " ")
    .trim();
}

function consistentInsights(insights: PortfolioAiInsight[], fallback: PortfolioAiBrief) {
  const seenCategories = new Set<PortfolioAiCategory>();
  const seenSignatures = new Set<string>();
  const unique: PortfolioAiInsight[] = [];

  for (const insight of insights) {
    const signature = insightSignature(insight);
    if (seenCategories.has(insight.category) || seenSignatures.has(signature)) continue;

    seenCategories.add(insight.category);
    seenSignatures.add(signature);
    unique.push(insight);
  }

  for (const fallbackInsight of fallback.insights) {
    if (unique.length >= MAX_PORTFOLIO_INSIGHTS) break;
    if (seenCategories.has(fallbackInsight.category)) continue;

    seenCategories.add(fallbackInsight.category);
    seenSignatures.add(insightSignature(fallbackInsight));
    unique.push(fallbackInsight);
  }

  return unique
    .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category))
    .slice(0, MAX_PORTFOLIO_INSIGHTS);
}

type DashboardAiContext = Awaited<ReturnType<typeof getDashboardAiContext>>;
type DashboardAiCampaign = DashboardAiContext["campaigns"][number];

function buildFallbackBrief(
  context: DashboardAiContext,
  generatedAt: string,
  source: PortfolioAiBrief["source"] = "fallback"
): PortfolioAiBrief {
  const { clients, campaigns } = context;
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const atRiskCampaigns = campaigns.filter((c) => c.status === "at_risk");
  const totalSpend = campaigns.reduce(
    (sum, campaign) =>
      sum + campaign.metrics.reduce((metricSum, metric) => metricSum + metric.spend, 0),
    0
  );
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0);
  const budgetPacing =
    totalBudget > 0 ? `${Math.round((totalSpend / totalBudget) * 100)}% of budget used` : "Budget pacing unavailable";
  const priorityCampaign = atRiskCampaigns[0] ?? activeCampaigns[0] ?? campaigns[0];

  return {
    briefTitle: "Portfolio AI brief",
    summary:
      campaigns.length > 0
        ? `${activeCampaigns.length} active campaigns, ${atRiskCampaigns.length} risks, and ${budgetPacing.toLowerCase()}.`
        : "Add campaigns and metrics to unlock portfolio-level AI recommendations.",
    generatedAt,
    source,
    insights: [
      {
        category: "performance",
        severity: activeCampaigns.length > 0 ? "positive" : "info",
        headline: "Portfolio momentum",
        insight:
          activeCampaigns.length > 0
            ? `${activeCampaigns.length} active campaign${activeCampaigns.length === 1 ? "" : "s"} running across ${clients.length} client${clients.length === 1 ? "" : "s"}.`
            : "No active campaigns are running yet, so AI has limited performance signals.",
        recommendedAction:
          activeCampaigns.length > 0
            ? "Review latest campaign metrics before changing budgets."
            : "Launch or activate a campaign to start collecting performance signals.",
      },
      {
        category: "risk",
        severity: atRiskCampaigns.length > 0 ? "warning" : "positive",
        headline: atRiskCampaigns.length > 0 ? "Risk watchlist" : "Risk check clear",
        insight:
          atRiskCampaigns.length > 0
            ? `${atRiskCampaigns.length} campaign${atRiskCampaigns.length === 1 ? "" : "s"} need attention, led by ${priorityCampaign?.name ?? "the latest campaign"}.`
            : "No campaigns are currently marked at risk.",
        recommendedAction:
          atRiskCampaigns.length > 0
            ? "Open the highest-risk campaign and update its next action."
            : "Keep monitoring deadlines and pacing as new metrics arrive.",
        campaignId: priorityCampaign?.id,
        campaignName: priorityCampaign?.name,
      },
      {
        category: "budget",
        severity: totalBudget > 0 && totalSpend / totalBudget > 0.9 ? "warning" : "info",
        headline: "Budget pacing",
        insight:
          totalBudget > 0
            ? `Tracked campaigns have spent ${budgetPacing.toLowerCase()}.`
            : "Budget data is incomplete, so spend recommendations are limited.",
        recommendedAction:
          totalBudget > 0
            ? "Compare spend against conversions before reallocating budget."
            : "Add campaign budgets to unlock stronger pacing recommendations.",
      },
    ],
  };
}

function serializeCampaignForPrompt(campaign: DashboardAiCampaign) {
  const recentSpend = campaign.metrics.reduce((sum, metric) => sum + metric.spend, 0);
  const recentClicks = campaign.metrics.reduce((sum, metric) => sum + metric.clicks, 0);
  const recentConversions = campaign.metrics.reduce(
    (sum, metric) => sum + (metric.conversions ?? 0),
    0
  );
  const recentImpressions = campaign.metrics.reduce(
    (sum, metric) => sum + metric.impressions,
    0
  );

  return {
    id: campaign.id,
    name: campaign.name,
    client: campaign.client?.name ?? "Unknown client",
    industry: campaign.client?.industry,
    platform: campaign.platform,
    status: campaign.status,
    goal: campaign.goal,
    budget: campaign.budget,
    deadline: campaign.deadline?.toISOString() ?? null,
    recentMetrics: {
      spend: recentSpend,
      clicks: recentClicks,
      impressions: recentImpressions,
      conversions: recentConversions,
      daysIncluded: campaign.metrics.length,
    },
    savedInsights: campaign.insights.map((insight) => ({
      type: insight.type,
      content: insight.content,
      score: insight.score,
      createdAt: insight.createdAt.toISOString(),
    })),
  };
}

function parseAiBrief(raw: string, fallback: PortfolioAiBrief): PortfolioAiBrief {
  const parsed = JSON.parse(raw) as {
    briefTitle?: unknown;
    summary?: unknown;
    insights?: unknown;
  };

  if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
    return fallback;
  }

  const normalizedInsights = parsed.insights.slice(0, CATEGORIES.length).map((item, index) => {
    const candidate = item as Partial<PortfolioAiInsight>;
    const fallbackInsight = fallback.insights[index % fallback.insights.length];

    return {
      category: normalizeCategory(candidate.category, fallbackInsight.category),
      severity: normalizeSeverity(candidate.severity, fallbackInsight.severity),
      headline: clampText(candidate.headline, fallbackInsight.headline, INSIGHT_HEADLINE_MAX),
      insight: clampText(candidate.insight, fallbackInsight.insight, INSIGHT_BODY_MAX),
      recommendedAction: clampText(
        candidate.recommendedAction,
        fallbackInsight.recommendedAction,
        INSIGHT_ACTION_MAX
      ),
      campaignId: typeof candidate.campaignId === "string" ? candidate.campaignId : undefined,
      campaignName:
        typeof candidate.campaignName === "string" ? candidate.campaignName : undefined,
    };
  });
  const insights = consistentInsights(normalizedInsights, fallback);

  return {
    briefTitle: clampText(parsed.briefTitle, fallback.briefTitle, BRIEF_TITLE_MAX),
    summary: clampText(parsed.summary, fallback.summary, BRIEF_SUMMARY_MAX),
    generatedAt: fallback.generatedAt,
    source: "ai",
    insights,
  };
}

export async function generatePortfolioAiBrief(workspaceId: string): Promise<PortfolioAiBrief> {
  const context = await getDashboardAiContext(workspaceId);
  const generatedAt = new Date().toISOString();
  const fallback = buildFallbackBrief(context, generatedAt);

  try {
    const activeCampaigns = context.campaigns.filter((c) => c.status === "active").length;
    const atRiskCampaigns = context.campaigns.filter((c) => c.status === "at_risk").length;
    const totalBudget = context.campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0);
    const totalRecentSpend = context.campaigns.reduce(
      (sum, campaign) =>
        sum + campaign.metrics.reduce((metricSum, metric) => metricSum + metric.spend, 0),
      0
    );
    const savedInsightCount = context.campaigns.reduce(
      (sum, campaign) => sum + campaign.insights.length,
      0
    );

    const completion = await getChatClient().chat.completions.create({
      model: chatModel(),
      messages: [
        {
          role: "system",
          content: `You are a senior marketing analyst powering an AI-first campaign dashboard.
Return a concise portfolio intelligence brief as JSON only.
Rules:
- Return exactly 3 insights (no more, no fewer).
- Do not repeat a category, headline, or recommendation.
- Use only the data provided. Do not invent campaigns, clients, metrics, or results.
- Make every insight actionable and specific.
- Prefer saved campaign insights when they are relevant.
- Categories must be one of: performance, risk, budget, next_action.
- Severity must be one of: positive, info, warning, critical.
- Keep headline under 22 words, insight under 62 words, recommendedAction under 48 words.
- Return this exact shape:
{
  "briefTitle": "short title",
  "summary": "one sentence portfolio readout",
  "insights": [
    {
      "category": "performance | risk | budget | next_action",
      "severity": "positive | info | warning | critical",
      "headline": "short headline",
      "insight": "specific insight",
      "recommendedAction": "specific next action",
      "campaignId": "optional campaign id",
      "campaignName": "optional campaign name"
    }
  ]
}`,
        },
        {
          role: "user",
          content: JSON.stringify({
            portfolio: {
              clientCount: context.clients.length,
              campaignCount: context.campaigns.length,
              activeCampaigns,
              atRiskCampaigns,
              totalBudget,
              totalRecentSpend,
              savedInsightCount,
            },
            campaigns: context.campaigns.map(serializeCampaignForPrompt),
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.55,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    return parseAiBrief(raw, fallback);
  } catch (error) {
    console.error("Dashboard portfolio AI brief error:", error);
    return fallback;
  }
}
