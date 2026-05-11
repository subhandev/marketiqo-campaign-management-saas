import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { chatModel, getChatClient } from "@/lib/chat-llm";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  const [clients, campaigns] = await Promise.all([
    prisma.client.findMany({
      where: { workspaceId },
      select: { id: true, status: true },
    }),
    prisma.campaign.findMany({
      where: { client: { workspaceId } },
      select: { name: true, status: true, platform: true, goal: true, deadline: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const clientCount = clients.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const atRiskCampaigns = campaigns.filter((c) => c.status === "at_risk").length;
  const platforms = [...new Set(campaigns.map((c) => c.platform))];
  const goals = [...new Set(campaigns.map((c) => c.goal).filter(Boolean))];
  const upcomingDeadlines = campaigns
    .filter((c) => c.deadline && new Date(c.deadline) > new Date())
    .map((c) => ({ name: c.name, deadline: c.deadline }))
    .slice(0, 3);

  const fallback = [
    `${activeCampaigns} active campaign${activeCampaigns !== 1 ? "s" : ""} running across your portfolio.`,
    atRiskCampaigns > 0
      ? `${atRiskCampaigns} campaign${atRiskCampaigns !== 1 ? "s" : ""} need attention and risk review.`
      : "All campaigns are currently on track.",
    "Review deadlines and platform performance for optimisation opportunities.",
  ];

  try {
    const completion = await getChatClient().chat.completions.create({
      model: chatModel(),
      messages: [
        {
          role: "system",
          content: `You are a senior marketing analyst writing a dashboard summary card.
Write exactly 3 short insight sentences about the user's campaign portfolio.
Rules:
- Each sentence max 22 words
- Be specific and data-driven using the numbers provided
- Vary the angle: one performance, one risk or deadline, one recommendation
- No filler phrases like "it's important to" or "you should consider"
- Return ONLY this JSON, no extra text:
{ "insights": ["sentence one", "sentence two", "sentence three"] }`,
        },
        {
          role: "user",
          content: JSON.stringify({
            clientCount,
            activeCampaigns,
            atRiskCampaigns,
            platforms,
            goals,
            upcomingDeadlines,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);
    const insights: string[] =
      Array.isArray(parsed.insights) && parsed.insights.length > 0
        ? parsed.insights
        : fallback;

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error("Dashboard LLM insights error:", error);
    return NextResponse.json({ insights: fallback }, { status: 200 });
  }
}
