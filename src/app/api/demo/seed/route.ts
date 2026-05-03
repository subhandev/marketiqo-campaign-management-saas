import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { seedDemoWorkspace } from "@/server/demo/demo-seed.service";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (user?.demoClearedAt) {
    return NextResponse.json({ success: true, skipped: true }, { status: 200 });
  }

  try {
    await seedDemoWorkspace(userId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Demo seed error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
