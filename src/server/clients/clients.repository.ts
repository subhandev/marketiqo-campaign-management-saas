// src/server/clients/clients.repository.ts

import { prisma } from "@/server/db/client";
import { CreateClientInput, UpdateClientInput } from "@/features/clients/types";

export async function getClientsByWorkspace(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      workspace: {
        select: { isDemo: true },
      },
      _count: {
        select: { campaigns: true },
      },
    },
  });
}

export async function getClientById(id: string, workspaceId: string) {
  return prisma.client.findFirst({
    where: { id, workspaceId },
    include: {
      workspace: {
        select: { isDemo: true },
      },
      campaigns: {
        orderBy: { createdAt: "desc" },
        include: {
          insights: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });
}

export async function createClient(
  workspaceId: string,
  data: CreateClientInput
) {
  return prisma.client.create({
    data: {
      ...data,
      workspaceId,
    },
  });
}

export async function updateClient(
  id: string,
  workspaceId: string,
  data: UpdateClientInput
) {
  const result = await prisma.client.updateMany({
    where: { id, workspaceId },
    data,
  });

  if (result.count === 0) return null;
  return getClientById(id, workspaceId);
}

export async function deleteClient(id: string, workspaceId: string) {
  return prisma.$transaction(async (tx) => {
    const client = await tx.client.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });

    if (!client) return false;

    await tx.insight.deleteMany({
      where: { campaign: { clientId: id } },
    });
    await tx.metric.deleteMany({
      where: { campaign: { clientId: id } },
    });
    await tx.campaign.deleteMany({ where: { clientId: id } });
    await tx.client.delete({ where: { id } });

    return true;
  });
}