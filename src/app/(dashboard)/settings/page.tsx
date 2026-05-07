import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { DataResetCard } from "@/features/settings/components/DataResetCard";

type SettingsData = {
  resetMode: "demo" | "real";
  clientCount: number;
  campaignCount: number;
};

async function getSettingsData(clerkUserId: string): Promise<SettingsData | null> {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) return null;

  const demoWorkspace = !user.demoClearedAt
    ? await prisma.workspace.findFirst({
        where: { userId: user.id, isDemo: true },
        orderBy: { createdAt: "asc" },
      })
    : null;

  const workspace =
    demoWorkspace ??
    (await prisma.workspace.findFirst({
      where: { userId: user.id, isDemo: false },
      orderBy: { createdAt: "asc" },
    }));

  if (!workspace) return null;

  const [clientCount, campaignCount] = await Promise.all([
    prisma.client.count({ where: { workspaceId: workspace.id } }),
    prisma.campaign.count({ where: { client: { workspaceId: workspace.id } } }),
  ]);

  return {
    resetMode: demoWorkspace ? "demo" : "real",
    clientCount,
    campaignCount,
  };
}

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, settingsData] = await Promise.all([
    currentUser(),
    getSettingsData(userId),
  ]);

  if (!settingsData) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          Settings
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Workspace settings are not available yet.
        </p>
      </div>
    );
  }

  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "No email available";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Manage your account and workspace data.
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-card">
        <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
          Profile
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Your account details are shown here as read-only information.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.35)] p-3">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Name
            </p>
            <p className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">
              {clerkUser?.fullName ?? clerkUser?.username ?? "User"}
            </p>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.35)] p-3">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Email
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[hsl(var(--foreground))]">
              {email}
            </p>
          </div>
        </div>
      </div>

      <DataResetCard {...settingsData} />
    </div>
  );
}
