import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleGetCampaignList, handleCreateCampaign } from "@/server/campaigns/campaigns.handler";
import {
  resolveWorkspaceId,
  getRealWorkspaceId,
} from "@/server/workspace/resolve-workspace";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404 });
  return handleGetCampaignList(workspaceId);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const workspaceId = await getRealWorkspaceId(userId);
  if (!workspaceId) return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404 });
  return handleCreateCampaign(req, workspaceId);
}
