import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";
import { handleGeneratePortfolioAiBrief } from "@/server/dashboard/dashboard.handler";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  return handleGeneratePortfolioAiBrief(workspaceId);
}
