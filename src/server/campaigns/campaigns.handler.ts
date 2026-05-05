import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignList,
  listCampaignItems,
  generateQuickInsight,
  getCampaign,
  addCampaign,
  editCampaign,
  removeCampaign,
} from "@/server/campaigns/campaigns.service";
import { CreateCampaignInput, UpdateCampaignInput } from "@/features/campaigns/types";

export async function handleGetCampaignList(workspaceId: string) {
  try {
    const campaigns = await getCampaignList(workspaceId);
    return NextResponse.json(campaigns, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function handleListCampaigns(workspaceId: string) {
  try {
    const data = await listCampaignItems(workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function handleGenerateQuickInsight(campaignId: string, workspaceId: string) {
  try {
    const data = await generateQuickInsight(campaignId, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}

export async function handleGetCampaign(id: string, clerkUserId: string) {
  try {
    const data = await getCampaign(id, clerkUserId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function handleCreateCampaign(req: NextRequest, clerkUserId: string) {
  try {
    const body: CreateCampaignInput = await req.json();
    const data = await addCampaign({ ...body });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function handleUpdateCampaign(req: NextRequest, id: string, clerkUserId: string) {
  try {
    const body: UpdateCampaignInput = await req.json();
    const data = await editCampaign(id, clerkUserId, body);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function handleDeleteCampaign(id: string, clerkUserId: string) {
  try {
    const data = await removeCampaign(id, clerkUserId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
