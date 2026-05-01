// src/app/api/clients/route.ts

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";
import {
  handleListClients,
  handleCreateClient,
} from "@/server/clients/clients.handler";

async function getWorkspaceId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { workspaces: { take: 1 } },
  });
  return user?.workspaces[0]?.id ?? null;
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const workspaceId = await getWorkspaceId(userId);

  if (!workspaceId) {
    return new Response(JSON.stringify({ error: "Workspace not found" }), {
      status: 404,
    });
  }

  return handleListClients(workspaceId);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const workspaceId = await getWorkspaceId(userId);

  if (!workspaceId) {
    return new Response(JSON.stringify({ error: "Workspace not found" }), {
      status: 404,
    });
  }

  return handleCreateClient(req, workspaceId);
}