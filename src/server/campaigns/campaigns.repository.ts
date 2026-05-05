import { prisma } from "@/server/db/client";
import { CreateCampaignInput, UpdateCampaignInput } from "@/features/campaigns/types";

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

export async function getCampaignById(id: string, clerkUserId: string) {
  return prisma.campaign.findFirst({
    where: {
      id,
      client: { workspace: { user: { clerkUserId } } },
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

export async function updateCampaign(id: string, data: UpdateCampaignInput) {
  return prisma.campaign.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    },
  });
}

export async function deleteCampaign(id: string) {
  return prisma.campaign.delete({ where: { id } });
}

export async function createInsight(campaignId: string, data: { type: string; content: string; score?: number }) {
  return prisma.insight.create({
    data: { campaignId, ...data },
  });
}
