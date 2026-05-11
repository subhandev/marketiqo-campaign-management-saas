import { prisma } from "@/server/db/client";
import { chatModel, getChatClient } from "@/lib/chat-llm";
import { createDemoClients } from "./demo-seed.data";

type MetricRow = {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  date: Date;
};

async function generateInsightsForCampaign(campaign: {
  id: string;
  name: string;
  platform: string;
  status: string;
  goal: string | null;
  metrics: MetricRow[];
  client: { name: string; industry: string | null };
}): Promise<void> {
  const metricsContext =
    campaign.metrics.length > 0
      ? `Recent metrics (last ${campaign.metrics.length} days): ` +
        campaign.metrics
          .slice(-5)
          .map(
            (m) =>
              `Impressions: ${m.impressions}, Clicks: ${m.clicks}, Spend: $${m.spend}, Conversions: ${m.conversions ?? 0}`
          )
          .join(" | ")
      : "No metrics yet.";

  const prompt = `
You are an expert marketing campaign analyst. Analyze this campaign and provide actionable insights.

Campaign: ${campaign.name}
Client: ${campaign.client.name}
Industry: ${campaign.client.industry ?? "Unknown"}
Platform: ${campaign.platform}
Status: ${campaign.status}
Goal: ${campaign.goal ?? "Not specified"}
${metricsContext}

Provide exactly 3 insights as JSON only, no extra text:
{
  "insights": [
    {
      "type": "performance" | "recommendation" | "risk",
      "title": "max 6 words",
      "content": "2-3 sentence actionable insight",
      "score": 0.0 to 1.0
    }
  ]
}
`;

  const fallbackInsights = [
    {
      campaignId: campaign.id,
      type: "performance",
      content: "Campaign is currently running within expected parameters.",
      score: 0.6,
    },
    {
      campaignId: campaign.id,
      type: "recommendation",
      content: "Monitor CTR trends weekly and adjust bidding strategy as needed.",
      score: 0.7,
    },
    {
      campaignId: campaign.id,
      type: "risk",
      content: "Ensure budget pacing is reviewed before the campaign deadline.",
      score: 0.5,
    },
  ];

  try {
    const completion = await getChatClient().chat.completions.create({
      model: chatModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);
    const insights: { type: string; title: string; content: string; score: number }[] =
      Array.isArray(parsed.insights) && parsed.insights.length > 0
        ? parsed.insights
        : [];

    if (insights.length === 0) {
      await prisma.insight.createMany({ data: fallbackInsights });
      return;
    }

    await prisma.insight.createMany({
      data: insights.map((i) => ({
        campaignId: campaign.id,
        type: i.type,
        content: `${i.title}: ${i.content}`,
        score: i.score,
      })),
    });
  } catch {
    await prisma.insight.createMany({ data: fallbackInsights });
  }
}

export async function seedDemoWorkspace(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const existing = await prisma.workspace.findFirst({
    where: { userId: user.id, isDemo: true },
  });
  if (existing) return;

  const demoWorkspace = await prisma.workspace.create({
    data: { name: "Demo Workspace", userId: user.id, isDemo: true },
  });

  const demoClients = createDemoClients(new Date());

  for (const clientData of demoClients) {
    const { campaigns, ...clientFields } = clientData;

    const client = await prisma.client.create({
      data: { ...clientFields, workspaceId: demoWorkspace.id },
    });

    for (const campaignData of campaigns) {
      const { metrics, ...campaignFields } = campaignData;

      const campaign = await prisma.campaign.create({
        data: { ...campaignFields, clientId: client.id },
      });

      if (metrics.length > 0) {
        await prisma.metric.createMany({
          data: metrics.map((m) => ({ ...m, campaignId: campaign.id })),
        });
      }

      if (campaignData.status !== "planned") {
        await generateInsightsForCampaign({
          id: campaign.id,
          name: campaign.name,
          platform: campaign.platform,
          status: campaign.status,
          goal: campaign.goal ?? null,
          metrics,
          client: { name: client.name, industry: client.industry ?? null },
        });
      }
    }
  }

  await prisma.workspace.update({
    where: { id: demoWorkspace.id },
    data: { seededAt: new Date() },
  });
}
