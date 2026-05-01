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
    },
    orderBy: { createdAt: "desc" },
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
