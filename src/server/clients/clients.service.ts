// src/server/clients/clients.service.ts

import {
  getClientsByWorkspace,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "@/server/clients/clients.repository";
import { CreateClientInput } from "@/features/clients/types";

export async function listClients(workspaceId: string) {
  const clients = await getClientsByWorkspace(workspaceId);

  const enriched = clients
    .map((client) => {
      const campaigns = client.campaigns ?? [];
      const activeCampaignsCount = campaigns.filter((c) => c.status === "active").length;
      const atRiskCampaignsCount = campaigns.filter((c) => c.status === "at_risk").length;

      const timestamps: number[] = [];
      if (client.updatedAt) timestamps.push(new Date(client.updatedAt).getTime());

      for (const c of campaigns) {
        if (c.updatedAt) timestamps.push(new Date(c.updatedAt).getTime());
        const metricDate = c.metrics[0]?.date;
        if (metricDate) timestamps.push(new Date(metricDate).getTime());
        const insightCreatedAt = c.insights[0]?.createdAt;
        if (insightCreatedAt) timestamps.push(new Date(insightCreatedAt).getTime());
      }

      const lastActivityAt =
        timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;

      // Strip heavy relation data from the list response while keeping counts/signals.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { campaigns: _campaigns, ...rest } = client as any;

      return {
        ...rest,
        activeCampaignsCount,
        atRiskCampaignsCount,
        lastActivityAt,
      };
    })
    .sort((a, b) => {
      // Triage-first: at-risk first, then most recent activity.
      if (b.atRiskCampaignsCount !== a.atRiskCampaignsCount) {
        return b.atRiskCampaignsCount - a.atRiskCampaignsCount;
      }
      const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return tb - ta;
    });

  return {
    clients: enriched,
    total: enriched.length,
  };
}

export async function getClient(id: string, workspaceId: string) {
  const client = await getClientById(id, workspaceId);

  if (!client) {
    throw new Error("Client not found");
  }

  const insights = client.campaigns.flatMap((campaign) => campaign.insights);

  return { client, insights };
}

export async function addClient(
  workspaceId: string,
  data: CreateClientInput
) {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Client name is required");
  }

  const client = await createClient(workspaceId, data);
  return { client };
}

export async function editClient(
  id: string,
  workspaceId: string,
  data: CreateClientInput
) {
  const client = await updateClient(id, workspaceId, data);
  if (!client) throw new Error("Client not found");
  return { client };
}

export async function removeClient(id: string, workspaceId: string) {
  const deleted = await deleteClient(id, workspaceId);
  if (!deleted) throw new Error("Client not found");
  return { success: true };
}