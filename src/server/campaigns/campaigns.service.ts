import {
  getCampaignsByWorkspace,
  getCampaignListItems,
  getCampaignWithLatestMetric,
  findManyByWorkspace,
  getCampaignById,
  getClientByIdInWorkspace,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createInsight,
  replaceSummaryInsight,
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
import { openai, OPENAI_MODEL_QUICK } from "@/lib/openai";

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

export async function generateQuickInsight(campaignId: string, workspaceId: string) {
  const campaign = await getCampaignWithLatestMetric(campaignId, workspaceId);
  if (!campaign) throw new Error("Campaign not found");

  const metric = campaign.metrics[0];
  const prompt = `You are a marketing analyst. Given this campaign data, write a single sharp insight sentence (max 15 words) about its health or performance. Campaign: ${campaign.name}, Platform: ${campaign.platform}, Status: ${campaign.status}, Spend: ${metric?.spend ?? "N/A"}/${campaign.budget ?? "N/A"}, Clicks: ${metric?.clicks ?? "N/A"}, Conversions: ${metric?.conversions ?? "N/A"}. Respond with only the insight sentence, no preamble.`;

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL_QUICK,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 80,
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "No insight available.";
  await replaceSummaryInsight(campaignId, { content });

  return { insight: content };
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
