import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { disconnectPrismaClientSafe, prisma } from "@/server/db/client";
import { isTransientDatabaseConnectionError } from "@/server/db/transient-errors";
import {
  releaseDemoSeedLease,
  tryAcquireDemoSeedLease,
} from "@/server/demo/demo-seed-lock.repository";
import { seedDemoWorkspace } from "@/server/demo/demo-seed.service";

/** Demo seed hits many sequential queries + LLM calls; Neon WebSocket/driver can flake mid-flight. */
export const maxDuration = 300;

export async function POST(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.demoClearedAt) {
    return NextResponse.json({ success: true, skipped: true }, { status: 200 });
  }

  const gotLease = await tryAcquireDemoSeedLease(user.id);
  if (!gotLease) {
    return NextResponse.json(
      { success: true, seedInProgress: true },
      { status: 202 }
    );
  }

  const maxAttempts = 5;

  try {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await seedDemoWorkspace(userId);
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        const retryable =
          isTransientDatabaseConnectionError(error) && attempt < maxAttempts - 1;

        if (retryable) {
          console.warn(
            `[demo seed] Attempt ${attempt + 1}/${maxAttempts} transient DB error — reconnect + backoff`,
            error
          );
          await disconnectPrismaClientSafe();
          const backoffMs = 3000 + attempt * 2000;
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }

        console.error("Demo seed error:", error);
        return NextResponse.json(
          { error: "Failed to seed demo data" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  } finally {
    await releaseDemoSeedLease(user.id).catch(() => {});
  }
}
