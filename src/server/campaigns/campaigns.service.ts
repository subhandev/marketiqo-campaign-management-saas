import {
  getCampaignsByWorkspace,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/server/campaigns/campaigns.repository";
import { CreateCampaignInput, UpdateCampaignInput } from "@/features/campaigns/types";

export async function listCampaigns(workspaceId: string) {
  const campaigns = await getCampaignsByWorkspace(workspaceId);
  return { campaigns, total: campaigns.length };
}

export async function getCampaign(id: string, workspaceId: string) {
  const campaign = await getCampaignById(id, workspaceId);
  if (!campaign) throw new Error("Campaign not found");
  return { campaign };
}

export async function addCampaign(data: CreateCampaignInput) {
  if (!data.name || data.name.trim() === "") throw new Error("Campaign name is required");
  if (!data.clientId) throw new Error("Client is required");
  if (!data.platform) throw new Error("Platform is required");
  const campaign = await createCampaign(data);
  return { campaign };
}

export async function editCampaign(id: string, workspaceId: string, data: UpdateCampaignInput) {
  const existing = await getCampaignById(id, workspaceId);
  if (!existing) throw new Error("Campaign not found");
  const campaign = await updateCampaign(id, data);
  return { campaign };
}

export async function removeCampaign(id: string, workspaceId: string) {
  const existing = await getCampaignById(id, workspaceId);
  if (!existing) throw new Error("Campaign not found");
  await deleteCampaign(id);
  return { success: true };
}
