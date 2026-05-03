import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import { DemoOnboarding } from "@/features/demo/components/DemoOnboarding";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { userId } = await auth();

  let demoInitialState: "needs_seed" | "seeded" | "none" = "needs_seed";

  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });

    if (user?.demoClearedAt) {
      demoInitialState = "none";
    } else {
      const demoWorkspace = user
        ? await prisma.workspace.findFirst({
            where: { userId: user.id, isDemo: true },
          })
        : null;

      demoInitialState = !demoWorkspace
        ? "needs_seed"
        : demoWorkspace.seededAt
        ? "seeded"
        : "needs_seed";
    }
  }

  return (
    <>
      <DemoOnboarding initialState={demoInitialState} />
      <DashboardContent />
    </>
  );
}
