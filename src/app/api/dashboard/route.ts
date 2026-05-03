import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const [clients, campaigns, metrics] = await Promise.all([
    prisma.client.findMany({
      where: { workspaceId },
      select: { id: true, name: true, industry: true, status: true, createdAt: true, _count: { select: { campaigns: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaign.findMany({
      where: { client: { workspaceId } },
      include: {
        client: { select: { id: true, name: true, industry: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.metric.findMany({
      where: { campaign: { client: { workspaceId } } },
      select: { spend: true },
    }),
  ]);

  const totalClients = clients.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const atRiskCampaigns = campaigns.filter((c) => c.status === "at_risk").length;
  const completedCampaigns = campaigns.filter((c) => c.status === "completed").length;
  const plannedCampaigns = campaigns.filter((c) => c.status === "planned").length;
  const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);

  const health = {
    active: activeCampaigns,
    at_risk: atRiskCampaigns,
    completed: completedCampaigns,
    planned: plannedCampaigns,
    archived: campaigns.filter((c) => c.status === "archived").length,
    total: campaigns.length,
  };

  const recentCampaigns = campaigns.slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
    status: c.status,
    deadline: c.deadline,
    client: c.client,
  }));

  const atRiskCampaignsList = campaigns
    .filter((c) => c.status === "at_risk")
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      name: c.name,
      platform: c.platform,
      deadline: c.deadline,
      client: c.client,
    }));

  const recentClients = clients.slice(0, 4).map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    status: c.status,
    campaignCount: c._count.campaigns,
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
    atRiskCampaignsList,
    recentClients,
  });
}
