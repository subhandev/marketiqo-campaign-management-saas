import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import {
  handleGetCampaign,
  handleUpdateCampaign,
  handleDeleteCampaign,
} from "@/server/campaigns/campaigns.handler";

async function getWorkspaceId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { workspaces: { take: 1 } },
  });
  return user?.workspaces[0]?.id ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404 });
  const { id } = await params;
  return handleGetCampaign(id, workspaceId);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404 });
  const { id } = await params;
  return handleUpdateCampaign(req, id, workspaceId);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404 });
  const { id } = await params;
  return handleDeleteCampaign(id, workspaceId);
}
