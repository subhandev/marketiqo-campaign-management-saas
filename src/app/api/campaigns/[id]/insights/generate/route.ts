import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";
import { handleGenerateQuickInsight } from "@/server/campaigns/campaigns.handler";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId)
    return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404 });

  const { id } = await params;
  return handleGenerateQuickInsight(id, workspaceId);
}
