import { prisma } from "@/server/db/client";

export async function findUserByClerkId(clerkUserId: string) {
  return prisma.user.findUnique({ where: { clerkUserId } });
}

export async function findActiveDemoWorkspace(userId: string) {
  return prisma.workspace.findFirst({
    where: { userId, isDemo: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function findRealWorkspace(userId: string) {
  return prisma.workspace.findFirst({
    where: { userId, isDemo: false },
    orderBy: { createdAt: "asc" },
  });
}

export async function clearWorkspaceData(workspaceId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.insight.deleteMany({
      where: { campaign: { client: { workspaceId } } },
    });
    await tx.metric.deleteMany({
      where: { campaign: { client: { workspaceId } } },
    });
    await tx.campaign.deleteMany({
      where: { client: { workspaceId } },
    });
    await tx.client.deleteMany({ where: { workspaceId } });
  });
}

export async function deleteWorkspace(workspaceId: string) {
  return prisma.workspace.delete({ where: { id: workspaceId } });
}

export async function markDemoCleared(clerkUserId: string) {
  return prisma.user.update({
    where: { clerkUserId },
    data: { demoClearedAt: new Date() },
  });
}
