import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { openai } from "@/lib/openai";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";
import { saveCampaignInsight } from "@/server/campaigns/campaigns.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, client: { workspaceId } },
    select: {
      id: true,
      name: true,
      platform: true,
      status: true,
      budget: true,
      metrics: {
        orderBy: { date: "desc" },
        take: 1,
        select: { spend: true, clicks: true, conversions: true },
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!campaign.metrics.length) return NextResponse.json({ error: "No metrics available" }, { status: 400 });

  const m = campaign.metrics[0];
  const prompt = `You are a marketing analyst AI. Write a single sharp insight sentence (max 15 words) about this campaign's health or performance trend. Be specific and actionable. Campaign: ${campaign.name}, Platform: ${campaign.platform}, Status: ${campaign.status}, Spend: $${m.spend} of $${campaign.budget ?? "unknown"} budget, Clicks: ${m.clicks}, Conversions: ${m.conversions ?? 0}. Respond with only the insight sentence, no preamble, no quotes.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    await saveCampaignInsight(campaign.id, content);

    return NextResponse.json({ insight: content }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const insights = await prisma.insight.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ insights }, { status: 200 });
}
