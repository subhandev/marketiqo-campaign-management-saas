import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { demoPortfolioClientCount } from "@/server/demo/demo-seed.data";
import { DemoOnboarding } from "@/features/demo/components/DemoOnboarding";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { userId } = await auth();

  let demoInitialState: "needs_seed" | "seeded" | "none" = "none";

  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });

    if (!user?.demoClearedAt) {
      const demoWorkspace = user
        ? await prisma.workspace.findFirst({
            where: { userId: user.id, isDemo: true },
          })
        : null;

      if (!demoWorkspace) {
        demoInitialState = "needs_seed";
      } else {
        const expectedClients = demoPortfolioClientCount(new Date());
        const clientCount = await prisma.client.count({
          where: { workspaceId: demoWorkspace.id },
        });

        // Match /api/demo/status “demo ready”: full portfolio OR seededAt marker.
        let seededAt = demoWorkspace.seededAt;
        if (!seededAt && clientCount >= expectedClients) {
          await prisma.workspace.update({
            where: { id: demoWorkspace.id },
            data: { seededAt: new Date() },
          });
          seededAt = new Date();
        }

        const demoReady =
          !!seededAt || clientCount >= expectedClients;

        demoInitialState = demoReady ? "seeded" : "needs_seed";
      }
    }
  }

  return (
    <>
      <DemoOnboarding initialState={demoInitialState} />
      <DashboardContent />
    </>
  );
}
