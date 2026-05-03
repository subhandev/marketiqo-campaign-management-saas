import { prisma } from "@/server/db/client";

// For GET/listing: returns real workspace if it has clients, otherwise the
// seeded demo workspace so new users see populated data on first load.
export async function resolveWorkspaceId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return null;

  const realWorkspace = await prisma.workspace.findFirst({
    where: { userId: user.id, isDemo: false },
    orderBy: { createdAt: "asc" },
  });
  if (!realWorkspace) return null;

  const realClientCount = await prisma.client.count({
    where: { workspaceId: realWorkspace.id },
  });

  if (realClientCount === 0) {
    const demoWorkspace = await prisma.workspace.findFirst({
      where: { userId: user.id, isDemo: true, seededAt: { not: null } },
    });
    if (demoWorkspace) return demoWorkspace.id;
  }

  return realWorkspace.id;
}

// For POST/write operations: always the real workspace.
export async function getRealWorkspaceId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      workspaces: {
        where: { isDemo: false },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
  return user?.workspaces[0]?.id ?? null;
}
