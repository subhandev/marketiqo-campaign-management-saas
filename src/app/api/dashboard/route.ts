import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";

async function getWorkspaceId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      workspaces: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return user?.workspaces[0]?.id ?? null;
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Fetch all data in parallel
  const [clients, campaigns, metrics] = await Promise.all([
    prisma.client.findMany({
      where: { workspaceId },
      select: { id: true, status: true },
    }),
    prisma.campaign.findMany({
      where: { client: { workspaceId } },
      include: {
        client: {
          select: { id: true, name: true, industry: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.metric.findMany({
      where: { campaign: { client: { workspaceId } } },
      select: { spend: true },
    }),
  ]);

  // Stats
  const totalClients = clients.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const atRiskCampaigns = campaigns.filter((c) => c.status === "at_risk").length;
  const completedCampaigns = campaigns.filter((c) => c.status === "completed").length;
  const plannedCampaigns = campaigns.filter((c) => c.status === "planned").length;
  const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);

  // Campaign health breakdown for chart
  const health = {
    active: activeCampaigns,
    at_risk: atRiskCampaigns,
    completed: completedCampaigns,
    planned: plannedCampaigns,
    archived: campaigns.filter((c) => c.status === "archived").length,
    total: campaigns.length,
  };

  // Recent campaigns (last 5)
  const recentCampaigns = campaigns.slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
    status: c.status,
    deadline: c.deadline,
    client: c.client,
  }));

  return NextResponse.json({
    stats: {
      totalClients,
      activeCampaigns,
      atRiskCampaigns,
      completedCampaigns,
      totalSpend,
    },
    health,
    recentCampaigns,
  });
}