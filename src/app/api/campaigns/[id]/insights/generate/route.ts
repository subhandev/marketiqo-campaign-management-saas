import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";
import { handleGenerateQuickInsight } from "@/server/campaigns/campaigns.handler";

// Backward-compatible alias for generating a quick insight.
// Canonical endpoint is POST /api/campaigns/[id]/insights
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const { id } = await params;
  return handleGenerateQuickInsight(id, workspaceId);
}
