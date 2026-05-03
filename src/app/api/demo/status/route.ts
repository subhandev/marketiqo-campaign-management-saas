import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ exists: false, seeded: false, seededAt: null, cleared: false }, { status: 200 });
  }

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    return NextResponse.json({ exists: false, seeded: false, seededAt: null, cleared: false }, { status: 200 });
  }

  if (user.demoClearedAt) {
    return NextResponse.json({ exists: false, seeded: false, seededAt: null, cleared: true }, { status: 200 });
  }

  const demoWorkspace = await prisma.workspace.findFirst({
    where: { userId: user.id, isDemo: true },
  });

  if (!demoWorkspace) {
    return NextResponse.json({ exists: false, seeded: false, seededAt: null, cleared: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      exists: true,
      seeded: demoWorkspace.seededAt !== null,
      seededAt: demoWorkspace.seededAt?.toISOString() ?? null,
      cleared: false,
    },
    { status: 200 }
  );
}
