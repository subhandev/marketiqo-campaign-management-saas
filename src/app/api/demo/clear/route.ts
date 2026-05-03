import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const demoWorkspace = await prisma.workspace.findFirst({
    where: { userId: user.id, isDemo: true },
  });

  if (demoWorkspace) {
    const clients = await prisma.client.findMany({
      where: { workspaceId: demoWorkspace.id },
      select: { id: true },
    });
    const clientIds = clients.map((c) => c.id);

    const campaigns = await prisma.campaign.findMany({
      where: { clientId: { in: clientIds } },
      select: { id: true },
    });
    const campaignIds = campaigns.map((c) => c.id);

    await prisma.insight.deleteMany({ where: { campaignId: { in: campaignIds } } });
    await prisma.metric.deleteMany({ where: { campaignId: { in: campaignIds } } });
    await prisma.campaign.deleteMany({ where: { clientId: { in: clientIds } } });
    await prisma.client.deleteMany({ where: { workspaceId: demoWorkspace.id } });
    await prisma.workspace.delete({ where: { id: demoWorkspace.id } });
  }

  await prisma.user.update({
    where: { clerkUserId: userId },
    data: { demoClearedAt: new Date() },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
