// src/server/clients/clients.repository.ts

import { prisma } from "@/server/db/client";
import { CreateClientInput, UpdateClientInput } from "@/features/clients/types";

export async function getClientsByWorkspace(workspaceId: string) {
  return prisma.client.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
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
      campaigns: {
        orderBy: { createdAt: "desc" },
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
  return prisma.client.update({
    where: { id },
    data,
  });
}

export async function deleteClient(id: string, workspaceId: string) {
  return prisma.client.delete({
    where: { id },
  });
}