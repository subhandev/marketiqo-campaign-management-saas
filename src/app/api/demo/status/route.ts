import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { demoPortfolioClientCount } from "@/server/demo/demo-seed.data";
import { releaseDemoSeedLease } from "@/server/demo/demo-seed-lock.repository";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ exists: false, seeded: false, cleared: false }, { status: 200 });
  }

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    return NextResponse.json({ exists: false, seeded: false, cleared: false }, { status: 200 });
  }

  if (user.demoClearedAt) {
    return NextResponse.json({ exists: false, seeded: false, cleared: true }, { status: 200 });
  }

  let demoWorkspace = await prisma.workspace.findFirst({
    where: { userId: user.id, isDemo: true },
  });

  const clientCount = demoWorkspace
    ? await prisma.client.count({ where: { workspaceId: demoWorkspace.id } })
    : 0;

  const expectedClients = demoPortfolioClientCount(new Date());

  // If seed finished writing clients but crashed before seededAt, repair so polling can stop.
  if (
    demoWorkspace &&
    !demoWorkspace.seededAt &&
    clientCount >= expectedClients
  ) {
    await prisma.workspace.update({
      where: { id: demoWorkspace.id },
      data: { seededAt: new Date() },
    });
    demoWorkspace = { ...demoWorkspace, seededAt: new Date() };
  }

  const seeded =
    !!demoWorkspace?.seededAt ||
    (!!demoWorkspace && clientCount >= expectedClients);

  if (seeded) {
    await releaseDemoSeedLease(user.id).catch(() => {});
  }

  return NextResponse.json(
    {
      exists: !!demoWorkspace,
      seeded,
      cleared: false,
    },
    { status: 200 }
  );
}
