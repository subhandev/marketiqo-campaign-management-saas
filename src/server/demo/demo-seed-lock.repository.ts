import { prisma } from "@/server/db/client";

/** >= route maxDuration (300s) so an in-flight seed keeps the lock. */
const DEMO_SEED_LEASE_MS = 6 * 60 * 1000;
/** Steal after this many seconds (above route maxDuration 300s) if the server died without releasing. */
// Keep in sync with SQL INTERVAL below.

export async function tryAcquireDemoSeedLease(userPk: string): Promise<boolean> {
  const leaseUntil = new Date(Date.now() + DEMO_SEED_LEASE_MS);

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    UPDATE "User"
    SET
      "demoSeedLeaseUntil" = ${leaseUntil},
      "demoSeedLockStartedAt" = NOW()
    WHERE "id" = ${userPk}
      AND (
        "demoSeedLeaseUntil" IS NULL
        OR "demoSeedLeaseUntil" < NOW()
        OR "demoSeedLockStartedAt" < NOW() - INTERVAL '330 seconds' /* > maxDuration */
      )
    RETURNING "id"
  `;

  return rows.length > 0;
}

export async function releaseDemoSeedLease(userPk: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userPk },
    data: { demoSeedLeaseUntil: null, demoSeedLockStartedAt: null },
  });
}
