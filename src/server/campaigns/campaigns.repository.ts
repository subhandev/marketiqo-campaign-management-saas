import { prisma } from "@/server/db/client";
import type {
  CreateCampaignInput,
  CreateMetricInput,
  UpdateCampaignInput,
} from "@/server/campaigns/campaigns.schemas";

export async function getCampaignsByWorkspace(workspaceId: string) {
  return prisma.campaign.findMany({
    where: {
      client: { workspaceId },
    },
    include: {
      client: {
        select: { id: true, name: true, industry: true },
      },
      metrics: {
        select: { spend: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignListItems(workspaceId: string) {
  return prisma.campaign.findMany({
    where: {
      client: { workspaceId },
    },
    select: {
      id: true,
      clientId: true,
      name: true,
      description: true,
      platform: true,
      status: true,
      goal: true,
      budget: true,
      startDate: true,
      endDate: true,
      deadline: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: { id: true, name: true },
      },
      _count: {
        select: { metrics: true },
      },
      metrics: {
        orderBy: { date: "desc" },
        take: 2,
        select: { spend: true, clicks: true, conversions: true, date: true },
      },
      insights: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });
}

export async function findManyByWorkspace(workspaceId: string) {
  return prisma.campaign.findMany({
    where: { client: { workspaceId } },
    select: {
      id: true,
      name: true,
      platform: true,
      status: true,
      budget: true,
      startDate: true,
      endDate: true,
      client: {
        select: { id: true, name: true },
      },
      _count: {
        select: { metrics: true },
      },
      metrics: {
        orderBy: { date: "desc" },
        take: 2,
        select: { spend: true, clicks: true, conversions: true, date: true },
      },
      insights: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, content: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCampaignWithLatestMetric(campaignId: string, workspaceId: string) {
  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      client: { workspaceId },
    },
    include: {
      metrics: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });
}

export async function getCampaignById(id: string, workspaceId: string) {
  return prisma.campaign.findFirst({
    where: {
      id,
      client: { workspaceId },
    },
    include: {
      client: {
        select: { id: true, name: true, industry: true },
      },
      insights: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      metrics: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });
}

export async function getClientByIdInWorkspace(clientId: string, workspaceId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, workspaceId },
    select: { id: true },
  });
}

export async function createCampaign(data: CreateCampaignInput) {
  return prisma.campaign.create({
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    },
    include: {
      client: {
        select: { id: true, name: true, industry: true },
      },
    },
  });
}

export async function updateCampaign(
  id: string,
  workspaceId: string,
  data: UpdateCampaignInput
) {
  const updated = await prisma.campaign.updateMany({
    where: { id, client: { workspaceId } },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    },
  });

  if (updated.count === 0) return null;
  return getCampaignById(id, workspaceId);
}

export async function deleteCampaign(id: string, workspaceId: string) {
  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.findFirst({
      where: { id, client: { workspaceId } },
      select: { id: true },
    });

    if (!campaign) return null;

    await tx.metric.deleteMany({ where: { campaignId: id } });
    await tx.insight.deleteMany({ where: { campaignId: id } });
    return tx.campaign.delete({ where: { id } });
  });
}

export async function createInsight(campaignId: string, data: { type: string; content: string; score?: number }) {
  return prisma.insight.create({
    data: { campaignId, ...data },
  });
}

export async function upsertMetric(
  campaignId: string,
  data: Omit<CreateMetricInput, "date"> & { date: Date }
) {
  return prisma.metric.upsert({
    where: { campaignId_date: { campaignId, date: data.date } },
    update: {
      impressions: data.impressions,
      clicks: data.clicks,
      spend: data.spend,
      conversions: data.conversions,
    },
    create: {
      campaignId,
      date: data.date,
      impressions: data.impressions,
      clicks: data.clicks,
      spend: data.spend,
      conversions: data.conversions,
    },
  });
}

export async function getMetricsByCampaign(campaignId: string, workspaceId: string) {
  return prisma.metric.findMany({
    where: { campaignId, campaign: { client: { workspaceId } } },
    orderBy: { date: "desc" },
  });
}

export async function getInsightsByCampaign(campaignId: string, workspaceId: string) {
  return prisma.insight.findMany({
    where: { campaignId, campaign: { client: { workspaceId } } },
    orderBy: { createdAt: "desc" },
  });
}
