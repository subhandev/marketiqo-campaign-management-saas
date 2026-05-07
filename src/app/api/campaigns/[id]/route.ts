import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  handleGetCampaign,
  handleUpdateCampaign,
  handleDeleteCampaign,
} from "@/server/campaigns/campaigns.handler";
import { resolveWorkspaceId } from "@/server/workspace/resolve-workspace";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  const { id } = await params;
  return handleGetCampaign(id, workspaceId);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  const { id } = await params;
  return handleUpdateCampaign(req, id, workspaceId);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceId = await resolveWorkspaceId(userId);
  if (!workspaceId) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  const { id } = await params;
  return handleDeleteCampaign(id, workspaceId);
}
