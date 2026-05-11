import {
  getCampaignsByWorkspace,
  getCampaignListItems,
  findManyByWorkspace,
  getCampaignById,
  getClientByIdInWorkspace,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createInsight,
  getCampaignForInsightReport,
  replaceInsightsForCampaign,
  upsertMetric,
  getMetricsByCampaign,
  getInsightsByCampaign,
} from "@/server/campaigns/campaigns.repository";
import type {
  CampaignStatus,
  CreateCampaignInput,
  CreateMetricInput,
  UpdateCampaignInput,
} from "@/server/campaigns/campaigns.schemas";
import { chatModel, getChatClient, resolveAiProvider } from "@/lib/chat-llm";

/** Regenerate replaces `summary`, but duplicates can exist historically; newest summary wins */
function dedupeSummaryInsights<
  T extends { type: string; createdAt: Date },
>(insights: T[]): T[] {
  let sawSummary = false;
  return insights.filter((row) => {
    if (row.type !== "summary") return true;
    if (!sawSummary) {
      sawSummary = true;
      return true;
    }
    return false;
  });
}

const STATUS_ORDER: Record<string, number> = {
  at_risk: 0,
  active: 1,
  planned: 2,
  completed: 3,
  inactive: 4,
  archived: 5,
};

function calculateChange(current: number, previous: number | null | undefined) {
  if (!previous || previous <= 0) return null;
  return (current - previous) / previous;
}

export async function getCampaignList(workspaceId: string) {
  const raw = await findManyByWorkspace(workspaceId);

  const campaigns = raw.map((c) => {
    const latest = c.metrics[0] ?? null;
    const previous = c.metrics[1] ?? null;
    const latestConversions = latest?.conversions ?? 0;
    const previousConversions = previous?.conversions ?? null;

    return {
      id: c.id,
      name: c.name,
      platform: c.platform,
      status: c.status,
      startDate: c.startDate?.toISOString() ?? null,
      endDate: c.endDate?.toISOString() ?? null,
      client: c.client,
      _count: c._count,
      latestMetric: latest
        ? {
            spend: latest.spend,
            budget: c.budget ?? 0,
            clicks: latest.clicks,
            conversions: latestConversions,
            spendChange: calculateChange(latest.spend, previous?.spend),
            clicksChange: calculateChange(latest.clicks, previous?.clicks),
            conversionsChange: calculateChange(latestConversions, previousConversions),
            recordedAt: latest.date.toISOString(),
          }
        : null,
      latestInsight: c.insights[0]
        ? {
            id: c.insights[0].id,
            content: c.insights[0].content,
            createdAt: c.insights[0].createdAt.toISOString(),
          }
        : null,
    };
  });

  return campaigns.sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
  );
}

export async function saveCampaignInsight(campaignId: string, content: string) {
  return createInsight(campaignId, { type: "summary", content });
}

export async function listCampaigns(workspaceId: string) {
  const campaigns = await getCampaignsByWorkspace(workspaceId);
  return { campaigns, total: campaigns.length };
}

export async function listCampaignItems(workspaceId: string) {
  const raw = await getCampaignListItems(workspaceId);

  const campaigns = raw.map((c) => {
    const latest = c.metrics[0] ?? null;
    const previous = c.metrics[1] ?? null;
    const clicksChange =
      latest && previous && previous.clicks > 0
        ? (latest.clicks - previous.clicks) / previous.clicks
        : null;

    return {
      id: c.id,
      clientId: c.clientId,
      name: c.name,
      description: c.description,
      platform: c.platform,
      status: c.status as CampaignStatus,
      goal: c.goal,
      budget: c.budget,
      startDate: c.startDate?.toISOString() ?? null,
      endDate: c.endDate?.toISOString() ?? null,
      deadline: c.deadline?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      client: c.client,
      _count: c._count,
      latestMetric: latest
        ? {
            spend: latest.spend,
            clicks: latest.clicks,
            conversions: latest.conversions,
            date: latest.date.toISOString(),
            clicksChange,
          }
        : null,
      latestInsight: c.insights[0]
        ? {
            content: c.insights[0].content,
            createdAt: c.insights[0].createdAt.toISOString(),
          }
        : null,
    };
  });

  campaigns.sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
  );

  return { campaigns, total: campaigns.length };
}

const INSIGHT_TYPES = new Set(["performance", "recommendation", "risk"]);

function normalizeInsightType(raw: unknown): string {
  const v = typeof raw === "string" ? raw.toLowerCase() : "recommendation";
  return INSIGHT_TYPES.has(v) ? v : "recommendation";
}

function clampInsightScore(raw: unknown): number | null {
  if (typeof raw !== "number" || Number.isNaN(raw)) return null;
  return Math.min(1, Math.max(0, raw));
}

function stripJsonFence(text: string) {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  return t.trim();
}

function parseInsightReportJson(raw: string): Array<{
  type: string;
  title: string;
  body: string;
  score: number | null;
}> {
  const trimmed = stripJsonFence(raw);
  const parsed = JSON.parse(trimmed) as { insights?: unknown };
  const list = Array.isArray(parsed.insights) ? parsed.insights : [];
  const rows: Array<{ type: string; title: string; body: string; score: number | null }> = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const content = typeof o.content === "string" ? o.content.trim() : "";
    if (!title && !content) continue;
    rows.push({
      type: normalizeInsightType(o.type),
      title: title || "Insight",
      body: content,
      score: clampInsightScore(o.score),
    });
    if (rows.length >= 3) break;
  }

  return rows;
}

