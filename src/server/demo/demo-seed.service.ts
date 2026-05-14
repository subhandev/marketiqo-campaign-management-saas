import { prisma } from "@/server/db/client";
import { chatModel, getChatClient } from "@/lib/chat-llm";
import { clearWorkspaceData, deleteWorkspace } from "@/server/settings/settings.repository";
import { createDemoClients, demoPortfolioClientCount } from "./demo-seed.data";

type MetricRow = {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  date: Date;
};

/**
 * Demo onboarding should finish reliably; chaining many LLM calls leaves the Neon connection
 * idle long enough to drop mid-seed. Set DEMO_SEED_INSIGHT_LLM=true to generate AI insights
 * during seed (slower, higher flake risk locally).
 */
async function persistDemoInsights(campaignId: string): Promise<void> {
  // Match `InsightCard` + `generateQuickInsight`: one string `title: body` (first colon splits).
  await prisma.insight.createMany({
    data: [
      {
        campaignId,
        type: "performance",
        content:
          "Running within targets: Campaign pacing looks healthy versus recent daily metrics; keep comparing spend, clicks, and conversions to plan.",
        score: 0.6,
      },
      {
        campaignId,
        type: "recommendation",
        content:
          "Review CTR weekly: Track click-through trends and adjust bids or creative rotation so efficiency stays aligned with the stated goal.",
        score: 0.7,
      },
      {
        campaignId,
        type: "risk",
        content:
          "Budget pacing before deadline: Confirm spend is on track for the remaining runway so you do not underspend or hit a hard cap late.",
        score: 0.5,
      },
    ],
  });
}

async function generateInsightsWithLlmForDemo(campaign: {
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
      await persistDemoInsights(campaign.id);
      return;
    }

    await prisma.insight.createMany({
      data: insights.map((i) => {
        const title = typeof i.title === "string" ? i.title.trim() || "Insight" : "Insight";
        const body =
          typeof i.content === "string" && i.content.trim() !== ""
            ? i.content.trim()
            : "Review Performance Trends with your latest metrics, then use Regenerate insights for a tailored pass.";
        return {
          campaignId: campaign.id,
          type: i.type,
          content: `${title}: ${body}`,
          score: i.score,
        };
      }),
    });
  } catch {
    await persistDemoInsights(campaign.id);
  }
}

export async function seedDemoWorkspace(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const expectedClients = demoPortfolioClientCount(new Date());

  const existing = await prisma.workspace.findFirst({
    where: { userId: user.id, isDemo: true },
  });
  // A demo workspace row can exist without any clients if a previous seed failed early, or CLIs
  // raced. Previously we returned immediately and the UI polled forever (`seeded: false`).
  if (existing) {
    const clientCount = await prisma.client.count({
      where: { workspaceId: existing.id },
    });
    const complete = !!existing.seededAt && clientCount >= expectedClients;
    if (complete) return;

    await clearWorkspaceData(existing.id);
    await deleteWorkspace(existing.id);
  }

  const demoWorkspace = await prisma.workspace.create({
    data: { name: "Demo Workspace", userId: user.id, isDemo: true },
  });

  const demoClients = createDemoClients(new Date());

  const useInsightLlm = process.env.DEMO_SEED_INSIGHT_LLM === "true";

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
        if (useInsightLlm) {
          await generateInsightsWithLlmForDemo({
            id: campaign.id,
            name: campaign.name,
            platform: campaign.platform,
            status: campaign.status,
            goal: campaign.goal ?? null,
            metrics,
            client: { name: client.name, industry: client.industry ?? null },
          });
        } else {
          await persistDemoInsights(campaign.id);
        }
      }
    }
  }

  await prisma.workspace.update({
    where: { id: demoWorkspace.id },
    data: { seededAt: new Date() },
  });
}
