import { prisma } from "@/server/db/client";

export async function getDashboardAiContext(workspaceId: string) {
  const [clients, campaigns] = await Promise.all([
    prisma.client.findMany({
      where: { workspaceId },
      select: { id: true, status: true },
    }),
    prisma.campaign.findMany({
      where: { client: { workspaceId } },
      select: {
        id: true,
        name: true,
        platform: true,
        status: true,
        goal: true,
        budget: true,
        deadline: true,
        createdAt: true,
        client: {
          select: { id: true, name: true, industry: true },
        },
        metrics: {
          orderBy: { date: "desc" },
          take: 3,
          select: {
            spend: true,
            clicks: true,
            impressions: true,
            conversions: true,
            date: true,
          },
        },
        insights: {
          orderBy: { createdAt: "desc" },
          take: 2,
          select: {
            type: true,
            content: true,
            score: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return { clients, campaigns };
}