export async function generateQuickInsight(campaignId: string, workspaceId: string) {
  const campaign = await getCampaignForInsightReport(campaignId, workspaceId);
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.metrics.length === 0) throw new Error("No metrics available");

  const metricsContext =
    campaign.metrics.length > 0
      ? `Recent metrics (newest first): ${campaign.metrics
          .map(
            (m) =>
              `Impressions: ${m.impressions}, Clicks: ${m.clicks}, Spend: $${m.spend}, Conversions: ${m.conversions ?? 0}`
          )
          .join(" | ")}`
      : "No metrics data available yet.";

  const prompt = `You are an expert marketing campaign analyst. Analyze the following campaign and provide actionable insights.

Campaign: ${campaign.name}
Client: ${campaign.client?.name ?? "Unknown"}
Industry: ${campaign.client?.industry ?? "Unknown"}
Platform: ${campaign.platform}
Status: ${campaign.status}
Goal: ${campaign.goal ?? "Not specified"}
Start Date: ${campaign.startDate?.toISOString() ?? "Not set"}
End Date: ${campaign.endDate?.toISOString() ?? "Not set"}
Deadline: ${campaign.deadline?.toISOString() ?? "Not set"}
Description: ${campaign.description ?? "Not provided"}
${metricsContext}

Provide exactly 3 insights in the following JSON format only, no extra text or markdown:
{
  "insights": [
    {
      "type": "performance" | "recommendation" | "risk",
      "title": "short title max 6 words",
      "content": "2-3 sentence actionable insight",
      "score": 0.0 to 1.0
    }
  ]
}`;

  const client = getChatClient();
  const baseArgs = {
    model: chatModel(),
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 900,
    temperature: 0.7,
  } as const;

  const completion =
    resolveAiProvider() === "openai"
      ? await client.chat.completions.create({
          ...baseArgs,
          response_format: { type: "json_object" },
        })
      : await client.chat.completions.create(baseArgs);

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  let parsedRows: Array<{ type: string; title: string; body: string; score: number | null }>;
  try {
    parsedRows = parseInsightReportJson(raw);
  } catch {
    throw new Error("Failed to parse insights");
  }

  if (parsedRows.length === 0) throw new Error("Failed to parse insights");

  const persistRows = parsedRows.map((row) => ({
    type: row.type,
    content: row.body ? `${row.title}: ${row.body}` : row.title,
    score: row.score,
  }));

  await replaceInsightsForCampaign(campaignId, persistRows);

  const primary = parsedRows[0];
  const previewBody = primary.body.length > 140 ? `${primary.body.slice(0, 137)}...` : primary.body;
  const insight = previewBody ? `${primary.title}: ${previewBody}` : primary.title;

  return { insight };
}

export async function getCampaign(id: string, workspaceId: string) {
  const campaign = await getCampaignById(id, workspaceId);
  if (!campaign) throw new Error("Campaign not found");
  return {
    campaign: {
      ...campaign,
      insights: dedupeSummaryInsights(campaign.insights),
    },
  };
}

export async function addCampaign(workspaceId: string, data: CreateCampaignInput) {
  if (!data.name || data.name.trim() === "") throw new Error("Campaign name is required");
  if (!data.clientId) throw new Error("Client is required");
  if (!data.platform) throw new Error("Platform is required");
  const client = await getClientByIdInWorkspace(data.clientId, workspaceId);
  if (!client) throw new Error("Client not found");
  const campaign = await createCampaign(data);
  return { campaign };
}

export async function editCampaign(id: string, workspaceId: string, data: UpdateCampaignInput) {
  const existing = await getCampaignById(id, workspaceId);
  if (!existing) throw new Error("Campaign not found");
  if (data.clientId) {
    const client = await getClientByIdInWorkspace(data.clientId, workspaceId);
    if (!client) throw new Error("Client not found");
  }
  const campaign = await updateCampaign(id, workspaceId, data);
  if (!campaign) throw new Error("Campaign not found");
  return {
    campaign: {
      ...campaign,
      insights: dedupeSummaryInsights(campaign.insights),
    },
  };
}

export async function removeCampaign(id: string, workspaceId: string) {
  const campaign = await deleteCampaign(id, workspaceId);
  if (!campaign) throw new Error("Campaign not found");
  return { success: true };
}

export async function addMetric(
  campaignId: string,
  workspaceId: string,
  data: CreateMetricInput
) {
  const campaign = await getCampaignById(campaignId, workspaceId);
  if (!campaign) throw new Error("Campaign not found");

  const metric = await upsertMetric(campaignId, {
    ...data,
    date: new Date(data.date),
  });

  return { metric };
}

export async function listMetrics(campaignId: string, workspaceId: string) {
  const campaign = await getCampaignById(campaignId, workspaceId);
  if (!campaign) throw new Error("Campaign not found");
  return getMetricsByCampaign(campaignId, workspaceId);
}

export async function listInsights(campaignId: string, workspaceId: string) {
  const campaign = await getCampaignById(campaignId, workspaceId);
  if (!campaign) throw new Error("Campaign not found");
  const insights = await getInsightsByCampaign(campaignId, workspaceId);

  return { insights: dedupeSummaryInsights(insights) };
}
